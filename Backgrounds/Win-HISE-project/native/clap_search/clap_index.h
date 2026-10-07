#pragma once

#include <cstdint>
#include <string>
#include <vector>

struct ClapIndexEntry
{
	std::string id;
	std::string family;
};

class ClapIndex
{
public:
	bool load(const std::string& path);
	int size() const { return static_cast<int>(entries_.size()); }
	const std::vector<float>& vectors() const { return vectors_; }
	const std::vector<ClapIndexEntry>& entries() const { return entries_; }
	int dim() const { return dim_; }

private:
	int dim_ = 0;
	std::vector<float> vectors_;
	std::vector<ClapIndexEntry> entries_;
};
