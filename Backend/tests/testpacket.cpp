// Backend/tests/test_packet.cpp
#include <gtest/gtest.h>
#include <vector>
#include <string>
#include <cstring>
#include "../packet.h"

// 1. Test basic packet creation
TEST(PacketTest, ConstructorSetsCorrectValues) {
    NetworkPacket packet(Command::LOGIN, 128);
    
    EXPECT_EQ(packet.getCommandID(), Command::LOGIN);
    EXPECT_EQ(packet.getPayloadSize(), 128);
    EXPECT_NE(packet.getPayload(), nullptr); // Payload should be allocated
}

// 2. Test writing and reading the payload
TEST(PacketTest, CanWriteAndReadPayload) {
    NetworkPacket packet(Command::LOGIN, 5);
    
    const uint8_t data[] = {'H', 'E', 'L', 'L', 'O'};
    packet.writePayload(data, 5);
    
    const uint8_t* payloadOut = packet.getPayload();
    // Compare the memory to ensure it matches
    EXPECT_EQ(std::memcmp(data, payloadOut, 5), 0);
}

// 3. Test Serialization and Deserialization (End-to-End)
TEST(PacketTest, SerializeAndDeserialize) {
    // Arrange: Create a packet and give it data
    NetworkPacket original(Command::TOGGLE_MAINTENANCE, 4);
    const uint8_t data[] = "test";
    original.writePayload(data, 4);
    
    // Act: Serialize to byte array
    std::vector<uint8_t> buffer = original.serialize();
    
    // Act: Deserialize back into a new packet pointer
    NetworkPacket* reconstructed = NetworkPacket::deserialize(buffer.data(), buffer.size());
    
    // Assert: The new packet should identically match the original
    ASSERT_NE(reconstructed, nullptr);
    EXPECT_EQ(reconstructed->getCommandID(), Command::TOGGLE_MAINTENANCE);
    EXPECT_EQ(reconstructed->getPayloadSize(), 4);
    EXPECT_EQ(std::memcmp(reconstructed->getPayload(), "test", 4), 0);
    
    // Cleanup
    delete reconstructed;
}
