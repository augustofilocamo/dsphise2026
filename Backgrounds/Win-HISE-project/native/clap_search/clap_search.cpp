#include "clap_search_api.h"
#include "bpe_tokenizer.h"
#include "clap_index.h"

#include <onnxruntime_cxx_api.h>

#include <algorithm>
#include <cmath>
#include <cstring>
#include <filesystem>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

namespace fs = std::filesystem;

namespace
{
constexpr int kMaxSeqLen = 77;
constexpr int kEmbedDim = 512;

std::string joinPath(const std::string& a, const std::string& b)
{
	fs::path p = fs::path(a) / b;
	return p.string();
}

std::string jsonEscape(const std::string& s)
{
	std::string out;
	out.reserve(s.size() + 8);
	for (char c : s)
	{
		switch (c)
		{
			case '\\': out += "\\\\"; break;
			case '"': out += "\\\""; break;
			case '\n': out += "\\n"; break;
			case '\r': out += "\\r"; break;
			case '\t': out += "\\t"; break;
			default: out.push_back(c); break;
		}
	}
	return out;
}

bool startsWith(const std::string& s, const std::string& prefix)
{
	return s.size() >= prefix.size() && s.compare(0, prefix.size(), prefix) == 0;
}

bool matchesBank(const std::string& id, const std::string& bank)
{
	if (bank.empty() || bank == "all")
		return true;

	if (bank == "v6")
		return startsWith(id, "v6_");

	if (bank == "v6_locations" || bank == "v6loc")
		return startsWith(id, "v6loc_");

	if (bank == "v6_sfx" || bank == "v6sfx" || bank == "sfx")
	{
		static const char* prefixes[] = {
			"v6foot_", "v6ani_", "v6veh_", "v6mach_", "v6imp_", "v6vox_", "v6wx_", "v6crd_", nullptr
		};
		for (const char** p = prefixes; *p != nullptr; ++p)
			if (startsWith(id, *p))
				return true;
		return false;
	}

	static const struct { const char* bank; const char* prefix; } kMap[] = {
		{"v6foot", "v6foot_"}, {"v6ani", "v6ani_"}, {"v6veh", "v6veh_"},
		{"v6mach", "v6mach_"}, {"v6imp", "v6imp_"}, {"v6vox", "v6vox_"},
		{"v6wx", "v6wx_"}, {"v6crd", "v6crd_"},
	};
	for (const auto& m : kMap)
		if (bank == m.bank)
			return startsWith(id, m.prefix);

	return startsWith(id, bank);
}

void writeError(char* out_buf, int out_buf_size, const char* message)
{
	if (out_buf == nullptr || out_buf_size <= 0)
		return;
	std::ostringstream ss;
	ss << "{\"ok\":false,\"error\":\"" << jsonEscape(message) << "\"}";
	const auto s = ss.str();
	std::snprintf(out_buf, static_cast<size_t>(out_buf_size), "%s", s.c_str());
}

struct Hit
{
	int index = -1;
	float score = 0.0f;
};

struct ClapSearchHandleImpl
{
	std::string data_dir;
	BpeTokenizer tokenizer;
	ClapIndex index;
	std::unique_ptr<Ort::Env> env;
	std::unique_ptr<Ort::Session> session;
	std::vector<std::string> input_names;
	std::vector<std::string> output_names;
	std::vector<const char*> input_name_ptrs;
	std::vector<const char*> output_name_ptrs;
};

bool loadOnnx(ClapSearchHandleImpl& h)
{
	try
	{
		h.env = std::make_unique<Ort::Env>(ORT_LOGGING_LEVEL_WARNING, "clap_search");
		Ort::SessionOptions opts;
		opts.SetIntraOpNumThreads(1);
		opts.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);

		const auto model_path = joinPath(h.data_dir, "text_encoder.onnx");
#ifdef _WIN32
		const std::wstring wide(model_path.begin(), model_path.end());
		h.session = std::make_unique<Ort::Session>(*h.env, wide.c_str(), opts);
#else
		h.session = std::make_unique<Ort::Session>(*h.env, model_path.c_str(), opts);
#endif

		Ort::AllocatorWithDefaultOptions allocator;
		const size_t n_inputs = h.session->GetInputCount();
		for (size_t i = 0; i < n_inputs; ++i)
		{
			auto name = h.session->GetInputNameAllocated(i, allocator);
			h.input_names.emplace_back(name.get());
		}
		const size_t n_outputs = h.session->GetOutputCount();
		for (size_t i = 0; i < n_outputs; ++i)
		{
			auto name = h.session->GetOutputNameAllocated(i, allocator);
			h.output_names.emplace_back(name.get());
		}
		h.input_name_ptrs.clear();
		for (const auto& n : h.input_names)
			h.input_name_ptrs.push_back(n.c_str());
		h.output_name_ptrs.clear();
		for (const auto& n : h.output_names)
			h.output_name_ptrs.push_back(n.c_str());
		return true;
	}
	catch (...)
	{
		return false;
	}
}

