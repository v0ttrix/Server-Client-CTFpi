# CTF Server Backend

C++ HTTP server with PostgreSQL integration for the CTF platform.

## Setup

### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get install libpq-dev nlohmann-json3-dev
```

**macOS:**
```bash
brew install libpq nlohmann-json
```

**Fedora:**
```bash
sudo dnf install libpq-devel nlohmann_json-devel
```

### 2. Configure Database

1. Copy the config template:
```bash
cp ../db_config.example.json db_config.json
```

2. Edit `db_config.json` with your PostgreSQL credentials:
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "your_user",
    "password": "your_password",
    "dbname": "ctf",
    "schema": "ctf"
  },
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  }
}
```

3. Run the SQL schema (provided in the project root):
```bash
psql -U postgres -d ctf -f ctf_schema.sql
```

### 3. Build the Server

```bash
mkdir -p build
cd build
cmake ..
make
```

### 4. Run the Server

```bash
./ctf_server
```

The server will:
- Load configuration from `db_config.json`
- Connect to PostgreSQL
- Listen on port 8080 (configurable)
- Serve static files from `./build` directory
- Handle API requests at `/api/*` endpoints

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
  - Body: `{"username": "user", "password": "pass"}`
  - Returns: `{"success": true, "user": {...}}`

### Challenges
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges/{id}/solve` - Mark challenge as solved
  - Body: `{"userID": 1}`

### User Profile
- `GET /api/profile?userID=1` - Get user profile

## Directory Structure

```
Backend/
├── server.cpp           # Main server implementation
├── CMakeLists.txt       # Build configuration
├── db_config.json       # Database credentials (gitignored)
├── db_config.example.json # Template for config
└── README.md            # This file
```

## Frontend Integration

The frontend React app should be built and placed in the `build/` directory:

```bash
# From Frontend/CTF
npm run build
cp -r dist/* ../../Backend/build/
```

Then restart the server to serve the updated frontend.

## Notes

- The server serves static files from `./build` directory
- All API responses are JSON
- CORS is enabled for development
- SQL injection protection is implemented via escaping
