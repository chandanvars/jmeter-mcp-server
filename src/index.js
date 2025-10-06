#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { JMeterHandler } from './handlers/jmeterHandler.js';
import { TemplateHandler } from './handlers/templateHandler.js';
import { UIFlowHandler } from './handlers/uiFlowHandler.js';
import { FlowCrawler } from './crawler/flowCrawler.js';
import { CorrelationEngine } from './correlation/correlationEngine.js';
import { FileMonitor } from './utils/fileMonitor.js';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { URL } from 'url';

// Server configuration with UI support
const serverConfig = {
  name: 'jmeter-generator',
  version: '1.0.0',
  description: 'JMeter Test Script Generator - Create comprehensive load tests with parameterization and correlation',
  author: 'JMeter MCP Team',
  homepage: 'https://github.com/your-repo/jmeter-mcp-server',
  ui: {
    title: '🚀 JMeter Test Generator',
    icon: '⚡',
    theme: {
      primaryColor: '#FF6B35',
      secondaryColor: '#004E89',
      backgroundColor: '#F8F9FA'
    },
    categories: [
      {
        name: 'Load Testing',
        description: 'Generate performance and load test scripts',
        icon: '📊'
      },
      {
        name: 'API Testing',
        description: 'Create API validation and functional tests',
        icon: '🔌'
      },
      {
        name: 'Templates',
        description: 'Pre-built test scenarios and configurations',
        icon: '📋'
      }
    ],
    quickActions: [
      {
        name: 'Quick API Test',
        description: 'Generate a simple API load test',
        tool: 'generate_jmeter_script',
        template: {
          testName: 'Quick API Test',
          baseUrl: 'https://api.example.com',
          requests: [
            {
              name: 'Health Check',
              method: 'GET',
              path: '/health'
            }
          ]
        }
      },
      {
        name: 'REST API Template',
        description: 'Get a comprehensive REST API test template',
        tool: 'get_templates',
        template: {
          templateType: 'rest_api'
        }
      }
    ]
  }
};

const server = new Server(
  serverConfig,
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      logging: {}
    },
  }
);

// Initialize handlers
const jmeterHandler = new JMeterHandler();
const templateHandler = new TemplateHandler();

// Initialize UI script generation components
const flowCrawler = new FlowCrawler();
const correlationEngine = new CorrelationEngine();

// Initialize file monitor to prevent AI-enhanced files
const fileMonitor = new FileMonitor();
fileMonitor.cleanupExistingFiles();
fileMonitor.startMonitoring();

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'jmeter-mcp.log' })
  ]
});

