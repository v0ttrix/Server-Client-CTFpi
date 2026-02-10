#include <sys/socket.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <netinet/in.h>
#include <unistd.h>
#include <fcntl.h>
#include <iostream>
#include <string>
#include <cstring>
#include <sstream>
#include <map>

namespace
{
    constexpr int kInvalidSocket = -1;
    constexpr int kSocketError = -1;
    constexpr size_t kBufferSize = 8192;
    constexpr const char* kWebRoot = "./build";
    
    class HTTPServer
    {
    public:
        explicit HTTPServer(int port)
            : port_(port), listenFd_(kInvalidSocket)
        {
            initMimeTypes();
        }
        
        ~HTTPServer()
        {
            if (listenFd_ != kInvalidSocket)
            {
                ::close(listenFd_);
            }
        }
        
        int run()
        {
            if (!setupSocket())
            {
                return 0;
            }
            std::cout << "HTTP Server listening on 0.0.0.0:" << port_ << "\n";
            std::cout << "Serving files from: " << kWebRoot << "\n";
            
            while(true)
            {
                const int clientFd = ::accept(listenFd_, nullptr, nullptr);
                if (clientFd == kSocketError)
                {
                    continue;
                }
                handleClient(clientFd);
                ::close(clientFd);
            }
            return 1;
        }
        
    private:
        void initMimeTypes()
        {
            mimeTypes_[".html"] = "text/html";
            mimeTypes_[".htm"] = "text/html";
            mimeTypes_[".css"] = "text/css";
            mimeTypes_[".js"] = "application/javascript";
            mimeTypes_[".json"] = "application/json";
            mimeTypes_[".png"] = "image/png";
            mimeTypes_[".jpg"] = "image/jpeg";
            mimeTypes_[".jpeg"] = "image/jpeg";
            mimeTypes_[".gif"] = "image/gif";
            mimeTypes_[".svg"] = "image/svg+xml";
            mimeTypes_[".ico"] = "image/x-icon";
            mimeTypes_[".txt"] = "text/plain";
            mimeTypes_[".pdf"] = "application/pdf";
            mimeTypes_[".woff"] = "font/woff";
            mimeTypes_[".woff2"] = "font/woff2";
            mimeTypes_[".ttf"] = "font/ttf";
            mimeTypes_[".otf"] = "font/otf";
        }
        
        std::string getMimeType(const std::string& path) const
        {
            size_t dotPos = path.find_last_of('.');
            if (dotPos != std::string::npos)
            {
                std::string ext = path.substr(dotPos);
                auto it = mimeTypes_.find(ext);
                if (it != mimeTypes_.end())
                {
                    return it->second;
                }
            }
            return "application/octet-stream";
        }
        
        bool setupSocket()
        {
            listenFd_ = ::socket(AF_INET, SOCK_STREAM, 0);
            if (listenFd_ == kInvalidSocket)
            {
                std::cerr << "Error: Failed to create socket\n";
                return false;
            }
            
            int opt = 1;
            ::setsockopt(listenFd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
            
            sockaddr_in serverAddr{};
            serverAddr.sin_family = AF_INET;
            serverAddr.sin_addr.s_addr = INADDR_ANY;
            serverAddr.sin_port = htons(port_);
            
            if (::bind(listenFd_, reinterpret_cast<sockaddr*>(&serverAddr), sizeof(serverAddr)) == kSocketError)
            {
                std::cerr << "Error: Failed to bind socket\n";
                ::close(listenFd_);
                return false;
            }
            
            if (::listen(listenFd_, 10) == kSocketError)
            {
                std::cerr << "Error: Failed to listen on socket\n";
                ::close(listenFd_);
                return false;
            }
            
            return true;
        }
        
        void handleClient(int clientFd) const
        {
            char buffer[kBufferSize] = {0};
            const ssize_t bytesRead = ::recv(clientFd, buffer, sizeof(buffer) - 1, 0);
            
            if (bytesRead <= 0)
            {
                return;
            }
            
            // Parse HTTP request
            std::string request(buffer);
            std::istringstream iss(request);
            std::string method, path, protocol;
            iss >> method >> path >> protocol;
            
            std::cout << method << " " << path << "\n";
            
            if (method != "GET" && method != "HEAD")
            {
                sendError(clientFd, 405, "Method Not Allowed");
                return;
            }
            
            bool isHead = (method == "HEAD");
            
            // Handle root path
            if (path == "/")
            {
                path = "/index.html";
            }
            
            // Build full file path
            std::string filePath = std::string(kWebRoot) + path;
            
            // Security check: prevent directory traversal
            if (path.find("..") != std::string::npos)
            {
                sendError(clientFd, 403, "Forbidden");
                return;
            }
            
            serveFile(clientFd, filePath, isHead);
        }
        
        void serveFile(int clientFd, const std::string& filePath, bool isHead) const
        {
            // Check if file exists and get size
            struct stat fileStat;
            if (stat(filePath.c_str(), &fileStat) != 0)
            {
                sendError(clientFd, 404, "Not Found");
                return;
            }
            
            // Check if it's a regular file
            if (!S_ISREG(fileStat.st_mode))
            {
                sendError(clientFd, 403, "Forbidden");
                return;
            }
            
            // Get MIME type
            std::string mimeType = getMimeType(filePath);
            
            // Send HTTP headers
            std::ostringstream headers;
            headers << "HTTP/1.1 200 OK\r\n";
            headers << "Content-Type: " << mimeType << "\r\n";
            headers << "Content-Length: " << fileStat.st_size << "\r\n";
            headers << "Connection: close\r\n";
            headers << "\r\n";
            
            std::string headerStr = headers.str();
            ::send(clientFd, headerStr.c_str(), headerStr.size(), 0);
            
            // For HEAD requests, only send headers
            if (isHead)
            {
                return;
            }
            
            // Open file for GET requests
            int fd = open(filePath.c_str(), O_RDONLY);
            if (fd < 0)
            {
                return; // Headers already sent, can't send error
            }
            
            // Send file content
            char fileBuffer[kBufferSize];
            ssize_t bytesRead;
            while ((bytesRead = read(fd, fileBuffer, sizeof(fileBuffer))) > 0)
            {
                ::send(clientFd, fileBuffer, bytesRead, 0);
            }
            
            ::close(fd);
        }
        
        void sendError(int clientFd, int code, const char* message) const
        {
            std::ostringstream response;
            response << "HTTP/1.1 " << code << " " << message << "\r\n";
            response << "Content-Type: text/html\r\n";
            response << "Connection: close\r\n";
            response << "\r\n";
            response << "<!DOCTYPE html>\n";
            response << "<html><head><title>" << code << " " << message << "</title></head>\n";
            response << "<body><h1>" << code << " " << message << "</h1></body></html>\n";
            
            std::string responseStr = response.str();
            ::send(clientFd, responseStr.c_str(), responseStr.size(), 0);
        }
        
        int port_;
        int listenFd_;
        std::map<std::string, std::string> mimeTypes_;
    };
}

int main()
{
    HTTPServer server(8080);
    return server.run();
}
