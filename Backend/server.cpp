#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <unistd.h>
#include <iostream>
#include <string>

namespace
{
    constexpr int kInvalidSocket = -1;
    constexpr int kSocketError = -1;
    constexpr size_t kBufferSize = 1024;
    class TCPserver
    {
    public:
      explicit TCPserver(int port)
        :port_(port),listenFd_(kInvalidSocket)
        {
            //empty for now
        }
        int run()
        {
          if (!setupSocket())
            {
             return 0;
            }
            std::cout<<"listening on 0.0.0.0:"<<port_ << "\n";
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
        bool setupSocket()
        {
            listenFd_ = ::socket(AF_INET, SOCK_STREAM,0);
            if (listenFd_ == kInvalidSocket)
            {
              std::cerr << "error1: the server failed to create socket\n";
                return false;
            }
            int opt = 1;
            ::setsockopt(listenFd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
            sockaddr_in serverAddr{};
            serverAddr.sin_family = AF_INET;
            serverAddr.sin_addr.s_addr = INADDR_ANY;
            serverAddr.sin_port = htons(port_);
            if (::bind(listenFd_, reinterpret_cast<sockaddr*>(&serverAddr),sizeof(serverAddr)) == kSocketError)
            {
                std::cerr << "error2: the server failed to bind socket\n";
                ::close(listenFd_);
                return false;
            }
            if (::listen(listenFd_, 5) == kSocketError)
            {
                std::cerr << "error3: the server failed to listen on socket\n";
                ::close(listenFd_);
                return false;
            }
            return true;
        }
        void handleClient(int clientFd) const
        {
            char buffer[kBufferSize] = {0};
            const auto bytesRead = ::recv(clientFd,buffer,sizeof(buffer) - 1,0);
            if (bytesRead <= 0)
            {
                return;
            }
            std::cout << "Received: " << buffer << "\n";
            const std::string response = "ACK\n";
            ::send(clientFd, response.c_str(), response.size(),0);
        }
        int port_;
        int listenFd_;
    };
}
int main()
{
 TCPserver server(8080);
 return server.run();
}