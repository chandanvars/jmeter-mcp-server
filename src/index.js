#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { JMeterHandler } from './handlers/jmeterHandler.js';
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
      name: 'execute_jmeter_script',
      description: 'Automatically execute JMeter test script in Docker container with performance analysis and reporting - No manual intervention required',
      category: 'Load Testing',
      icon: '🐳',
      tags: ['docker', 'execution', 'performance', 'reports'],
      examples: [
        {
          name: 'Execute JMX with Docker',
          description: 'Run JMeter test in containerized environment with reports',
          parameters: {
            jmxFile: 'HTTPBin_Basic_API_Test.jmx',
            generateReports: true,
            resourceAnalysis: true
          }
        }
      ],
      inputSchema: {
        type: 'object',
        title: 'JMeter Docker Execution',
        properties: {
          jmxFile: {
            type: 'string',
            title: 'JMX File Name',
            description: 'Name of the JMX file in the output folder to execute',
            ui: { widget: 'text', placeholder: 'test.jmx' }
          },
          generateReports: {
            type: 'boolean',
            title: 'Generate HTML Reports',
            description: 'Generate detailed HTML performance reports',
            default: true,
            ui: { widget: 'checkbox' }
          },
          resourceAnalysis: {
            type: 'boolean',
            title: 'Analyze Resource Requirements',
            description: 'Analyze JMX file for resource requirements',
            default: true,
            ui: { widget: 'checkbox' }
          },
          dockerImage: {
            type: 'string',
            title: 'Docker Image',
            description: 'JMeter Docker image to use',
            default: 'justb4/jmeter:5.6.3',
            ui: { widget: 'text', placeholder: 'justb4/jmeter:5.6.3' }
          },
          maxMemory: {
            type: 'string',
            title: 'Maximum Memory',
            description: 'Maximum memory allocation for container',
            default: '2g',
            ui: { widget: 'text', placeholder: '2g' }
          },
          cpuLimit: {
            type: 'string',
            title: 'CPU Limit',
            description: 'CPU limit for container',
            default: '2',
            ui: { widget: 'text', placeholder: '2' }
          }
        },
        required: ['jmxFile']
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
        
      case 'execute_jmeter_script':
        result = await executeJMeterScript(args);
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}. Available tools: generate_jmeter_script, execute_jmeter_script`);
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

// Execute JMeter Script in Docker Function
async function executeJMeterScript(args) {
  try {
    const {
      jmxFile,
      generateReports = true,
      resourceAnalysis = true,
      dockerImage = 'justb4/jmeter:5.6.3',
      maxMemory = '2g',
      cpuLimit = '2'
    } = args;

    logger.info(`Executing JMeter script: ${jmxFile}`);

    // Validate JMX file exists
    const jmxPath = path.join(process.cwd(), 'output', jmxFile);
    if (!fs.existsSync(jmxPath)) {
      throw new Error(`JMX file not found: ${jmxPath}`);
    }

    // Analyze JMX file if requested
    let analysis = null;
    if (resourceAnalysis) {
      analysis = analyzeJMXResources(jmxPath);
    }

    // Generate Docker configuration
    const dockerConfig = generateDockerConfig({
      jmxFile,
      dockerImage,
      maxMemory,
      cpuLimit,
      analysis
    });

    // Create Dockerfile
    const dockerfilePath = createDockerfile(dockerConfig);
    
    // Create docker-compose.yml
    const dockerComposePath = createDockerCompose(dockerConfig);

    // Generate execution script
    const executionScript = createExecutionScript(dockerConfig);

    // Create results directory
    const resultsDir = path.join(process.cwd(), 'jmeter-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Execute Docker container automatically
    logger.info('Starting automatic Docker execution...');
    const executionResult = await executeDockerContainer(dockerConfig);

    return {
      content: [
        {
          type: 'text',
          text: `🐳 **JMeter Test Execution Completed Automatically!**

**JMX File:** \`${jmxFile}\`
**Docker Image:** \`${dockerImage}\`
**Memory Limit:** ${maxMemory}
**CPU Limit:** ${cpuLimit}

${analysis ? `📊 **Resource Analysis:**
- **Thread Groups:** ${analysis.threadGroups}
- **Total Virtual Users:** ${analysis.totalUsers}
- **Test Duration:** ~${analysis.estimatedDuration} seconds
- **HTTP Requests:** ${analysis.httpRequests}
- **CSV Data Files:** ${analysis.csvFiles.length}
- **Estimated Memory Need:** ${analysis.recommendedMemory}
- **Recommended CPUs:** ${analysis.recommendedCPU}

` : ''}🚀 **Execution Results:**
${executionResult.success ? 
`✅ **Test executed successfully!**
- **Execution Time:** ${executionResult.duration}s
- **Exit Code:** ${executionResult.exitCode}
- **Container Status:** ${executionResult.status}

📈 **Generated Reports:**
- **Raw Results:** \`jmeter-results/results.jtl\`
- **HTML Dashboard:** \`jmeter-results/reports/index.html\`
- **Performance Analysis (HTML):** \`jmeter-results/performance-analysis.html\`
- **Performance Analysis (MD):** \`jmeter-results/performance-analysis.md\`
- **Analysis Data (JSON):** \`jmeter-results/performance-analysis.json\`
- **Execution Logs:** \`jmeter-results/logs/jmeter.log\`
- **Summary:** \`jmeter-results/summary.txt\`

🎯 **Performance Summary:**
${executionResult.summary || 'Detailed metrics available in HTML reports'}

**📊 Quick Stats:**
${executionResult.stats ? 
`- **Total Samples:** ${executionResult.stats.totalSamples || 'N/A'}
- **Success Rate:** ${executionResult.stats.successRate || 'N/A'}%
- **Average Response Time:** ${executionResult.stats.avgResponseTime || 'N/A'}ms
- **Throughput:** ${executionResult.stats.throughput || 'N/A'} requests/sec
- **Errors:** ${executionResult.stats.errorCount || '0'}` 
: 'Check HTML dashboard for detailed statistics'}

${executionResult.performanceAnalysis ? 
`**🔍 Performance Analysis:**
- **Load Profile:** ${executionResult.performanceAnalysis.loadProfile.classification}
- **Response Time Trend:** ${executionResult.performanceAnalysis.responseTimes.trend}
- **Throughput Rating:** ${executionResult.performanceAnalysis.throughput.rating}
- **Error Analysis:** ${executionResult.performanceAnalysis.errors.severity}
- **Resource Usage:** ${executionResult.performanceAnalysis.resourceUsage.efficiency}
- **Bottlenecks:** ${executionResult.performanceAnalysis.bottlenecks.primary || 'None identified'}

