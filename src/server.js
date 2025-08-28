import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { JMeterHandler } from './handlers/jmeterHandler.js';
import { TemplateHandler } from './handlers/templateHandler.js';
import { validateTestPlan } from './utils/validator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class JMeterMCPServer {
  constructor() {
    this.server = null;
    this.handlers = {
      jmeter: new JMeterHandler(),
      template: new TemplateHandler()
    };
    this.initializeServer();
  }

  initializeServer() {
    this.server = new MCPServer(
      {
        name: 'jmeter-script-generator',
        version: '1.0.0',
        description: 'MCP server for generating JMeter test scripts with parameterization and correlation'
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    // Ensure output directories exist
    this.ensureOutputDirectories();

    this.registerTools();
    this.registerResources();
    this.setupErrorHandling();
  }

  registerTools() {
    // Tool definitions
    const tools = [
      {
        name: 'generate_jmeter_script',
        description: 'Generate a complete JMeter test script (.jmx) with parameterization and correlation',
        inputSchema: {
          type: 'object',
          properties: {
            testName: {
              type: 'string',
              description: 'Name of the test plan'
            },
            baseUrl: {
              type: 'string',
              description: 'Base URL for the API (e.g., https://api.example.com)'
            },
            requests: {
              type: 'array',
              description: 'Array of API requests to include in the test',
              items: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string',
                    description: 'Name of the request' 
                  },
                  method: { 
                    type: 'string', 
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                    description: 'HTTP method'
                  },
                  path: { 
                    type: 'string',
                    description: 'Request path (can include variables like ${userId})'
                  },
                  headers: { 
                    type: 'object',
                    description: 'Request headers'
                  },
                  body: { 
                    type: 'string',
                    description: 'Request body (can include variables)'
                  },
                  parameters: {
                    type: 'array',
                    description: 'URL parameters',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        value: { type: 'string' },
                        encode: { type: 'boolean', default: true }
                      }
                    }
                  },
                  extractors: {
                    type: 'array',
                    description: 'Variable extractors for correlation',
                    items: {
                      type: 'object',
                      properties: {
                        variableName: { 
                          type: 'string',
                          description: 'Name of variable to store extracted value'
                        },
                        jsonPath: { 
                          type: 'string',
                          description: 'JSON Path expression (e.g., $.data.id)'
                        },
                        regex: { 
                          type: 'string',
                          description: 'Regular expression with capture groups'
                        },
                        defaultValue: { 
                          type: 'string',
                          description: 'Default value if extraction fails'
                        }
                      }
                    }
                  },
                  assertions: {
                    type: 'array',
                    description: 'Response assertions',
                    items: {
                      type: 'object',
                      properties: {
                        type: { 
                          type: 'string', 
                          enum: ['responseCode', 'responseTime', 'jsonPath', 'contains'],
                          description: 'Type of assertion'
                        },
                        value: { 
                          type: 'string',
                          description: 'Expected value'
                        },
                        jsonPath: { 
                          type: 'string',
                          description: 'JSON Path for jsonPath assertion type'
                        },
                        expectedValue: { 
                          type: 'string',
                          description: 'Expected value for jsonPath assertion'
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
              description: 'Thread group configuration',
              properties: {
                numThreads: { 
                  type: 'number', 
                  default: 10,
                  description: 'Number of concurrent users'
                },
                rampUpTime: { 
                  type: 'number', 
                  default: 10,
                  description: 'Ramp-up period in seconds'
                },
                loops: { 
                  type: 'number', 
                  default: 1,
                  description: 'Number of iterations (-1 for infinite)'
                },
                duration: {
                  type: 'number',
                  description: 'Test duration in seconds (optional)'
                },
                delayTime: {
                  type: 'number',
                  description: 'Thread startup delay in seconds'
                }
              }
            },
            csvDataSet: {
              type: 'object',
              description: 'CSV data configuration for parameterization',
              properties: {
                fileName: { 
                  type: 'string',
                  description: 'Path to CSV file'
                },
                variableNames: { 
                  type: 'string',
                  description: 'Comma-separated variable names (e.g., username,password,userId)'
                },
                delimiter: { 
                  type: 'string', 
                  default: ',',
                  description: 'CSV delimiter'
                },
                ignoreFirstLine: {
                  type: 'boolean',
                  default: true,
                  description: 'Skip CSV header row'
                },
                recycle: {
                  type: 'boolean',
                  default: true,
                  description: 'Reuse CSV data when reaching EOF'
                },
                stopThread: {
                  type: 'boolean',
                  default: false,
                  description: 'Stop thread when CSV EOF is reached'
                }
              }
            },
            defaultHeaders: {
              type: 'object',
              description: 'Default headers for all requests'
            },
            timers: {
              type: 'object',
              description: 'Timer configuration',
              properties: {
                type: {
                  type: 'string',
                  enum: ['constant', 'gaussian', 'uniform', 'throughput'],
                  default: 'gaussian'
                },
                constantDelay: {
                  type: 'string',
                  default: '300',
                  description: 'Constant delay in milliseconds'
                },
                randomDelay: {
                  type: 'string',
                  default: '100',
                  description: 'Random delay range in milliseconds'
                },
                throughput: {
                  type: 'string',
                  default: '60.0',
                  description: 'Target throughput in requests per minute'
                }
              }
            },
            listeners: {
              type: 'array',
              description: 'Result listeners to include',
              items: {
                type: 'string',
                enum: ['view_results_tree', 'aggregate_report', 'response_time_graph', 'simple_data_writer']
              },
              default: ['view_results_tree']
            }
          },
          required: ['testName', 'baseUrl', 'requests']
        }
      },
      {
        name: 'get_jmeter_template',
        description: 'Get a pre-configured JMeter test template',
        inputSchema: {
          type: 'object',
          properties: {
            templateType: {
              type: 'string',
              enum: ['rest_api', 'graphql', 'soap', 'oauth2', 'load_test', 'spike_test', 'stress_test'],
              description: 'Type of template to retrieve'
            }
          },
          required: ['templateType']
        }
      },
      {
        name: 'validate_jmeter_config',
        description: 'Validate JMeter test configuration before generation',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              description: 'JMeter configuration to validate'
            }
          },
          required: ['config']
        }
      }
    ];

    // Register tools list handler
    this.server.setRequestHandler('tools/list', async () => ({
      tools: tools
    }));

    // Register tool call handler
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_jmeter_script':
            return await this.generateJMeterScript(args);
          
          case 'get_jmeter_template':
            return await this.getTemplate(args);
          
          case 'validate_jmeter_config':
            return await this.validateConfig(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return this.errorResponse(error);
      }
    });
  }

  registerResources() {
    // Register resources list handler
    this.server.setRequestHandler('resources/list', async () => ({
      resources: [
        {
          uri: 'jmeter://templates',
          name: 'JMeter Templates',
          description: 'Available JMeter test templates',
          mimeType: 'application/json'
        },
        {
          uri: 'jmeter://examples',
          name: 'JMeter Examples',
          description: 'Example JMeter configurations',
          mimeType: 'application/json'
        }
      ]
    }));

    // Register resource read handler
    this.server.setRequestHandler('resources/read', async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'jmeter://templates':
            return {
              contents: [
                {
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(this.handlers.template.getAllTemplates(), null, 2)
                }
              ]
            };

          case 'jmeter://examples':
            return {
              contents: [
                {
                  uri: uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(this.getExamples(), null, 2)
                }
              ]
            };

          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        return this.errorResponse(error);
      }
    });
  }

  setupErrorHandling() {
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
  
  /**
   * Ensure output directories exist
   */
  ensureOutputDirectories() {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const projectRoot = path.resolve(__dirname, '..');
      
      // Define output directories
      const outputDir = path.join(projectRoot, 'output');
      const sampleDataDir = path.join(projectRoot, 'sample_data');
      
      // Create directories if they don't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}`);
      }
      
      if (!fs.existsSync(sampleDataDir)) {
        fs.mkdirSync(sampleDataDir, { recursive: true });
        console.log(`Created sample_data directory: ${sampleDataDir}`);
      }
    } catch (error) {
      console.error(`Error creating output directories: ${error.message}`);
    }
  }

  async generateJMeterScript(args) {
    return this.handlers.jmeter.generateJMeterScript(args);
  }

  async getTemplate(args) {
    return this.handlers.template.getTemplate(args);
  }

  async validateConfig(args) {
    const validationResult = validateTestPlan(args.config);
    
    if (validationResult.error) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation failed: ${validationResult.error.message}`
          },
          {
            type: 'text',
            text: 'Details:\n' + JSON.stringify(validationResult.error.details, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'Configuration is valid! ✓'
        }
      ]
    };
  }

  getExamples() {
    return {
      simple_api_test: {
        testName: "Simple API Test",
        baseUrl: "https://jsonplaceholder.typicode.com",
        requests: [
          {
            name: "Get Posts",
            method: "GET",
            path: "/posts",
            assertions: [
              {
                type: "responseCode",
                value: "200"
              }
            ]
          }
        ]
      },
      authenticated_api_test: {
        testName: "Authenticated API Test",
        baseUrl: "https://api.example.com",
        defaultHeaders: {
          "Content-Type": "application/json"
        },
        csvDataSet: {
          fileName: "users.csv",
          variableNames: "username,password"
        },
        requests: [
          {
            name: "Login",
            method: "POST",
            path: "/auth/login",
            body: '{"username":"${username}","password":"${password}"}',
            extractors: [
              {
                variableName: "authToken",
                jsonPath: "$.token"
              }
            ]
          },
          {
            name: "Get Profile",
            method: "GET",
            path: "/users/me",
            headers: {
              "Authorization": "Bearer ${authToken}"
            }
          }
        ]
      }
    };
  }

  errorResponse(error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }

  async connect(transport) {
    await this.server.connect(transport);
  }
}

// Export a singleton instance
export const jmeterServer = new JMeterMCPServer();