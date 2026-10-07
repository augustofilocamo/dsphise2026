#pragma once

#include <cstdint>
#include <string>
#include <unordered_map>
#include <vector>

class BpeTokenizer
{
public:
	bool load(const std::string& tokenizer_dir);
	std::vector<int64_t> encode(const std::string& text, int max_length) const;

private:
	std::unordered_map<std::string, int> vocab_;
	std::vector<std::pair<std::string, std::string>> merges_;
	int bos_id_ = 0;
	int pad_id_ = 1;
	int eos_id_ = 2;
	int unk_id_ = 3;

	std::unordered_map<uint8_t, char32_t> byte_encoder_;
	std::unordered_map<char32_t, uint8_t> byte_decoder_;

	void buildByteMaps();
	static std::u32string utf8ToUtf32(const std::string& text);
	static std::string utf32ToUtf8(const std::u32string& text);
	std::string byteEncode(const std::string& token) const;
	std::vector<std::string> bpe(const std::string& token) const;
	int tokenToId(const std::string& token) const;
};
