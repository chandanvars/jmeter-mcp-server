# 🏛️ JMeter MCP Server Architecture

**Version:** 1.0.0  
**Last Updated:** October 3, 2025  
**Server Name:** `jmeter-generator`

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Transport Layer](#transport-layer)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Tool Implementation](#tool-implementation)
7. [File Generation Pipeline](#file-generation-pipeline)
8. [Error Handling](#error-handling)
9. [Performance Considerations](#performance-considerations)
10. [Security Architecture](#security-architecture)
11. [Extension Points](#extension-points)

---

## 🌟 Overview

The JMeter MCP Server is a **Model Context Protocol (MCP)** compliant server that generates Apache JMeter test scripts through AI-assisted interfaces. It provides a bridge between natural language test descriptions and production-ready JMeter XML (JMX) files.

### Key Design Principles

- **Modularity**: Clean separation of concerns with handler-based architecture
- **Dual Transport**: Support for both local (stdio) and remote (HTTP/SSE) connections
- **Intelligent Processing**: Auto-correction and validation of user inputs
- **File-based Output**: Automatic generation and organization of test artifacts
- **Extensibility**: Plugin-style handlers for different test types

### Technology Stack

```
┌─────────────────────────────────────────┐
│   MCP Protocol (JSON-RPC 2.0)          │
├─────────────────────────────────────────┤
│   @modelcontextprotocol/sdk v1.17.4    │
├─────────────────────────────────────────┤
│   Node.js 16+ (ES Modules)             │
├─────────────────────────────────────────┤
│   Core Libraries:                       │
│   - xmlbuilder2 (JMX generation)       │
│   - swagger-parser (API schemas)       │
│   - puppeteer (UI flow crawling)       │
│   - axios (HTTP requests)              │
│   - winston (logging)                  │
└─────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Claude       │  │ VS Code      │  │ HTTP Client  │         │
│  │ Desktop      │  │ MCP Ext      │  │ (Browser)    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
    ┌─────▼──────────────────▼──────────────────▼─────┐
    │         TRANSPORT LAYER (MCP Protocol)          │
    │  ┌──────────────┐      ┌──────────────────┐    │
    │  │ Stdio        │      │ HTTP/SSE         │    │
    │  │ Transport    │      │ Transport        │    │
    │  └──────┬───────┘      └──────┬───────────┘    │
    │         │                     │                 │
    └─────────┼─────────────────────┼─────────────────┘
              │                     │
    ┌─────────▼─────────────────────▼─────────────────┐
    │            MCP SERVER CORE (index.js)           │
    │  ┌───────────────────────────────────────┐     │
    │  │  Server Instance (MCPServer class)    │     │
    │  │  - Request routing                    │     │
    │  │  - Tool registry                      │     │
    │  │  - Error handling                     │     │
    │  │  - Logging                            │     │
    │  └───────────────┬───────────────────────┘     │
    │                  │                              │
    └──────────────────┼──────────────────────────────┘
                       │
    ┌──────────────────▼──────────────────────────────┐
    │              HANDLER LAYER                      │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │ JMeter       │  │ UIFlow               │    │
    │  │ Handler      │  │ Handler              │    │
    │  └──────┬───────┘  └──────┬───────────────┘    │
    │  ┌──────▼───────┐  ┌──────▼───────────────┐    │
    │  │ Template     │  │ APISchema            │    │
    │  │ Handler      │  │ Handler              │    │
    │  └──────────────┘  └──────────────────────┘    │
    └──────────────────┬──────────────────────────────┘
                       │
    ┌──────────────────▼──────────────────────────────┐
    │           PROCESSING LAYER                      │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │ Scenario     │  │ Prompt-to-Flow       │    │
    │  │ Validator    │  │ Parser               │    │
    │  └──────────────┘  └──────────────────────┘    │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │ Correlation  │  │ Flow Crawler         │    │
    │  │ Engine       │  │ (Puppeteer)          │    │
    │  └──────────────┘  └──────────────────────┘    │
    └──────────────────┬──────────────────────────────┘
                       │
    ┌──────────────────▼──────────────────────────────┐
    │           GENERATION LAYER                      │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │ JMX          │  │ Config               │    │
    │  │ Generator    │  │ Generator            │    │
    │  └──────────────┘  └──────────────────────┘    │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │ Sampler      │  │ CSV Data             │    │
    │  │ Generator    │  │ Generator            │    │
    │  └──────────────┘  └──────────────────────┘    │
    └──────────────────┬──────────────────────────────┘
                       │
    ┌──────────────────▼──────────────────────────────┐
    │             OUTPUT LAYER                        │
    │  ┌──────────────┐  ┌──────────────────────┐    │
    │  │ File Writer  │  │ File Monitor         │    │
    │  └──────┬───────┘  └──────┬───────────────┘    │
    │         │                  │                    │
    │  ┌──────▼──────────────────▼───────────────┐   │
    │  │     File System (output/ directory)     │   │
    │  │  - *.jmx (JMeter test plans)            │   │
    │  │  - *.csv (test data files)              │   │
    │  └─────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────┘
```

---

## 🔌 Transport Layer

### Dual Transport Architecture

The server supports two transport mechanisms for maximum flexibility:

#### 1. Stdio Transport (Local Development)

```javascript
// Connection Flow
┌─────────────┐
│ MCP Client  │
│ (Claude/    │
│  VS Code)   │
└──────┬──────┘
       │ stdin/stdout pipes
       │
┌──────▼──────────────────┐
│ StdioServerTransport    │
│ - Direct process comm   │
│ - Low latency           │
│ - Single client         │
└─────────────────────────┘
```

**Use Cases:**
- Local development and testing
- Claude Desktop integration
- VS Code MCP extension
- Single-user scenarios

**Configuration:**
```bash
npm start  # Default stdio mode
node src/index.js  # Direct invocation
```

#### 2. HTTP/SSE Transport (Remote/Production)

```javascript
// Connection Flow
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Web Client  │    │ Mobile App  │    │ Remote IDE  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │ HTTP/HTTPS
                    ┌─────▼──────────────────┐
                    │ HTTP Server (Node.js)  │
                    │ - CORS enabled         │
                    │ - Multiple endpoints   │
                    └─────┬──────────────────┘
                          │
            ┌─────────────▼─────────────────┐
            │ StreamableHTTPServerTransport │
            │ - Server-Sent Events (SSE)    │
            │ - Session management          │
            │ - Multi-client support        │
            └───────────────────────────────┘
```

**Endpoints:**
- `POST /message` or `/mcp` - MCP message handling (SSE stream)
- `GET /health` - Health check endpoint
- `GET /api` or `/docs` - API documentation
- `OPTIONS *` - CORS preflight handling

**Use Cases:**
- Production deployments
- Remote access
- Load balancer integration
- Multiple concurrent clients
- Cloud hosting (Heroku, Railway, etc.)

**Configuration:**
```bash
npm run start:http  # Port 3000 (default)
PORT=8080 npm run start:http  # Custom port
node src/index.js --http --port 3000  # Direct with port
```

---

## 🎯 Core Components

### 1. Server Core (`src/index.js`, `src/server.js`)

**Responsibilities:**
- MCP protocol implementation
- Transport initialization
- Request routing
- Tool registration
- Error handling and logging
- File monitoring

**Key Classes:**

```javascript
// Main entry point
class MCPServer {
  constructor(config, capabilities)
  connect(transport)
  setRequestHandler(schema, handler)
}

// Server wrapper (src/server.js)
class JMeterMCPServer {
  constructor()
  initializeServer()
  registerTools()
  registerResources()
  connect(transport)
}
```

**Request Flow:**
```
Client Request → Transport Layer → Server.setRequestHandler()
                                          ↓
                                   Route by schema:
                                   - ListToolsRequestSchema
                                   - CallToolRequestSchema
                                          ↓
                                   Execute handler
                                          ↓
                                   Format response
                                          ↓
                                   Return to client
```

### 2. Handler Layer

#### JMeterHandler (`src/handlers/jmeterHandler.js`)

**Purpose:** Core JMeter test script generation

```javascript
class JMeterHandler {
  constructor() {
    this.jmxGenerator = new JMXGenerator()
    this.fileWriter = new FileWriter()
  }
  
  async generateJMeterScript(args) {
    // 1. Validate input
    // 2. Generate JMX content
    // 3. Write JMX file to output/
    // 4. Generate CSV if needed
    // 5. Return success response with file paths
  }
  
  async generateFromApiSchema(args) {
    // 1. Parse API schema (OpenAPI/Swagger)
    // 2. Extract endpoint details
    // 3. Generate authentication requests
    // 4. Create JMeter test plan
    // 5. Return formatted response
  }
}
```

**Dependencies:**
- JMXGenerator (generates XML)
- FileWriter (writes files)
- SuccessMessageGenerator (formats responses)

#### UIFlowHandler (`src/handlers/uiFlowHandler.js`)

**Purpose:** UI flow testing from natural language

```javascript
class UIFlowHandler {
  constructor() {
    this.promptParser = new PromptToFlowParser()
    this.jmxGenerator = new JMXGenerator()
    this.scenarioValidator = new ScenarioValidator()
    this.fileWriter = new FileWriter()
  }
  
  async generateUIFlowScript(params) {
    // 1. Validate & correct flow description (ScenarioValidator)
    // 2. Parse corrected flow into actionable steps
    // 3. Convert steps to HTTP requests
    // 4. Generate JMX test plan
    // 5. Write files and return response
  }
}
```

**Processing Pipeline:**
```
User Prompt → ScenarioValidator → PromptToFlowParser → 
HTTP Requests → JMXGenerator → JMX File
```

#### TemplateHandler (`src/handlers/templateHandler.js`)

**Purpose:** Pre-built test templates

```javascript
class TemplateHandler {
  async getTemplate(args) {
    // Returns pre-configured test templates:
    // - rest_api, graphql, soap
    // - oauth2, websocket, database
  }
}
```

#### ApiSchemaHandler (`src/handlers/apiSchemaHandler.js`)

**Purpose:** OpenAPI/Swagger schema processing

```javascript
class ApiSchemaHandler {
  async parseApiSchema(url) {
    // 1. Fetch schema (JSON/YAML)
    // 2. Parse with swagger-parser
    // 3. Extract endpoints, auth methods
    // 4. Return structured data
  }
  
  extractAuthMethods(spec) {
    // Supports: OAuth2, JWT, Bearer, API Key, Basic Auth
  }
}
```

### 3. Processing Layer

#### ScenarioValidator (`src/validators/scenarioValidator.js`)

**Purpose:** Intelligent flow correction and enhancement

**Architecture:**
```javascript
class ScenarioValidator {
  async validateAndCorrect(flowDescription, params) {
    // Step 1: Normalize flow (fix spacing, punctuation)
    // Step 2: Validate flow structure
    // Step 3: Fix common parsing issues
    // Step 4: Enhance with missing elements
    // Step 5: Validate against parser patterns
    // Step 6: Calculate confidence score
    
    return {
      success: true,
      correctedFlow: "...",
      wasModified: true,
      issues: [],
      corrections: [],
      suggestions: [],
      confidence: 0.95
    }
  }
}
```

**Correction Patterns:**
- Typo fixing: "loggin" → "login", "clik" → "click"
- Flow enhancement: "login" → "Navigate to login. Enter credentials. Click submit."
- Structure validation: Ensure proper step sequencing
- Element addition: Add missing navigation, waits, assertions

**Impact:** 815 lines of intelligent validation logic

#### PromptToFlowParser (`src/parsers/promptToFlowParser.js`)

**Purpose:** Natural language to test steps conversion

```javascript
class PromptToFlowParser {
  async parsePrompt(description) {
    // Patterns recognized:
    // - "navigate to X" → navigation action
    // - "click X" → click action
    // - "fill X with Y" → input action
    // - "wait X seconds" → timer action
    // - "verify X" → assertion action
    
    return {
      success: true,
      steps: [
        { type: 'navigate', url: '...', name: '...' },
        { type: 'click', selector: '...', name: '...' },
        { type: 'input', selector: '...', value: '...', name: '...' }
      ]
    }
  }
}
```

#### CorrelationEngine (`src/correlation/correlationEngine.js`)

**Purpose:** Extract and correlate dynamic values between requests

```javascript
class CorrelationEngine {
  extractCorrelations(requests) {
    // Identifies:
    // - Tokens in responses
    // - Session IDs
    // - CSRF tokens
    // - Dynamic IDs
    
    // Creates extractors for subsequent requests
  }
}
```

**Patterns** (`src/correlation/patterns.js`):
- JSON Path extraction
- Regex extraction
- XPath extraction
- Boundary-based extraction

#### FlowCrawler (`src/crawler/flowCrawler.js`)

**Purpose:** Automated web flow discovery using Puppeteer

```javascript
class FlowCrawler {
  async crawlFlow(baseUrl, flowSteps) {
    // Uses Puppeteer to:
    // - Navigate pages
    // - Discover elements
    // - Record HTTP requests
    // - Capture screenshots
    // - Generate test data
  }
}
```

### 4. Generation Layer

#### JMXGenerator (`src/generators/jmxGenerator.js`)

**Purpose:** Core JMX XML generation

```javascript
class JMXGenerator {
  generate(config) {
    // Creates complete JMX structure:
    // 1. Test Plan element
    // 2. Thread Group
    // 3. HTTP Request Defaults
    // 4. Cookie Manager
    // 5. HTTP Requests (samplers)
    // 6. Extractors (JSON, Regex)
    // 7. Assertions
    // 8. Timers
    // 9. Listeners
    
    return xmlString
  }
}
```

**XML Structure Generated:**
```xml
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan>
      <hashTree>
        <ThreadGroup>
          <hashTree>
            <HTTPSamplerProxy>
              <hashTree>
                <JSONPathExtractor/>
                <ResponseAssertion/>
              </hashTree>
            </HTTPSamplerProxy>
            <GaussianRandomTimer/>
          </hashTree>
        </ThreadGroup>
        <ResultCollector/>
      </hashTree>
    </TestPlan>
  </hashTree>
</jmeterTestPlan>
```

#### ConfigGenerator (`src/generators/configGenerator.js`)

**Purpose:** Generate test configuration elements

- User-defined variables
- HTTP Request Defaults
- Header Manager
- Cookie Manager
- Cache Manager
- Authorization Manager

#### SamplerGenerator (`src/generators/samplerGenerator.js`)

**Purpose:** Generate HTTP sampler elements

- HTTP Request Sampler
- URL parameters
- Request body
- Headers
- Authentication

### 5. Output Layer

#### FileWriter (`src/utils/fileWriter.js`)

**Purpose:** File I/O operations

```javascript
class FileWriter {
  writeJMXFile(filename, content) {
    // Writes to: ./output/${filename}
    // Creates directory if needed
    // Returns absolute path
  }
  
  writeCSVFile(filename, content) {
    // Writes to: ./sample_data/${filename}
    // Creates directory if needed
    // Returns absolute path
  }
  
  cleanFilename(name) {
    // Sanitizes filename:
    // - Replace spaces with underscores
    // - Remove special characters
    // - Convert to lowercase
  }
}
```

**Directory Structure:**
```
project-root/
├── output/           # Generated JMX files
│   ├── test_plan_1.jmx
│   └── test_plan_2.jmx
├── sample_data/      # Generated CSV files
│   ├── test_data.csv
│   └── users.csv
└── jmeter-mcp.log   # Server log file
```

#### FileMonitor (`src/utils/fileMonitor.js`)

**Purpose:** Monitor file system and prevent duplication

```javascript
class FileMonitor {
  startMonitoring() {
    // Watches: ./output, ./src/output, ./
    // Prevents: AI-enhanced file generation
    // Cleans: Duplicate or enhanced files
  }
  
  cleanupExistingFiles() {
    // Removes *_enhanced.jmx files
  }
}
```

---

## 🔄 Data Flow

### Complete Request Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                               │
│    {                                                            │
│      "jsonrpc": "2.0",                                         │
│      "method": "tools/call",                                   │
│      "params": {                                               │
│        "name": "generate_jmeter_script",                       │
│        "arguments": { testName, baseUrl, requests, ... }       │
│      }                                                          │
│    }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. TRANSPORT LAYER                                              │
│    - Stdio: Read from stdin                                     │
│    - HTTP: Receive POST /message                                │
│    - Parse JSON-RPC message                                     │
│    - Extract method and params                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. SERVER CORE                                                  │
│    - Route to CallToolRequestSchema handler                     │
│    - Extract tool name: "generate_jmeter_script"                │
│    - Lookup handler: jmeterHandler                              │
│    - Call: jmeterHandler.generateJMeterScript(args)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. HANDLER LAYER (JMeterHandler)                                │
│    a) Input validation                                          │
│    b) Call JMXGenerator.generate(args)                          │
│    c) Receive JMX XML string                                    │
│    d) Generate safe filename                                    │
│    e) Check for CSV data requirements                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. GENERATION LAYER (JMXGenerator)                              │
│    a) Create XML structure with xmlbuilder2                     │
│    b) Add TestPlan element                                      │
│    c) Add ThreadGroup with config                               │
│    d) Add HTTP Request Defaults                                 │
│    e) Add Cookie Manager                                        │
│    f) For each request:                                         │
│       - Create HTTPSamplerProxy                                 │
│       - Add headers, body, parameters                           │
│       - Add extractors (JSON/Regex)                             │
│       - Add assertions                                          │
│    g) Add timers (Gaussian/Uniform/Throughput)                  │
│    h) Add listeners (View Results Tree, etc.)                   │
│    i) Generate final XML string                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. OUTPUT LAYER (FileWriter)                                    │
│    a) Ensure output directory exists                            │
│    b) Write JMX file to ./output/${filename}.jmx                │
│    c) If CSV data required:                                     │
│       - Generate CSV content                                    │
│       - Write to ./sample_data/${filename}_data.csv             │
│       - Update JMX with CSV file reference                      │
│    d) Return file paths                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. RESPONSE FORMATTING                                          │
│    - SuccessMessageGenerator creates formatted message          │
│    - Include file paths, tool information, next steps           │
│    - Format as MCP response with content array                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. RETURN TO CLIENT                                             │
│    {                                                            │
│      "content": [                                               │
│        {                                                        │
│          "type": "text",                                        │
│          "text": "✅ JMeter script generated successfully!"    │
│        }                                                        │
│      ]                                                          │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

### UI Flow Processing (Special Case)

```
User Prompt: "Navigate to login page, enter credentials, click submit"
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ ScenarioValidator.validateAndCorrect()                          │
│ - Fix typos: "loggin" → "login"                                │
│ - Add structure: Add navigation, wait steps                     │
│ - Enhance: Expand minimal descriptions                          │
│ OUTPUT: "Navigate to https://example.com/login. Wait 2 seconds.│
│          Enter username into #username field. Enter password    │
│          into #password field. Click #submit button. Wait 3     │
│          seconds for page load."                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ PromptToFlowParser.parsePrompt()                                │
│ - Tokenize corrected flow                                       │
│ - Identify action patterns                                      │
│ - Extract parameters                                            │
│ OUTPUT: [                                                       │
│   { type: 'navigate', url: '...', name: 'Navigate to Login' }, │
│   { type: 'wait', duration: 2000, name: 'Wait' },              │
│   { type: 'input', selector: '#username', value: '${user}' },  │
│   { type: 'input', selector: '#password', value: '${pass}' },  │
│   { type: 'click', selector: '#submit', name: 'Submit' },      │
│   { type: 'wait', duration: 3000, name: 'Wait for load' }      │
│ ]                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ UIFlowHandler.convertStepsToRequests()                          │
│ - Convert actions to HTTP requests                              │
│ - Simulate browser behavior                                     │
│ - Add appropriate headers                                       │
│ OUTPUT: HTTP request sequence simulating browser                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ JMXGenerator.generate()                                         │
│ - Generate JMeter test plan                                     │
│ - Include timers for wait steps                                 │
│ - Add assertions for page verification                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tool Implementation

### Tool Registration Architecture

```javascript
// In src/index.js
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_jmeter_script',
        description: '...',
        inputSchema: { /* JSON Schema */ },
        category: 'Load Testing',
        icon: '⚡',
        examples: [...]
      },
      // ... other tools
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  
  switch (name) {
    case 'generate_jmeter_script':
      return await jmeterHandler.generateJMeterScript(args)
    case 'generate_from_api_schema':
      return await jmeterHandler.generateFromApiSchema(args)
    case 'generate_ui_flow_script':
      return await generateUIFlowScript(args)
    case 'get_templates':
      return await templateHandler.getTemplate(args)
  }
})
```

### Tool Execution Flow

```
Tool Call Request
       │
       ▼
