#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <fcntl.h>

#define INVALID_SOCKET -1
#define SOCKET_ERROR -1
#define BUFFER_SIZE 4096
#define WEB_ROOT "./build"

typedef struct
{
    int ChallengeID; //a unique challenge identifier
    char Category[64]; //challenge category (null-terminated)
    char Title[64];  //challenge title (null-terminated)
    float Points;    //points awarded for solving
} CTFChallenge;

const char* get_mime_type(const char* path)
{
    const char* ext = strrchr(path, '.');
    if (!ext) return "application/octet-stream";
    
    if (strcmp(ext, ".html") == 0) return "text/html";
    if (strcmp(ext, ".css") == 0) return "text/css";
    if (strcmp(ext, ".js") == 0) return "application/javascript";
    if (strcmp(ext, ".json") == 0) return "application/json";
    if (strcmp(ext, ".png") == 0) return "image/png";
    if (strcmp(ext, ".jpg") == 0 || strcmp(ext, ".jpeg") == 0) return "image/jpeg";
    if (strcmp(ext, ".svg") == 0) return "image/svg+xml";
    if (strcmp(ext, ".ico") == 0) return "image/x-icon";
    
    return "application/octet-stream";
}

void send_response(int socket_fd, int status_code, const char* status_text, 
                   const char* content_type, const char* body, size_t body_len)
{
    char header[BUFFER_SIZE];
    snprintf(header, sizeof(header),
             "HTTP/1.1 %d %s\r\n"
             "Content-Type: %s\r\n"
             "Content-Length: %zu\r\n"
             "Connection: close\r\n"
             "\r\n",
             status_code, status_text, content_type, body_len);
    
    send(socket_fd, header, strlen(header), 0);
    if (body && body_len > 0)
    {
        send(socket_fd, body, body_len, 0);
    }
}

void serve_file(int socket_fd, const char* filepath)
{
    struct stat st;
    if (stat(filepath, &st) != 0)
    {
        const char* error_msg = "404 Not Found";
        send_response(socket_fd, 404, "Not Found", "text/plain", error_msg, strlen(error_msg));
        return;
    }
    
    int fd = open(filepath, O_RDONLY);
    if (fd < 0)
    {
        const char* error_msg = "500 Internal Server Error";
        send_response(socket_fd, 500, "Internal Server Error", "text/plain", error_msg, strlen(error_msg));
        return;
    }
    
    char* file_content = malloc(st.st_size);
    if (!file_content)
    {
        close(fd);
        const char* error_msg = "500 Internal Server Error";
        send_response(socket_fd, 500, "Internal Server Error", "text/plain", error_msg, strlen(error_msg));
        return;
    }
    
    read(fd, file_content, st.st_size);
    close(fd);
    
    const char* mime_type = get_mime_type(filepath);
    send_response(socket_fd, 200, "OK", mime_type, file_content, st.st_size);
    
    free(file_content);
}

void handle_http_request(int socket_fd)
{
    char buffer[BUFFER_SIZE] = {0};
    recv(socket_fd, buffer, sizeof(buffer) - 1, 0);
    
    char method[16], path[256], protocol[16];
    sscanf(buffer, "%s %s %s", method, path, protocol);
    
    printf("Request: %s %s\n", method, path);
    
    if (strcmp(method, "GET") != 0)
    {
        const char* error_msg = "405 Method Not Allowed";
        send_response(socket_fd, 405, "Method Not Allowed", "text/plain", error_msg, strlen(error_msg));
        return;
    }
    
    char filepath[512];
    if (strcmp(path, "/") == 0)
    {
        snprintf(filepath, sizeof(filepath), "%s/index.html", WEB_ROOT);
    }
    else
    {
        snprintf(filepath, sizeof(filepath), "%s%s", WEB_ROOT, path);
    }
    
    serve_file(socket_fd, filepath);
}

int main()
{
    struct sockaddr_in SvrAddr;
    int WelcomeSocket, ConnectionSocket;
    int opt = 1;

    //create welcoming socket at port and bind local address
    if ((WelcomeSocket = socket(AF_INET, SOCK_STREAM, 0)) == INVALID_SOCKET)
    {
        printf("ERROR:  Failed to create WelcomeSocket\n");
        return 0;
    }

    //to set socket options to reuse address
    setsockopt(WelcomeSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    SvrAddr.sin_family = AF_INET;
    SvrAddr.sin_addr.s_addr = INADDR_ANY;
    SvrAddr.sin_port = htons(8080);

    if ((bind(WelcomeSocket, (struct sockaddr*)&SvrAddr, sizeof(SvrAddr))) == SOCKET_ERROR)
    {
        printf("ERROR:  Failed to bind WelcomeSocket\n");
        close(WelcomeSocket);
        return 0;
    }

    //specify the maximum number of clients that can be queued
    if (listen(WelcomeSocket, 10) == SOCKET_ERROR)
    {
        printf("ERROR:  Failed to start Listening Port\n");
        close(WelcomeSocket);
        return 0;
    }

    printf("CTF Web Server running on http://0.0.0.0:8080\n");
    printf("Serving React app from: %s\n", WEB_ROOT);
    
    ConnectionSocket = SOCKET_ERROR;

    while (1)
    {
        //wait for an incoming connection from a client
        if ((ConnectionSocket = accept(WelcomeSocket, NULL, NULL)) != SOCKET_ERROR)
        {
            handle_http_request(ConnectionSocket);
            close(ConnectionSocket);
        }
    }

    return 1;
}
