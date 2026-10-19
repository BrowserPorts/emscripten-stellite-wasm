# Copyright 2026 The Emscripten Authors. All rights reserved.
# SPDX-License-Identifier: MIT

# Match emcc and em++ instead of CMake's generic Clang Thin LTO default.
foreach(emscripten_ipo_language IN ITEMS C CXX)
  set(CMAKE_${emscripten_ipo_language}_COMPILE_OPTIONS_IPO "-flto=full")
  set(CMAKE_${emscripten_ipo_language}_LINK_OPTIONS_IPO "-flto=full")
endforeach()
unset(emscripten_ipo_language)
