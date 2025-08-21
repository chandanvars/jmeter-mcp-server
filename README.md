# 🎯 JMeter MCP Server

A powerful Model Context Protocol (MCP) server for generating Apache JMeter test scripts with AI assistance, advanced parameterization, correlation capabilities, and comprehensive testing support.

[![GitHub stars](https://img.shields.io/github/stars/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/chandanvars/jmeter-mcp-server?style=social)](https://github.com/chandanvars/jmeter-mcp-server/network/members)
[![GitHub issues](https://img.shields.io/github/issues/chandanvars/jmeter-mcp-server)](https://github.com/chandanvars/jmeter-mcp-server/issues)

## 🌟 Overview

The JMeter MCP Server is a comprehensive testing solution that integrates with MCP-compatible clients (like Claude Desktop, VS Code) to generate sophisticated JMeter test plans. It combines traditional performance testing with modern AI assistance to create production-ready test scripts with minimal effort.

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
Create sophisticated UI testing scenarios:

**Features:**
- Natural language flow parsing
- Web browser simulation
- Element interaction (click, type, select, navigate)
- Form handling and submission
- JavaScript execution support
- Screenshot capture on failures
- Responsive design testing
- Cross-browser simulation
- Session management and cookies

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

### VS Code Integration
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

### Docker Deployment
```bash
# Build and run container
docker build -t jmeter-mcp-server .
docker run -p 3000:3000 jmeter-mcp-server
```

## 📖 Usage Examples

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
├── src/
│   ├── index.js                    # MCP server entry point
│   ├── handlers/
│   │   ├── jmeterHandler.js       # Core JMeter generation
│   │   ├── uiFlowHandler.js       # UI testing workflows
│   │   ├── apiSchemaHandler.js    # API schema processing
│   │   ├── templateHandler.js     # Template management
│   │   └── correlationHandler.js  # Response correlation
│   ├── generators/
│   │   ├── jmxGenerator.js        # JMX XML generation
│   │   ├── configGenerator.js     # Configuration generation
│   │   └── samplerGenerator.js    # HTTP sampler creation
│   ├── ai/
│   │   ├── aiValidationService.js # AI-powered validation
│   │   └── aiJMXAssistant.js      # AI enhancement engine
│   ├── parsers/
│   │   └── promptToFlowParser.js  # Natural language parsing
│   ├── correlation/
│   │   ├── correlationEngine.js   # Correlation processing
│   │   └── patterns.js            # Correlation patterns
│   ├── utils/
│   │   ├── fileWriter.js          # File management
│   │   ├── validator.js           # Input validation
│   │   └── xmlBuilder.js          # XML construction
│   └── templates/
│       └── jmxTemplates.js        # Pre-built templates
├── output/                         # Generated JMX files
├── sample_data/                   # CSV test data
├── EXAMPLE_PROMPTS.md             # Usage examples
├── DEPLOY.md                      # Deployment guide
└── package.json
```

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
git clone https://github.com/YOUR_USERNAME/jmeter-mcp-server.git
cd jmeter-mcp-server
npm install
```

**Via GitHub Releases:**
Download the latest release from [GitHub Releases](https://github.com/YOUR_USERNAME/jmeter-mcp-server/releases)

### 🔧 Development Setup

For contributors and developers:

```bash
# Clone and setup for development
git clone https://github.com/YOUR_USERNAME/jmeter-mcp-server.git
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
- 🐛 [Create an issue](https://github.com/YOUR_USERNAME/jmeter-mcp-server/issues/new/choose) for bugs or feature requests
- 💬 [Start a discussion](https://github.com/YOUR_USERNAME/jmeter-mcp-server/discussions) for questions and ideas
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

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/jmeter-mcp-server?style=social)](https://github.com/YOUR_USERNAME/jmeter-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/jmeter-mcp-server?style=social)](https://github.com/YOUR_USERNAME/jmeter-mcp-server/network/members)
[![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/jmeter-mcp-server)](https://github.com/YOUR_USERNAME/jmeter-mcp-server/issues)
[![NPM downloads](https://img.shields.io/npm/dm/jmeter-mcp-server)](https://www.npmjs.com/package/jmeter-mcp-server)

---

**Made with ❤️ for the testing community**
- [ ] Database testing components
- [ ] Advanced correlation patterns
- [ ] CI/CD integration templates
- [ ] Performance monitoring integration
- [ ] Custom assertion support