#include "bpe_tokenizer.h"

#include <nlohmann/json.hpp>

#include <algorithm>
#include <cctype>
#include <fstream>
#include <sstream>
#include <stdexcept>

using json = nlohmann::json;

namespace
{
std::string joinPath(const std::string& a, const std::string& b)
{
	if (a.empty())
		return b;
	if (a.back() == '/' || a.back() == '\\')
		return a + b;
	return a + "/" + b;
}

std::string readFile(const std::string& path)
{
	std::ifstream in(path, std::ios::binary);
	if (!in)
		throw std::runtime_error("failed to open " + path);
	std::ostringstream ss;
	ss << in.rdbuf();
	return ss.str();
}
} // namespace

void BpeTokenizer::buildByteMaps()
{
	std::vector<uint8_t> bs;
	for (int c = int('!'); c <= int('~'); ++c)
		bs.push_back(static_cast<uint8_t>(c));
	for (int c = 161; c <= 172; ++c)
		bs.push_back(static_cast<uint8_t>(c));
	for (int c = 174; c <= 255; ++c)
		bs.push_back(static_cast<uint8_t>(c));

	std::vector<char32_t> cs;
	for (auto b : bs)
		cs.push_back(static_cast<char32_t>(b));

	int n = 0;
	for (int b = 0; b < 256; ++b)
	{
		if (std::find(bs.begin(), bs.end(), static_cast<uint8_t>(b)) == bs.end())
		{
			bs.push_back(static_cast<uint8_t>(b));
			cs.push_back(static_cast<char32_t>(256 + n));
			++n;
		}
	}

	for (size_t i = 0; i < bs.size(); ++i)
	{
		byte_encoder_[bs[i]] = cs[i];
		byte_decoder_[cs[i]] = bs[i];
	}
}

bool BpeTokenizer::load(const std::string& tokenizer_dir)
{
	try
	{
		buildByteMaps();

		const auto vocab_path = joinPath(tokenizer_dir, "vocab.json");
		const auto merges_path = joinPath(tokenizer_dir, "merges.txt");
		const auto config_path = joinPath(tokenizer_dir, "tokenizer_config.json");

		const auto vocab_json = json::parse(readFile(vocab_path));
		vocab_.clear();
		for (auto it = vocab_json.begin(); it != vocab_json.end(); ++it)
			vocab_[it.key()] = it.value().get<int>();

		if (vocab_.count("<s>"))
			bos_id_ = vocab_.at("<s>");
		if (vocab_.count("<pad>"))
			pad_id_ = vocab_.at("<pad>");
		if (vocab_.count("</s>"))
			eos_id_ = vocab_.at("</s>");
		if (vocab_.count("<unk>"))
			unk_id_ = vocab_.at("<unk>");

		std::ifstream merges_in(merges_path);
		if (!merges_in)
			return false;

		std::string line;
		if (!std::getline(merges_in, line))
			return false; // #version

		merges_.clear();
		while (std::getline(merges_in, line))
		{
			if (line.empty())
				continue;
			const auto tab = line.find(' ');
			if (tab == std::string::npos)
				continue;
			merges_.emplace_back(line.substr(0, tab), line.substr(tab + 1));
		}

		(void)config_path;
		return !vocab_.empty() && !merges_.empty();
	}
	catch (...)
	{
		return false;
	}
}

std::u32string BpeTokenizer::utf8ToUtf32(const std::string& text)
{
	std::u32string out;
	for (size_t i = 0; i < text.size();)
	{
		unsigned char c = static_cast<unsigned char>(text[i]);
		char32_t cp = 0;
		size_t len = 1;
		if (c < 0x80)
			cp = c;
		else if ((c & 0xE0) == 0xC0 && i + 1 < text.size())
		{
			cp = ((c & 0x1F) << 6) | (static_cast<unsigned char>(text[i + 1]) & 0x3F);
			len = 2;
		}
		else if ((c & 0xF0) == 0xE0 && i + 2 < text.size())
		{
			cp = ((c & 0x0F) << 12)
			   | ((static_cast<unsigned char>(text[i + 1]) & 0x3F) << 6)
			   | (static_cast<unsigned char>(text[i + 2]) & 0x3F);
			len = 3;
		}
		else if ((c & 0xF8) == 0xF0 && i + 3 < text.size())
		{
			cp = ((c & 0x07) << 18)
			   | ((static_cast<unsigned char>(text[i + 1]) & 0x3F) << 12)
			   | ((static_cast<unsigned char>(text[i + 2]) & 0x3F) << 6)
			   | (static_cast<unsigned char>(text[i + 3]) & 0x3F);
			len = 4;
		}
		else
			cp = c;
		out.push_back(cp);
		i += len;
	}
	return out;
}