// Register tools list handler with UI enhancements
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: 'generate_jmeter_script',
      description: 'Generate a comprehensive JMeter test script with advanced features including parameterization, correlation, timers, and result collection',
      category: 'Load Testing',
      icon: '⚡',
      tags: ['performance', 'load-testing', 'api', 'web'],
      examples: [
        {
          name: 'Simple REST API Test',
          description: 'Basic API load test with multiple endpoints',
          parameters: {
            testName: 'REST API Load Test',
            baseUrl: 'https://jsonplaceholder.typicode.com',
            requests: [
              {
                name: 'Get Posts',
                method: 'GET',
                path: '/posts'
              },
              {
                name: 'Create Post',
                method: 'POST',
                path: '/posts',
                headers: { 'Content-Type': 'application/json' },
                body: '{"title": "Test", "body": "Test content", "userId": 1}'
              }
            ],
            threadGroup: {
              numThreads: 10,
              rampUpTime: 30,
              loops: 5
            }
          }
        },
        {
          name: 'Parameterized Test with CSV Data',
          description: 'Load test using external CSV data for parameterization',
          parameters: {
            testName: 'User Login Test',
            baseUrl: 'https://api.myapp.com',
            requests: [
              {
                name: 'Login',
                method: 'POST',
                path: '/auth/login',
                body: '{"username": "${username}", "password": "${password}"}'
              }
            ],
            csvDataSet: {
              fileName: 'users.csv',
              variableNames: 'username,password'
            }
          }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'JMeter Test Configuration',
        properties: {
          testName: {
            type: 'string',
            title: 'Test Plan Name',
            description: 'A descriptive name for your JMeter test plan',
            examples: ['API Load Test', 'User Journey Test', 'Performance Regression Test'],
            ui: {
              widget: 'text',
              placeholder: 'Enter test plan name...'
            }
          },
          baseUrl: {
            type: 'string',
            title: 'Base URL',
            description: 'The base URL for all API requests (e.g., https://api.example.com)',
            format: 'uri',
            examples: ['https://api.example.com', 'https://jsonplaceholder.typicode.com'],
            ui: {
              widget: 'url',
              placeholder: 'https://api.example.com'
            }
          },
          requests: {
            type: 'array',
            title: 'API Requests',
            description: 'Array of HTTP requests to include in the test plan',
            minItems: 1,
            ui: {
              widget: 'array',
              addButtonText: 'Add Request',
              collapsible: true
            },
            items: {
              type: 'object',
              title: 'HTTP Request',
              properties: {
                name: { 
                  type: 'string',
                  title: 'Request Name',
                  description: 'Descriptive name for this request',
                  examples: ['Login', 'Get User Profile', 'Create Order'],
                  ui: { widget: 'text', placeholder: 'Request name...' }
                },
                method: { 
                  type: 'string', 
                  title: 'HTTP Method',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                  default: 'GET',
                  ui: { widget: 'select' }
                },
                path: { 
                  type: 'string',
                  title: 'Request Path',
                  description: 'URL path relative to base URL (e.g., /api/users)',
                  examples: ['/users', '/auth/login', '/api/v1/products'],
                  ui: { widget: 'text', placeholder: '/api/endpoint' }
                },
                headers: { 
                  type: 'object',
                  title: 'Request Headers',
                  description: 'HTTP headers to include with the request',
                  additionalProperties: { type: 'string' },
                  examples: [{ 'Content-Type': 'application/json', 'Authorization': 'Bearer ${token}' }],
                  ui: { widget: 'keyvalue' }
                },
                body: { 
                  type: 'string',
                  title: 'Request Body',
                  description: 'Request body content (for POST, PUT, PATCH methods)',
                  examples: ['{"username": "${username}", "password": "${password}"}'],
                  ui: { widget: 'textarea', rows: 4, placeholder: 'Request body...' }
                },
                extractors: {
                  type: 'array',
                  title: 'Response Extractors',
                  description: 'Extract data from responses for use in subsequent requests',
                  ui: { widget: 'array', addButtonText: 'Add Extractor' },
                  items: {
                    type: 'object',
                    title: 'Data Extractor',
                    properties: {
                      variableName: { 
                        type: 'string',
                        title: 'Variable Name',
                        description: 'Name to store the extracted value',
                        examples: ['authToken', 'userId', 'sessionId'],
                        ui: { widget: 'text', placeholder: 'variableName' }
                      },
                      jsonPath: { 
                        type: 'string',
                        title: 'JSON Path',
                        description: 'JSONPath expression to extract data',
                        examples: ['$.token', '$.user.id', '$.data[0].name'],
                        ui: { widget: 'text', placeholder: '$.token' }
                      },
                      regex: { 
                        type: 'string',
                        title: 'Regular Expression',
                        description: 'Regex pattern to extract data (alternative to JSON Path)',
                        examples: ['"token":"([^"]+)"', 'id=([0-9]+)'],
                        ui: { widget: 'text', placeholder: 'regex pattern' }
                      },
                      defaultValue: { 
                        type: 'string',
                        title: 'Default Value',
                        description: 'Default value if extraction fails',
                        ui: { widget: 'text', placeholder: 'default value' }
                      }
                    }
                  }
                },
                assertions: {
                  type: 'array',
                  title: 'Response Assertions',
                  description: 'Validate response data to ensure test accuracy',
                  ui: { widget: 'array', addButtonText: 'Add Assertion' },
                  items: {
                    type: 'object',
                    title: 'Response Assertion',
                    properties: {
                      type: { 
                        type: 'string', 
                        title: 'Assertion Type',
                        enum: ['responseCode', 'responseTime', 'jsonPath', 'containsText'],
                        ui: { widget: 'select' }
                      },
                      value: { 
                        type: 'string',
                        title: 'Expected Value',
                        description: 'Value to assert against',
                        examples: ['200', '500', 'success', '$.status'],
                        ui: { widget: 'text', placeholder: 'expected value' }
                      }
                    }
                  }
                }
              },
              required: ['name', 'method', 'path']
            }
          },
          threadGroup: {
            type: 'object',
            title: 'Load Configuration',
            description: 'Configure the number of virtual users and test duration',
            ui: { widget: 'object', collapsible: true },
            properties: {
              numThreads: { 
                type: 'number', 
                title: 'Number of Users',
                description: 'Number of concurrent virtual users',
                default: 10,
                minimum: 1,
                maximum: 10000,
                ui: { widget: 'number', step: 1 }
              },
              rampUpTime: { 
                type: 'number', 
                title: 'Ramp-up Time (seconds)',
                description: 'Time to gradually increase users to target level',
                default: 10,
                minimum: 0,
                ui: { widget: 'number', step: 1 }
              },
              loops: { 
                type: 'number', 
                title: 'Loop Count',
                description: 'Number of times each user executes the test (-1 for infinite)',
                default: 1,
                minimum: -1,
                ui: { widget: 'number', step: 1 }
              }
            }
          },
          csvDataSet: {
            type: 'object',
            title: 'CSV Data Configuration',
            description: 'Use external CSV file for test data parameterization',
            ui: { widget: 'object', collapsible: true },
            properties: {
              fileName: { 
                type: 'string',
                title: 'CSV File Name',
                description: 'Name of the CSV file containing test data',
                examples: ['users.csv', 'testdata.csv', 'parameters.csv'],
                ui: { widget: 'text', placeholder: 'data.csv' }
              },
              variableNames: { 
                type: 'string',
                title: 'Variable Names',
                description: 'Comma-separated list of column names',
                examples: ['username,password', 'userId,email,name'],
                ui: { widget: 'text', placeholder: 'column1,column2,column3' }
              },
              delimiter: { 
                type: 'string', 
                title: 'Delimiter',
                description: 'Character used to separate values in CSV',
                default: ',',
                enum: [',', ';', '\t', '|'],
                ui: { widget: 'select' }
              }
            }
          }
        },
        required: ['testName', 'baseUrl', 'requests']
      }
    },
    {
      name: 'generate_from_api_schema',
      description: 'Generate JMeter test script from API schema/Swagger URL with authentication and correlation',
      category: 'API Testing',
      icon: '🔗',
      tags: ['api-schema', 'swagger', 'openapi', 'authentication', 'correlation'],
      examples: [
        {
          name: 'API Schema Test',
          description: 'Generate test from OpenAPI/Swagger schema with OAuth2',
          parameters: {
            schemaUrl: 'https://petstore.swagger.io/v2/swagger.json',
            endpoint: { operationId: 'addPet' },
            authConfig: { method: 'oauth2', credentials: { clientId: 'test', clientSecret: 'secret' } }
          }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'API Schema Test Configuration',
        properties: {
          schemaUrl: {
            type: 'string',
            title: 'API Schema URL',
            description: 'URL to OpenAPI/Swagger schema (JSON or YAML)',
            format: 'uri',
            examples: ['https://petstore.swagger.io/v2/swagger.json', 'https://docs.inventree.org/api/schema/'],
            ui: { widget: 'url', placeholder: 'https://api.example.com/swagger.json' }
          },
          endpoint: {
            type: 'object',
            title: 'Target Endpoint',
            description: 'Specify which endpoint to test',
            properties: {
              operationId: { type: 'string', title: 'Operation ID', description: 'OpenAPI operation ID' },
              path: { type: 'string', title: 'Path', description: 'Endpoint path' },
              method: { type: 'string', title: 'Method', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
              tag: { type: 'string', title: 'Tag', description: 'Find endpoint by tag' }
            }
          },
          authConfig: {
            type: 'object',
            title: 'Authentication Configuration',
            properties: {
              method: { type: 'string', title: 'Auth Method', description: 'Authentication scheme name from API spec' },
              credentials: {
                type: 'object',
                title: 'Credentials',
                properties: {
                  username: { type: 'string', title: 'Username' },
                  password: { type: 'string', title: 'Password' },
                  clientId: { type: 'string', title: 'Client ID' },
                  clientSecret: { type: 'string', title: 'Client Secret' },
                  scope: { type: 'string', title: 'Scope' }
                }
              },
              csvDataSet: {
                type: 'object',
                title: 'CSV Data File',
                properties: {
                  fileName: { type: 'string', title: 'File Name', default: 'auth_data.csv' },
                  variableNames: { type: 'string', title: 'Variable Names', default: 'username,password' }
                }
              }
            }
          },
          testConfig: {
            type: 'object',
            title: 'Test Configuration',
            properties: {
              threadGroup: {
                type: 'object',
                properties: {
                  numThreads: { type: 'number', title: 'Number of Users', default: 10 },
                  rampUpTime: { type: 'number', title: 'Ramp-up Time (seconds)', default: 30 },
                  loops: { type: 'number', title: 'Loop Count', default: 5 }
                }
              }
            }
          }
        },
        required: ['schemaUrl', 'endpoint']
      }
    },
    {
      name: 'get_templates',
      description: 'Get pre-built JMeter test templates for common testing scenarios',
      category: 'Templates',
      icon: '📋',
      tags: ['templates', 'examples', 'quick-start'],
      examples: [
        {
          name: 'REST API Template',
          description: 'Complete REST API testing template with CRUD operations',
          parameters: { templateType: 'rest_api' }
        },
        {
          name: 'GraphQL Template',
          description: 'GraphQL API testing template with queries and mutations',
          parameters: { templateType: 'graphql' }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'Template Selection',
        properties: {
          templateType: {
            type: 'string',
            title: 'Template Type',
            description: 'Select a pre-built template for your testing needs',
            enum: ['rest_api', 'graphql', 'soap', 'oauth2', 'websocket', 'database'],
            enumDescriptions: [
              'REST API testing with CRUD operations',
              'GraphQL queries and mutations testing',
              'SOAP web service testing',
              'OAuth2 authentication flow testing',
              'WebSocket connection testing',
              'Database performance testing'
            ],
            default: 'rest_api',
            ui: { 
              widget: 'radio',
              descriptions: true
            }
          }
        }
      }
    },
    {
      name: 'generate_ui_flow_script',
      description: 'Generate JMeter script from natural language UI flow description with intelligent parsing and request generation',
      category: 'Load Testing',
      icon: '🌐',
      tags: ['ui-testing', 'natural-language', 'web-flow', 'user-journey'],
      examples: [
        {
          name: 'E-commerce User Journey',
          description: 'Generate test for complete shopping flow using natural language',
          parameters: {
            testName: 'E-commerce Flow Test',
            baseUrl: 'https://demo.opencart.com',
            flowDescription: 'Navigate to homepage, click on login button, fill email with test@example.com, fill password with password123, click login button, wait 2 seconds, go to products page, click on first product, add to cart, proceed to checkout',
            threadCount: 10,
            rampUp: 30,
            duration: 300
          }
        },
        {
          name: 'Search and Filter Flow',
          description: 'Test search functionality with filters',
          parameters: {
            testName: 'Search Test',
            baseUrl: 'https://example-store.com',
            flowDescription: 'Go to search page, type "laptop" in search box, click search, apply price filter for $500-1000, sort by rating, click on third result',
            threadCount: 5,
            rampUp: 15
          }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'UI Flow Test Configuration',
        properties: {
          testName: {
            type: 'string',
            title: 'Test Name',
            description: 'Name for the generated test plan',
            examples: ['Login Flow Test', 'Shopping Cart Journey', 'User Registration Test'],
            ui: { widget: 'text', placeholder: 'My UI Flow Test' }
          },
          baseUrl: {
            type: 'string',
            title: 'Base URL',
            description: 'Starting URL for the web application',
            format: 'uri',
            examples: ['https://demo.opencart.com', 'https://the-internet.herokuapp.com'],
            ui: { widget: 'url', placeholder: 'https://example.com' }
          },
          flowDescription: {
            type: 'string',
            title: 'Flow Description',
            description: 'Natural language description of the user flow to test',
            examples: [
              'Navigate to login page, enter username and password, click login, go to dashboard',
              'Search for products, filter by price, add item to cart, proceed to checkout',
              'Register new user, verify email, complete profile setup'
            ],
            ui: { 
              widget: 'textarea', 
              placeholder: 'Describe the user flow step by step...',
              rows: 4
            }
          },
          threadCount: {
            type: 'number',
            title: 'Number of Virtual Users',
            description: 'Number of concurrent users to simulate',
            default: 10,
            minimum: 1,
            maximum: 1000,
            ui: { widget: 'number', step: 1 }
          },
          rampUp: {
            type: 'number',
            title: 'Ramp-up Time (seconds)',
            description: 'Time to gradually increase users to target level',
            default: 30,
            minimum: 1,
            maximum: 3600,
            ui: { widget: 'number', step: 1 }
          },
          duration: {
            type: 'number',
            title: 'Test Duration (seconds)',
            description: 'How long to run the test',
            default: 300,
            minimum: 10,
            maximum: 86400,
            ui: { widget: 'number', step: 10 }
          }
        },
        required: ['testName', 'baseUrl', 'flowDescription']
      }
    },
    {
      name: 'execute_jmx_prompt',
      description: 'Execute the JMX prompt file to generate actual JMeter JMX test file',
      category: 'Load Testing',
      icon: '⚙️',
      tags: ['jmx', 'generation', 'execution', 'prompt'],
      examples: [
        {
          name: 'Generate JMX from Prompt',
          description: 'Read jmx_prompt.prompt.md and generate the JMX file',
          parameters: {}
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'JMX Prompt Execution',
        properties: {
          promptFile: {
            type: 'string',
            title: 'Prompt File Path',
            description: 'Path to the prompt file (defaults to .github/prompts/jmx_prompt.prompt.md)',
            default: '.github/prompts/jmx_prompt.prompt.md',
            ui: { widget: 'text', placeholder: '.github/prompts/jmx_prompt.prompt.md' }
          },
          outputFileName: {
            type: 'string',
            title: 'Output JMX File Name',
            description: 'Custom name for the generated JMX file (optional)',
            ui: { widget: 'text', placeholder: 'my_test.jmx' }
          }
        }
      }
    }
    ];
  
  return { tools };
});

// Enhanced tool call handler with modular success messages and robust error handling
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    switch (name) {
      case 'generate_jmeter_script':
        result = await jmeterHandler.generateJMeterScript(args);
        break;
        
      case 'generate_from_api_schema':
        result = await jmeterHandler.generateFromApiSchema(args);
        break;
        
      case 'get_templates':
        result = await templateHandler.getTemplate(args);
        break;
        
      case 'generate_ui_flow_script':
        result = await generateUIFlowScript(args);
        break;
        
      case 'execute_jmx_prompt':
        result = await executeJmxPrompt(args);
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}. Available tools: generate_jmeter_script, generate_from_api_schema, get_templates, generate_ui_flow_script, execute_jmx_prompt`);
    }

    // Ensure result has proper structure
    if (!result) {
      throw new Error(`Tool ${name} returned null or undefined result`);
    }

    // If result is already in MCP format (has content array), return it directly
    if (result.content && Array.isArray(result.content)) {
      return result;
    }

    // Otherwise, wrap the result in MCP format
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        }
      ]
    };
    
  } catch (error) {
    console.error(`Error in tool ${name}:`, error);
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error in ${name}: ${error.message}\n\nStack trace: ${error.stack}`
        }
      ],
      isError: true
    };
  }
});