┌──────────────────┐
│ Validate Input   │
│ against schema   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Route to Handler │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Process Request  │
│ - Generate files │
│ - Transform data │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Format Response  │
│ - Success msgs   │
│ - Error handling │
└────────┬─────────┘
         │
         ▼
  Return to Client
```

---

## 📁 File Generation Pipeline

### JMX File Generation

```
Input Configuration
       │
       ▼
┌─────────────────────────────────────┐
│ JMXGenerator.generate()             │
│                                     │
│ 1. Create XML Document              │
│    - xmlbuilder2 builder            │
│    - Root element: jmeterTestPlan   │
│                                     │
│ 2. Build Test Plan                  │
│    - Test plan properties           │
│    - User-defined variables         │
│                                     │
│ 3. Build Thread Group               │
│    - numThreads, rampUpTime, loops  │
│    - Scheduler configuration        │
│                                     │
│ 4. Add Configuration Elements       │
│    - HTTP Request Defaults          │
│    - Cookie Manager                 │
│    - Header Manager                 │
│                                     │
│ 5. Add Samplers (for each request) │
│    - HTTPSamplerProxy               │
│    - Method, path, body             │
│    - Headers, parameters            │
│                                     │
│ 6. Add Post-Processors              │
│    - JSON Path Extractor            │
│    - Regex Extractor                │
│    - Boundary Extractor             │
│                                     │
│ 7. Add Assertions                   │
│    - Response Code Assertion        │
│    - Response Time Assertion        │
│    - JSON Path Assertion            │
│                                     │
│ 8. Add Timers                       │
│    - Gaussian Random Timer          │
│    - Uniform Random Timer           │
│    - Constant Throughput Timer      │
│                                     │
│ 9. Add Listeners                    │
│    - View Results Tree              │
│    - Aggregate Report               │
│    - Simple Data Writer             │
│                                     │
│ 10. Generate XML String             │
│     - Pretty print                  │
│     - Proper indentation            │
└────────────┬────────────────────────┘
             │
             ▼
      JMX XML String
             │
             ▼