bool encodeText(ClapSearchHandleImpl& h, const std::string& prompt, std::vector<float>& out_embedding)
{
	const auto ids = h.tokenizer.encode(prompt, kMaxSeqLen);
	std::vector<int64_t> mask(kMaxSeqLen, 0);
	for (int i = 0; i < kMaxSeqLen; ++i)
		mask[static_cast<size_t>(i)] = ids[static_cast<size_t>(i)] == 1 ? 0 : 1;

	std::array<int64_t, 2> shape {1, kMaxSeqLen};
	Ort::MemoryInfo mem = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);
	Ort::Value input_ids = Ort::Value::CreateTensor<int64_t>(
		mem, const_cast<int64_t*>(ids.data()), ids.size(), shape.data(), shape.size());
	Ort::Value attention_mask = Ort::Value::CreateTensor<int64_t>(
		mem, mask.data(), mask.size(), shape.data(), shape.size());

	std::vector<Ort::Value> inputs;
	inputs.push_back(std::move(input_ids));
	inputs.push_back(std::move(attention_mask));

	auto outputs = h.session->Run(Ort::RunOptions{nullptr},
	                              h.input_name_ptrs.data(), inputs.data(), inputs.size(),
	                              h.output_name_ptrs.data(), h.output_name_ptrs.size());

	if (outputs.empty() || !outputs[0].IsTensor())
		return false;

	auto& info = outputs[0].GetTensorTypeAndShapeInfo();
	const auto out_shape = info.GetShape();
	const float* data = outputs[0].GetTensorData<float>();
	size_t n = 1;
	for (auto d : out_shape)
		if (d > 0)
			n *= static_cast<size_t>(d);
	if (n < static_cast<size_t>(kEmbedDim))
		return false;

	out_embedding.assign(data, data + kEmbedDim);
	float norm = 0.0f;
	for (float v : out_embedding)
		norm += v * v;
	norm = std::sqrt(norm);
	if (norm > 0.0f)
		for (float& v : out_embedding)
			v /= norm;
	return true;
}
} // namespace

extern "C" {

CLAP_SEARCH_API ClapSearchHandle clap_search_create(const char* data_dir)
{
	if (data_dir == nullptr)
		return nullptr;

	auto* h = new (std::nothrow) ClapSearchHandleImpl();
	if (h == nullptr)
		return nullptr;

	h->data_dir = data_dir;
	const auto tokenizer_dir = joinPath(h->data_dir, "tokenizer");
	const auto index_path = joinPath(h->data_dir, "index.bin");

	if (!h->tokenizer.load(tokenizer_dir))
	{
		delete h;
		return nullptr;
	}
	if (!h->index.load(index_path))
	{
		delete h;
		return nullptr;
	}
	if (!loadOnnx(*h))
	{
		delete h;
		return nullptr;
	}
	return h;
}

CLAP_SEARCH_API void clap_search_destroy(ClapSearchHandle handle)
{
	delete static_cast<ClapSearchHandleImpl*>(handle);
}

CLAP_SEARCH_API int clap_search_size(ClapSearchHandle handle)
{
	if (handle == nullptr)
		return 0;
	return static_cast<ClapSearchHandleImpl*>(handle)->index.size();
}

CLAP_SEARCH_API int clap_search_query(ClapSearchHandle handle,
                                      const char* prompt,
                                      const char* bank,
                                      int top_k,
                                      char* out_buf,
                                      int out_buf_size)
{
	if (handle == nullptr || prompt == nullptr || out_buf == nullptr || out_buf_size <= 0)
		return -1;

	auto* h = static_cast<ClapSearchHandleImpl*>(handle);
	const std::string bank_key = bank != nullptr ? bank : "all";
	if (top_k < 1)
		top_k = 1;
	if (top_k > 50)
		top_k = 50;

	std::vector<float> query;
	if (!encodeText(*h, prompt, query))
	{
		writeError(out_buf, out_buf_size, "encode failed");
		return -1;
	}

	const auto& entries = h->index.entries();
	const auto& vectors = h->index.vectors();
	const int dim = h->index.dim();
	std::vector<Hit> hits;
	hits.reserve(entries.size());

	for (size_t i = 0; i < entries.size(); ++i)
	{
		if (!matchesBank(entries[i].id, bank_key))
			continue;

		float score = 0.0f;
		const float* row = vectors.data() + i * static_cast<size_t>(dim);
		for (int d = 0; d < dim; ++d)
			score += row[d] * query[static_cast<size_t>(d)];
		hits.push_back({static_cast<int>(i), score});
	}

	std::partial_sort(hits.begin(),
	                  hits.begin() + std::min<size_t>(hits.size(), static_cast<size_t>(top_k)),
	                  hits.end(),
	                  [](const Hit& a, const Hit& b) { return a.score > b.score; });

	const size_t n_out = std::min<size_t>(hits.size(), static_cast<size_t>(top_k));
	std::ostringstream ss;
	ss << "{\"ok\":true,\"n\":" << n_out << ",\"hits\":[";
	for (size_t i = 0; i < n_out; ++i)
	{
		if (i > 0)
			ss << ',';
		const auto& entry = entries[static_cast<size_t>(hits[i].index)];
		ss << "{\"id\":\"" << jsonEscape(entry.id)
		   << "\",\"family\":\"" << jsonEscape(entry.family)
		   << "\",\"score\":" << hits[i].score << '}';
	}
	ss << "]}";

	const auto json = ss.str();
	if (static_cast<int>(json.size()) + 1 > out_buf_size)
	{
		writeError(out_buf, out_buf_size, "output buffer too small");
		return -1;
	}
	std::memcpy(out_buf, json.c_str(), json.size() + 1);
	return static_cast<int>(json.size());
}

} // extern "C"
