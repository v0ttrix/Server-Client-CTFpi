// Backend/tests/test_packet.cpp
#include <gtest/gtest.h>
#include <vector>
#include <string>
#include <cstring>
#include "../packet.h"

// Test basic packet creation
TEST(PacketTest, ConstructorSetsCorrectValues) {
    NetworkPacket packet(Command::LOGIN, 128);
    
    EXPECT_EQ(packet.getCommandID(), Command::LOGIN);
    EXPECT_EQ(packet.getPayloadSize(), 128);
    EXPECT_NE(packet.getPayload(), nullptr); // Payload should be allocated
}

//  Test writing and reading the payload
TEST(PacketTest, CanWriteAndReadPayload) {
    NetworkPacket packet(Command::LOGIN, 5);
    
    const uint8_t data[] = {'H', 'E', 'L', 'L', 'O'};
    packet.writePayload(data, 5);
    
    const uint8_t* payloadOut = packet.getPayload();
  
    EXPECT_EQ(std::memcmp(data, payloadOut, 5), 0);
}

//  Test Serialization and Deserialization (End-to-End)
TEST(PacketTest, SerializeAndDeserialize) {
    
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
    

    delete reconstructed;
}

///
/// THIS SECTION NEEDS TO BE COMPILED AND RUN ON JADENS MACHINE TO TEST!
///

// Test deserialization with invalid data
TEST(PacketTest, DeserializeInvalidDataReturnsNull) {
    // Arrange: Create an invalid buffer (too small)
    std::vector<uint8_t> invalidBuffer = {0x01};
    
    // Act: Attempt to deserialize
    NetworkPacket* packet = NetworkPacket::deserialize(invalidBuffer.data(), invalidBuffer.size());
    
    // Assert: Should return nullptr due to invalid data
    EXPECT_EQ(packet, nullptr);
}

// Test deserialization with mismatched payload size
TEST(PacketTest, DeserializeOnTruncatedPayload)
{
    NetworkPacket original(Command::LOGIN, 10);
    std::vector<uint8_t> buffer = original.serialize();

    EXPECT_THROW (NetworkPacket::deserialize(buffer.data(), buffer.size() - 5), std::runtime_error);
}
// Test CRC calculation on payload write
TEST(PacketTest, CRCCalculateOnWrite){
    NetworkPacket, packet(Command::LOGIN, 4);
    EXPECT_EQ(packet.getPayloadCrc(), 0); // CRC should be 0 before writing payload

    const uint8_t data[] ="test";
    packet.writePayload(data, 4);
    EXPECT_NE(packet.getPayloadCrc(), 0); // CRC should be calculated after writing payload
}
// Test move constructor transfers ownership
TEST(PacketTest, MoveConstructorTransfersOwnership){
    NetworkPacket original(Command::LOGIN, 8);
    const uint8_t data[] = "flagdata";
    original.writePayload(data, 8);

    NetworkPacket moved(std::move(original));

    EXPECT_EQ(moved.getCommandID(), Command::LOGIN);
    EXPECT_EQ(moved.getPayloadSize(), 8);
    EXPECT_EQ(std::memcmp(moved.getPayload(), "flagdata", 8), 0);
    EXPECT_EQ(original.getPayload(), nullptr); // Original should have released ownership
}
// Test default constructor initializes to NONE command and empty payload
TEST(PacketTest, DefaultConstructorInitializesCorrectly){
    NetworkPacket packet;

    EXPECT_EQ(packet.getCommandID(), Command::NONE);
    EXPECT_EQ(packet.getPayloadSize(), 0);
    EXPECT_EQ(packet.getPayload(), nullptr);
    EXPECT_EQ(packet.getPayloadCrc(), 0);
}

TEST(PacketTest, HandlesZeroLengthPayload){
    NetworkPacket emptyPacket(Command::ACK, 0);
    EXPECT_EQ(emptyPacket.getPayloadSize(), nullptr);

    std::vector<uint8_t> buffer = emptyPacket.serialize();
    NetworkPacket* deserialized = NetworkPacket::deserialize(buffer.data(), buffer.size());

    EXPECT_EQ(deserialized->getCommandID(), Command::ACK);
    EXPECT_EQ(deserialized->getPayloadSize(), 0);
    EXPECT_EQ(deserialized->getPayload(), nullptr);

    delete deserialized;
}
// Test that writing more data than the allocated payload size does not cause buffer overflow
TEST(PacketTest, WritePayloadPreventsBufferOverflow){
    NetworkPacket packet(Command::LOGIN, 5);
    const uint8_t data[] = "This is way to much data for the allocated payload";

    packet.writePayload(data, sizeof(data)); // Attempt to write more than allocated

    const uint8_t* payloadOut = packet.getPayload();
    for(int i = 0; i < 5; i++){
        EXPECT_EQ(payloadOut[i], 0); // Payload should remain unchanged (zeroed)
    }

TEST(PacketTest, MoveAssignmentTransfersOwnership){
    NetworkPacket original(Command::LOGIN, 8);
    packet1.writepayload((const uint8_t*)"flagdata", 8);


    NetworkPacket packet2(Command::NONE, 0);
    packet2 = std::move(packet1);

    EXPECT_EQ(packet2.getCommandID(), Command::LOGIN);
    EXPECT_EQ(packet2.getPayloadSize(), 8);
    EXPECT_NE(packet2.getPayload(), nullptr);


    EXPECT_EQ(p1.getPayload(), nullptr); // Original should have released ownership
}
