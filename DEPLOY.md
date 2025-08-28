# 🚀 JMeter MCP Server Deployment Guide

## Quick Deploy & Start

### Prerequisites
- Node.js 16+ installed
- Git installed
- VS Code with MCP extension (optional)

### 1. Clone & Setup
```bash
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server
npm install
```

### 2. Start MCP Server
```bash
# Option 1: Standard start
npm start

# Option 2: Development mode with auto-restart
npm run dev

# Option 3: Background mode
nohup npm start > server.log 2>&1 &
```

### 3. Verify Server Running
```bash
# Check if server is responding
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### 4. Configure VS Code (Optional)
Add to your VS Code `settings.json`:
```json
{
  "chat.mcp.serverSampling": {
    "jmeter-generator": {
      "command": "node",
      "args": ["path/to/jmeter-mcp-server/src/index.js"],
      "cwd": "path/to/jmeter-mcp-server"
    }
  },
  "chat.mcp.autostart": "newAndOutdated"
}
```

## 🌐 Cloud Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI, then:
heroku create your-jmeter-mcp-server
git push heroku main
heroku ps:scale web=1
```

### Option 2: Railway
```bash
# Connect GitHub repo at railway.app
# Auto-deploys on push to main branch
```

### Option 3: Digital Ocean App Platform
1. Fork this repository
2. Connect to Digital Ocean App Platform
3. Auto-deploy on git push

### Option 4: Local Server
```bash
# Install PM2 for process management
npm install -g pm2
pm2 start src/index.js --name jmeter-mcp-server
pm2 startup
pm2 save
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
NODE_ENV=production
PORT=3000
MCP_SERVER_NAME=jmeter-generator
LOG_LEVEL=info
```

### Custom Configuration
Edit `src/config.js` for:
- Custom tool configurations
- Output directory settings
- AI validation settings
- File size limits

## 📊 Usage Examples

### Via HTTP API
```bash
# Generate JMeter script
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "generate_jmeter_script",
      "arguments": {
        "testName": "API Test",
        "baseUrl": "https://api.example.com",
        "requests": [
          {
            "name": "Health Check",
            "method": "GET",
            "path": "/health"
          }
        ]
      }
    }
  }'
```

### Via VS Code
Use `@jmeter-generator` in chat and provide prompts like:
```
Generate a JMeter test for https://api.github.com with 10 users, 30-second ramp-up
```

## 🛠️ Troubleshooting

### Server Won't Start
1. Check Node.js version: `node --version`
2. Install dependencies: `npm install`
3. Check logs: `npm run logs`

### VS Code Integration Issues
1. Restart VS Code
2. Check MCP extension is installed
3. Verify settings.json configuration
4. Check VS Code output panel for errors

### Performance Issues
1. Increase Node.js memory: `node --max-old-space-size=4096 src/index.js`
2. Monitor server resources
3. Check AI validation timeout settings

## 📈 Monitoring

### Logs
```bash
# View real-time logs
tail -f *.log

# Check specific component logs
tail -f jmeter-handler.log
tail -f ai-validation.log
```

### Health Check
```bash
# Simple health check
curl http://localhost:3000/health

# Detailed status
curl http://localhost:3000/status
```

## 🔒 Security

### Production Deployment
1. Use environment variables for sensitive data
2. Enable HTTPS
3. Add rate limiting
4. Implement authentication if needed
5. Regular security updates

### File Permissions
```bash
# Secure output directory
chmod 755 output/
chmod 644 output/*.jmx
```

## 📚 Additional Resources

- [JMeter Documentation](https://jmeter.apache.org/usermanual/)
- [Model Context Protocol](https://github.com/anthropics/mcp)
- [Example Prompts](./EXAMPLE_PROMPTS.md)
- [API Documentation](./API.md)

---

🎯 **Ready to generate JMeter tests with AI assistance!**