std::string BpeTokenizer::utf32ToUtf8(const std::u32string& text)
{
	std::string out;
	for (char32_t cp : text)
	{
		if (cp < 0x80)
			out.push_back(static_cast<char>(cp));
		else if (cp < 0x800)
		{
			out.push_back(static_cast<char>(0xC0 | ((cp >> 6) & 0x1F)));
			out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
		}
		else if (cp < 0x10000)
		{
			out.push_back(static_cast<char>(0xE0 | ((cp >> 12) & 0x0F)));
			out.push_back(static_cast<char>(0x80 | ((cp >> 6) & 0x3F)));
			out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
		}
		else
		{
			out.push_back(static_cast<char>(0xF0 | ((cp >> 18) & 0x07)));
			out.push_back(static_cast<char>(0x80 | ((cp >> 12) & 0x3F)));
			out.push_back(static_cast<char>(0x80 | ((cp >> 6) & 0x3F)));
			out.push_back(static_cast<char>(0x80 | (cp & 0x3F)));
		}
	}
	return out;
}

std::string BpeTokenizer::byteEncode(const std::string& token) const
{
	std::u32string encoded;
	for (unsigned char b : token)
		encoded.push_back(byte_encoder_.at(b));
	return utf32ToUtf8(encoded);
}

int BpeTokenizer::tokenToId(const std::string& token) const
{
	const auto it = vocab_.find(token);
	if (it != vocab_.end())
		return it->second;
	return unk_id_;
}

std::vector<std::string> BpeTokenizer::bpe(const std::string& token) const
{
	std::vector<std::string> word;
	const auto encoded = byteEncode(token);
	for (size_t i = 0; i < encoded.size();)
	{
		size_t len = 1;
		if ((encoded[i] & 0xF8) == 0xF0)
			len = 4;
		else if ((encoded[i] & 0xF0) == 0xE0)
			len = 3;
		else if ((encoded[i] & 0xE0) == 0xC0)
			len = 2;
		word.push_back(encoded.substr(i, len));
		i += len;
	}

	auto getPairRank = [&](const std::string& a, const std::string& b) -> int
	{
		for (size_t i = 0; i < merges_.size(); ++i)
			if (merges_[i].first == a && merges_[i].second == b)
				return static_cast<int>(i);
		return -1;
	};

	while (word.size() > 1)
	{
		int best_rank = -1;
		size_t best_idx = 0;
		for (size_t i = 0; i + 1 < word.size(); ++i)
		{
			const int rank = getPairRank(word[i], word[i + 1]);
			if (rank >= 0 && (best_rank < 0 || rank < best_rank))
			{
				best_rank = rank;
				best_idx = i;
			}
		}
		if (best_rank < 0)
			break;

		const auto merged = word[best_idx] + word[best_idx + 1];
		std::vector<std::string> next;
		next.reserve(word.size());
		for (size_t i = 0; i < word.size();)
		{
			if (i == best_idx)
			{
				next.push_back(merged);
				i += 2;
			}
			else
			{
				next.push_back(word[i]);
				++i;
			}
		}
		word.swap(next);
	}
	return word;
}

std::vector<int64_t> BpeTokenizer::encode(const std::string& text, int max_length) const
{
	std::vector<int64_t> ids;
	ids.reserve(static_cast<size_t>(max_length));
	ids.push_back(bos_id_);

	std::vector<std::string> words;
	{
		std::string current;
		for (char ch : text)
		{
			if (ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r')
			{
				if (!current.empty())
				{
					words.push_back(current);
					current.clear();
				}
			}
			else
			{
				current.push_back(ch);
			}
		}
		if (!current.empty())
			words.push_back(current);
	}

	for (size_t wi = 0; wi < words.size(); ++wi)
	{
		std::string chunk = words[wi];
		if (wi > 0)
			chunk = " " + chunk;

		const auto pieces = bpe(chunk);
		for (const auto& piece : pieces)
			ids.push_back(tokenToId(piece));
	}

	ids.push_back(eos_id_);

	if (static_cast<int>(ids.size()) > max_length)
		ids.resize(static_cast<size_t>(max_length));
	else
		ids.resize(static_cast<size_t>(max_length), pad_id_);

	return ids;
}
