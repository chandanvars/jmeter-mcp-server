#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { JMeterHandler } from './handlers/jmeterHandler.js';
import { TemplateHandler } from './handlers/templateHandler.js';
import { UIFlowHandler } from './handlers/uiFlowHandler.js';
import { FlowCrawler } from './crawler/flowCrawler.js';
import { CorrelationEngine } from './correlation/correlationEngine.js';
import { JMXGenerator } from './jmx/jmxGenerator.js';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

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
const jmxGenerator = new JMXGenerator();

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
      name: 'generate_inventree_test',
      description: 'Generate InvenTree API test with authentication and purchase order creation',
      category: 'API Testing',
      icon: '📦',
      tags: ['inventree', 'purchase-order', 'authentication', 'api'],
      examples: [
        {
          name: 'InvenTree Purchase Order Test',
          description: 'Complete test for InvenTree purchase order API with token auth',
          parameters: {
            numThreads: 5,
            rampUpTime: 60,
            loops: 3
          }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'InvenTree Test Configuration',
        properties: {
          numThreads: { type: 'number', title: 'Number of Users', default: 5, minimum: 1 },
          rampUpTime: { type: 'number', title: 'Ramp-up Time (seconds)', default: 60, minimum: 1 },
          loops: { type: 'number', title: 'Loop Count', default: 3, minimum: 1 },
          baseUrl: { type: 'string', title: 'InvenTree Base URL', default: 'https://demo.inventree.org', format: 'uri' }
        }
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
        
      case 'generate_inventree_test':
        result = await jmeterHandler.generateInventreeTestPlan(args);
        break;
        
      case 'get_templates':
        result = await templateHandler.getTemplate(args);
        break;
        
      case 'generate_ui_flow_script':
        result = await generateUIFlowScript(args);
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}. Available tools: generate_jmeter_script, generate_from_api_schema, generate_inventree_test, get_templates, generate_ui_flow_script`);
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

// Startup function with enhanced UI information
async function main() {
  try {
    console.error('🔧 Initializing JMeter MCP Server...');
    
    // Display server information
    console.error(`📊 Server: ${serverConfig.name} v${serverConfig.version}`);
    console.error(`📝 Description: ${serverConfig.description}`);
    console.error(`🎨 Theme: ${serverConfig.ui.theme.primaryColor}`);
    console.error(`📂 Available Categories: ${serverConfig.ui.categories.map(c => c.name).join(', ')}`);
    console.error(`⚡ Quick Actions: ${serverConfig.ui.quickActions.length} available`);
    
    // Display all available tools
    console.error(`🛠️  Available MCP Tools:`);
    console.error(`   1. generate_jmeter_script - Generate comprehensive JMeter test scripts`);
    console.error(`   2. generate_from_api_schema - Generate tests from API schema/Swagger`);
    console.error(`   3. generate_inventree_test - Generate InvenTree API test plans`);
    console.error(`   4. get_templates - Get pre-built JMeter test templates`);
    console.error(`   5. generate_ui_flow_script - Generate tests from natural language UI flows`);
    
    console.error(`📁 Output Monitoring: Enabled (./output, ./src/output, ./)`);
    console.error(`🔄 Auto-stop on file generation: Enabled`);
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('🎯 JMeter MCP Server successfully started!');
    console.error('💡 Ready to generate JMeter test scripts via MCP protocol');
    console.error('🔗 Connect via Claude Desktop, VS Code MCP extension, or custom MCP client');
    console.error('📖 Use any of the 5 available tools to create comprehensive test plans');
    
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.error('👋 Shutting down JMeter MCP Server gracefully...');
  process.exit(0);
});

main().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});