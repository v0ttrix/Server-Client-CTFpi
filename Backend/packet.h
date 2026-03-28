#ifndef PACKET_H
#define PACKET_H

# include <cstring>
# include <string>
#include <iostream>
#include <vector>
using namespace std;

#pragma pack(push, 1)
struct Header{
    uint32_t commandID;
    uint32_t payloadSize;
};
#pragma pack(pop)

class NetworkPacket{
    private:
    Header header;
    uint8_t* payload;

public:
    //default constructor
    NetworkPacket(){
        header.commandID = 0;
        header.payloadSize = 0;
        payload = nullptr;
    }
    //overloaded constructor
    NetworkPacket(uint32_t cmd, uint32_t size){
        header.commandID = cmd;
        header.payloadSize = size;
        
        if (size > 0){
            payload = new uint8_t[size];
            memset(payload, 0, size);
        } else {
            payload = nullptr;
        }
    }

    //destructor
    ~NetworkPacket(){
        if (payload){
            delete[] payload;
        }
    }

    NetworkPacket(const NetworkPacket&) = delete; // disable copy constructor
    NetworkPacket& operator=(const NetworkPacket&) = delete; // disable copy assignment


    uint32_t getCommandID() const {
        return header.commandID;
    }

    uint32_t getPayloadSize() const {
        return header.payloadSize;
    }

    const uint8_t* getPayload() const {
        return payload;
    }

    void writePayload(const uint8_t* data, uint32_t size) {
        if (size > header.payloadSize) {
            std::cerr << "Error: Payload size exceeds allocated size\n";
            return; // Prevent buffer overflow!
        }
        if (payload != nullptr && data != nullptr){
            std::memcpy(payload, data, size);
        }
    }
    
    // Packs the header and payload into a single contiguous byte array for sending
    std::vector<uint8_t> serialize() const {
        std::vector<uint8_t> buffer(sizeof(Header) + header.payloadSize);
        // Copy header to the beginning
        std::memcpy(buffer.data(), &header, sizeof(Header));
        // Copy payload right after the header
        if (payload != nullptr && header.payloadSize > 0) {
            std::memcpy(buffer.data() + sizeof(Header), payload, header.payloadSize);
        }
        return buffer;
    }

};   

#endif // PACKET_H