// UI Flow Script Generation Function
async function generateUIFlowScript(args) {
  const { baseUrl, flowDescription, testName, threadCount = 10, rampUp = 30, duration = 300 } = args;

  try {
    // Create UI Flow Handler
    const uiFlowHandler = new UIFlowHandler();
    
    logger.info('Starting UI flow script generation from prompt...');
    
    // Generate the JMX content using prompt-based approach
    const result = await uiFlowHandler.generateUIFlowScript({
      baseUrl,
      flowDescription,
      testName,
      threadGroup: {
        numThreads: threadCount,
        rampUpTime: rampUp,
        loops: duration > 0 ? Math.ceil(duration / 10) : 1 // Approximate loops based on duration
      }
    });

    // Add safety checks
    if (!result) {
      throw new Error('UI Flow Handler returned null result');
    }
    
    if (!result.content) {
      throw new Error('UI Flow Handler result missing content property');
    }

    // Return the content from the UI Flow Handler
    return {
      content: result.content
    };
    
  } catch (error) {
    logger.error('Error generating UI flow script:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error generating UI flow script:**
          
${error.message}

**Troubleshooting Tips:**
- Check that the flow description is clear and detailed
- Ensure the base URL is accessible and valid
- Try breaking down complex flows into simpler steps
- Verify that action descriptions use common terms (click, fill, navigate, etc.)

**Example valid flow description:**
"Navigate to login page, fill username with admin, fill password with secret123, click login button, wait 2 seconds, go to dashboard"`
        }
      ]
    };
  }
}

// Execute JMX Prompt Function - Generates actual JMX file from prompt
async function executeJmxPrompt(args) {
  try {
    const { promptFile = '.github/prompts/jmx_prompt.prompt.md', outputFileName } = args;
    
    logger.info('Executing JMX prompt to generate JMX file...');
    
    // Import necessary modules
    const { PromptGenerator } = await import('./utils/promptGenerator.js');
    const promptGenerator = new PromptGenerator();
    
    // Read the prompt file
    const promptPath = path.join(process.cwd(), promptFile);
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file not found at: ${promptPath}. Please generate a test configuration first using one of the generation tools.`);
    }
    
    const promptContent = fs.readFileSync(promptPath, 'utf8');
    logger.info('Prompt file read successfully');
    
    // Parse the prompt content to extract test configuration
    const config = parsePromptContent(promptContent);
    
    if (!config) {
      throw new Error('Failed to parse prompt content. The prompt file may be malformed.');
    }
    
    // Generate JMX content from the parsed configuration
    const jmxContent = jmeterHandler.jmxGenerator.generate(config);
    
    if (!jmxContent) {
      throw new Error('Failed to generate JMX content from prompt');
    }
    
    // Determine output filename
    const safeTestName = jmeterHandler.fileWriter.cleanFilename(
      outputFileName || config.testName || 'jmeter_test'
    );
    const jmxFilename = safeTestName.endsWith('.jmx') ? safeTestName : `${safeTestName}.jmx`;
    
    // Write JMX file to output directory
    const jmxPath = jmeterHandler.fileWriter.writeJMXFile(jmxFilename, jmxContent);
    logger.info(`JMX file generated at: ${jmxPath}`);
    
    // Check if file was written successfully
    if (!fs.existsSync(jmxPath)) {
      throw new Error(`Failed to write JMX file to: ${jmxPath}`);
    }
    
    // Generate CSV file if specified in config
    let csvPath = null;
    if (config.csvDataSet) {
      const csvFilename = `${safeTestName}_data.csv`;
      const csvHeaders = config.csvDataSet.variableNames || '';
      const csvContent = jmeterHandler.generateCSVContent(csvHeaders, config.csvDataSet.values);
      csvPath = jmeterHandler.fileWriter.writeCSVFile(csvFilename, csvContent);
      logger.info(`CSV file generated at: ${csvPath}`);
    }
    
    // Return success response
    return {
      content: [
        {
          type: 'text',
          text: `✅ **JMX File Generated Successfully from Prompt!**

**Source Prompt:** \`${promptFile}\`
**Generated JMX:** \`${jmxFilename}\`
**Output Path:** \`${jmxPath}\`

**Test Configuration:**
- **Test Name:** ${config.testName || 'JMeter Test'}
- **Base URL:** ${config.baseUrl || 'Not specified'}
- **Requests:** ${config.requests?.length || 0} HTTP samplers
- **Load Config:** ${config.threadGroup?.numThreads || 10} users, ${config.threadGroup?.rampUpTime || 10}s ramp-up

${csvPath ? `**CSV Data File:** \`${path.basename(csvPath)}\`\n` : ''}**What's Next:**
1. Open the JMX file in JMeter GUI: \`jmeter -t "${jmxPath}"\`
2. Or run in CLI mode: \`jmeter -n -t "${jmxPath}" -l results.jtl\`
3. View results in JMeter or generate HTML report

**Features Included:**
✅ HTTP samplers with proper configuration
✅ Thread group with load settings
✅ Response extractors for correlation
✅ Assertions for validation
✅ Result listeners${csvPath ? '\n✅ CSV data parameterization' : ''}

The JMX file is ready for load testing! 🚀`
        },
        {
          type: 'file_reference',
          name: 'jmx_file',
          file_type: 'jmx',
          path: jmxPath
        }
      ]
    };
    
  } catch (error) {
    logger.error('Error executing JMX prompt:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error executing JMX prompt:**

${error.message}

**Troubleshooting:**
- Ensure a prompt file has been generated first using one of these tools:
  - \`generate_jmeter_script\`
  - \`generate_from_api_schema\`
  - \`generate_ui_flow_script\`
- Verify the prompt file exists at: \`.github/prompts/jmx_prompt.prompt.md\`
- Check that the prompt file contains valid test configuration

**To generate a new prompt:**
Run one of the test generation tools first, then use \`execute_jmx_prompt\` to create the JMX file.`
        }
      ]
    };
  }
}

