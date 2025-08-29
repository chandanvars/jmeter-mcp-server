# 🎯 JMeter MCP Server

A powerful Model Context Protocol (MCP) server for generating Apache JMeter test scripts with AI assistance, advanced parameterization, correlation capabilities, and comprehensive testing support.

[![GitHub stars](https://img.shields.io/github/stars/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/network/members)
[![GitHub issues](https://img.shields.io/github/issues/chandanvars/jmeter-mcp-server)](https://github.com/chandanvars/jmeter-mcp-server/issues)

## 🌟 Overview

The JMeter MCP Server is a comprehensive testing solution that integrates with MCP-compatible clients (like Claude Desktop, VS Code) to generate sophisticated JMeter test plans. It combines traditional performance testing with modern AI assistance to create production-ready test scripts with minimal effort.

## 🔧 NEW: Scenario Validator

**Revolutionary Auto-Correction Technology** - The built-in Scenario Validator automatically fixes and enhances any UI flow description, ensuring reliable JMX generation from any input:

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

[📖 **Read Full Documentation**](./SCENARIO_VALIDATOR.md)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server

# Install dependencies  
npm install

# Start the MCP server
npm start
```

**VS Code Integration:** Use `@jmeter-generator` in VS Code chat for instant test generation!

## 🛠️ Complete Tool Suite

### 1. 🚀 **generate_jmeter_script** - Core JMeter Test Generation
Create comprehensive JMeter test plans with advanced features:

**Features:**
- Multi-threaded load simulation
- CSV data parameterization  
- Response correlation and extraction
- Multiple timer types (Gaussian, Uniform, Constant Throughput)
- Custom headers and authentication
- Response assertions and validations
- Result collectors and data writers

**Example:**
```javascript
{
  "testName": "API Performance Test",
  "baseUrl": "https://api.example.com",
  "threadGroup": { "numThreads": 50, "rampUpTime": 120, "loops": 10 },
  "requests": [
    {
      "name": "Login",
      "method": "POST", 
      "path": "/auth/login",
      "body": "{\"username\":\"${username}\",\"password\":\"${password}\"}",
      "extractors": [{"variableName": "authToken", "jsonPath": "$.token"}]
    }
  ],
  "csvDataSet": {"fileName": "users.csv", "variableNames": "username,password"}
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

**Auto-Correction Examples:**
```javascript
// Input: "loggin to system"
// Auto-corrected: "Navigate to login page. Enter username. Enter password. Click login button."

// Input: "search laptop, add cart"  
// Auto-corrected: "Navigate to homepage. Search for laptop. Add to cart. Proceed to checkout."
```

**Example:**
```javascript
{
  "baseUrl": "https://demo.opencart.com",
  "flowDescription": "Navigate to login page, enter credentials, verify dashboard appears",
  "testName": "Login Flow Test",
  "threadCount": 5,
  "rampUp": 30,
  "duration": 300
}
```

### 4. 📦 **generate_inventree_test** - InvenTree API Specialized Testing
Optimized testing for InvenTree inventory management systems:

**Features:**
- Pre-configured InvenTree endpoints
- Purchase order creation workflows
- Sales order management testing
- Inventory tracking scenarios
- Token-based authentication
- Real demo environment integration
- Counter management and ID generation

**Example:**
```javascript
{
  "numThreads": 5,
  "rampUpTime": 60,
  "loops": 3,
  "baseUrl": "https://demo.inventree.org"
}
```

### 5. � **get_templates** - Pre-built Testing Templates
Access professionally crafted templates:

**Available Templates:**
- `rest_api` - Complete REST API testing
- `oauth2` - OAuth2 authentication flows
- `graphql` - GraphQL query and mutation testing
- `microservices` - Microservices architecture testing
- `database` - Database performance testing
- `ui_testing` - Web UI automation testing
- `load_testing` - High-volume load testing

**Example:**
```javascript
{"templateType": "rest_api"}
```

### 6. 🤖 **validate_jmx_with_ai** - AI-Powered Test Validation
Enhance and validate JMeter scripts with AI assistance:

**Features:**
- Performance score analysis
- Automated issue detection
- Best practice recommendations
- Auto-correction capabilities
- Enhancement suggestions
- Configuration optimization
- Security validation

**Example:**
```javascript
{
  "jmxContent": "<jmeterTestPlan>...</jmeterTestPlan>",
  "validationMode": "comprehensive",
  "autoCorrect": true
}
```

## � Advanced Features

### 🤖 **AI-Powered Enhancements**
- **Automatic Validation**: Every generated test is analyzed by AI
- **Performance Optimization**: Auto-tuning for better performance
- **Best Practice Application**: Industry standards automatically applied
- **Issue Detection**: Proactive identification of potential problems
- **Smart Corrections**: Automatic fixes for common issues

### 📁 **Intelligent File Organization**
- **JMX Files** → `output/` directory (ready for JMeter)
- **CSV Data** → `sample_data/` directory (test parameters)
- **Enhanced Versions** → `*_ai_enhanced.jmx` (AI-optimized files)
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

# Start the server
npm start
```

### IDE Integration

#### VS Code Integration

**Method 1: Workspace Configuration (Recommended)**
Create a `.vscode/mcp.json` file in your workspace:
```json
{
  "servers": {
    "jmeter-mcp": {
      "command": "node",
      "args": ["src/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

**Method 2: Global Settings**
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
# Build and run container
docker build -t jmeter-mcp-server .
docker run -p 3000:3000 jmeter-mcp-server
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
│   ├── 🖥️ server.js                # Core MCP server implementation
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
│   │   └── ✅ scenarioValidator.js # Smart UI flow validation & correction
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
├── 📁 docs/                        # Documentation (if exists)
│   ├── 📖 API.md                   # API documentation
│   ├── ⚙️ CONFIG.md               # Configuration guide
│   └── 🎯 EXAMPLES.md              # Usage examples
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
- **Enhanced Versions**: AI-optimized test scripts
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
6. **Enhancement**: Optional AI-powered optimization
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
NODE_ENV=production
PORT=3000
MCP_SERVER_NAME=jmeter-generator
LOG_LEVEL=info
AI_VALIDATION_ENABLED=true
MAX_FILE_SIZE=50MB
OUTPUT_DIRECTORY=./output
SAMPLE_DATA_DIRECTORY=./sample_data
```

### Custom Settings
Edit `src/config/settings.js`:
- AI validation timeout settings
- File size limits
- Output directory preferences
- Template customizations

## 📊 Performance & Monitoring

### Built-in Monitoring
- **Request Rate**: Tracks generation requests per minute
- **Success Rate**: Monitors successful test generation
- **AI Validation**: Tracks enhancement application rate
- **File Output**: Monitors generated file sizes and counts

### Health Checks
```bash
# Server health
curl http://localhost:3000/health

# Tool availability  
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

## 🚀 Deployment Options

### 1. Heroku
```bash
heroku create your-jmeter-mcp-server
git push heroku main
heroku ps:scale web=1
```

### 2. Railway
- Connect GitHub repository at railway.app
- Auto-deploy on push to main branch

### 3. Digital Ocean
- Use App Platform with GitHub integration
- Automatic scaling and SSL

### 4. Local Production
```bash
npm install -g pm2
pm2 start src/index.js --name jmeter-mcp-server
pm2 startup && pm2 save
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

### Running Tests
```bash
# Run all tests
npm test

# Test specific components
npm run test-api
npm run test-ui
npm run test-github

# Validate server
npm run check
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
```

**VS Code Integration Issues**
1. Restart VS Code completely
2. Check MCP extension is installed and enabled
3. Verify settings.json configuration
4. Check VS Code output panel for errors

**Generated Tests Not Working**
1. Verify JMeter is installed
2. Check file paths in generated JMX
3. Validate CSV data format
4. Review JMeter logs for errors

### Debug Mode
```bash
# Start with debug logging
NODE_ENV=development npm run dev

# Enable verbose AI logging
AI_DEBUG=true npm start
```

## 📚 Documentation

- 📖 [Complete API Documentation](docs/API.md)
- 🎯 [Ready-to-Use Examples](EXAMPLE_PROMPTS.md)
- 🚀 [Deployment Guide](DEPLOY.md)
- 🤝 [Contributing Guidelines](CONTRIBUTING.md)
- 🔧 [Configuration Reference](docs/CONFIG.md)

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
- [ ] Enhanced AI validation models

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

*Transform your testing workflow with AI-powered JMeter generation!*

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
- 📚 Check the [documentation](docs/) for detailed guides
- 🔍 Review the [examples](EXAMPLE_PROMPTS.md) for implementation patterns
- 📖 Read the [deployment guide](DEPLOYMENT.md) for hosting instructions

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