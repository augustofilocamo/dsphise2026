#pragma once

#ifdef _WIN32
  #ifdef CLAP_SEARCH_BUILD
    #define CLAP_SEARCH_API __declspec(dllexport)
  #else
    #define CLAP_SEARCH_API __declspec(dllimport)
  #endif
#else
  #define CLAP_SEARCH_API __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef void* ClapSearchHandle;

CLAP_SEARCH_API ClapSearchHandle clap_search_create(const char* data_dir);
CLAP_SEARCH_API void clap_search_destroy(ClapSearchHandle handle);
CLAP_SEARCH_API int clap_search_size(ClapSearchHandle handle);
/** Writes JSON into out_buf. Returns bytes written, or -1 on error. */
CLAP_SEARCH_API int clap_search_query(ClapSearchHandle handle,
                                      const char* prompt,
                                      const char* bank,
                                      int top_k,
                                      char* out_buf,
                                      int out_buf_size);

#ifdef __cplusplus
}
#endif