// Helper function to parse prompt content and extract configuration
function parsePromptContent(promptContent) {
  try {
    const config = {
      testName: 'JMeter Test',
      baseUrl: 'https://api.example.com',
      requests: [],
      threadGroup: { numThreads: 10, rampUpTime: 10, loops: 1 },
      csvDataSet: null,
      defaultHeaders: {},
      timers: {},
      listeners: ['view_results_tree']
    };
    
    // Extract test name
    const testNameMatch = promptContent.match(/\*\*Test Name:\*\*\s*(.+)/i);
    if (testNameMatch) {
      config.testName = testNameMatch[1].trim();
    }
    
    // Extract base URL
    const baseUrlMatch = promptContent.match(/\*\*Base URL:\*\*\s*(.+)/i);
    if (baseUrlMatch) {
      config.baseUrl = baseUrlMatch[1].trim();
    }
    
    // Extract thread group settings
    const threadsMatch = promptContent.match(/Number of Threads \(Users\):\*\*\s*(\d+)/i);
    if (threadsMatch) {
      config.threadGroup.numThreads = parseInt(threadsMatch[1], 10);
    }
    
    const rampUpMatch = promptContent.match(/Ramp-Up Time \(seconds\):\*\*\s*(\d+)/i);
    if (rampUpMatch) {
      config.threadGroup.rampUpTime = parseInt(rampUpMatch[1], 10);
    }
    
    const loopsMatch = promptContent.match(/Loop Count:\*\*\s*(\d+)/i);
    if (loopsMatch) {
      config.threadGroup.loops = parseInt(loopsMatch[1], 10);
    }
    
    // Extract CSV configuration
    const csvFileMatch = promptContent.match(/\*\*File Name:\*\*\s*(.+)/i);
    const csvVarsMatch = promptContent.match(/\*\*Variable Names:\*\*\s*(.+)/i);
    if (csvFileMatch && csvVarsMatch) {
      config.csvDataSet = {
        fileName: csvFileMatch[1].trim(),
        variableNames: csvVarsMatch[1].trim(),
        delimiter: ',',
        ignoreFirstLine: true
      };
    }
    
    // Extract requests (simplified - look for request sections)
    const requestMatches = promptContent.matchAll(/### Request \d+:\s*(.+)\n[\s\S]*?\*\*Method:\*\*\s*(\w+)\n[\s\S]*?\*\*Path:\*\*\s*(.+)/gi);
    for (const match of requestMatches) {
      config.requests.push({
        name: match[1].trim(),
        method: match[2].trim(),
        path: match[3].trim(),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If no requests found, add a default one
    if (config.requests.length === 0) {
      config.requests.push({
        name: 'Default Request',
        method: 'GET',
        path: '/',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return config;
  } catch (error) {
    logger.error('Error parsing prompt content:', error);
    return null;
  }
}

// Startup function with enhanced UI information and HTTP transport support
async function main() {
  try {
    console.error('🔧 Initializing JMeter MCP Server...');
    
    // Check command line arguments for transport mode
    const args = process.argv.slice(2);
    const httpMode = args.includes('--http') || args.includes('--server');
    const port = getPortFromArgs(args) || process.env.PORT || 3000;
    
    // Display server information
    console.error(`📊 Server: ${serverConfig.name} v${serverConfig.version}`);
    console.error(`📝 Description: ${serverConfig.description}`);
    console.error(`🎨 Theme: ${serverConfig.ui.theme.primaryColor}`);
    console.error(`📂 Available Categories: ${serverConfig.ui.categories.map(c => c.name).join(', ')}`);
    console.error(`⚡ Quick Actions: ${serverConfig.ui.quickActions.length} available`);
    
    // Display all available tools
    console.error(`🛠️  Available MCP Tools:`);
    console.error(`   1. generate_jmeter_script - Generate JMeter test prompts (not JMX files directly)`);
    console.error(`   2. generate_from_api_schema - Generate API schema test prompts`);
    console.error(`   3. get_templates - Get pre-built JMeter test templates`);
    console.error(`   4. generate_ui_flow_script - Generate UI flow test prompts from natural language`);
    console.error(`   5. execute_jmx_prompt - Execute prompt to generate actual JMX file`);
    
    console.error(`📁 Output Monitoring: Enabled (./output, ./src/output, ./)`);
    console.error(`🔄 Auto-stop on file generation: Enabled`);
    
    // Choose transport based on mode
    let transport;
    if (httpMode) {
      // Create Streamable HTTP transport for remote connections
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });
      
      // Create HTTP server
      const httpServer = http.createServer((req, res) => {
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
        
        // Health check endpoint
        if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            status: 'healthy', 
            server: serverConfig.name,
            version: serverConfig.version,
            transport: 'streamable-http',
            endpoint: '/mcp',
            tools: 6
          }));
          return;
        }
        
        // API documentation endpoint
        if (req.url === '/api' || req.url === '/docs') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            server: serverConfig.name,
            version: serverConfig.version,
            description: serverConfig.description,
            transport: {
              type: 'Streamable HTTP',
              endpoint: '/mcp',
              healthCheck: '/health'
            },
            tools: [
              'generate_jmeter_script',
              'generate_from_api_schema', 
              'get_templates',
              'generate_ui_flow_script',
              'execute_jmx_prompt'
            ],
            ui: serverConfig.ui
          }, null, 2));
          return;
        }
        
        // MCP endpoint
        if (req.url === '/mcp' || req.url === '/message') {
          transport.handleRequest(req, res);
          return;
        }
        
        // Default 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      });
      
      httpServer.listen(port, () => {
        console.error(`� HTTP Transport Mode: Server listening on port ${port}`);
        console.error(`🔗 SSE Endpoint: http://localhost:${port}/message`);
        console.error(`🏥 Health Check: http://localhost:${port}/health`);
        console.error(`📚 API Docs: http://localhost:${port}/api`);
        console.error(`💡 Connect via HTTP client or remote MCP applications`);
        console.error(`📖 Example connection: curl http://localhost:${port}/health`);
      });
    } else {
      // Use stdio transport for local connections (default)
      transport = new StdioServerTransport();
      console.error(`🖥️  Stdio Transport Mode: Ready for local MCP connections`);
      console.error(`🔗 Connect via Claude Desktop, VS Code MCP extension, or pipe`);
    }
    
    await server.connect(transport);
    
    console.error('🎯 JMeter MCP Server successfully started!');
    console.error('� Ready to generate JMeter test scripts via MCP protocol');
    console.error(`📡 Transport: ${httpMode ? 'HTTP/SSE (Remote)' : 'Stdio (Local)'}`);
    
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Helper function to extract port from command line arguments
function getPortFromArgs(args) {
  const portIndex = args.findIndex(arg => arg === '--port' || arg === '-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    return parseInt(args[portIndex + 1], 10);
  }
  
  // Check for --port=value format
  const portArg = args.find(arg => arg.startsWith('--port='));
  if (portArg) {
    return parseInt(portArg.split('=')[1], 10);
  }
  
  return null;
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.error('👋 Shutting down JMeter MCP Server gracefully...');
  fileMonitor.stopMonitoring();
  process.exit(0);
});

main().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});