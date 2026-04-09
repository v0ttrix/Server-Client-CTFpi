#include <iostream>
#include <vector>
#include <fstream>
#include <atomic>
#include <thread>
#include <mutex>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <libpq-fe.h>
#include <nlohmann/json.hpp>
#include "packet.h"

enum class ServerState { ONLINE, MAINTENANCE, OFFLINE };

class CTFServer {
private:
    int listenFd;
    std::atomic<ServerState> serverState;
    std::string dbConnStr;
    std::mutex dbMutex;

    void loadDbConfig() {
        std::ifstream f("db_config.json");
        if (!f.is_open()) {
            std::cerr << "Warning: db_config.json not found\n";
            return;
        }
        auto cfg = nlohmann::json::parse(f);
        auto& db = cfg["database"];
        dbConnStr = "host=" + db["host"].get<std::string>() +
                    " port=" + std::to_string(db["port"].get<int>()) +
                    " dbname=" + db["dbname"].get<std::string>() +
                    " user=" + db["user"].get<std::string>() +
                    " password=" + db["password"].get<std::string>();
    }

    void storeLogin(const std::string& username, const std::string& password, const std::string& ip) {
        std::lock_guard<std::mutex> lock(dbMutex);
        PGconn* conn = PQconnectdb(dbConnStr.c_str());
        if (PQstatus(conn) != CONNECTION_OK) {
            std::cerr << "DB error: " << PQerrorMessage(conn) << "\n";
            PQfinish(conn);
            return;
        }
        const char* params[] = { username.c_str(), password.c_str(), ip.c_str() };
        PGresult* res = PQexecParams(conn,
            "INSERT INTO ctf.login_attempts (username, password, ip_address) VALUES ($1, $2, $3)",
            3, nullptr, params, nullptr, nullptr, 0);
        if (PQresultStatus(res) != PGRES_COMMAND_OK)
            std::cerr << "Insert error: " << PQerrorMessage(conn) << "\n";
        PQclear(res);
        PQfinish(conn);
    }

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
            if (received <= 0) return false;
            totalReceived += received;
        }
        return true;
    }

    std::string getClientIP(int fd) {
        sockaddr_in addr{};
        socklen_t len = sizeof(addr);
        if (getpeername(fd, (sockaddr*)&addr, &len) == 0)
            return inet_ntoa(addr.sin_addr);
        return "unknown";
    }

    void handleClient(int fd) {
        bool isAuthenticated = false;
        std::string clientIP = getClientIP(fd);
        try {
            while (true) {
                std::vector<uint8_t> headerBuffer(sizeof(Header));
                if (!recieveExact(fd, headerBuffer.data(), sizeof(Header))) break;

                NetworkPacket* headerPeek = NetworkPacket::deserialize(headerBuffer.data(), sizeof(Header));
                uint32_t payloadSize = headerPeek->getPayloadSize();
                delete headerPeek;

                std::vector<uint8_t> fullBuf(sizeof(Header) + payloadSize);
                std::memcpy(fullBuf.data(), headerBuffer.data(), sizeof(Header));

                if (payloadSize > 0) {
                    if (!recieveExact(fd, fullBuf.data() + sizeof(Header), payloadSize)) break;
                }

                NetworkPacket* req = NetworkPacket::deserialize(fullBuf.data(), fullBuf.size());
                logPacket(*req, "RECEIVED");
                processCommand(fd, *req, isAuthenticated, clientIP);
                delete req;
            }
        } catch (const std::exception& e) {
            std::cerr << "Error handling client: " << e.what() << "\n";
        }
        close(fd);
    }

    void processCommand(int fd, const NetworkPacket& packet, bool& isAuthenticated, const std::string& clientIP) {
        Command cmd = packet.getCommandID();

        if (cmd == Command::LOGIN) {
            std::string payload(reinterpret_cast<const char*>(packet.getPayload()), packet.getPayloadSize());
            std::string username = "unknown", password = "unknown";
            auto sep = payload.find(':');
            if (sep != std::string::npos) {
                username = payload.substr(0, sep);
                password = payload.substr(sep + 1);
            }
            storeLogin(username, password, clientIP);

            isAuthenticated = true;
            std::string response = "Login successful";
            NetworkPacket res(Command::ACK, response.size());
            res.writePayload(reinterpret_cast<const uint8_t*>(response.data()), response.size());
            sendPacket(fd, res);
            return;
        }
        if (!isAuthenticated) {
            std::string response = "Unauthorized";
            NetworkPacket res(Command::ERROR, response.size());
            res.writePayload(reinterpret_cast<const uint8_t*>(response.data()), response.size());
            sendPacket(fd, res);
            return;
        }
        if (cmd == Command::TOGGLE_MAINTENANCE) {
            serverState = ServerState::MAINTENANCE;
            std::string response = "Server in maintenance mode";
            NetworkPacket res(Command::ACK, response.size());
            res.writePayload(reinterpret_cast<const uint8_t*>(response.data()), response.size());
            sendPacket(fd, res);
            return;
        }
        if (cmd == Command::REQUEST_FLAG_IMAGE) {
            std::string flagPath = "flag.png";
            std::ifstream f(flagPath, std::ios::binary);
            if (!f.is_open()) {
                std::string response = "Flag not found";
                NetworkPacket res(Command::ERROR, response.size());
                res.writePayload(reinterpret_cast<const uint8_t*>(response.data()), response.size());
                sendPacket(fd, res);
                return;
            }
            f.seekg(0, std::ios::end);
            size_t fileSize = f.tellg();
            f.seekg(0, std::ios::beg);
            NetworkPacket res(Command::ACK, fileSize);
            std::vector<uint8_t> fileData(fileSize);
            f.read(reinterpret_cast<char*>(fileData.data()), fileSize);
            res.writePayload(fileData.data(), fileSize);
            sendPacket(fd, res);
        }
    }

    void sendPacket(int fd, const NetworkPacket& packet) {
        std::vector<uint8_t> data = packet.serialize();
        send(fd, data.data(), data.size(), 0);
        logPacket(packet, "SENT");
    }

public:
    CTFServer() : listenFd(-1), serverState(ServerState::ONLINE) { loadDbConfig(); }

    void start(int port) {
        listenFd = socket(AF_INET, SOCK_STREAM, 0);
        int opt = 1;
        setsockopt(listenFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_addr.s_addr = INADDR_ANY;
        addr.sin_port = htons(port);
        if (bind(listenFd, (sockaddr*)&addr, sizeof(addr)) < 0) {
            std::cerr << "Bind failed\n";
            return;
        }
        listen(listenFd, 5);
        std::cout << "Server listening on port " << port << "\n";
        while (true) {
            int client = accept(listenFd, nullptr, nullptr);
            if (client >= 0)
                std::thread(&CTFServer::handleClient, this, client).detach();
        }
    }
};

int main() {
    CTFServer server;
    server.start(8080);
    return 0;
}
