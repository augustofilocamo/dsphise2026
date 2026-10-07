cmake_minimum_required(VERSION 3.20)
project(clap_search LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT DEFINED ORT_ROOT)
  if(APPLE)
    set(ORT_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/third_party/onnxruntime")
  else()
    set(ORT_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/third_party/onnxruntime_win")
  endif()
endif()

set(ORT_INCLUDE_DIR "${ORT_ROOT}/include")
if(APPLE)
  set(ORT_LIB "${ORT_ROOT}/lib/libonnxruntime.dylib")
else()
  set(ORT_LIB "${ORT_ROOT}/lib/onnxruntime.lib")
endif()

add_library(clap_search SHARED
  clap_search.cpp
  clap_index.cpp
  bpe_tokenizer.cpp
  delay_load_hook.cpp
)
target_compile_definitions(clap_search PRIVATE CLAP_SEARCH_BUILD)
target_include_directories(clap_search PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}"
  "${CMAKE_CURRENT_SOURCE_DIR}/third_party"
  "${ORT_INCLUDE_DIR}"
)
target_link_libraries(clap_search PRIVATE "${ORT_LIB}")

if(WIN32)
  target_link_options(clap_search PRIVATE "/DELAYLOAD:onnxruntime.dll")
  target_link_libraries(clap_search PRIVATE delayimp shlwapi)
endif()

if(APPLE)
  set_target_properties(clap_search PROPERTIES
    OUTPUT_NAME "clap_search"
    PREFIX "lib"
    SUFFIX ".dylib"
  )
else()
  set_target_properties(clap_search PROPERTIES
    OUTPUT_NAME "clap_search"
    PREFIX ""
  )
endif()

add_executable(clap_search_cli clap_search_cli.cpp)
target_include_directories(clap_search_cli PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
target_link_libraries(clap_search_cli PRIVATE clap_search)

if(WIN32)
  add_custom_command(TARGET clap_search POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
      "${ORT_ROOT}/lib/onnxruntime.dll"
      "$<TARGET_FILE_DIR:clap_search>/onnxruntime.dll"
  )
endif()
