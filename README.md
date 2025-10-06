# 🎯 JMeter MCP Server

A powerful Model Context Protocol (MCP) server for generating Apache JMeter test scripts, advanced parameterization, correlation capabilities, and comprehensive testing support.

[![GitHub stars](https://img.shields.io/github/stars/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/network/members)
[![GitHub issues](https://img.shields.io/github/issues/chandanvars/jmeter-mcp-server)](https://github.com/chandanvars/jmeter-mcp-server/issues)

## 🌟 Overview

The JMeter MCP Server (`jmeter-generator` v1.0.0) is a comprehensive testing solution that integrates with MCP-compatible clients (like Claude Desktop, VS Code) to generate sophisticated JMeter test plans. It combines traditional performance testing with modern automation to create production-ready test scripts with minimal effort.

**Key Capabilities:**
- 🚀 5 powerful tools for test generation (including new prompt execution)
- 🔄 Dual transport modes: Stdio (local) and HTTP/SSE (remote)
- 🧠 Intelligent scenario validation and auto-correction
- 📝 **NEW: Prompt-based workflow** for better control and review
- 📊 Automatic JMX and CSV file generation
- 🔗 OpenAPI/Swagger schema integration
- 🌐 Natural language UI flow parsing

## 🆕 NEW: Prompt-Based Workflow

The JMeter MCP Server now uses a **two-step approach** for generating test files:

### Step 1: Generate Test Prompt
Use any of the generation tools (`generate_jmeter_script`, `generate_ui_flow_script`, `generate_from_api_schema`) to create a structured prompt file at `.github/prompts/jmx_prompt.prompt.md`.

### Step 2: Execute Prompt to Generate JMX
Use the `execute_jmx_prompt` tool or the `@workspace /jmx_prompt` command in Copilot Chat to generate the actual JMX file in the `output` folder.

**Benefits:**
- ✅ Review test specifications before generation
- ✅ Modify prompts to customize tests
- ✅ Better control over the generation process
- ✅ Leverage Copilot Chat for JMX generation

**📖 See [PROMPT_WORKFLOW.md](PROMPT_WORKFLOW.md) for detailed documentation**

## 🔧 NEW: Scenario Validator

**Advanced Auto-Correction Technology** - The built-in Scenario Validator (`src/validators/scenarioValidator.js`) automatically fixes and enhances any UI flow description, ensuring reliable JMX generation from any input:

✅ **Smart Typo Correction**: Fixes common misspellings ("loggin" → "login", "clik" → "click")  
✅ **Flow Enhancement**: Expands minimal descriptions ("login" → complete login flow)  
✅ **Structure Validation**: Adds missing navigation, wait steps, and proper sequencing  
✅ **Parser Compatibility**: Ensures 100% compatibility with the natural language parser  
✅ **Confidence Scoring**: Provides validation confidence metrics  

**Example Auto-Correction:**
```
Input:  "loggin with wrong spelling, clik button"
Output: "Navigate to login page. Enter username. Enter password. Click login button. Wait for page load."
```

The ScenarioValidator is automatically invoked during UI flow script generation to ensure maximum reliability.

## ⚡ Quick Start

### 🖥️ Local Development (Stdio Transport)
```bash
# Clone the repository
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server

# Install dependencies  
npm install

# Start the MCP server (stdio mode for local connections)
npm start
```

### 🌐 Remote/HTTP Server Mode (Recommended for Production)
```bash
# Start server with HTTP transport for remote connections
npm run start:http

# Or specify custom port
npm run start:server -- --port 8080

# Or start directly with custom port
node src/index.js --http --port 3000

# Development mode with debugging
npm run dev          # stdio mode with inspector
npm run dev:http     # HTTP mode with inspector
```

**VS Code Integration:** Configure the server in your MCP settings for instant test generation!

## 🚀 Transport Modes

### 📡 HTTP/SSE Transport (Recommended for Remote Connections)

The server supports **Streamable HTTP Transport** using Server-Sent Events (SSE) for robust remote connections:

**Features:**
- ✅ **Remote Access**: Connect from any network location
- ✅ **CORS Support**: Cross-origin requests enabled
- ✅ **Health Monitoring**: Built-in health check endpoints
- ✅ **API Documentation**: Self-documenting endpoints
- ✅ **Production Ready**: Scalable for multiple clients
- ✅ **Firewall Friendly**: Standard HTTP/HTTPS ports

**Starting HTTP Server:**
```bash
# Start on default port 3000
npm run start:http

# Start on custom port
npm run start:server -- --port 8080

# Or with environment variable
PORT=5000 npm run start:http
```

**Server Endpoints:**
- **MCP Endpoint**: `http://localhost:3000/message` or `/mcp` (SSE stream)
- **Health Check**: `http://localhost:3000/health`
- **API Documentation**: `http://localhost:3000/api` or `/docs`

**Connection Examples:**
```bash
# Health check
curl http://localhost:3000/health

# Get API documentation
curl http://localhost:3000/api | jq

# Check server status
curl -s http://localhost:3000/health | jq '.status'
```

### 🖥️ Stdio Transport (Local Development)

Traditional stdio transport for local development and MCP client integration:

**Features:**
- ✅ **Local Integration**: Perfect for Claude Desktop, VS Code
- ✅ **Low Latency**: Direct process communication
- ✅ **Simple Setup**: No network configuration needed
- ✅ **Secure**: No network exposure

**Starting Stdio Server:**
```bash
# Default mode (stdio)
npm start

# Development mode with debugging
npm run dev
```

## 🛠️ Complete Tool Suite

The JMeter MCP Server provides **4 main tools** for comprehensive test generation:

### 1. 🚀 **generate_jmeter_script** - Core JMeter Test Generation
Create comprehensive JMeter test plans with advanced features:

**Features:**
- Multi-threaded load simulation with configurable thread groups
- CSV data parameterization for data-driven testing
- Response correlation and extraction (JSON Path, Regex)
- Multiple timer types (Gaussian, Uniform, Constant Throughput)
- Custom headers and authentication
- Response assertions and validations
- Result collectors and data writers
- Automatic file generation to `output/` directory

**Example:**
```javascript
{
  "testName": "API Performance Test",
  "baseUrl": "https://api.example.com",
  "threadGroup": { 
    "numThreads": 50, 
    "rampUpTime": 120, 
    "loops": 10 
  },
  "requests": [
    {
      "name": "Login",
      "method": "POST", 
      "path": "/auth/login",
      "headers": { "Content-Type": "application/json" },
      "body": "{\"username\":\"${username}\",\"password\":\"${password}\"}",
      "extractors": [
        {
          "variableName": "authToken", 
          "jsonPath": "$.token"
        }
      ],
      "assertions": [
        {
          "type": "responseCode",
          "value": "200"
        }
      ]
    }
  ],
  "csvDataSet": {
    "fileName": "users.csv", 
    "variableNames": "username,password",
    "delimiter": ","
  }
}
```

### 2. 🔗 **generate_from_api_schema** - API Schema-Based Testing
Generate tests directly from OpenAPI/Swagger specifications:

**Features:**
- Automatic API schema parsing (JSON/YAML)
- OAuth2, JWT, and Bearer token authentication
- Endpoint discovery by operation ID, path, or tag
- Automatic request body generation
- Response validation based on schema
- Token correlation and management

**Example:**
```javascript
{
  "schemaUrl": "https://petstore.swagger.io/v2/swagger.json",
  "endpoint": {"operationId": "addPet"},
  "authConfig": {
    "method": "oauth2",
    "credentials": {"clientId": "client", "clientSecret": "secret"}
  },
  "testConfig": {"threadGroup": {"numThreads": 10, "rampUpTime": 30, "loops": 5}}
}
```

### 3. 🌐 **generate_ui_flow_script** - UI Testing with Browser Simulation
Create sophisticated UI testing scenarios with **intelligent auto-correction**:

**Features:**
- ✨ **Scenario Validator**: Automatic flow correction and enhancement
- 🧠 **Natural language flow parsing** with typo correction
- 🌐 **Web browser simulation** 
- 🖱️ **Element interaction** (click, type, select, navigate)
- 📝 **Form handling and submission**
- ⚡ **JavaScript execution support**
- 📸 **Screenshot capture on failures**
- 📱 **Responsive design testing**
- 🌍 **Cross-browser simulation**
- 🍪 **Session management and cookies**
- 📦 **InvenTree integration** (purchase orders, inventory management)

**Auto-Correction Examples:**
```javascript
// Input: "loggin to system"
// Auto-corrected: "Navigate to login page. Enter username. Enter password. Click login button."

// Input: "search laptop, add cart"  
// Auto-corrected: "Navigate to homepage. Search for laptop. Add to cart. Proceed to checkout."

// Input: "inventree purchase order"
// Auto-corrected: "Navigate to InvenTree login. Authenticate with token. Create purchase order. Add items. Submit order."
```

**Examples:**
```javascript
// E-commerce flow
{
  "baseUrl": "https://demo.opencart.com",
  "flowDescription": "Navigate to login page, enter credentials, verify dashboard appears",
  "testName": "Login Flow Test",
  "threadCount": 5,
  "rampUp": 30,
  "duration": 300
}

// InvenTree workflow
{
  "baseUrl": "https://demo.inventree.org",
  "flowDescription": "Login to InvenTree, create purchase order, add supplier, add line items, submit order",
  "testName": "InvenTree Purchase Order Flow",
  "threadCount": 3,
  "rampUp": 60,
  "duration": 180
}
  "duration": 300
}
```

### 4. 🎭 **get_templates** - Pre-built Testing Templates
Access professionally crafted templates for common testing scenarios:

**Available Templates:**
- `rest_api` - Complete REST API testing with CRUD operations
- `graphql` - GraphQL query and mutation testing
- `soap` - SOAP web service testing
- `oauth2` - OAuth2 authentication flows
- `websocket` - WebSocket connection testing
- `database` - Database performance testing

**Example:**
```javascript
{
  "templateType": "rest_api"
}
```

**Returns:** A complete JMeter test configuration that can be customized for your specific needs.

## 🔧 Advanced Features

### 🛠️ **Automated Enhancements**
- **Automatic Validation**: Every generated test is analyzed for best practices
- **Performance Optimization**: Auto-tuning for better performance
- **Best Practice Application**: Industry standards automatically applied
- **Issue Detection**: Proactive identification of potential problems
- **Smart Corrections**: Automatic fixes for common issues

### 📁 **Intelligent File Organization**
- **JMX Files** → `output/` directory (ready for JMeter)
- **CSV Data** → `sample_data/` directory (test parameters)
- **Enhanced Versions** → `*_enhanced.jmx` (optimized files)
- **Relative Paths** → Automatic cross-platform compatibility

### 🔄 **Correlation Engine**
- **Token Management**: Automatic extraction and reuse
- **Session Handling**: Cookie and session management
- **Dynamic Data**: Response-based parameter generation
- **Workflow Automation**: Multi-step process automation

### 🎯 **Natural Language Processing**
- **Prompt-to-Test**: Convert descriptions to test scripts
- **Flow Parsing**: Understand complex user workflows
- **Element Recognition**: Smart web element identification
- **Action Interpretation**: Natural language to test actions

## 📊 Generated Test Features

### Core JMeter Elements
- ✅ **Test Plans** with user-defined variables
- ✅ **Thread Groups** with configurable load patterns
- ✅ **HTTP Request Defaults** for base configuration
- ✅ **Cookie Managers** for session handling
- ✅ **Authorization Managers** for security
- ✅ **Result Collectors** for data analysis

### Advanced Components
- ✅ **CSV Data Sets** for parameterization
- ✅ **Regular Expression Extractors** for correlation
- ✅ **JSON Path Extractors** for API responses  
- ✅ **Response Assertions** for validation
- ✅ **Timer Components** for realistic load simulation
- ✅ **Listeners** for result visualization

### Authentication Support
- ✅ **OAuth2** (Client Credentials, Password, Authorization Code)
- ✅ **JWT** token management
- ✅ **Bearer Token** authentication
- ✅ **Basic Authentication**
- ✅ **API Key** authentication
- ✅ **Custom Headers** and authentication schemes

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 16+** 
- **npm or yarn**
- **JMeter** (for running generated tests)

### Local Installation
```bash
# Clone and setup
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server
npm install

# Start the server (choose your mode)
npm start              # Local stdio mode
npm run start:http     # Remote HTTP mode (port 3000)
npm run start:server   # Remote HTTP mode with explicit port
```

### 🌐 Remote/Production Deployment

#### HTTP Transport Configuration

For production deployments and remote access, use HTTP transport:

```bash
# Production server (default port 3000)
NODE_ENV=production npm run start:http

# Custom port
PORT=8080 npm run start:http

# With process manager (PM2)
pm2 start "npm run start:http" --name jmeter-mcp-server

# Docker deployment
docker run -p 3000:3000 -e NODE_ENV=production jmeter-mcp-server npm run start:http
```

#### Environment Variables for HTTP Mode
```bash
NODE_ENV=production
PORT=3000
MCP_SERVER_NAME=jmeter-generator
LOG_LEVEL=info
VALIDATION_ENABLED=true
MAX_FILE_SIZE=50MB
OUTPUT_DIRECTORY=./output
SAMPLE_DATA_DIRECTORY=./sample_data
CORS_ORIGIN=*  # Configure CORS origins for security
```

#### Health Monitoring
```bash
# Health check endpoint
curl http://your-server:3000/health

# Expected response:
{
  "status": "healthy",
  "server": "jmeter-generator",
  "version": "1.0.0",
  "transport": "http-sse",
  "endpoint": "/message",
  "tools": 4
}

# Monitor server uptime
while true; do
  curl -s http://localhost:3000/health | jq '.status'
  sleep 30
done
```

#### Client Connection Examples

**JavaScript/Node.js Client:**
```javascript
// Connect to HTTP transport
const eventSource = new EventSource('http://localhost:3000/message');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Send MCP request
fetch('http://localhost:3000/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'generate_jmeter_script',
      arguments: { /* your config */ }
    }
  })
});
```

**Python Client:**
```python
import requests
import json

# Health check
response = requests.get('http://localhost:3000/health')
print(f"Server status: {response.json()['status']}")

# Generate JMeter script
config = {
    "testName": "API Load Test",
    "baseUrl": "https://api.example.com",
    "requests": [{"name": "Test", "method": "GET", "path": "/health"}]
}

response = requests.post('http://localhost:3000/message', 
                        json={
                            "jsonrpc": "2.0",
                            "id": 1,
                            "method": "tools/call",
                            "params": {
                                "name": "generate_jmeter_script",
                                "arguments": config
                            }
                        })
```

**Load Balancer Configuration (Nginx):**
```nginx
upstream jmeter_mcp {
    server localhost:3000;
    server localhost:3001;  # Additional instances
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://jmeter_mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SSE specific headers
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Cache-Control 'no-cache';
    }
    
    location /health {
        proxy_pass http://jmeter_mcp/health;
    }
}
```

### IDE Integration

#### VS Code Integration

Configure the JMeter MCP Server in VS Code using one of the following JSON configurations:

**Method 1: STDIO Mode (Local Development)**
Add to your Claude Desktop `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "jmeter-generator": {
      "command": "node",
      "args": ["c:/path/to/jmeter-mcp-server/src/index.js", "--stdio"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

For VS Code MCP extension, create `.vscode/mcp.json`:
```json
{
  "servers": {
    "jmeter-mcp": {
      "command": "node",
      "args": ["src/index.js", "--stdio"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

**Method 2: HTTP Mode (Remote/Production)**
For Claude Desktop with HTTP transport:
```json
{
  "mcpServers": {
    "jmeter-generator": {
      "url": "http://your-server:3000/mcp",
      "transport": "http"
    }
  }
}
```

For VS Code with HTTP transport:
```json
{
  "servers": {
    "jmeter-mcp-remote": {
      "url": "http://your-server:3000/mcp",
      "transport": "http",
      "timeout": 30000,
      "healthCheck": {
        "url": "http://your-server:3000/health",
        "interval": 60000
      }
    }
  }
}
```

**Method 3: Global Settings**
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

#### IntelliJ IDEA Integration

**Method 1: AI Assistant Plugin Configuration**
1. Install the **MCP Support** plugin from JetBrains Marketplace
2. Go to `File > Settings > Tools > MCP Servers`
3. Add a new server configuration:
   - **Name**: `JMeter MCP Server`
   - **Command**: `node`
   - **Arguments**: `src/index.js`
   - **Working Directory**: `path/to/jmeter-mcp-server`
   - **Environment**: `NODE_ENV=development`

**Method 2: External Tools Integration**
1. Go to `File > Settings > Tools > External Tools`
2. Create a new tool:
   - **Name**: `Generate JMeter Test`
   - **Program**: `node`
   - **Arguments**: `src/index.js --generate --input="$SELECTION$"`
   - **Working Directory**: `$ProjectFileDir$/jmeter-mcp-server`
3. Use via `Tools > External Tools > Generate JMeter Test`

**Method 3: Run Configuration Setup**
1. Go to `Run > Edit Configurations`
2. Add new Node.js configuration:
   - **Name**: `JMeter MCP Server`
   - **Node interpreter**: System Node.js
   - **Node parameters**: `--experimental-modules`
   - **JavaScript file**: `src/index.js`
   - **Application parameters**: `--port=3000 --debug`
   - **Working directory**: `$PROJECT_DIR$`

**IntelliJ Features Integration:**
- **Code completion**: Use MCP server for JMeter DSL suggestions
- **Quick actions**: Generate tests from selected API documentation
- **Task integration**: Add JMeter generation to build processes
- **Version control**: Automatic test generation on commit hooks

### Docker Deployment
```bash
# Build and run container (stdio mode)
docker build -t jmeter-mcp-server .
docker run -p 3000:3000 jmeter-mcp-server

# Run with HTTP transport
docker run -p 3000:3000 -e NODE_ENV=production jmeter-mcp-server npm run start:http

# Docker Compose for production
version: '3.8'
services:
  jmeter-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    command: npm run start:http
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🎯 IntelliJ IDEA Workflow Integration

### Project Setup in IntelliJ
1. **Open Project**: `File > Open` → Select `jmeter-mcp-server` directory
2. **Configure Node.js**: `File > Settings > Languages & Frameworks > Node.js`
3. **Install Plugins**: 
   - **Node.js** (JetBrains)
   - **JSON Schema** (for configuration validation)
   - **HTTP Client** (for testing generated APIs)

### Development Workflow
```bash
# Terminal in IntelliJ (Alt+F12)
npm install          # Install dependencies
npm run dev         # Start development server
npm test           # Run test suite
```

### Debugging Configuration
1. **Run/Debug Configuration**: `Run > Edit Configurations`
2. **Add Node.js Configuration**:
   - **JavaScript file**: `src/index.js`
   - **Application parameters**: `--debug --port=3000`
   - **Environment variables**: `NODE_ENV=development`
3. **Set breakpoints** in handler files for debugging

### HTTP Client Integration
Create `.http` files in IntelliJ for testing:
```http
### Test JMeter Generation
POST http://localhost:3000
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_jmeter_script",
    "arguments": {
      "testName": "API Load Test",
      "baseUrl": "https://api.example.com",
      "requests": [
        {
          "name": "Get Users",
          "method": "GET",
          "path": "/users"
        }
      ]
    }
  }
}
```

### File Watchers Setup
1. **Settings** → `Tools > File Watchers`
2. **Add JavaScript watcher**:
   - **File type**: JavaScript
   - **Scope**: `src/**/*.js`
   - **Program**: `eslint`
   - **Arguments**: `$FilePath$ --fix`
3. **Auto-format on save** for consistent code style

### Other IDE Support

#### WebStorm
- **Full support** with Node.js integration
- **Built-in debugging** and profiling
- **Advanced refactoring** capabilities
- **Integrated version control**

#### Eclipse with Node.js
1. Install **Nodeclipse** plugin
2. Import as **Node.js project**
3. Configure **run configurations** for MCP server
4. Use **external tools** for JMeter generation

#### Sublime Text
1. Install **Package Control**
2. Add **Node.js** and **JSON** packages
3. Create **build system**:
```json
{
  "cmd": ["node", "src/index.js"],
  "working_dir": "$project_path",
  "variants": [
    {
      "name": "Debug",
      "cmd": ["node", "--inspect", "src/index.js"]
    }
  ]
}
```

#### Vim/Neovim
1. Install **CoC.nvim** for Node.js support
2. Configure **.vimrc** for JavaScript:
```vim
" Node.js support
autocmd FileType javascript setlocal omnifunc=javascriptcomplete#CompleteJS
" Auto-formatting
autocmd BufWritePre *.js execute ':!npx prettier --write %'
```

### Cross-Platform Development

#### Windows Specific
- **PowerShell scripts** in `scripts/` directory
- **Windows Terminal** integration
- **WSL2 support** for Linux compatibility

#### macOS Specific  
- **Homebrew** package management
- **Terminal.app** integration
- **Xcode** project integration (if needed)

#### Linux Specific
- **Package manager** installation (apt, yum, pacman)
- **Shell integration** (bash, zsh, fish)
- **Desktop environment** shortcuts

## 📖 Usage Examples

### IntelliJ IDEA Usage Examples

#### Quick Test Generation
1. **Select API Documentation**: Highlight OpenAPI spec or API docs in editor
2. **Right-click** → `External Tools` → `Generate JMeter Test`
3. **Generated test** appears in `output/` directory

#### Integration with Run Configurations
```bash
# Add to Run Configuration arguments:
--base-url="https://api.example.com" --threads=10 --duration=300 --output="test-api.jmx"
```

#### Live Templates for JMeter MCP
Create live templates in IntelliJ:
- **Abbreviation**: `jgen`
- **Template text**: 
```json
{
  "testName": "$TEST_NAME$",
  "baseUrl": "$BASE_URL$", 
  "threadGroup": {
    "numThreads": $THREADS$,
    "rampUpTime": $RAMP_TIME$,
    "loops": $LOOPS$
  },
  "requests": [$END$]
}
```

### Basic API Test
```
@jmeter-generator Generate a JMeter test for https://api.github.com with 10 users, 30-second ramp-up
```

### Schema-Based Test  
```
@jmeter-generator Generate a test from Petstore API schema with OAuth2 authentication for the addPet operation
```

### UI Flow Test
```
@jmeter-generator Create a login flow test for https://demo.opencart.com with 5 users navigating through checkout
```

### Performance Test
```
@jmeter-generator Generate a comprehensive API performance test for https://api.github.com with 50 users, 2-minute ramp-up, testing multiple endpoints
```

## 🏗️ Project Structure

## 🏗️ Project Structure

```
jmeter-mcp-server/
├── 📁 src/                         # Source code directory
│   ├── 🚀 index.js                 # MCP server entry point & initialization
│   ├── 🖥️ server.js                # Core MCP server implementation class
│   │
│   ├── 📁 handlers/                # Request handlers for different tool types
│   │   ├── 🎯 jmeterHandler.js     # Core JMeter test generation logic
│   │   ├── 🌐 uiFlowHandler.js     # UI testing workflows & browser simulation
│   │   ├── 📋 apiSchemaHandler.js  # OpenAPI/Swagger schema processing
│   │   ├── 📑 templateHandler.js   # Pre-built template management
│   │   ├── 🔗 correlationHandler.js # Response correlation & token extraction
│   │   └── 🔐 tokenManager.js      # Authentication token management
│   │
│   ├── 📁 generators/              # JMX file generation components
│   │   ├── 📄 jmxGenerator.js      # Core JMX XML generation engine
│   │   ├── ⚙️ configGenerator.js   # Test configuration generation
│   │   └── 🔧 samplerGenerator.js  # HTTP sampler & request creation
│   │
│   ├── 📁 validators/              # Input validation & auto-correction
│   │   └── ✅ scenarioValidator.js # Smart UI flow validation & correction (815 lines)
│   │
│   ├── 📁 parsers/                 # Natural language processing
│   │   └── 🧠 promptToFlowParser.js # Convert descriptions to test flows
│   │
│   ├── 📁 correlation/             # Response correlation engine
│   │   ├── 🔄 correlationEngine.js # Main correlation processing logic
│   │   └── 📊 patterns.js          # Predefined correlation patterns
│   │
│   ├── 📁 crawler/                 # Web crawling & flow recording
│   │   ├── 🕷️ flowCrawler.js       # Web flow analysis & discovery
│   │   └── 📹 requestRecorder.js   # HTTP request recording & replay
│   │
│   ├── 📁 jmx/                     # JMX-specific utilities
│   │   ├── 🎨 jmxGenerator.js      # Advanced JMX generation features
│   │   ├── 📚 jmxTemplates.js      # JMX template library
│   │   └── 📝 parameterizer.js     # Dynamic parameterization engine
│   │
│   ├── 📁 utils/                   # Utility functions & helpers
│   │   ├── 📂 fileWriter.js        # File I/O operations & management
│   │   ├── ✅ validator.js         # Input validation & sanitization
│   │   ├── 🔧 xmlBuilder.js        # XML construction utilities
│   │   ├── 📊 responseFormatter.js # Response formatting & prettification
│   │   ├── 🎉 successMessageGenerator.js # Success message templates
│   │   ├── 🌐 uiFlowHelpers.js     # UI testing utility functions
│   │   └── 👀 fileMonitor.js       # File system monitoring
│   │
│   └── 📁 templates/               # Template management
│       └── 📋 jmxTemplates.js      # Pre-built JMeter test templates
│
├── 📁 output/                      # Generated test files (auto-created)
│   ├── 📄 *.jmx                    # Generated JMeter test plans
│   ├── 📊 *.csv                    # Test data files
│   └── 📁 enhanced/                # AI-enhanced test versions
│
├── 📁 sample_data/                 # Sample test data & examples
│   ├── 👥 users.csv                # Sample user data
│   ├── 🛒 products.csv             # Sample product data
│   └── 🔐 auth_data.csv            # Sample authentication data
│
├── 📁 scripts/                     # Utility scripts & tools
│   └── 🛠️ jmeter-helper.ps1       # PowerShell helper script for JMeter
│
├── 📁 .vscode/                     # VS Code workspace settings
│   ├── ⚙️ settings.json            # Editor settings
│   ├── 🎯 launch.json              # Debug configurations
│   └── 📋 tasks.json               # Build tasks
│
├── 📄 package.json                 # Node.js project configuration
├── 📄 package-lock.json            # Dependency lock file
├── 📄 README.md                    # Project documentation (this file)
├── 📄 LICENSE                      # MIT license
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 DEPLOYMENT.md                # Deployment instructions
├── 📄 EXAMPLE_PROMPTS.md           # Ready-to-use examples
├── 📄 SCENARIO_VALIDATOR.md        # Scenario validator documentation
├── 📄 Procfile                     # Heroku deployment config
└── 📄 .gitignore                   # Git ignore rules
```

### 📁 Directory Breakdown

#### **Core Application (`src/`)**
- **Entry Points**: `index.js` (MCP server), `server.js` (core logic)
- **Request Handling**: Modular handlers for different tool types
- **Generation Engine**: Sophisticated JMX file creation system
- **AI Integration**: Smart validation and auto-correction capabilities

#### **Handlers (`src/handlers/`)**
- **🎯 jmeterHandler.js**: Main test generation logic with thread groups, timers, assertions
- **🌐 uiFlowHandler.js**: Browser simulation, form handling, element interaction
- **📋 apiSchemaHandler.js**: OpenAPI parsing, endpoint discovery, auth integration
- **📑 templateHandler.js**: Pre-built templates for common testing scenarios
- **🔗 correlationHandler.js**: Response parsing, token extraction, session management
- **🔐 tokenManager.js**: OAuth2, JWT, API key management

#### **Generation System (`src/generators/`)**
- **📄 jmxGenerator.js**: Core XML generation with proper JMeter structure
- **⚙️ configGenerator.js**: Test plan configuration, variables, defaults
- **🔧 samplerGenerator.js**: HTTP requests, headers, body content

#### **Intelligence Layer (`src/validators/`, `src/parsers/`)**
- **✅ scenarioValidator.js**: Auto-correction engine for UI flows
- **🧠 promptToFlowParser.js**: Natural language to test step conversion

#### **Advanced Features (`src/correlation/`, `src/crawler/`)**
- **🔄 correlationEngine.js**: Dynamic parameter extraction and reuse
- **📊 patterns.js**: Common correlation patterns (tokens, IDs, timestamps)
- **🕷️ flowCrawler.js**: Web application flow discovery
- **📹 requestRecorder.js**: HTTP traffic capture and replay

#### **Output Management (`output/`, `sample_data/`)**
- **Generated Files**: JMX test plans ready for JMeter execution
- **Test Data**: CSV files for parameterized testing
- **Enhanced Versions**: Optimized test scripts
- **Sample Data**: Example datasets for quick testing

#### **Development Tools (`scripts/`, `.vscode/`)**
- **PowerShell Scripts**: Windows-specific JMeter utilities
- **VS Code Integration**: Debug configs, tasks, settings
- **Documentation**: Comprehensive guides and examples

### 🔧 File Naming Conventions

- **`.jmx`**: JMeter test plan files
- **`.csv`**: Test data files
- **`*Handler.js`**: Request processing modules
- **`*Generator.js`**: Content generation modules
- **`*Parser.js`**: Data parsing modules
- **`*Validator.js`**: Validation modules
- **`test-*.js`**: Test files
- **`*Templates.js`**: Template libraries

### 📊 Data Flow Architecture

```
User Request → MCP Server → Handler → Validator → Parser → Generator → JMX File
     ↓              ↓           ↓          ↓         ↓          ↓
  VS Code/     index.js    Handler    Validator   Parser   Generator
 IntelliJ                   Logic     Engine      Engine    Engine
```

### 🔄 Processing Pipeline

1. **Input Reception**: MCP server receives tool request
2. **Request Routing**: Appropriate handler selected based on tool type
3. **Validation**: Input validated and auto-corrected if needed
4. **Parsing**: Natural language converted to structured data
5. **Generation**: JMX XML generated with proper structure
6. **Enhancement**: Optional automated optimization
7. **Output**: Files written to output directory with success notification

## 🎮 Example Prompts

### API Testing
```
Generate a comprehensive API performance test:
- Base URL: https://api.github.com
- Test endpoints: /users/octocat, /users/octocat/repos
- 50 users, 2-minute ramp-up, 10 loops
- Include response time assertions < 2000ms
```

### UI Testing
```
Create a complete e-commerce UI test:
- Navigate to https://demo.opencart.com
- Search for "MacBook", add to cart, checkout
- 5 users, 30-second ramp-up, 3 loops
- Include form validation and error handling
```

### Schema-Based Testing
```
Generate a JMeter test from the Petstore API schema:
- Schema URL: https://petstore.swagger.io/v2/swagger.json
- Target endpoint: addPet operation
- Include OAuth2 authentication with client credentials
- Use 10 users, 30-second ramp-up, 5 loops
```

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production          # Environment mode (development/production)
PORT=3000                    # HTTP server port (for --http mode)
DEBUG=true                   # Enable verbose logging
```

**Note:** The server automatically creates `output/` and `sample_data/` directories if they don't exist.

### Custom Settings
The server uses built-in defaults and environment variables:
- Output directory: `./output` (auto-created)
- Sample data directory: `./sample_data` (auto-created)
- Log file: `jmeter-mcp.log`
- Default port (HTTP mode): 3000

## 📊 Performance & Monitoring

### Built-in Monitoring
- **Request Rate**: Tracks generation requests per minute
- **Success Rate**: Monitors successful test generation
- **Validation Rate**: Tracks enhancement application rate
- **File Output**: Monitors generated file sizes and counts

### Health Checks
```bash
# Server health (HTTP mode only)
curl http://localhost:3000/health

# API documentation endpoint
curl http://localhost:3000/api

# Expected health response:
{
  "status": "healthy",
  "server": "jmeter-generator", 
  "version": "1.0.0",
  "transport": "streamable-http",
  "endpoint": "/mcp",
  "tools": 5
}

# Tool availability (HTTP mode)
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

**Note:** Stdio mode doesn't have HTTP endpoints. Health checks are only available in HTTP transport mode.

## 🚀 Deployment Options

### 1. Heroku (HTTP Transport)
```bash
# Create and deploy with HTTP transport
heroku create your-jmeter-mcp-server
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set NODE_ENV=production
git push heroku main

# The app will automatically start with HTTP transport
# Access via: https://your-app.herokuapp.com/health
```

### 2. Railway (HTTP Transport)
- Connect GitHub repository at railway.app
- Set environment variable: `PORT=3000`
- Auto-deploy on push to main branch
- Railway will automatically use HTTP mode

### 3. Digital Ocean App Platform
```yaml
# .do/app.yaml
name: jmeter-mcp-server
services:
- name: api
  source_dir: /
  github:
    repo: your-username/jmeter-mcp-server
    branch: main
  run_command: npm run start:http
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3000"
  health_check:
    http_path: /health
    initial_delay_seconds: 30
    period_seconds: 10
    timeout_seconds: 5
    success_threshold: 1
    failure_threshold: 3
```

### 4. Local Production (PM2)
```bash
# Install PM2 process manager
npm install -g pm2

# Start with HTTP transport
pm2 start npm --name "jmeter-mcp-http" -- run start:http

# Start with custom port
pm2 start npm --name "jmeter-mcp-8080" -- run start:server -- --port 8080

# Monitoring and management
pm2 list
pm2 logs jmeter-mcp-http
pm2 restart jmeter-mcp-http
pm2 stop jmeter-mcp-http

# Auto-start on system boot
pm2 startup
pm2 save

# Cluster mode for high availability
pm2 start ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'jmeter-mcp-cluster',
      script: 'npm',
      args: 'run start:http',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      health_check_grace_period: 3000,
      health_check_path: '/health'
    }
  ]
};
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/jmeter-mcp-server.git
cd jmeter-mcp-server

# Create a feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm test
npm run check

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

### Available NPM Scripts
```bash
# Server Operations
npm start                  # Start server (stdio mode)
npm run start:http         # Start server (HTTP mode, port 3000)
npm run start:server       # Start server (HTTP mode with explicit port)
npm run dev                # Development mode with debugger (stdio)
npm run dev:http           # Development mode with debugger (HTTP)

# Testing
npm test                   # Run server tests
npm run test-api           # Test API schema handler
npm run test-xml           # Test XML generation
npm run test-inventree     # Test InvenTree integration
npm run test-github        # Test GitHub API integration

# Utilities
npm run check              # Syntax check without running
npm run logs               # Tail log files
npm run clean              # Clean output directory and logs
npm run deploy             # Pre-deployment checks
```

## 🐛 Troubleshooting

### Common Issues

**Server Won't Start**
```bash
# Check Node.js version
node --version  # Should be 16+

# Install dependencies
npm install

# Check for errors
npm run check

# Test specific transport modes
npm start        # stdio mode
npm run start:http  # HTTP mode
```

**HTTP Transport Issues**
```bash
# Check if port is available
netstat -an | grep :3000  # Windows
lsof -i :3000             # macOS/Linux

# Test connectivity
curl http://localhost:3000/health

# Check server logs
npm run start:http 2>&1 | tee server.log

# Test with different port
PORT=8080 npm run start:http
```

**VS Code Integration Issues**
1. **Stdio Mode (Local)**:
   - Restart VS Code completely
   - Check MCP extension is installed and enabled
   - Verify settings.json configuration
   - Check VS Code output panel for errors

2. **HTTP Mode (Remote)**:
   - Verify server is running: `curl http://server:3000/health`
   - Check network connectivity and firewall settings
   - Ensure correct URL in VS Code MCP configuration
   - Check CORS settings for cross-origin requests

**Generated Tests Not Working**
1. Verify JMeter is installed
2. Check file paths in generated JMX
3. Validate CSV data format
4. Review JMeter logs for errors

### Debug Mode
```bash
# Stdio mode with debugging
NODE_ENV=development npm run dev

# HTTP mode with debugging  
NODE_ENV=development npm run dev:http

# Enable verbose logging (both modes)
DEBUG=true npm start
DEBUG=true npm run start:http

# Test specific endpoints (HTTP mode)
curl -v http://localhost:3000/health
curl -v http://localhost:3000/api
```

## 📚 Documentation

- 🎯 [Ready-to-Use Examples](EXAMPLE_PROMPTS.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🤝 [Contributing Guidelines](CONTRIBUTING.md)
- � [Fix Summary](FIX_SUMMARY.md)

## 🌟 Community & Support

### Getting Help
- 🐛 [Report Issues](https://github.com/chandanvars/jmeter-mcp-server/issues/new/choose)
- 💬 [Join Discussions](https://github.com/chandanvars/jmeter-mcp-server/discussions)
- 📧 [Email Support](mailto:support@jmeter-mcp-server.com)
- 📚 [Documentation](https://docs.jmeter-mcp-server.com)

### Community
- ⭐ Star this repository if you find it useful
- 🍴 Fork and contribute to make it better
- 📢 Share with the testing community
- 🐦 Follow updates on [Twitter](https://twitter.com/jmeter_mcp)

## 🗺️ Roadmap

### 🚧 In Development
- [ ] WebSocket testing support
- [ ] GraphQL introspection and testing
- [ ] Database performance testing
- [ ] Kubernetes deployment templates
- [ ] Enhanced validation models

### 🔮 Future Plans
- [ ] Selenium WebDriver integration
- [ ] Mobile app testing support
- [ ] Real-time collaboration features
- [ ] Cloud-native monitoring integration
- [ ] Advanced security testing capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apache JMeter Team** - For the incredible testing framework
- **Model Context Protocol** - For the communication standard
- **OpenAPI Initiative** - For API standardization
- **Testing Community** - For feedback and contributions

## 📊 Project Stats

[![GitHub stars](https://img.shields.io/github/stars/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/network/members)
[![GitHub issues](https://img.shields.io/github/issues/chandanvars/jmeter-mcp-server)](https://github.com/chandanvars/jmeter-mcp-server/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

**🎯 Made with ❤️ for the testing community by [Chandan Varshney](https://github.com/chandanvars)**

*Transform your testing workflow with automated JMeter generation!*

**Parameters:**
- `testName` (string): Name of the test plan
- `threadGroup` (object): Thread group configuration
  - `numThreads` (number): Number of concurrent users
  - `rampTime` (number): Ramp-up time in seconds
  - `duration` (number): Test duration in seconds
- `httpRequests` (array): List of HTTP request configurations
- `csvDataSet` (object, optional): CSV data configuration
- `correlations` (array, optional): Response correlation rules
- `timers` (array, optional): Timer configurations

#### `get_jmeter_templates`

Retrieves available JMeter test templates.

**Parameters:**
- `category` (string, optional): Template category filter

## Examples

### Basic Load Test

```json
{
  "testName": "Simple Load Test",
  "threadGroup": {
    "numThreads": 5,
    "rampTime": 30,
    "duration": 120
  },
  "httpRequests": [
    {
      "name": "Home Page",
      "url": "https://example.com",
      "method": "GET"
    }
  ]
}
```

### Parameterized API Test

```json
{
  "testName": "API Test with Data",
  "threadGroup": {
    "numThreads": 10,
    "rampTime": 60,
    "duration": 300
  },
  "httpRequests": [
    {
      "name": "Create User",
      "url": "https://api.example.com/users",
      "method": "POST",
      "body": "{\"name\":\"${name}\",\"email\":\"${email}\"}",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  ],
  "csvDataSet": {
    "fileName": "testdata.csv",
    "variableNames": "name,email"
  }
}
```

## 🚀 GitHub Hosting & Distribution

This project is hosted on GitHub and available through multiple channels:

### 📦 Installation Options

**Via NPM (Recommended):**
```bash
npm install -g jmeter-mcp-server
```

**Via GitHub:**
```bash
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server
npm install
```

**Via GitHub Releases:**
Download the latest release from [GitHub Releases](https://github.com/chandanvars/jmeter-mcp-server/releases)

### 🔧 Development Setup

For contributors and developers:

```bash
# Clone and setup for development
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidelines.

### 📋 Deployment Guide

For detailed hosting and deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 🐛 [Create an issue](https://github.com/chandanvars/jmeter-mcp-server/issues/new/choose) for bugs or feature requests
- 💬 [Start a discussion](https://github.com/chandanvars/jmeter-mcp-server/discussions) for questions and ideas
-  Review the [examples](EXAMPLE_PROMPTS.md) for implementation patterns
- 📖 Read the [deployment guide](DEPLOYMENT.md) for hosting instructions
- 📝 Check [FIX_SUMMARY.md](FIX_SUMMARY.md) for recent updates and fixes

## 🗺️ Roadmap

- [ ] WebSocket support for real-time testing
- [ ] Enhanced UI testing with Selenium integration
- [ ] Performance monitoring integration
- [ ] Cloud deployment templates
- [ ] Additional authentication methods (SAML, OAuth1)
- [ ] GraphQL API testing support
- [ ] Database testing capabilities
- [ ] CI/CD pipeline integrations

## 🌟 Community

- ⭐ Star this repository if you find it useful
- 🍴 Fork it to contribute
- 📢 Share with the testing community
- 🐦 Follow updates on social media

## 📊 Project Stats

[![GitHub stars](https://img.shields.io/github/stars/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/network/members)
[![GitHub issues](https://img.shields.io/github/issues/chandanvars/jmeter-mcp-server)](https://github.com/chandanvars/jmeter-mcp-server/issues)
[![NPM downloads](https://img.shields.io/npm/dm/jmeter-mcp-server)](https://www.npmjs.com/package/jmeter-mcp-server)

---

**Made with ❤️ for the testing community**
- [ ] Database testing components
- [ ] Advanced correlation patterns
- [ ] CI/CD integration templates
- [ ] Performance monitoring integration
- [ ] Custom assertion support