**📋 Key Recommendations:**
${executionResult.performanceAnalysis.recommendations.slice(0, 3).map(rec => `- ${rec}`).join('\n')}
` : ''}
**🌐 View Results:**
- **Interactive Dashboard:** \`jmeter-results/reports/index.html\`
- **Performance Analysis (HTML):** \`jmeter-results/performance-analysis.html\`
- **Performance Analysis (MD):** \`jmeter-results/performance-analysis.md\``
:
`❌ **Test execution failed!**
- **Exit Code:** ${executionResult.exitCode}
- **Error:** ${executionResult.error}
- **Duration:** ${executionResult.duration}s

**🔍 Troubleshooting:**
1. Check Docker is running: \`docker info\`
2. Verify JMX file exists: \`${jmxPath}\`
3. Check container logs: \`docker logs jmeter-${dockerConfig.testName}\`
4. Review error details in: \`jmeter-results/logs/\`

**📝 Execution Log:**
\`\`\`
${executionResult.output || 'No output captured'}
\`\`\`

**⚠️ Next Steps:**
1. Fix the identified issues
2. Run the tool again for automatic retry
3. Check Docker container resources and permissions`}

**🔧 Generated Docker Files:**
- ✅ \`Dockerfile\` - Custom JMeter container
- ✅ \`docker-compose.yml\` - Service orchestration  
- ✅ \`docker-entrypoint.sh\` - Execution script
- ✅ \`run-jmeter.sh\` - Standalone runner

**🎉 All done! No manual intervention required.**`
        },
        {
          type: 'file_reference',
          name: 'dockerfile',
          file_type: 'dockerfile',
          path: dockerfilePath
        },
        {
          type: 'file_reference',
          name: 'docker_compose',
          file_type: 'yml',
          path: dockerComposePath
        },
        {
          type: 'file_reference',
          name: 'execution_script',
          file_type: 'sh',
          path: executionScript
        }
      ]
    };

  } catch (error) {
    logger.error(`Error setting up JMeter execution: ${error.message}`);
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error setting up JMeter execution:** ${error.message}\n\n**Troubleshooting:**\n- Ensure the JMX file exists in the output folder\n- Check Docker is installed and running\n- Verify file permissions\n- Ensure sufficient disk space for results`
        }
      ]
    };
  }
}

// Execute Docker container automatically
async function executeDockerContainer(config) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const startTime = Date.now();
  let executionResult = {
    success: false,
    duration: 0,
    exitCode: null,
    status: 'failed',
    error: null,
    output: '',
    summary: '',
    stats: null
  };

  try {
    logger.info('Checking Docker availability...');
    
    // Check if Docker is running
    try {
      await execAsync('docker info');
      logger.info('✅ Docker is running');
    } catch (error) {
      throw new Error('Docker is not running or not installed. Please start Docker first.');
    }

    // Clean up any previous containers
    try {
      await execAsync(`docker rm -f jmeter-${config.testName} 2>/dev/null || true`);
      logger.info('🧹 Cleaned up previous containers');
    } catch (error) {
      // Ignore cleanup errors
    }

    // Build Docker image
    logger.info('🔨 Building Docker image...');
    const buildResult = await execAsync('docker build -t jmeter-test .', { 
      timeout: 300000 // 5 minutes timeout
    });
    logger.info('✅ Docker image built successfully');

    // Prepare Docker run command with cross-platform path handling
    const currentDir = process.cwd().replace(/\\/g, '/');
    const dockerCmd = `docker run --rm ` +
      `--name jmeter-${config.testName} ` +
      `--memory=${config.maxMemory} ` +
      `--cpus=${config.cpuLimit} ` +
      `-v "${currentDir}/output:/tests" ` +
      `-v "${currentDir}/sample_data:/data" ` +
      `-v "${currentDir}/jmeter-results:/results" ` +
      `jmeter-test ${config.jmxFile}`;

    logger.info(`🚀 Executing JMeter test: ${config.jmxFile}`);
    logger.info(`Docker command: ${dockerCmd}`);

    // Execute the test
    const testResult = await execAsync(dockerCmd, {
      timeout: config.analysis?.estimatedDuration ? 
        (config.analysis.estimatedDuration + 60) * 1000 : // Add 1 minute buffer
        300000 // Default 5 minutes
    });

    const endTime = Date.now();
    executionResult.duration = Math.round((endTime - startTime) / 1000);
    executionResult.success = true;
    executionResult.exitCode = 0;
    executionResult.status = 'completed';
    executionResult.output = testResult.stdout;

    logger.info('✅ JMeter test completed successfully');

    // Parse results and generate performance analysis report
    try {
      const resultsPath = path.join(process.cwd(), 'jmeter-results', 'results.jtl');
      const summaryPath = path.join(process.cwd(), 'jmeter-results', 'summary.txt');
      const statisticsPath = path.join(process.cwd(), 'jmeter-results', 'reports', 'statistics.json');
      
      // Read summary if exists
      if (fs.existsSync(summaryPath)) {
        executionResult.summary = fs.readFileSync(summaryPath, 'utf8');
      }

      // Parse JTL file for quick stats
      if (fs.existsSync(resultsPath)) {
        executionResult.stats = parseJTLResults(resultsPath);
      }
      
      // Generate comprehensive performance analysis report
      const performanceAnalysis = generatePerformanceAnalysisReport({
        jtlPath: resultsPath,
        statisticsPath: statisticsPath,
        config: config,
        stats: executionResult.stats
      });
      
      if (performanceAnalysis) {
        const reportPath = path.join(process.cwd(), 'jmeter-results', 'performance-analysis.json');
        const markdownReportPath = path.join(process.cwd(), 'jmeter-results', 'performance-analysis.md');
        const htmlReportPath = path.join(process.cwd(), 'jmeter-results', 'performance-analysis.html');
        
        // Save JSON report
        fs.writeFileSync(reportPath, JSON.stringify(performanceAnalysis, null, 2));
        
        // Save Markdown report
        const markdownReport = generateMarkdownReport(performanceAnalysis);
        fs.writeFileSync(markdownReportPath, markdownReport);
        
        // Save HTML report
        const htmlReport = generateHtmlReport(performanceAnalysis);
        fs.writeFileSync(htmlReportPath, htmlReport);
        
        executionResult.performanceAnalysis = performanceAnalysis;
        logger.info('✅ Performance analysis reports generated (JSON, MD, HTML)');
      }
      
    } catch (parseError) {
      logger.warn(`Warning: Could not parse results: ${parseError.message}`);
    }

  } catch (error) {
    const endTime = Date.now();
    executionResult.duration = Math.round((endTime - startTime) / 1000);
    executionResult.error = error.message;
    executionResult.exitCode = error.code || 1;
    executionResult.output = error.stdout || error.stderr || error.message;
    
    logger.error(`❌ JMeter execution failed: ${error.message}`);
    
    // Try to get container logs if container exists
    try {
      const logsResult = await execAsync(`docker logs jmeter-${config.testName} 2>&1`);
      executionResult.output += '\n\nContainer logs:\n' + logsResult.stdout;
    } catch (logError) {
      // Ignore log retrieval errors
    }
  }

  return executionResult;
}

// Parse JTL results file for quick statistics
function parseJTLResults(jtlPath) {
  try {
    const content = fs.readFileSync(jtlPath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) return null; // Header + at least one data line
    
    const dataLines = lines.slice(1); // Skip header
    const samples = dataLines.map(line => {
      const parts = line.split(',');
      return {
        elapsed: parseInt(parts[1]) || 0,
        success: parts[7] === 'true',
        responseCode: parts[3] || '000'
      };
    });
    
    const totalSamples = samples.length;
    const successfulSamples = samples.filter(s => s.success).length;
    const successRate = totalSamples > 0 ? Math.round((successfulSamples / totalSamples) * 100) : 0;
    const avgResponseTime = totalSamples > 0 ? 
      Math.round(samples.reduce((sum, s) => sum + s.elapsed, 0) / totalSamples) : 0;
    const errorCount = totalSamples - successfulSamples;
    
    // Calculate throughput (samples per second)
    const firstTimestamp = parseInt(lines[1].split(',')[0]);
    const lastTimestamp = parseInt(lines[lines.length - 1].split(',')[0]);
    const durationMs = lastTimestamp - firstTimestamp;
    const throughput = durationMs > 0 ? Math.round((totalSamples / durationMs) * 1000 * 100) / 100 : 0;
    
    return {
      totalSamples,
      successRate,
      avgResponseTime,
      throughput,
      errorCount
    };
  } catch (error) {
    logger.error(`Error parsing JTL results: ${error.message}`);
    return null;
  }
}

// Analyze JMX file for resource requirements
function analyzeJMXResources(jmxPath) {
  try {
    const jmxContent = fs.readFileSync(jmxPath, 'utf8');
    
    // Extract thread group information
    const threadGroupMatches = jmxContent.match(/<stringProp name="ThreadGroup\.num_threads">(\d+)<\/stringProp>/g) || [];
    const rampTimeMatches = jmxContent.match(/<stringProp name="ThreadGroup\.ramp_time">(\d+)<\/stringProp>/g) || [];
    const loopMatches = jmxContent.match(/<stringProp name="LoopController\.loops">(\d+)<\/stringProp>/g) || [];
    
    // Extract HTTP samplers
    const httpSamplers = (jmxContent.match(/<HTTPSamplerProxy/g) || []).length;
    
    // Extract CSV data files
    const csvMatches = jmxContent.match(/<stringProp name="filename">([^<]+\.csv)<\/stringProp>/g) || [];
    const csvFiles = csvMatches.map(match => match.match(/>([^<]+)</)[1]);
    
    // Calculate totals
    const totalUsers = threadGroupMatches.reduce((sum, match) => {
      const users = parseInt(match.match(/>(\d+)</)[1]);
      return sum + users;
    }, 0);
    
    const maxRampTime = rampTimeMatches.reduce((max, match) => {
      const rampTime = parseInt(match.match(/>(\d+)</)[1]);
      return Math.max(max, rampTime);
    }, 0);
    
    const maxLoops = loopMatches.reduce((max, match) => {
      const loops = parseInt(match.match(/>(\d+)</)[1]);
      return Math.max(max, loops);
    }, 1);
    
    // Estimate test duration (ramp time + execution time)
    const estimatedDuration = maxRampTime + (maxLoops * 5); // Assuming 5 seconds per loop average
    
    // Calculate resource recommendations
    const recommendedMemory = Math.max(1, Math.ceil(totalUsers / 100)) + 'g';
    const recommendedCPU = Math.max(1, Math.ceil(totalUsers / 250));
    
    return {
      threadGroups: threadGroupMatches.length,
      totalUsers,
      maxRampTime,
      maxLoops,
      estimatedDuration,
      httpRequests: httpSamplers,
      csvFiles,
      recommendedMemory,
      recommendedCPU
    };
  } catch (error) {
    logger.error(`Error analyzing JMX file: ${error.message}`);
    return {
      threadGroups: 1,
      totalUsers: 10,
      estimatedDuration: 60,
      httpRequests: 1,
      csvFiles: [],
      recommendedMemory: '2g',
      recommendedCPU: 2
    };
  }
}

// Generate Docker configuration
function generateDockerConfig({ jmxFile, dockerImage, maxMemory, cpuLimit, analysis }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testName = jmxFile.replace('.jmx', '');
  
  return {
    jmxFile,
    dockerImage,
    maxMemory,
    cpuLimit,
    testName,
    timestamp,
    analysis,
    resultsDir: 'jmeter-results',
    reportsDir: 'jmeter-results/reports',
    logsDir: 'jmeter-results/logs'
  };
}

// Create Dockerfile
function createDockerfile(config) {
  const dockerfileContent = `# JMeter Test Execution Dockerfile
# Generated by JMeter MCP Server

FROM ${config.dockerImage}

# Set working directory
WORKDIR /jmeter

# Create directories for results
RUN mkdir -p /tests /data /results/reports /results/logs

# Copy execution script
COPY docker-entrypoint.sh /entrypoint.sh

# Make script executable
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
`;

  const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
  fs.writeFileSync(dockerfilePath, dockerfileContent);
  
  // Create docker entrypoint script
  const entrypointContent = `#!/bin/sh

echo "🚀 Starting JMeter Test Execution"
echo "📊 Test File: $1"
echo "⏰ Timestamp: $(date '+%Y%m%d-%H%M%S')"
echo "💾 Results will be saved to: /results"
echo "🔥 Executing JMeter test..."

# JMeter is installed at /opt/apache-jmeter-5.5/bin/jmeter
JMETER_DIR="/opt/apache-jmeter-5.5"
if [ ! -d "$JMETER_DIR" ]; then
    # Try to find it dynamically
    JMETER_DIR=$(find /opt -name "apache-jmeter-*" -type d | head -n 1)
    if [ -z "$JMETER_DIR" ]; then
        echo "❌ Could not find JMeter installation"
        find /opt -name "*jmeter*" -type d 2>/dev/null || echo "No jmeter directories found"
        exit 1
    fi
fi

echo "📍 Found JMeter at: $JMETER_DIR"

# Create timestamped results directory
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
RESULTS_DIR="/results/${config.testName}-$TIMESTAMP"
mkdir -p "$RESULTS_DIR/reports" "$RESULTS_DIR/logs"

# Check if JMX file exists
if [ ! -f "/tests/$1" ]; then
    echo "❌ Error: JMX file not found: /tests/$1"
    ls -la /tests/
    exit 1
fi

# Run JMeter test
"$JMETER_DIR/bin/jmeter" \\
  -n \\
  -t "/tests/$1" \\
  -l "$RESULTS_DIR/results.jtl" \\
  -e \\
  -o "$RESULTS_DIR/reports" \\
  -j "$RESULTS_DIR/logs/jmeter.log"

echo "✅ Test execution completed!"
echo "📈 Results available at: $RESULTS_DIR"
echo "🌐 Open $RESULTS_DIR/reports/index.html for dashboard"

# Generate summary
echo "📋 Test Summary:" > "$RESULTS_DIR/summary.txt"
echo "Test File: $1" >> "$RESULTS_DIR/summary.txt"
echo "Execution Time: $(date)" >> "$RESULTS_DIR/summary.txt"
echo "Results Directory: $RESULTS_DIR" >> "$RESULTS_DIR/summary.txt"

# Copy results to host volume
cp -r "$RESULTS_DIR"/* "/results/" 2>/dev/null || true

echo "🎉 JMeter execution completed successfully!"
`;

  const entrypointPath = path.join(process.cwd(), 'docker-entrypoint.sh');
  fs.writeFileSync(entrypointPath, entrypointContent);

  return dockerfilePath;
}

// Create docker-compose.yml
function createDockerCompose(config) {
  const composeContent = `# JMeter Docker Compose Configuration
# Generated by JMeter MCP Server

version: '3.8'

services:
  jmeter-test:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jmeter-${config.testName}
    volumes:
      - ./output:/tests:ro
      - ./sample_data:/data:ro
      - ./jmeter-results:/results
    deploy:
      resources:
        limits:
          memory: ${config.maxMemory}
          cpus: '${config.cpuLimit}'
    environment:
      - JMX_FILE=${config.jmxFile}
      - TEST_NAME=${config.testName}
    networks:
      - jmeter-network
    command: ["${config.jmxFile}"]

  # Optional: Resource monitoring
  monitoring:
    image: prom/node-exporter:latest
    container_name: jmeter-monitoring
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - jmeter-network
    profiles:
      - monitoring

networks:
  jmeter-network:
    driver: bridge

volumes:
  jmeter-results:
    driver: local
`;

  const composePath = path.join(process.cwd(), 'docker-compose.yml');
  fs.writeFileSync(composePath, composeContent);
  return composePath;
}

// Create execution script
function createExecutionScript(config) {
  const scriptContent = `#!/bin/bash
# JMeter Test Execution Script
# Generated by JMeter MCP Server

set -e

TEST_NAME="${config.testName}"
JMX_FILE="${config.jmxFile}"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

echo "🐳 JMeter Docker Test Execution"
echo "================================"
echo "Test: $TEST_NAME"
echo "File: $JMX_FILE"
echo "Time: $TIMESTAMP"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    exit 1
fi

if [ ! -f "output/$JMX_FILE" ]; then
    echo "❌ JMX file not found: output/$JMX_FILE"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Clean up previous results
echo "🧹 Cleaning up previous results..."
rm -rf jmeter-results/*
mkdir -p jmeter-results

# Build and run with Docker Compose
echo "🚀 Starting test execution with Docker Compose..."
docker-compose up --build --remove-orphans

echo ""
echo "✅ Test execution completed!"
echo "📊 Results available in: ./jmeter-results/"
echo "🌐 Open ./jmeter-results/reports/index.html for dashboard"

# Optional: Open results in browser (uncomment for auto-open)
# if command -v xdg-open &> /dev/null; then
#     xdg-open "./jmeter-results/reports/index.html"
# elif command -v open &> /dev/null; then
#     open "./jmeter-results/reports/index.html"
# fi

echo "🎉 Execution script completed successfully!"
`;

  const scriptPath = path.join(process.cwd(), 'run-jmeter.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  
  // Make script executable on Unix systems
  try {
    fs.chmodSync(scriptPath, '755');
  } catch (error) {
    // Ignore chmod errors on Windows
  }
  
  return scriptPath;
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
    console.error(`   1. generate_jmeter_script - Generate JMeter test prompts`);
    console.error(`   2. execute_jmeter_script - Auto-execute JMX in Docker with reports (no manual steps)`);
    
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
            tools: 2
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
              'execute_jmeter_script'
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

// Generate comprehensive performance analysis report
function generatePerformanceAnalysisReport({ jtlPath, statisticsPath, config, stats }) {
  try {
    if (!fs.existsSync(jtlPath)) {
      logger.warn('JTL file not found for performance analysis');
      return null;
    }

    const jtlContent = fs.readFileSync(jtlPath, 'utf8');
    const lines = jtlContent.trim().split('\n');
    
    if (lines.length < 2) return null;
    
    const dataLines = lines.slice(1);
    const samples = dataLines.map(line => {
      const parts = line.split(',');
      return {
        timestamp: parseInt(parts[0]) || 0,
        elapsed: parseInt(parts[1]) || 0,
        label: parts[2] || 'Unknown',
        responseCode: parts[3] || '000',
        success: parts[7] === 'true',
        bytes: parseInt(parts[9]) || 0,
        sentBytes: parseInt(parts[10]) || 0,
        grpThreads: parseInt(parts[11]) || 0,
        allThreads: parseInt(parts[12]) || 0,
        url: parts[13] || '',
        latency: parseInt(parts[14]) || 0,
        connect: parseInt(parts[16]) || 0
      };
    });

    const analysis = {
      metadata: {
        testName: config.testName,
        jmxFile: config.jmxFile,
        timestamp: new Date().toISOString(),
        duration: config.analysis?.estimatedDuration || 0,
        totalSamples: samples.length
      },
      loadProfile: analyzeLoadProfile(samples, config),
      responseTimes: analyzeResponseTimes(samples),
      throughput: analyzeThroughput(samples),
      errors: analyzeErrors(samples),
      resourceUsage: analyzeResourceUsage(samples, config),
      bottlenecks: identifyBottlenecks(samples),
      recommendations: generateRecommendations(samples, config),
      statistics: stats || {},
      trends: analyzeTrends(samples)
    };

    // Read statistics.json if available for additional insights
    if (fs.existsSync(statisticsPath)) {
      try {
        const statisticsContent = fs.readFileSync(statisticsPath, 'utf8');
        const statisticsData = JSON.parse(statisticsContent);
        analysis.detailedStatistics = statisticsData;
      } catch (error) {
        logger.warn('Could not parse statistics.json');
      }
    }

    return analysis;
  } catch (error) {
    logger.error(`Error generating performance analysis: ${error.message}`);
    return null;
  }
}

// Analyze load profile characteristics
function analyzeLoadProfile(samples, config) {
  const totalUsers = config.analysis?.totalUsers || 1;
  const duration = (Math.max(...samples.map(s => s.timestamp)) - Math.min(...samples.map(s => s.timestamp))) / 1000;
  const avgConcurrency = samples.reduce((sum, s) => sum + s.allThreads, 0) / samples.length;
  
  let classification = 'Light Load';
  if (totalUsers > 100) classification = 'Heavy Load';
  else if (totalUsers > 50) classification = 'Medium Load';
  else if (totalUsers > 10) classification = 'Moderate Load';
  
  return {
    totalUsers,
    duration,
    avgConcurrency: Math.round(avgConcurrency),
    classification,
    loadIntensity: totalUsers / duration,
    peakConcurrency: Math.max(...samples.map(s => s.allThreads))
  };
}

// Analyze response time patterns
function analyzeResponseTimes(samples) {
  const responseTimes = samples.map(s => s.elapsed);
  const sorted = responseTimes.sort((a, b) => a - b);
  
  const min = Math.min(...responseTimes);
  const max = Math.max(...responseTimes);
  const avg = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  let trend = 'Stable';
  const firstHalf = responseTimes.slice(0, Math.floor(responseTimes.length / 2));
  const secondHalf = responseTimes.slice(Math.floor(responseTimes.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg * 1.2) trend = 'Degrading';
  else if (secondAvg < firstAvg * 0.8) trend = 'Improving';
  
  return {
    min, max, avg, p50, p90, p95, p99,
    trend,
    variability: max - min,
    consistency: p95 / avg
  };
}

// Analyze throughput patterns
function analyzeThroughput(samples) {
  const duration = (Math.max(...samples.map(s => s.timestamp)) - Math.min(...samples.map(s => s.timestamp))) / 1000;
  const throughput = samples.length / duration;
  
  let rating = 'Low';
  if (throughput > 100) rating = 'Excellent';
  else if (throughput > 50) rating = 'Good';
  else if (throughput > 10) rating = 'Moderate';
  
  // Calculate throughput over time
  const timeWindows = {};
  samples.forEach(sample => {
    const window = Math.floor(sample.timestamp / 1000) * 1000;
    timeWindows[window] = (timeWindows[window] || 0) + 1;
  });
  
  const throughputValues = Object.values(timeWindows);
  const peakThroughput = Math.max(...throughputValues);
  const avgThroughput = throughputValues.reduce((a, b) => a + b, 0) / throughputValues.length;
  
  return {
    average: Math.round(throughput * 100) / 100,
    peak: peakThroughput,
    rating,
    stability: avgThroughput / peakThroughput,
    dataTransferred: samples.reduce((sum, s) => sum + s.bytes, 0)
  };
}

// Analyze error patterns
function analyzeErrors(samples) {
  const errors = samples.filter(s => !s.success);
  const errorRate = (errors.length / samples.length) * 100;
  
  let severity = 'None';
  if (errorRate > 10) severity = 'Critical';
  else if (errorRate > 5) severity = 'High';
  else if (errorRate > 1) severity = 'Medium';
  else if (errorRate > 0) severity = 'Low';
  
  // Group errors by type
  const errorTypes = {};
  errors.forEach(error => {
    const key = `${error.responseCode}-${error.label}`;
    errorTypes[key] = (errorTypes[key] || 0) + 1;
  });
  
  return {
    total: errors.length,
    rate: Math.round(errorRate * 100) / 100,
    severity,
    types: errorTypes,
    mostCommon: Object.keys(errorTypes).length > 0 ? 
      Object.keys(errorTypes).reduce((a, b) => errorTypes[a] > errorTypes[b] ? a : b) : 'None'
  };
}

// Analyze resource usage efficiency
function analyzeResourceUsage(samples, config) {
  const avgResponseTime = samples.reduce((sum, s) => sum + s.elapsed, 0) / samples.length;
  const throughput = samples.length / ((Math.max(...samples.map(s => s.timestamp)) - Math.min(...samples.map(s => s.timestamp))) / 1000);
  const concurrency = config.analysis?.totalUsers || 1;
  
  const efficiency = throughput / (concurrency * avgResponseTime / 1000);
  
  let rating = 'Poor';
  if (efficiency > 0.8) rating = 'Excellent';
  else if (efficiency > 0.6) rating = 'Good';
  else if (efficiency > 0.4) rating = 'Fair';
  
  return {
    efficiency: Math.round(efficiency * 100) / 100,
    rating,
    memoryUsage: config.maxMemory,
    cpuUsage: config.cpuLimit,
    concurrencyUtilization: Math.round((throughput / concurrency) * 100) / 100
  };
}

// Identify performance bottlenecks
function identifyBottlenecks(samples) {
  const bottlenecks = [];
  
  // Response time bottleneck
  const avgResponseTime = samples.reduce((sum, s) => sum + s.elapsed, 0) / samples.length;
  if (avgResponseTime > 5000) {
    bottlenecks.push('High response times (>5s average)');
  }
  
  // Error rate bottleneck
  const errorRate = (samples.filter(s => !s.success).length / samples.length) * 100;
  if (errorRate > 5) {
    bottlenecks.push('High error rate (>5%)');
  }
  
  // Throughput bottleneck
  const duration = (Math.max(...samples.map(s => s.timestamp)) - Math.min(...samples.map(s => s.timestamp))) / 1000;
  const throughput = samples.length / duration;
  if (throughput < 1) {
    bottlenecks.push('Low throughput (<1 req/s)');
  }
  
  // Connection time bottleneck
  const avgConnectTime = samples.reduce((sum, s) => sum + s.connect, 0) / samples.length;
  if (avgConnectTime > 1000) {
    bottlenecks.push('High connection times (>1s average)');
  }
  
  return {
    identified: bottlenecks,
    primary: bottlenecks.length > 0 ? bottlenecks[0] : null,
    count: bottlenecks.length
  };
}

// Generate performance recommendations
function generateRecommendations(samples, config) {
  const recommendations = [];
  
  // Response time recommendations
  const avgResponseTime = samples.reduce((sum, s) => sum + s.elapsed, 0) / samples.length;
  if (avgResponseTime > 3000) {
    recommendations.push('Consider optimizing server response times or reducing load');
  }
  
  // Error rate recommendations
  const errorRate = (samples.filter(s => !s.success).length / samples.length) * 100;
  if (errorRate > 1) {
    recommendations.push('Investigate and fix errors to improve success rate');
  }
  
  // Load recommendations
  const totalUsers = config.analysis?.totalUsers || 1;
  if (totalUsers < 10) {
    recommendations.push('Consider increasing load to better simulate production conditions');
  }
  
  // Duration recommendations
  const duration = config.analysis?.estimatedDuration || 0;
  if (duration < 60) {
    recommendations.push('Consider running longer tests for more reliable results');
  }
  
  // Resource recommendations
  const throughput = samples.length / ((Math.max(...samples.map(s => s.timestamp)) - Math.min(...samples.map(s => s.timestamp))) / 1000);
  if (throughput < totalUsers * 0.5) {
    recommendations.push('Consider optimizing test script or server resources');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance looks good! Consider gradual load increases for capacity planning');
  }
  
  return recommendations;
}

// Analyze performance trends over time
function analyzeTrends(samples) {
  const timeWindows = {};
  const windowSize = 5000; // 5 second windows
  
  samples.forEach(sample => {
    const window = Math.floor(sample.timestamp / windowSize) * windowSize;
    if (!timeWindows[window]) {
      timeWindows[window] = {
        responseTimes: [],
        errors: 0,
        throughput: 0,
        timestamp: window
      };
    }
    timeWindows[window].responseTimes.push(sample.elapsed);
    timeWindows[window].throughput++;
    if (!sample.success) timeWindows[window].errors++;
  });
  
  const windows = Object.values(timeWindows).sort((a, b) => a.timestamp - b.timestamp);
  
  return {
    responseTimeProgression: windows.map(w => ({
      timestamp: w.timestamp,
      avg: w.responseTimes.reduce((a, b) => a + b, 0) / w.responseTimes.length
    })),
    throughputProgression: windows.map(w => ({
      timestamp: w.timestamp,
      value: w.throughput / (windowSize / 1000)
    })),
    errorProgression: windows.map(w => ({
      timestamp: w.timestamp,
      rate: (w.errors / w.throughput) * 100
    }))
  };
}

// Generate HTML report
function generateHtmlReport(analysis) {
  const timestamp = new Date().toISOString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JMeter Performance Analysis - ${analysis.metadata.testName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            margin-top: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            margin: -20px -20px 30px -20px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header .meta {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #007bff;
            transition: transform 0.3s ease;
        }
        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .summary-card.success { border-left-color: #28a745; }
        .summary-card.warning { border-left-color: #ffc107; }
        .summary-card.danger { border-left-color: #dc3545; }
        .summary-card h3 {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }
        .summary-card .status {
            font-size: 1.5rem;
            margin-left: 10px;
        }
        .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-header {
            background: #007bff;
            color: white;
            padding: 15px 20px;
            font-size: 1.2rem;
            font-weight: bold;
        }
        .section-content {
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin: 20px 0;
        }
        .recommendations {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .recommendations h4 {
            color: #1976d2;
            margin-bottom: 15px;
        }
        .recommendations ul {
            list-style: none;
        }
        .recommendations li {
            padding: 8px 0;
            border-bottom: 1px solid #bbdefb;
        }
        .recommendations li:last-child {
            border-bottom: none;
        }
        .recommendations li:before {
            content: "💡";
            margin-right: 10px;
        }
        .bottleneck {
            background: #ffebee;
            border: 1px solid #ffcdd2;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }
        .bottleneck.none {
            background: #e8f5e8;
            border-color: #c8e6c9;
        }
        .load-profile {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .load-metric {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .load-metric .value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #007bff;
        }
        .load-metric .label {
            color: #6c757d;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        .trend-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 10px;
        }
        .trend-degrading {
            background: #ffebee;
            color: #c62828;
        }
        .trend-stable {
            background: #fff3e0;
            color: #ef6c00;
        }
        .trend-improving {
            background: #e8f5e8;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 JMeter Performance Analysis</h1>
            <div class="meta">
                <strong>Test:</strong> ${analysis.metadata.testName} &nbsp;|&nbsp;
                <strong>Generated:</strong> ${new Date(timestamp).toLocaleString()} &nbsp;|&nbsp;
                <strong>Duration:</strong> ${analysis.loadProfile.duration}s
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="summary-grid">
            <div class="summary-card ${analysis.statistics.successRate >= 99 ? 'success' : analysis.statistics.successRate >= 95 ? 'warning' : 'danger'}">
                <h3>Success Rate</h3>
                <div class="value">${analysis.statistics.successRate || 'N/A'}%
                    <span class="status">${(analysis.statistics.successRate || 0) >= 99 ? '✅' : (analysis.statistics.successRate || 0) >= 95 ? '⚠️' : '❌'}</span>
                </div>
            </div>
            <div class="summary-card ${analysis.responseTimes.avg < 1000 ? 'success' : analysis.responseTimes.avg < 3000 ? 'warning' : 'danger'}">
                <h3>Avg Response Time</h3>
                <div class="value">${analysis.responseTimes.avg}ms
                    <span class="status">${analysis.responseTimes.avg < 1000 ? '✅' : analysis.responseTimes.avg < 3000 ? '⚠️' : '❌'}</span>
                </div>
            </div>
            <div class="summary-card ${analysis.throughput.rating === 'Excellent' ? 'success' : analysis.throughput.rating === 'Good' ? 'warning' : 'danger'}">
                <h3>Throughput</h3>
                <div class="value">${analysis.throughput.average} req/s
                    <span class="status">${analysis.throughput.rating === 'Excellent' ? '✅' : analysis.throughput.rating === 'Good' ? '⚠️' : '❌'}</span>
                </div>
            </div>
            <div class="summary-card ${analysis.errors.rate === 0 ? 'success' : analysis.errors.rate < 1 ? 'warning' : 'danger'}">
                <h3>Error Rate</h3>
                <div class="value">${analysis.errors.rate}%
                    <span class="status">${analysis.errors.rate === 0 ? '✅' : analysis.errors.rate < 1 ? '⚠️' : '❌'}</span>
                </div>
            </div>
            <div class="summary-card">
                <h3>Total Samples</h3>
                <div class="value">${analysis.metadata.totalSamples}</div>
            </div>
            <div class="summary-card">
                <h3>Virtual Users</h3>
                <div class="value">${analysis.loadProfile.totalUsers}</div>
            </div>
        </div>

        <!-- Load Profile -->
        <div class="section">
            <div class="section-header">📊 Load Profile Analysis</div>
            <div class="section-content">
                <p><strong>Classification:</strong> <span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px; color: #1976d2;">${analysis.loadProfile.classification}</span></p>
                <div class="load-profile">
                    <div class="load-metric">
                        <div class="value">${analysis.loadProfile.totalUsers}</div>
                        <div class="label">Virtual Users</div>
                    </div>
                    <div class="load-metric">
                        <div class="value">${Math.round(analysis.loadProfile.duration * 10) / 10}s</div>
                        <div class="label">Duration</div>
                    </div>
                    <div class="load-metric">
                        <div class="value">${analysis.loadProfile.avgConcurrency}</div>
                        <div class="label">Avg Concurrency</div>
                    </div>
                    <div class="load-metric">
                        <div class="value">${analysis.loadProfile.peakConcurrency}</div>
                        <div class="label">Peak Concurrency</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Response Times -->
        <div class="section">
            <div class="section-header">⏱️ Response Time Analysis</div>
            <div class="section-content">
                <p><strong>Trend:</strong> 
                    <span class="trend-indicator trend-${analysis.responseTimes.trend.toLowerCase()}">${analysis.responseTimes.trend}</span>
                </p>
                <div class="chart-container">
                    <canvas id="responseTimeChart"></canvas>
                </div>
                <table>
                    <tr><th>Metric</th><th>Value</th><th>Assessment</th></tr>
                    <tr><td>Minimum</td><td>${analysis.responseTimes.min}ms</td><td>✅ Baseline</td></tr>
                    <tr><td>Average</td><td>${analysis.responseTimes.avg}ms</td><td>${analysis.responseTimes.avg < 1000 ? '✅ Excellent' : analysis.responseTimes.avg < 3000 ? '⚠️ Acceptable' : '❌ Poor'}</td></tr>
                    <tr><td>50th Percentile</td><td>${analysis.responseTimes.p50}ms</td><td>ℹ️ Median</td></tr>
                    <tr><td>90th Percentile</td><td>${analysis.responseTimes.p90}ms</td><td>${analysis.responseTimes.p90 < 2000 ? '✅ Good' : '⚠️ Monitor'}</td></tr>
                    <tr><td>95th Percentile</td><td>${analysis.responseTimes.p95}ms</td><td>${analysis.responseTimes.p95 < 3000 ? '✅ Good' : '❌ Poor'}</td></tr>
                    <tr><td>99th Percentile</td><td>${analysis.responseTimes.p99}ms</td><td>${analysis.responseTimes.p99 < 5000 ? '✅ Acceptable' : '❌ Critical'}</td></tr>
                    <tr><td>Maximum</td><td>${analysis.responseTimes.max}ms</td><td>${analysis.responseTimes.max < 5000 ? '✅ Acceptable' : '❌ Critical'}</td></tr>
                </table>
            </div>
        </div>

        <!-- Throughput -->
        <div class="section">
            <div class="section-header">🚀 Throughput Analysis</div>
            <div class="section-content">
                <div class="chart-container">
                    <canvas id="throughputChart"></canvas>
                </div>
                <table>
                    <tr><th>Metric</th><th>Value</th><th>Rating</th></tr>
                    <tr><td>Average Throughput</td><td>${analysis.throughput.average} req/s</td><td>${analysis.throughput.rating}</td></tr>
                    <tr><td>Peak Throughput</td><td>${analysis.throughput.peak} req/s</td><td>ℹ️ Maximum</td></tr>
                    <tr><td>Stability</td><td>${Math.round(analysis.throughput.stability * 100)}%</td><td>${analysis.throughput.stability > 0.8 ? '✅ Stable' : '⚠️ Variable'}</td></tr>
                    <tr><td>Data Transferred</td><td>${Math.round(analysis.throughput.dataTransferred / 1024)} KB</td><td>ℹ️ Total</td></tr>
                </table>
            </div>
        </div>

        <!-- Resource Usage -->
        <div class="section">
            <div class="section-header">🔧 Resource Usage & Efficiency</div>
            <div class="section-content">
                <table>
                    <tr><th>Resource</th><th>Allocation</th><th>Efficiency</th></tr>
                    <tr><td>Memory</td><td>${analysis.resourceUsage.memoryUsage}</td><td>${analysis.resourceUsage.rating}</td></tr>
                    <tr><td>CPU</td><td>${analysis.resourceUsage.cpuUsage} cores</td><td>Score: ${analysis.resourceUsage.efficiency}</td></tr>
                    <tr><td>Concurrency</td><td>${analysis.loadProfile.totalUsers} users</td><td>${analysis.resourceUsage.concurrencyUtilization} req/user/s</td></tr>
                </table>
            </div>
        </div>

        <!-- Bottlenecks -->
        <div class="section">
            <div class="section-header">🔍 Bottleneck Analysis</div>
            <div class="section-content">
                <div class="bottleneck ${analysis.bottlenecks.count === 0 ? 'none' : ''}">
                    ${analysis.bottlenecks.count === 0 ? 
                        '<strong>✅ No significant bottlenecks identified</strong><br>Performance appears to be within acceptable ranges.' :
                        `<strong>⚠️ ${analysis.bottlenecks.count} bottleneck(s) identified:</strong><br>
                        ${analysis.bottlenecks.identified.map(b => `• ${b}`).join('<br>')}`
                    }
                </div>
            </div>
        </div>

        ${Object.keys(analysis.detailedStatistics || {}).filter(key => key !== 'Total').length > 0 ? `
        <!-- Detailed Statistics -->
        <div class="section">
            <div class="section-header">📈 Endpoint Performance</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Endpoint</th>
                        <th>Samples</th>
                        <th>Error Rate</th>
                        <th>Avg Response</th>
                        <th>Throughput</th>
                    </tr>
                    ${Object.entries(analysis.detailedStatistics).filter(([key]) => key !== 'Total').map(([endpoint, stats]) => `
                    <tr>
                        <td><strong>${endpoint}</strong></td>
                        <td>${stats.sampleCount}</td>
                        <td>${stats.errorPct}%</td>
                        <td>${Math.round(stats.meanResTime)}ms</td>
                        <td>${Math.round(stats.throughput * 100) / 100} req/s</td>
                    </tr>
                    `).join('')}
                </table>
            </div>
        </div>
        ` : ''}

        <!-- Recommendations -->
        <div class="recommendations">
            <h4>💡 Performance Recommendations</h4>
            <ul>
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>

    <script>
        // Response Time Trend Chart
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(responseTimeCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(analysis.trends.responseTimeProgression.map((_, i) => `${i * 5}s`))},
                datasets: [{
                    label: 'Response Time (ms)',
                    data: ${JSON.stringify(analysis.trends.responseTimeProgression.map(p => Math.round(p.avg)))},
                    borderColor: '#FF6B35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Response Time Progression Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });

        // Throughput Chart
        const throughputCtx = document.getElementById('throughputChart').getContext('2d');
        new Chart(throughputCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(analysis.trends.throughputProgression.map((_, i) => `${i * 5}s`))},
                datasets: [{
                    label: 'Throughput (req/s)',
                    data: ${JSON.stringify(analysis.trends.throughputProgression.map(p => Math.round(p.value * 100) / 100))},
                    backgroundColor: 'rgba(0, 123, 255, 0.6)',
                    borderColor: '#007bff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Throughput Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Requests per Second'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}

// Generate Markdown report
function generateMarkdownReport(analysis) {
  const timestamp = new Date().toISOString();
  
  return `# JMeter Performance Analysis Report

**Generated:** ${timestamp}  
**Test:** ${analysis.metadata.testName}  
**JMX File:** ${analysis.metadata.jmxFile}  

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total Samples** | ${analysis.metadata.totalSamples} | ℹ️ |
| **Success Rate** | ${analysis.statistics.successRate || 'N/A'}% | ${(analysis.statistics.successRate || 0) >= 99 ? '✅' : (analysis.statistics.successRate || 0) >= 95 ? '⚠️' : '❌'} |
| **Average Response Time** | ${analysis.responseTimes.avg}ms | ${analysis.responseTimes.avg < 1000 ? '✅' : analysis.responseTimes.avg < 3000 ? '⚠️' : '❌'} |
| **Peak Response Time** | ${analysis.responseTimes.max}ms | ${analysis.responseTimes.max < 5000 ? '✅' : '❌'} |
| **Throughput** | ${analysis.throughput.average} req/s | ${analysis.throughput.rating === 'Excellent' ? '✅' : analysis.throughput.rating === 'Good' ? '⚠️' : '❌'} |
| **Error Rate** | ${analysis.errors.rate}% | ${analysis.errors.rate === 0 ? '✅' : analysis.errors.rate < 1 ? '⚠️' : '❌'} |

## Load Profile Analysis

- **Classification:** ${analysis.loadProfile.classification}
- **Virtual Users:** ${analysis.loadProfile.totalUsers}
- **Test Duration:** ${analysis.loadProfile.duration}s
- **Average Concurrency:** ${analysis.loadProfile.avgConcurrency}
- **Peak Concurrency:** ${analysis.loadProfile.peakConcurrency}

## Response Time Analysis

| Percentile | Value |
|------------|-------|
| **Minimum** | ${analysis.responseTimes.min}ms |
| **Average** | ${analysis.responseTimes.avg}ms |
| **50th (Median)** | ${analysis.responseTimes.p50}ms |
| **90th** | ${analysis.responseTimes.p90}ms |
| **95th** | ${analysis.responseTimes.p95}ms |
| **99th** | ${analysis.responseTimes.p99}ms |
| **Maximum** | ${analysis.responseTimes.max}ms |

**Trend:** ${analysis.responseTimes.trend}  
**Variability:** ${analysis.responseTimes.variability}ms  
**Consistency Ratio:** ${Math.round(analysis.responseTimes.consistency * 100) / 100}

## Throughput Analysis

- **Average Throughput:** ${analysis.throughput.average} requests/second
- **Peak Throughput:** ${analysis.throughput.peak} requests/second  
- **Rating:** ${analysis.throughput.rating}
- **Stability:** ${Math.round(analysis.throughput.stability * 100)}%
- **Data Transferred:** ${Math.round(analysis.throughput.dataTransferred / 1024)} KB

## Error Analysis

- **Total Errors:** ${analysis.errors.total}
- **Error Rate:** ${analysis.errors.rate}%
- **Severity:** ${analysis.errors.severity}
- **Most Common Error:** ${analysis.errors.mostCommon}

${Object.keys(analysis.errors.types).length > 0 ? `
### Error Breakdown
${Object.entries(analysis.errors.types).map(([type, count]) => `- **${type}:** ${count} occurrences`).join('\n')}
` : ''}

## Resource Usage

- **Efficiency Rating:** ${analysis.resourceUsage.rating}
- **Efficiency Score:** ${analysis.resourceUsage.efficiency}
- **Memory Allocated:** ${analysis.resourceUsage.memoryUsage}
- **CPU Limit:** ${analysis.resourceUsage.cpuUsage} cores
- **Concurrency Utilization:** ${analysis.resourceUsage.concurrencyUtilization} req/user/s

## Bottleneck Analysis

${analysis.bottlenecks.count > 0 ? `
**${analysis.bottlenecks.count} bottleneck(s) identified:**

${analysis.bottlenecks.identified.map(bottleneck => `- ⚠️ ${bottleneck}`).join('\n')}

**Primary Bottleneck:** ${analysis.bottlenecks.primary}
` : '✅ No significant bottlenecks identified'}

## Recommendations

${analysis.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

## Detailed Statistics

${analysis.detailedStatistics ? Object.entries(analysis.detailedStatistics).filter(([key]) => key !== 'Total').map(([endpoint, stats]) => `
### ${endpoint}
- **Samples:** ${stats.sampleCount}
- **Error Rate:** ${stats.errorPct}%
- **Avg Response:** ${Math.round(stats.meanResTime)}ms
- **Throughput:** ${Math.round(stats.throughput * 100) / 100} req/s
`).join('') : 'Detailed statistics not available'}

---
*Report generated by JMeter MCP Server on ${timestamp}*
`;
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