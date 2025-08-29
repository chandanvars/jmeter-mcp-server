# JMeter MCP Server - Transport Examples

This document provides examples of how to connect to the JMeter MCP Server using different transport modes.

## 🚀 Quick Start Commands

### Local Development (Stdio)
```bash
# Start server for local MCP clients
npm start

# Start with debugging
npm run dev
```

### Remote/Production (HTTP)
```bash
# Start HTTP server on default port 3000
npm run start:http

# Start on custom port
npm run start:server -- --port 8080

# Start with environment variables
PORT=5000 npm run start:http
```

## 📡 HTTP Transport Examples

### Health Check
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/health"

# curl (if available)
curl http://localhost:3000/health

# Expected Response:
{
  "status": "healthy",
  "server": "jmeter-generator",
  "version": "1.0.0", 
  "transport": "streamable-http",
  "endpoint": "/mcp",
  "tools": 5
}
```

### API Documentation
```bash
# Get server information and available tools
Invoke-RestMethod -Uri "http://localhost:3000/api"
```

### MCP Tool Call (HTTP)
```javascript
// JavaScript example
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'generate_jmeter_script',
      arguments: {
        testName: 'Simple API Test',
        baseUrl: 'https://api.example.com',
        requests: [
          {
            name: 'Health Check',
            method: 'GET', 
            path: '/health'
          }
        ],
        threadGroup: {
          numThreads: 10,
          rampUpTime: 30,
          loops: 5
        }
      }
    }
  })
});

const result = await response.json();
console.log('Generated JMX:', result);
```

## 💻 Stdio Transport Examples

### Direct MCP Client
```javascript
// Node.js MCP client example
import { spawn } from 'child_process';

const server = spawn('node', ['src/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send MCP request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log('Available tools:', response.result.tools);
});
```

### VS Code Integration
```json
// .vscode/mcp.json
{
  "servers": {
    "jmeter-local": {
      "command": "node",
      "args": ["src/index.js"],
      "env": { "NODE_ENV": "development" }
    },
    "jmeter-remote": {
      "url": "http://your-server:3000/mcp",
      "transport": "http"
    }
  }
}
```

## 🐳 Docker Examples

### Run with HTTP Transport
```bash
# Build and run
docker build -t jmeter-mcp .
docker run -p 3000:3000 jmeter-mcp npm run start:http

# Test health
docker exec -it <container-id> curl http://localhost:3000/health
```

### Docker Compose
```bash
# Start production stack
docker-compose up -d

# Check health
curl http://localhost:3000/health

# View logs
docker-compose logs -f jmeter-mcp-http
```

## 🔧 Development & Testing

### Test Both Transports
```bash
# Run transport tests
node test-transports.js

# Expected output:
# ✅ HTTP Transport: PASSED
# ✅ Stdio Transport: PASSED
```

### Monitor Server
```bash
# Monitor health endpoint
while true; do
  curl -s http://localhost:3000/health | jq '.status'
  sleep 10
done

# Check server logs
tail -f jmeter-mcp.log
```

## 🌐 Production Deployment

### PM2 Process Manager
```bash
# Start with PM2
pm2 start "npm run start:http" --name jmeter-mcp-server

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Nginx Load Balancer
```bash
# Start multiple instances
PORT=3001 npm run start:http &
PORT=3002 npm run start:http &
PORT=3003 npm run start:http &

# Configure nginx.conf and start
nginx -c $(pwd)/nginx.conf
```

### Cloud Deployment
```bash
# Heroku
heroku create your-jmeter-server
git push heroku main
# Automatically uses HTTP transport

# Test deployed app
curl https://your-jmeter-server.herokuapp.com/health
```

## 🔍 Troubleshooting

### Check Server Status
```bash
# Test connectivity
telnet localhost 3000

# Check port availability
netstat -an | findstr :3000    # Windows
lsof -i :3000                  # macOS/Linux

# Test specific endpoints
curl -I http://localhost:3000/health
curl -I http://localhost:3000/api
```

### Debug Server Issues
```bash
# Start with debug output
DEBUG=* npm run start:http

# Check error logs
npm run logs

# Validate configuration
npm run check
```

## 📚 Integration Examples

### Python Client
```python
import requests

# Health check
health = requests.get('http://localhost:3000/health')
print(f"Server: {health.json()['status']}")

# Generate JMeter script
config = {
    "testName": "Python API Test",
    "baseUrl": "https://httpbin.org",
    "requests": [{"name": "GET Test", "method": "GET", "path": "/get"}]
}

response = requests.post('http://localhost:3000/mcp', json={
    "jsonrpc": "2.0",
    "id": 1, 
    "method": "tools/call",
    "params": {"name": "generate_jmeter_script", "arguments": config}
})

print("Generated script:", response.json())
```

### PowerShell Client
```powershell
# Health check
$health = Invoke-RestMethod "http://localhost:3000/health"
Write-Host "Server Status: $($health.status)"

# Generate test script
$config = @{
    testName = "PowerShell Test"
    baseUrl = "https://httpbin.org"
    requests = @(@{
        name = "GET Test"
        method = "GET" 
        path = "/get"
    })
}

$body = @{
    jsonrpc = "2.0"
    id = 1
    method = "tools/call"
    params = @{
        name = "generate_jmeter_script"
        arguments = $config
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:3000/mcp" -Method POST -Body $body -ContentType "application/json"
Write-Host "Generated JMX: $($response.result)"
```
