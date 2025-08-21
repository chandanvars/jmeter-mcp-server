# JMeter MCP Server

A Model Context Protocol (MCP) server for generating Apache JMeter test scripts with advanced parameterization, correlation capabilities, and API schema integration.

## Overview

The JMeter MCP Server is a specialized tool that integrates with MCP-compatible clients to generate comprehensive JMeter test plans. It provides intelligent test script generation with support for HTTP requests, CSV parameterization, response correlation, timers, result collectors, and **automatic API schema parsing with authentication**.

## Features

### Core Features
- 🚀 **Automated JMX Generation**: Create complete JMeter test plans programmatically
- 📊 **CSV Data Integration**: Support for CSV-based test data parameterization
- 🔗 **Response Correlation**: Extract and reuse dynamic values between requests
- ⏱️ **Timer Support**: Multiple timer types (Gaussian, Uniform, Constant Throughput)
- 📈 **Result Collection**: Built-in listeners and data writers for test results
- ✅ **Validation**: Input validation with comprehensive error reporting
- 🎯 **Template System**: Pre-built templates for common testing scenarios

### 🆕 New Advanced Features
- 🌐 **API Schema Integration**: Generate tests from Swagger/OpenAPI URLs
- 🔐 **Advanced Authentication**: OAuth2, JWT, and Bearer token support
- 🔄 **Automatic Correlation**: Token extraction and reuse across requests
- 📦 **InvenTree API Support**: Specialized integration for InvenTree systems
- 🔧 **Smart Request Generation**: Auto-generate requests from API endpoints
- 🎛️ **Multi-Step Workflows**: Create complex authentication flows
- 📋 **Enhanced Templates**: API-schema-aware templates and examples

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/jmeter-mcp-server.git
cd jmeter-mcp-server
```

Or install via NPM:
```bash
npm install -g jmeter-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the MCP server:
```bash
npm start
```

## Usage

The server provides several tools that can be called via MCP-compatible clients:

### 📁 File Organization

The JMeter MCP Server automatically organizes generated files for optimal workflow:

- **📄 JMX Files** → `output/` directory
  - All generated JMeter test scripts (.jmx files)
  - Ready to open in JMeter GUI or run from command line
  
- **📊 CSV Files** → `sample_data/` directory  
  - All test data files for parameterization
  - User credentials, test data, configuration files
  
- **🔗 Automatic Path Linking**
  - JMX files use relative paths to reference CSV files: `../sample_data/filename.csv`
  - Ensures portability across different environments
  - Works seamlessly with JMeter's file resolution

### 1. Generate JMeter Script (Standard)

Generate a complete JMeter test plan with traditional manual configuration:

```javascript
{
  "testName": "API Performance Test",
  "threadGroup": {
    "numThreads": 10,
    "rampTime": 60,
    "duration": 300
  },
  "httpRequests": [
    {
      "name": "Login Request",
      "url": "https://api.example.com/login",
      "method": "POST",
      "body": "{\"username\":\"${username}\",\"password\":\"${password}\"}",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  ],
  "csvDataSet": {
    "fileName": "users.csv",
    "variableNames": "username,password"
  },
  "correlations": [
    {
      "name": "authToken",
      "regex": "\"token\":\"([^\"]+)\"",
      "template": "$1$"
    }
  ],
  "timers": [
    {
      "type": "gaussian",
      "constantDelay": "1000",
      "deviation": "200"
    }
  ]
}
```

### 🆕 2. Generate from API Schema

Generate JMeter tests directly from OpenAPI/Swagger schemas with automatic authentication:

```javascript
{
  "schemaUrl": "https://petstore.swagger.io/v2/swagger.json",
  "endpoint": {
    "operationId": "addPet",  // or use path/method or tag
    "path": "/pet",
    "method": "POST"
  },
  "authConfig": {
    "method": "oauth2",  // Auth method from schema
    "credentials": {
      "clientId": "your_client_id",
      "clientSecret": "your_client_secret",
      "scope": "write:pets read:pets"
    },
    "csvDataSet": {
      "fileName": "oauth_clients.csv",
      "variableNames": "client_id,client_secret,scope"
    }
  },
  "testConfig": {
    "threadGroup": {
      "numThreads": 10,
      "rampUpTime": 30,
      "loops": 5
    }
  }
}
```

### 🆕 3. Generate InvenTree Test

Specialized tool for InvenTree API testing with purchase order workflows:

```javascript
{
  "numThreads": 5,
  "rampUpTime": 60,
  "loops": 3,
  "baseUrl": "https://demo.inventree.org"  // Optional, defaults to docs URL
}
```

### 4. Get Templates

Retrieve pre-built templates for common scenarios:

```javascript
{
  "templateType": "rest_api"  // or oauth2, graphql, etc.
}
```

### Get Templates

Retrieve pre-built templates for common testing scenarios:

- API Load Testing
- Web Application Testing
- Database Performance Testing
- Microservices Testing

## Project Structure

```
jmeter-mcp-server/
├── src/
│   ├── index.js                 # MCP server entry point
│   ├── server.js               # Server configuration
│   ├── generators/
│   │   ├── configGenerator.js  # Test plan configuration
│   │   ├── jmxGenerator.js     # Main JMX generation logic
│   │   └── samplerGenerator.js # HTTP sampler generation
│   ├── handlers/
│   │   ├── jmeterHandler.js    # Main request handler
│   │   └── templateHandler.js  # Template management
│   ├── templates/
│   │   └── jmxTemplates.js     # Predefined templates
│   └── utils/
│       ├── validator.js        # Input validation
│       └── xmlBuilder.js       # XML/JMX building utilities
├── package.json
└── README.md
```

## Generated JMX Features

The server generates JMeter test plans with:

### Core Elements
- **Test Plan**: Main container with user-defined variables
- **Thread Group**: Configurable user simulation with ramp-up and duration
- **HTTP Request Defaults**: Base configuration for all HTTP requests
- **HTTP Cookie Manager**: Automatic cookie handling

### HTTP Requests
- Multiple HTTP methods (GET, POST, PUT, DELETE, etc.)
- Custom headers and request bodies
- Parameter substitution from CSV files
- Response assertions and validations

### Data Management
- **CSV Data Set Config**: External data file integration
- **User Defined Variables**: Static variable definitions
- **Regular Expression Extractor**: Response correlation and data extraction

### Timers
- **Gaussian Random Timer**: Normal distribution delays
- **Uniform Random Timer**: Uniform distribution delays  
- **Constant Throughput Timer**: Rate-based request control

### Result Collection
- **Simple Data Writer**: Basic result logging
- **Response Time Graph**: Performance visualization
- **Summary Report**: Aggregate statistics

## API Reference

### Tools

#### `generate_jmeter_script`

Generates a complete JMeter test script.

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