#include "clap_index.h"

#include <cstring>
#include <fstream>

namespace
{
bool readExact(std::ifstream& in, void* dst, size_t n)
{
	return static_cast<bool>(in.read(reinterpret_cast<char*>(dst), static_cast<std::streamsize>(n)));
}
} // namespace

bool ClapIndex::load(const std::string& path)
{
	std::ifstream in(path, std::ios::binary);
	if (!in)
		return false;

	char magic[4] = {};
	if (!readExact(in, magic, 4) || std::memcmp(magic, "CIDX", 4) != 0)
		return false;

	uint32_t version = 0;
	uint32_t reserved = 0;
	uint32_t count = 0;
	uint32_t dim = 0;
	if (!readExact(in, &version, 4) || !readExact(in, &reserved, 4)
	    || !readExact(in, &count, 4) || !readExact(in, &dim, 4))
		return false;

	if (version != 1 || count == 0 || dim == 0)
		return false;

	dim_ = static_cast<int>(dim);
	vectors_.resize(static_cast<size_t>(count) * static_cast<size_t>(dim));
	if (!readExact(in, vectors_.data(), vectors_.size() * sizeof(float)))
		return false;

	in.seekg(0, std::ios::end);
	const auto file_size = static_cast<size_t>(in.tellg());
	const auto meta_offset = 16ull + static_cast<size_t>(count) * static_cast<size_t>(dim) * 4ull;
	if (file_size <= meta_offset)
		return false;

	std::vector<char> meta(file_size - meta_offset);
	in.seekg(static_cast<std::streamoff>(meta_offset));
	if (!readExact(in, meta.data(), meta.size()))
		return false;

	size_t pos = 4; // skip metadata header
	entries_.clear();
	entries_.reserve(count);

	for (uint32_t i = 0; i < count; ++i)
	{
		if (pos + 2 > meta.size())
			return false;
		uint16_t id_len = 0;
		std::memcpy(&id_len, meta.data() + pos, 2);
		pos += 2;
		if (pos + id_len > meta.size())
			return false;

		ClapIndexEntry entry;
		entry.id.assign(meta.data() + pos, id_len);
		pos += id_len;

		if (pos + 2 > meta.size())
			return false;
		uint16_t fam_len = 0;
		std::memcpy(&fam_len, meta.data() + pos, 2);
		pos += 2;
		if (pos + fam_len > meta.size())
			return false;
		entry.family.assign(meta.data() + pos, fam_len);
		pos += fam_len;
		entries_.push_back(std::move(entry));
	}

	return entries_.size() == count;
}
