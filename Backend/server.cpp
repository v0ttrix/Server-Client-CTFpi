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
#include <vector>
#include <fstream>
#include <nlohmann/json.hpp>
#include <libpq-fe.h>

namespace
{
    using json = nlohmann::json;
    
    constexpr int kInvalidSocket = -1;
    constexpr int kSocketError = -1;
    constexpr size_t kBufferSize = 8192;
    constexpr const char* kWebRoot = "./build";
    
    class ConfigManager
    {
    public:
        static ConfigManager& getInstance()
        {
            static ConfigManager instance;
            return instance;
        }
        
        bool loadConfig(const std::string& configPath)
        {
            try
            {
                std::ifstream file(configPath);
                if (!file.is_open())
                {
                    std::cerr << "Failed to open config file: " << configPath << "\n";
                    return false;
                }
                config_ = json::parse(file);
                return true;
            }
            catch (const std::exception& e)
            {
                std::cerr << "Config parse error: " << e.what() << "\n";
                return false;
            }
        }
        
        std::string getString(const std::string& path) const
        {
            try
            {
                auto parts = parsePath(path);
                json current = config_;
                for (const auto& part : parts)
                {
                    current = current[part];
                }
                return current.get<std::string>();
            }
            catch (...)
            {
                return "";
            }
        }
        
        int getInt(const std::string& path) const
        {
            try
            {
                auto parts = parsePath(path);
                json current = config_;
                for (const auto& part : parts)
                {
                    current = current[part];
                }
                return current.get<int>();
            }
            catch (...)
            {
                return 0;
            }
        }
        
    private:
        ConfigManager() = default;
        
        std::vector<std::string> parsePath(const std::string& path) const
        {
            std::vector<std::string> parts;
            std::istringstream iss(path);
            std::string part;
            while (std::getline(iss, part, '.'))
            {
                parts.push_back(part);
            }
            return parts;
        }
        
        json config_;
    };
    
    class DatabaseManager
    {
    public:
        static DatabaseManager& getInstance()
        {
            static DatabaseManager instance;
            return instance;
        }
        
        bool connect()
        {
            auto& config = ConfigManager::getInstance();
            std::string connStr = "host=" + config.getString("database.host") +
                                 " port=" + std::to_string(config.getInt("database.port")) +
                                 " user=" + config.getString("database.user") +
                                 " password=" + config.getString("database.password") +
                                 " dbname=" + config.getString("database.dbname");
            
            conn_ = PQconnectdb(connStr.c_str());
            
            if (PQstatus(conn_) != CONNECTION_OK)
            {
                std::cerr << "Database connection failed: " << PQerrorMessage(conn_) << "\n";
                PQfinish(conn_);
                conn_ = nullptr;
                return false;
            }
            
            std::cout << "Connected to PostgreSQL database\n";
            return true;
        }
        
        json query(const std::string& sql) const
        {
            if (!conn_)
            {
                return json{{"error", "No database connection"}};
            }
            
            PGresult* res = PQexec(conn_, sql.c_str());
            
            if (PQresultStatus(res) != PGRES_TUPLES_OK && 
                PQresultStatus(res) != PGRES_COMMAND_OK)
            {
                std::string error = PQerrorMessage(conn_);
                PQclear(res);
                return json{{"error", error}};
            }
            
            json result = json::array();
            int rows = PQntuples(res);
            int cols = PQnfields(res);
            
            for (int i = 0; i < rows; ++i)
            {
                json row;
                for (int j = 0; j < cols; ++j)
                {
                    const char* val = PQgetvalue(res, i, j);
                    const char* colName = PQfname(res, j);
                    row[colName] = (val && *val) ? val : nullptr;
                }
                result.push_back(row);
            }
            
            PQclear(res);
            return result;
        }
        
        ~DatabaseManager()
        {
            if (conn_)
            {
                PQfinish(conn_);
            }
        }
        
    private:
        DatabaseManager() : conn_(nullptr) {}
        PGconn* conn_;
    };
    
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
            
            // Handle API routes
            if (path.find("/api/") == 0)
            {
                handleAPI(clientFd, method, path, request);
                return;
            }
            
            // Handle static files
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
        
        void handleAPI(int clientFd, const std::string& method, const std::string& path, const std::string& request) const
        {
            json response;
            int statusCode = 200;
            
            if (path == "/api/auth/login" && method == "POST")
            {
                response = handleLogin(request);
                statusCode = response.contains("error") ? 401 : 200;
            }
            else if (path == "/api/challenges" && method == "GET")
            {
                response = handleGetChallenges();
            }
            else if (path == "/api/profile" && method == "GET")
            {
                response = handleGetProfile(request);
            }
            else if (path.find("/api/challenges/") == 0 && method == "POST")
            {
                // Extract challenge ID from path
                std::string idStr = path.substr(strlen("/api/challenges/"));
                idStr = idStr.substr(0, idStr.find('/'));
                response = handleSolveChallenge(request, idStr);
            }
            else
            {
                statusCode = 404;
                response = json{{"error", "Not Found"}};
            }
            
            sendJSON(clientFd, response, statusCode);
        }
        