┌─────────────────────────────────────┐
│ FileWriter.writeJMXFile()           │
│                                     │
│ 1. Sanitize filename                │
│ 2. Ensure output/ directory exists  │
│ 3. Write file with UTF-8 encoding   │
│ 4. Return absolute file path        │
└────────────┬────────────────────────┘
             │
             ▼
  ./output/test_name.jmx
```

### CSV File Generation

```
CSV Configuration
       │
       ▼
┌─────────────────────────────────────┐
│ Generate CSV Content                │
│                                     │
│ 1. Extract variable names           │
│    - From csvDataSet.variableNames  │
│    - Split by comma                 │
│                                     │
│ 2. Create header row                │
│    - Join variable names            │
│                                     │
│ 3. Generate sample data rows        │
│    - If values provided: use them   │
│    - Else: generate placeholder     │
│                                     │
│ 4. Format as CSV                    │
│    - Proper delimiter               │
│    - Quote escaping                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ FileWriter.writeCSVFile()           │
│                                     │
│ 1. Ensure sample_data/ exists       │
│ 2. Write CSV file                   │
│ 3. Return absolute path             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Update JMX References               │
│                                     │
│ 1. Update CSVDataSet element        │
│ 2. Set filename to CSV path         │
│ 3. Configure delimiter, variables   │
│ 4. Re-write JMX file                │
└────────────┬────────────────────────┘
             │
             ▼
  Complete Test Plan
  - JMX file: ./output/test.jmx
  - CSV file: ./sample_data/test_data.csv
