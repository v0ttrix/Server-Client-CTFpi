#include <iostream>
#include <vector>
#include <fstream>
#include <atomic>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include "packet.h"


enum class ServerState {
    ONLINE,
    MAINTENANCE
};

Class CTFServer{
    private:
    int listenFd;
    std::atomic<ServerState> serverState;

   void logPacket(const NetworkPacket& p, const std::string& dir) {
        std::ofstream f("packet_audit.log", std::ios::app);
        if (f.is_open()) {
            f << "[" << dir << "] Cmd:" << static_cast<uint32_t>(p.getCommandID()) 
              << " Size:" << p.getPayloadSize() << " CRC:0x" << std::hex << p.getPayloadCrc() << std::dec << "\n";
        }
    }

    bool recieveExact(int fd, uint8_t* buffer, size_t size) {
        size_t totalReceived = 0;
        while (totalReceived < size) {
            ssize_t received = recv(fd, buffer + totalReceived, size - totalReceived, 0);
            if (received <= 0) {
                return false; 
            }
            totalReceived += received;
        }
        return true;
    }

    public:
    CTFServer() : listenFd(-1), serverState(ServerState::ONLINE) {}

    void start(int port) {
        listenFd = socket(AF_INET, SOCK_STREAM, 0);
        int opt =1;
        setsockopt(listenFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_addr.s_addr = INADDR_ANY;
        addr.sin_port = htons(port);

        if(bind(listenFd, (sockaddr*)&addr, sizeof(addr)) < 0){
            std::cerr << "Bind failed\n";
            return;
        }
        listen(listenFd, 5);
        std::cout << "Server listening on port " << port << "\n";

        while(true){
            int client = accept(listenFd, nullptr, nullptr);
            if (client >=0 {
                std::thread(&CTFServer::handleClient, this, client).detach();
            })
        }
    }

    void handleClient(int fd){
        try{
            std::vector<uint8_t> headerBuffer(sizeof(Header));
            if (!recieveExact(fd, headerBuffer.data(), sizeof(Header))) {
                std::cerr << "Failed to receive header\n";
                return;
            }
            NetworkPacket headerPacket = NetworkPacket::deserialize(headerBuffer.data(), sizeof(Header));
            if (headerPacket >0){
                std::vector<uint8_t> payloadBuffer(headerPacket.getPayloadSize());
                std::memcpy(fullBuf.data(), hBuf.data(), sizeof(Header));
                if(!recieveExact(fd.fullBuf.data() + sizeof(Header), payLoadSize)){
                    std::cerr << "Failed to receive payload\n";
                    return;
                }
            }
                req = NetworkPacket::deserialize(fullBuf.data(), fullBuf.size());
                logPacket(req, "RECEIVED");
                processCommand(fd, req);
            
        }catch(const std::exception& e){
            std::cerr << "Error handling client: " << e.what() << "\n";
           
        }
         close(fd);
    }

    

    
}