        json handleLogin(const std::string& requestBody) const
        {
            try
            {
                size_t bodyStart = requestBody.find("\r\n\r\n");
                if (bodyStart == std::string::npos)
                {
                    return json{{"success", false}};
                }
                
                std::string body = requestBody.substr(bodyStart + 4);
                auto data = json::parse(body);
                
                std::string username = data["username"];
                std::string password = data["password"];
                
                // Check if user exists
                std::string checkSql = "SELECT userID, username, score FROM ctf.users WHERE username = '" + 
                                      escapeSQL(username) + "';";
                
                auto& db = DatabaseManager::getInstance();
                json result = db.query(checkSql);
                
                if (result.is_array() && result.size() > 0)
                {
                    // User exists, return their data
                    return json{
                        {"success", true},
                        {"user", result[0]}
                    };
                }
                
                // User doesn't exist, insert with provided password
                std::string insertSql = "INSERT INTO ctf.users (username, password_hash, score) VALUES ('" +
                                       escapeSQL(username) + "', '" +
                                       escapeSQL(password) + "', 0) RETURNING userID, username, score;";
                
                json insertResult = db.query(insertSql);
                
                if (insertResult.is_array() && insertResult.size() > 0)
                {
                    return json{
                        {"success", true},
                        {"user", insertResult[0]}
                    };
                }
                
                // If insertion fails (duplicate), just fetch the user
                json retryResult = db.query(checkSql);
                if (retryResult.is_array() && retryResult.size() > 0)
                {
                    return json{
                        {"success", true},
                        {"user", retryResult[0]}
                    };
                }
                
                return json{{"success", false}};
            }
            catch (const std::exception& e)
            {
                return json{{"success", false}};
            }
        }
        
        json handleGetChallenges() const
        {
            std::string sql = "SELECT challengeID, title, description, points, difficulty FROM ctf.challenges;";
            auto& db = DatabaseManager::getInstance();
            return db.query(sql);
        }
        
        json handleGetProfile(const std::string& requestBody) const
        {
            // Extract userID from query params or headers
            size_t userIdPos = requestBody.find("userID=");
            if (userIdPos == std::string::npos)
            {
                return json{{"error", "Missing userID"}};
            }
            
            std::string userIdStr = requestBody.substr(userIdPos + 7, 10);
            userIdStr = userIdStr.substr(0, userIdStr.find_first_of("& \r\n"));
            
            std::string sql = "SELECT userID, username, score, lastLogin FROM ctf.users WHERE userID = " + userIdStr + ";";
            auto& db = DatabaseManager::getInstance();
            return db.query(sql);
        }
        
        json handleSolveChallenge(const std::string& requestBody, const std::string& challengeID) const
        {
            try
            {
                size_t bodyStart = requestBody.find("\r\n\r\n");
                if (bodyStart == std::string::npos)
                {
                    return json{{"error", "Invalid request"}};
                }
                
                std::string body = requestBody.substr(bodyStart + 4);
                auto data = json::parse(body);
                int userID = data["userID"];
                
                std::string sql = "INSERT INTO ctf.solved (challengeID, userID) VALUES (" + 
                                 challengeID + ", " + std::to_string(userID) + ") ON CONFLICT DO NOTHING;";
                
                auto& db = DatabaseManager::getInstance();
                db.query(sql);
                
                return json{{"success", true}, {"message", "Challenge solved"}};
            }
            catch (const std::exception& e)
            {
                return json{{"error", std::string(e.what())}};
            }
        }
        
        void sendJSON(int clientFd, const json& data, int statusCode) const
        {
            std::string jsonStr = data.dump();
            std::ostringstream response;
            response << "HTTP/1.1 " << statusCode << " OK\r\n";
            response << "Content-Type: application/json\r\n";
            response << "Content-Length: " << jsonStr.size() << "\r\n";
            response << "Access-Control-Allow-Origin: *\r\n";
            response << "Connection: close\r\n";
            response << "\r\n";
            response << jsonStr;
            
            std::string responseStr = response.str();
            ::send(clientFd, responseStr.c_str(), responseStr.size(), 0);
        }
        
        std::string escapeSQL(const std::string& input) const
        {
            std::string result;
            for (char c : input)
            {
                if (c == '\'')
                    result += "''";
                else
                    result += c;
            }
            return result;
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
    // Load configuration
    auto& config = ConfigManager::getInstance();
    if (!config.loadConfig("db_config.json"))
    {
        std::cerr << "Failed to load configuration\n";
        return 1;
    }
    
    // Connect to database
    auto& db = DatabaseManager::getInstance();
    if (!db.connect())
    {
        std::cerr << "Failed to connect to database\n";
        return 1;
    }
    
    int serverPort = config.getInt("server.port");
    HTTPServer server(serverPort);
    return server.run();
}
