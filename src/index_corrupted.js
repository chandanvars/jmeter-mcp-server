#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { JMeterHandler } from './handlers/jmeterHandler.js';
import { TemplateHandler } from './handlers/templateHandler.js';
import { RequestRouter } from './utils/requestRouter.js';

// Server configuration with UI support
const serverConfig = {
  name: 'jmeter-generator',
  version: '1.0.0',
  description: 'JMeter Test Script Generator - Create comprehensive load tests with natural language prompts, UI flows, and API integration',
  author: 'JMeter MCP Team',
  h    console.error('🔗 Connect via Claude Desktop, VS Code MCP extension, or custom MCP client');
    console.error('');
    console.error('🤖 **NEW**: Smart Auto-Detection with @jmeter-generator!');
    console.error('   🎯 Just type "@jmeter-generator" + your description - no tool selection needed!');
    console.error('   📝 Example: "@jmeter-generator Test login flow on GitHub"');
    console.error('   🛒 Example: "@jmeter-generator Load test my REST API with 100 users"');
    console.error('   ✨ Automatically detects UI flows vs API testing vs templates');
    console.error('');
    console.error('🔧 Available Tools:');
    console.error('   🤖 jmeter-generator - Smart auto-routing (RECOMMENDED)');
    console.error('   🗣️ generate_ui_flow_from_prompt - Natural language UI flows');
    console.error('   ⚡ generate_jmeter_script - Traditional API test plans');
    console.error('   🔗 generate_from_api_schema - OpenAPI/Swagger integration');
    console.error('   📦 generate_inventree_test - InvenTree specialized testing');
    console.error('   📋 get_templates - Pre-built test scenarios');ps://github.com/your-repo/jmeter-mcp-server',
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
        name: 'UI Flow Testing',
        description: 'Generate tests from natural language descriptions',
        icon: '🗣️'
      },
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
        name: 'Natural Language UI Test',
        description: 'Generate UI flow test from plain English',
        tool: 'generate_ui_flow_from_prompt',
        template: {
          prompt: 'Login with email user@example.com and password secret123',
          baseUrl: 'https://app.example.com',
          testName: 'Login Flow Test'
        }
      },
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
        name: 'E-commerce Flow',
        description: 'Generate shopping cart test flow',
        tool: 'generate_ui_flow_from_prompt',
        template: {
          prompt: 'Search for laptop, add first item to cart, then checkout',
          baseUrl: 'https://shop.example.com',
          testName: 'Purchase Flow Test'
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

// Initialize handlers and smart router
const jmeterHandler = new JMeterHandler();
const templateHandler = new TemplateHandler();
const requestRouter = new RequestRouter();

// Register tools list handler with UI enhancements
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
      name: 'jmeter-generator',
      description: '🎯 Smart JMeter generator that automatically detects and routes your request to the appropriate tool. Just describe what you want to test!',
      category: 'Smart Generation',
      icon: '🤖',
      tags: ['smart', 'auto-detect', 'natural-language', 'ui-flows', 'api-testing'],
      examples: [
        {
          name: 'Natural Language UI Flow',
          description: 'Generate UI flow test from plain English description',
          parameters: {
            request: "Test login flow on GitHub - navigate to github.com, click Sign in, enter credentials, and verify dashboard loads"
          }
        },
        {
          name: 'API Testing Description',
          description: 'Generate API test from simple description',
          parameters: {
            request: "Test REST API with GET /users, POST /users with authentication headers"
          }
        },
        {
          name: 'Complex User Journey',
          description: 'Multi-step user scenario testing',
          parameters: {
            request: "E-commerce checkout flow: browse products, add to cart, enter shipping info, complete payment"
          }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'Smart JMeter Generator',
        properties: {
          request: {
            type: 'string',
            title: 'Test Description',
            description: 'Describe what you want to test in natural language. The system will automatically determine the best approach.',
            examples: [
              'Test login flow on my website',
              'Load test my REST API endpoints',
              'Test checkout process with 50 concurrent users',
              'API testing with authentication and data correlation'
            ],
            ui: {
              widget: 'textarea',
              rows: 4,
              placeholder: 'Describe your testing scenario in plain English...'
            }
          }
        },
        required: ['request']
      }
    }
    ]
  };
});