```

---

## ⚠️ Error Handling

### Error Handling Strategy

```javascript
// Multi-layer error handling
┌─────────────────────────────────────┐
│ Layer 1: Transport Layer            │
│ - Malformed JSON                    │
│ - Connection errors                 │
│ - Protocol violations               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Layer 2: Server Core                │
│ - Unknown tool requests             │
│ - Invalid method calls              │
│ - Missing parameters                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Layer 3: Handler Layer              │
│ - Validation failures               │
│ - Schema parsing errors             │
│ - File I/O errors                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Layer 4: Processing Layer           │
│ - Flow parsing failures             │
│ - Correlation errors                │
│ - Validation issues                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Layer 5: Generation Layer           │
│ - XML generation errors             │
│ - File write failures               │
│ - Invalid configuration             │
└─────────────────────────────────────┘
```

### Error Response Format

```javascript
// Success response
{
  content: [
    {
      type: 'text',
      text: '✅ JMeter script generated successfully!'
    }
  ]
}

// Error response
{
  content: [
    {
      type: 'text',
      text: '❌ Error in generate_jmeter_script: ${error.message}'
    }
  ],
  isError: true
}
```

### Logging Architecture

```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'jmeter-mcp.log' 
    })
  ]
})

// Log levels used:
// - error: Critical failures
// - warn: Recoverable issues
// - info: Normal operations
// - debug: Detailed execution flow
```

---

## 🚀 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   ```javascript
   // Handlers initialized only when needed
   const handlers = {
     jmeter: null,
     uiFlow: null,
     template: null
   }
   
   // Initialize on first use
   if (!handlers.jmeter) {
     handlers.jmeter = new JMeterHandler()
   }
   ```

2. **Caching**
   ```javascript
   // API schemas cached in memory
   class ApiSchemaHandler {
     constructor() {
       this.apiSpecs = new Map()
     }
     
     async parseApiSchema(url) {
       if (this.apiSpecs.has(url)) {
         return this.apiSpecs.get(url)
       }
       // ... fetch and cache
     }
   }
   ```

3. **Streaming Output**
   ```javascript
   // Large JMX files streamed to disk
   const writeStream = fs.createWriteStream(filePath)
   xmlBuilder.end({ prettyPrint: true, stream: writeStream })
   ```

4. **Async Operations**
   ```javascript
   // All I/O operations are async
   await fileWriter.writeJMXFile(filename, content)
   await apiSchemaHandler.parseApiSchema(url)
   ```

### Memory Management

- **XML Generation**: Streaming for large files
- **File I/O**: Buffered writes
- **Schema Parsing**: Cached parsed schemas
- **Session Management**: UUID-based session IDs

### Scalability

**Horizontal Scaling (HTTP Mode):**
```
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│ MCP │ │ MCP │
│ S#1 │ │ S#2 │
└─────┘ └─────┘
```

**Vertical Scaling:**
- Increase Node.js memory limit: `node --max-old-space-size=4096`
- Use worker threads for CPU-intensive operations
- Optimize XML generation with faster libraries

---

## 🔒 Security Architecture

### Input Validation

```javascript
// Schema-based validation
const inputSchema = {
  type: 'object',
  properties: {
    testName: { 
      type: 'string',
      pattern: '^[a-zA-Z0-9_\\-\\s]+$'  // Prevent injection
    },
    baseUrl: { 
      type: 'string',
      format: 'uri'  // Validate URLs
    }
  },
  required: ['testName', 'baseUrl']
}
```

### File System Security

```javascript
// Filename sanitization
cleanFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')  // Remove dangerous chars
    .replace(/_{2,}/g, '_')        // Collapse underscores
    .substring(0, 255)             // Limit length
}

