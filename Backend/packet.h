
/**
 * @file packet.h
 * @brief Defines the network packet structure and serialization protocol.
 */

#ifndef PACKET_H
#define PACKET_H

#include <cstdint>
#include <cstring>
#include <string>
#include <iostream>
#include <vector>
#include <stdexcept>

#ifdef _WIN32
    #include <winsock2.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <arpa/inet.h>
#endif

/**
 * @brief Available commands for the network protocol.
 * 
 * Defines the operations the client can request from the server, 
 * as well as server response codes.
 */
enum class Command : uint32_t {
    NONE = 0,
    LOGIN = 100,
    TOGGLE_MAINTENANCE = 101,
    SET_ONLINE = 102,
    REQUEST_FLAG_IMAGE = 103, 
    ACK = 200,
    ERROR = 400
};

#pragma pack(push, 1)
/**
 * @brief Fixed-size header preceding every network packet.
 * 
 * This structure ensures that both the sender and receiver process
 * the incoming byte stream correctly by specifying what command is
 * being executed and how large the appended payload is.
 */
struct Header {
    /** @brief The command identifier indicating the action to perform. */
    Command commandID; 
    
    /** @brief The size of the incoming payload in bytes (0 if no payload). */
    uint32_t payloadSize;
    
    /** @brief Checksum of the payload to verify data integrity. */
    uint32_t payloadCRC; 
};
#pragma pack(pop)

/**
 * @brief Represents a single network packet in the CTF application.
 * 
 * Provides functionality for creating, reading, serializing, and 
 * deserializing packets sent over the TCP socket connection.
 */
class NetworkPacket {
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
    /**
     * @brief Constructs an empty packet with no command or payload.
     */
    NetworkPacket(){
        header.commandID = Command::NONE;
        header.payloadSize = 0;
        header.payloadCRC = 0;
        payload = nullptr;
    }
    
    /**
     * @brief Constructs a new packet with a specific command and pre-allocated payload size.
     * @param cmd The command to execute.
     * @param size The number of bytes to allocate for the payload.
     */
    NetworkPacket(Command cmd, uint32_t size){
        header.commandID = cmd;
        header.payloadSize = size;
        header.payloadCRC = 0; 
        payload = nullptr;
        
        if (size > 0){
            payload = new uint8_t[size];
            std::memset(payload, 0, size);
        } else {
            payload = nullptr;
        }
    }

    /**
     * @brief Destructor that automatically frees the payload memory.
     */
    ~NetworkPacket(){
        if (payload){
            delete[] payload;
        }
    }

    NetworkPacket(const NetworkPacket&) = delete; 
    NetworkPacket& operator=(const NetworkPacket&) = delete; 

    /**
     * @brief Move constructor to safely transfer payload ownership.
     * @param other The rvalue packet being moved from.
     */
    NetworkPacket(NetworkPacket&& other) noexcept {
        header = other.header;       
        payload = other.payload;     
        other.payload = nullptr;     
    }

    /**
     * @brief Move assignment operator.
     * @param other The rvalue packet being moved from.
     * @return Reference to this newly assigned packet.
     */
    NetworkPacket& operator=(NetworkPacket&& other) noexcept {
        if (this != &other) {
            delete[] payload;        
            header = other.header;   
            payload = other.payload; 
            other.payload = nullptr; 
        }
        return *this;
    }

    /**
     * @brief Retrieves the command ID of this packet.
     * @return The Command enum value.
     */
    Command getCommandID() const {
        return header.commandID;
    }

    /**
     * @brief Retrieves the expected size of the payload.
     * @return The size in bytes.
     */
    uint32_t getPayloadSize() const {
        return header.payloadSize;
    }

    /**
     * @brief Retrieves a read-only pointer to the payload data.
     * @return A pointer to the raw byte buffer.
     */
    const uint8_t* getPayload() const {
        return payload;
    }
    
    /**
     * @brief Retrieves the checksum associated with the payload.
     * @return The 32-bit CRC.
     */
    uint32_t getPayloadCrc() const {
        return header.payloadCRC;
    }

    /**
     * @brief Writes data into the packet's payload buffer and calculates the CRC.
     * @param data Pointer to the raw bytes to copy.
     * @param size The number of bytes to copy. Must not exceed the allocated payload size.
     */
    void writePayload(const uint8_t* data, uint32_t size) {
        if (size > header.payloadSize) {
            std::cerr << "Error: Payload size exceeds allocated size\n";
            return; 
        }
        if (payload != nullptr && data != nullptr){
            std::memcpy(payload, data, size);
            header.payloadCRC = calculateCRC32(payload, header.payloadSize); 
        }
    }
    
    /**
     * @brief Serializes the packet (header + payload) into a single byte array for network transmission.
     * 
     * Applies standard network byte order (endianness) to the header fields.
     * 
     * @return A vector of bytes representing the ready-to-send packet.
     */
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

    /**
     * @brief Deserializes a received byte array into a NetworkPacket object.
     * 
     * Converts network byte order back to host byte order and allocates memory
     * for the payload if one exists.
     * 
     * @param data Pointer to the raw incoming network buffer.
     * @param totalSize The total number of bytes received in the buffer.
     * @return A pointer to the dynamically allocated NetworkPacket. The caller is responsible for deleting it.
     * @throw std::runtime_error If the data is too small to contain a header or full payload.
     */
    static NetworkPacket* deserialize(const uint8_t* data, uint32_t totalSize) {
        if (totalSize < sizeof(Header)) {
            throw std::runtime_error("Data too small to contain header");
        }
        
        NetworkPacket* packet = new NetworkPacket();
        
        Header netHeader;
        std::memcpy(&netHeader, data, sizeof(Header));
        
        packet->header.commandID = static_cast<Command>(ntohl(static_cast<uint32_t>(netHeader.commandID)));
        packet->header.payloadSize = ntohl(netHeader.payloadSize);
        packet->header.payloadCRC = ntohl(netHeader.payloadCRC);

        if (totalSize > sizeof(Header) && totalSize < sizeof(Header) + packet->header.payloadSize) {
            throw std::runtime_error("Data too small to contain complete payload");
        }
        
        if (packet->header.payloadSize > 0) {
            packet->payload = new uint8_t[packet->header.payloadSize];
            std::memcpy(packet->payload, data + sizeof(Header), packet->header.payloadSize);
        }
        
        return packet;
    }
};   

#endif // PACKET_H