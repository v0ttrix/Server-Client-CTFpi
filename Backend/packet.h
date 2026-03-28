#ifndef PACKET_H
#define PACKET_H

#include <cstdint>    // ADDED: Required for uint32_t, uint8_t
#include <cstring>
#include <string>
#include <iostream>
#include <vector>
#include <stdexcept>

// Cross-platform includes for htonl/ntohl
#ifdef _WIN32
    #include <winsock2.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <arpa/inet.h>
#endif

// REMOVED: using namespace std; (Prevents namespace pollution)

enum class Command : uint32_t {
    NONE = 0,
    LOGIN = 100,
    TOGGLE_MAINTENANCE = 101,
    SET_ONLINE = 102,
    REQUEST_FLAG_IMAGE = 103, 
    ACK = 200
};

#pragma pack(push, 1)
struct Header{
    Command commandID; 
    uint32_t payloadSize;
    uint32_t payloadCRC; 
};
#pragma pack(pop)

class NetworkPacket{
    private:
    Header header;
    uint8_t* payload;

    static uint32_t calculateCRC32(const uint8_t* data, size_t length) {
        uint32_t crc = 0xFFFFFFFF;
        for (size_t i = 0; i < length; i++) {
            crc ^= data[i];
            for (int j = 0; j < 8; j++) {
                crc = (crc >> 1) ^ (0xEDB88320 & (-(crc & 1)));
            }
        }
        return ~crc;
    }

public:
    NetworkPacket(){
        header.commandID = Command::NONE;
        header.payloadSize = 0;
        header.payloadCRC = 0;
        payload = nullptr;
    }
    
    NetworkPacket(Command cmd, uint32_t size){
        header.commandID = cmd;
        header.payloadSize = size;
        header.payloadCRC = 0; 
        payload = nullptr;
        
        if (size > 0){
            payload = new uint8_t[size];
            std::memset(payload, 0, size); // ADDED std::
        } else {
            payload = nullptr;
        }
    }

    ~NetworkPacket(){
        if (payload){
            delete[] payload;
        }
    }

    NetworkPacket(const NetworkPacket&) = delete; 
    NetworkPacket& operator=(const NetworkPacket&) = delete; 

    NetworkPacket(NetworkPacket&& other) noexcept {
        header = other.header;       
        payload = other.payload;     
        other.payload = nullptr;     
    }

    NetworkPacket& operator=(NetworkPacket&& other) noexcept {
        if (this != &other) {
            delete[] payload;        
            header = other.header;   
            payload = other.payload; 
            other.payload = nullptr; 
        }
        return *this;
    }

    Command getCommandID() const {
        return header.commandID;
    }

    uint32_t getPayloadSize() const {
        return header.payloadSize;
    }

    const uint8_t* getPayload() const {
        return payload;
    }
    
    uint32_t getPayloadCrc() const {
        return header.payloadCRC;
    }

    void writePayload(const uint8_t* data, uint32_t size) {
        if (size > header.payloadSize) {
            std::cerr << "Error: Payload size exceeds allocated size\n";
            return; 
        }
        if (payload != nullptr && data != nullptr){
            std::memcpy(payload, data, size);
            // FIXED: Now calculates CRC based on the total allocated payload size
            header.payloadCRC = calculateCRC32(payload, header.payloadSize); 
        }
    }
    
    std::vector<uint8_t> serialize() const {
        std::vector<uint8_t> buffer(sizeof(Header) + header.payloadSize);
        
        Header netHeader;
        netHeader.commandID = static_cast<Command>(htonl(static_cast<uint32_t>(header.commandID)));
        netHeader.payloadSize = htonl(header.payloadSize);
        netHeader.payloadCRC = htonl(header.payloadCRC);

        std::memcpy(buffer.data(), &netHeader, sizeof(Header));
        
        if (payload != nullptr && header.payloadSize > 0) {
            std::memcpy(buffer.data() + sizeof(Header), payload, header.payloadSize);
        }
        return buffer;
    }

    static NetworkPacket deserialize(const uint8_t* data, uint32_t totalSize) {
        if (totalSize < sizeof(Header)) {
            throw std::runtime_error("Data too small to contain header");
        }
        
        NetworkPacket packet;
        
        Header netHeader;
        std::memcpy(&netHeader, data, sizeof(Header));
        
        packet.header.commandID = static_cast<Command>(ntohl(static_cast<uint32_t>(netHeader.commandID)));
        packet.header.payloadSize = ntohl(netHeader.payloadSize);
        packet.header.payloadCRC = ntohl(netHeader.payloadCRC);

        if (totalSize < sizeof(Header) + packet.header.payloadSize) {
            throw std::runtime_error("Data too small to contain complete payload");
        }
        
        if (packet.header.payloadSize > 0) {
            packet.payload = new uint8_t[packet.header.payloadSize];
            std::memcpy(packet.payload, data + sizeof(Header), packet.header.payloadSize);
        }
        
        return packet;
    }
};   

#endif // PACKET_H