// Path traversal prevention
const outputDir = path.resolve(__dirname, '..', 'output')
const targetPath = path.resolve(outputDir, filename)

if (!targetPath.startsWith(outputDir)) {
  throw new Error('Invalid file path')
}
```

### CORS Configuration (HTTP Mode)

```javascript
// Configurable CORS
res.setHeader('Access-Control-Allow-Origin', 
  process.env.CORS_ORIGIN || '*')
res.setHeader('Access-Control-Allow-Methods', 
  'GET, POST, PUT, DELETE, OPTIONS')
res.setHeader('Access-Control-Allow-Headers', 
  'Content-Type, Authorization, X-Requested-With')
```

### Secrets Management

```javascript
// Environment variables for sensitive data
const config = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD,
  tokenSecret: process.env.TOKEN_SECRET
}

// Never log sensitive data
logger.info('Request received', { 
  testName: args.testName,
  // Do NOT log: passwords, tokens, API keys
})
```

---

## 🔌 Extension Points

### Adding New Tools

```javascript
// 1. Create handler
class MyNewHandler {
  async handleRequest(args) {
    // Implementation
  }
}

// 2. Register in index.js
const myHandler = new MyNewHandler()

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // ... existing cases
  case 'my_new_tool':
    return await myHandler.handleRequest(args)
})

