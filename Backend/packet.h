#ifndef CTF_PACKET_H
#define CTF_PACKET_H

#include <string>
#include <nlohmann/json.hpp>

namespace ctf
{
    using json = nlohmann::json;

    struct Packet
    {
        static json success(const json& data)
        {
            return json{
                {"success", true},
                {"meta", json{{"version", "1.0"}}},
                {"data", data}
            };
        }

        static json error(const std::string& code, const std::string& message)
        {
            return json{
                {"success", false},
                {"meta", json{{"version", "1.0"}}},
                {"error", json{{"code", code}, {"message", message}}}
            };
        }

        static json extractData(const json& payload)
        {
            if (payload.is_object() && payload.contains("data") && payload["data"].is_object())
            {
                return payload["data"];
            }

            if (payload.is_object())
            {
                return payload;
            }

            return json::object();
        }
    };
}

#endif

