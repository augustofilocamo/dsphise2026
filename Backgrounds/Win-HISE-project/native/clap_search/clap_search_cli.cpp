#include "clap_search_api.h"

#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

namespace
{
void printUsage()
{
	std::cerr << "Usage: clap_search_cli --prompt <text> [--bank v6|v6_locations|all] [--top 5]\n";
	std::cerr << "Set CINESCAPES_CLAP_DIR to Semantic_s folder (defaults to ./Semantic_s).\n";
}
} // namespace

int main(int argc, char** argv)
{
	std::string prompt;
	std::string bank = "v6";
	int top_k = 5;

	for (int i = 1; i < argc; ++i)
	{
		const std::string arg = argv[i];
		if (arg == "--prompt" && i + 1 < argc)
			prompt = argv[++i];
		else if (arg == "--bank" && i + 1 < argc)
			bank = argv[++i];
		else if (arg == "--top" && i + 1 < argc)
			top_k = std::atoi(argv[++i]);
		else if (arg == "--help" || arg == "-h")
		{
			printUsage();
			return 0;
		}
	}

	if (prompt.empty())
	{
		printUsage();
		return 1;
	}

	const char* env = std::getenv("CINESCAPES_CLAP_DIR");
	const std::string data_dir = env != nullptr ? env : "Semantic_s";

	ClapSearchHandle handle = clap_search_create(data_dir.c_str());
	if (handle == nullptr)
	{
		std::cerr << "clap_search_create failed for " << data_dir << "\n";
		return 2;
	}

	std::vector<char> buf(1 << 20);
	const int n = clap_search_query(handle, prompt.c_str(), bank.c_str(), top_k, buf.data(), static_cast<int>(buf.size()));
	clap_search_destroy(handle);

	if (n < 0)
	{
		std::cerr << buf.data() << "\n";
		return 3;
	}

	std::cout.write(buf.data(), n);
	std::cout << "\n";
	return 0;
}