// 3. Add to tool list
{
  name: 'my_new_tool',
  description: '...',
  inputSchema: { /* schema */ }
}
```

### Adding New Templates

```javascript
// In src/templates/jmxTemplates.js
export const templates = {
  // ... existing templates
  
  my_new_template: {
    name: 'My New Template',
    description: '...',
    config: {
      testName: 'My Test',
      baseUrl: 'https://example.com',
      requests: [...]
    }
  }
}
```

### Adding New Extractors

```javascript
// In src/correlation/patterns.js
export const extractorPatterns = {
  // ... existing patterns
  
  custom_extractor: {
    name: 'Custom Extractor',
    type: 'jsonPath',
    pattern: '$.custom.field',
    example: '{"custom": {"field": "value"}}'
  }
}
```

### Adding New Validators

```javascript
// Create new validator
class MyValidator {
  validate(input) {
    // Validation logic
    return { isValid: true, errors: [] }
  }
}

// Use in handler
const validator = new MyValidator()
const result = validator.validate(args)
if (!result.isValid) {
  throw new Error(result.errors.join(', '))
}
```

---

## 📊 Architecture Metrics

### Code Organization

```
Total Files: ~30
Total Lines: ~10,000+

Distribution:
- Handlers: 25%
- Generators: 20%
- Validators/Parsers: 30%
- Utilities: 15%
- Templates: 10%
```

### Component Sizes

| Component | LOC | Complexity |
|-----------|-----|------------|
| ScenarioValidator | 815 | High |
| UIFlowHandler | 676 | High |
| JMXGenerator | 500+ | Medium |
| PromptToFlowParser | 400+ | Medium |
| ApiSchemaHandler | 321 | Medium |
| JMeterHandler | 177 | Low |

### Dependencies

```json
{
  "production": {
    "@modelcontextprotocol/sdk": "^1.17.4",
    "axios": "^1.6.0",
    "xmlbuilder2": "^3.1.1",
    "swagger-parser": "^10.0.3",
    "puppeteer": "^21.11.0",
    "winston": "^3.17.0"
  }
}
```

---

## 🔮 Future Architecture Improvements

### Planned Enhancements

1. **Plugin System**
   - Dynamic tool loading
   - Third-party handler support
   - Custom extractor plugins

2. **Database Integration**
   - Store test configurations
   - Test execution history
   - Performance metrics

3. **Real-time Monitoring**
   - WebSocket updates
   - Progress tracking
   - Live test execution

4. **Distributed Processing**
   - Worker pool for heavy operations
   - Queue-based job processing
   - Redis for state management

5. **Enhanced Security**
   - OAuth2 authentication
   - API key management
   - Rate limiting
   - Request signing

6. **Advanced Caching**
   - Redis cache layer
   - CDN integration
   - Smart invalidation

---

## 📚 References

- **MCP Protocol**: [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- **JMeter**: [Apache JMeter Documentation](https://jmeter.apache.org/usermanual/)
- **OpenAPI**: [OpenAPI Specification](https://spec.openapis.org/)
- **Node.js**: [Node.js Best Practices](https://nodejs.org/en/docs/)

---

**Document Version:** 1.0.0  
**Last Updated:** October 3, 2025  
**Maintained By:** JMeter MCP Server Team