// Enhanced tool call handler with smart routing
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    // Smart routing for @jmeter-generator
    if (name === 'jmeter-generator') {
      console.error(`🤖 Smart routing request: "${args.request?.substring(0, 50)}..."`);
      
      // Analyze the request and route to appropriate tool
      const routing = requestRouter.routeRequest(args);
      const explanation = requestRouter.explainRouting(routing, args);
      
      console.error(`🎯 Detected: ${explanation.explanation} (${explanation.confidence} confidence)`);
      console.error(`🔧 Using tool: ${routing.tool}`);
      
      // Route to the appropriate handler based on detection
      switch (routing.tool) {
        case 'generate_ui_flow_from_prompt':
          result = await jmeterHandler.generateUIFlowFromPrompt({
            prompt: args.request,
            ...args // Pass through any additional parameters
          });
          break;
          
        case 'generate_jmeter_script':
          // Try to parse the request into structured format
          const parsedRequest = await parseNaturalLanguageToAPI(args.request);
          result = await jmeterHandler.generateJMeterScript({
            ...parsedRequest,
            ...args
          });
          break;
          
        case 'generate_from_api_schema':
          result = await jmeterHandler.generateFromApiSchema(args);
          break;
          
        case 'get_templates':
          result = await templateHandler.getTemplate(args);
          break;
          
        default:
          // Default to UI flow generation
          result = await jmeterHandler.generateUIFlowFromPrompt({
            prompt: args.request,
            ...args
          });
      }
      
      // Add routing information to the result
      if (result && result.content) {
        result.content.unshift({
          type: 'text',
          text: `🤖 **Smart Routing Applied**\n\n**Analysis:** ${explanation.explanation}\n**Confidence:** ${explanation.confidence}\n**Tool Used:** \`${routing.tool}\`\n\n---\n\n`
        });
      }
      
      console.error(`✅ Smart routing completed successfully`);
      return result;
    }
    
    // Original tool handlers
    switch (name) {
      case 'generate_jmeter_script':
        console.error(`🚀 Generating JMeter script: ${args.testName || 'Unnamed Test'}`);
        result = await jmeterHandler.generateJMeterScript(args);
        console.error(`✅ Script generated successfully with ${args.requests?.length || 0} requests`);
        return result;
        
      case 'generate_from_api_schema':
        console.error(`🔗 Generating from API schema: ${args.schemaUrl}`);
        result = await jmeterHandler.generateFromApiSchema(args);
        console.error(`✅ API schema script generated successfully`);
        return result;
        
      case 'generate_inventree_test':
        console.error(`📦 Generating InvenTree test plan`);
        result = await jmeterHandler.generateInventreeTestPlan(args);
        console.error(`✅ InvenTree test plan generated successfully`);
        return result;
        
      case 'get_templates':
        console.error(`📋 Fetching template: ${args.templateType || 'default'}`);
        result = await templateHandler.getTemplate(args);
        console.error(`✅ Template retrieved successfully`);
        return result;
        
      default:
        throw new Error(`Unknown tool: ${name}. Available tools: jmeter-generator (smart), generate_jmeter_script, generate_from_api_schema, generate_inventree_test, get_templates`);
    }
  } catch (error) {
    console.error(`❌ Error executing tool '${name}': ${error.message}`);
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error in ${name}**\n\n${error.message}\n\n**Troubleshooting:**\n- Check that all required parameters are provided\n- Ensure URLs are valid and accessible\n- Verify CSV files exist if using data parameterization\n- For API schema tools, ensure the schema URL is accessible and valid\n- For smart routing, provide a clear description of what you want to test`
        }
      ],
      isError: true
    };
  }
});

// Helper function to parse natural language into API structure
async function parseNaturalLanguageToAPI(description) {
  // Simple parsing logic - could be enhanced with AI/NLP
  const defaultConfig = {
    testName: 'Generated Test',
    baseUrl: 'https://api.example.com',
    requests: [],
    threadGroup: {
      numThreads: 10,
      rampUpTime: 30,
      loops: 5
    }
  };
  
  // Extract base URL if mentioned
  const urlMatch = description.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) {
    defaultConfig.baseUrl = urlMatch[1];
  }
  
  // Extract HTTP methods and create basic requests
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  methods.forEach(method => {
    const regex = new RegExp(`${method}\\s+([/\\w-]+)`, 'gi');
    const matches = [...description.matchAll(regex)];
    matches.forEach(match => {
      defaultConfig.requests.push({
        name: `${method} ${match[1]}`,
        method: method,
        path: match[1]
      });
    });
  });
  
  return defaultConfig;
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
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('🎯 JMeter MCP Server successfully started!');
    console.error('💡 Ready to generate JMeter test scripts via MCP protocol');
    console.error('🔗 Connect via Claude Desktop, VS Code MCP extension, or custom MCP client');
    console.error('');
    console.error('� **NEW**: Natural Language UI Flow Generation!');
    console.error('   �📖 Use "generate_ui_flow_from_prompt" with plain English descriptions');
    console.error('   📋 Example: "Login with email user@test.com and password secret123"');
    console.error('   🛒 Example: "Search for laptop, add to cart, checkout"');
    console.error('');
    console.error('🔧 Available Tools:');
    console.error('   • generate_ui_flow_from_prompt - Natural language UI flows');
    console.error('   • generate_jmeter_script - Traditional API test plans');
    console.error('   • generate_from_api_schema - OpenAPI/Swagger integration');
    console.error('   • generate_flow_script - Technical UI flow steps');
    console.error('   • get_templates - Pre-built test scenarios');
    
  } catch (error) {
    console.error(`💥 Failed to start server: ${error.message}`);
    console.error('🔍 Check your MCP client configuration and try again');
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.error('👋 Shutting down JMeter MCP Server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('👋 JMeter MCP Server terminated');
  process.exit(0);
});

main().catch((error) => {
  console.error(`💥 Unexpected error: ${error.message}`);
  process.exit(1);
});