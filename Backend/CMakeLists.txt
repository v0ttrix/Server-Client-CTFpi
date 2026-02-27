cmake_minimum_required(VERSION 3.10)
project(CTF_Server)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(PostgreSQL REQUIRED)
find_package(nlohmann_json 3.2.0 QUIET)

# If nlohmann_json not found as package, use header-only
if(NOT nlohmann_json_FOUND)
    message(STATUS "nlohmann_json not found as package, using system headers")
    # The library is header-only, so we just need the include path
    set(NLOHMANN_JSON_INCLUDE_DIR "/usr/include" CACHE PATH "nlohmann_json include directory")
endif()

# Create executable
add_executable(ctf_server server.cpp)

# Link libraries
target_link_libraries(ctf_server PRIVATE PostgreSQL::PostgreSQL)

# Include directories
target_include_directories(ctf_server PRIVATE ${PostgreSQL_INCLUDE_DIRS})

if(nlohmann_json_FOUND)
    target_link_libraries(ctf_server PRIVATE nlohmann_json::nlohmann_json)
else()
    target_include_directories(ctf_server PRIVATE ${NLOHMANN_JSON_INCLUDE_DIR})
endif()

# Compiler flags
if(MSVC)
    target_compile_options(ctf_server PRIVATE /W4)
else()
    target_compile_options(ctf_server PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Set output directory
set_target_properties(ctf_server PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

# Copy db_config.json to build directory
configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/db_config.json"
    "${CMAKE_BINARY_DIR}/db_config.json"
    COPYONLY
)

message(STATUS "CTF Server build configured")
message(STATUS "PostgreSQL: ${PostgreSQL_LIBRARIES}")
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
