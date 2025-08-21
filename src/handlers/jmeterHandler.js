import { JMXGenerator } from '../generators/jmxGenerator.js';
import { validateTestPlan } from '../utils/validator.js';
import { ApiSchemaHandler } from './apiSchemaHandler.js';
import { CorrelationHandler } from './correlationHandler.js';
import { TokenManager } from './tokenManager.js';
import { FileWriter } from '../utils/fileWriter.js';
import { AIValidationService } from '../ai/aiValidationService.js';

export class JMeterHandler {
  constructor() {
    this.jmxGenerator = new JMXGenerator();
    this.apiSchemaHandler = new ApiSchemaHandler();
    this.correlationHandler = new CorrelationHandler();
    this.tokenManager = new TokenManager();
    this.fileWriter = new FileWriter();
    this.aiValidationService = new AIValidationService();
    
    // Setup common correlation rules
    this.correlationHandler.setupCommonAuthCorrelations();
  }

  async generateJMeterScript(params) {
    try {
      // Validate input
      const validationResult = validateTestPlan(params);
      if (validationResult.error) {
        throw new Error(`Validation error: ${validationResult.error.message}`);
      }

      // Generate filename for JMX file
      const jmxFileName = this.fileWriter.generateFilename(params.testName, 'jmx');
      
      // Generate CSV filename if needed and update params
      let csvFileName = null;
      let updatedJmxContent = null;
      
      if (params.csvDataSet) {
        csvFileName = params.csvDataSet.fileName.endsWith('.csv') ? 
          params.csvDataSet.fileName : 
          params.csvDataSet.fileName + '.csv';
        
        // Write CSV file to sample_data directory
        const csvContent = this.generateCSVContent(params.csvDataSet);
        this.fileWriter.writeCSVFile(csvFileName, csvContent);
        
        // Update JMX to reference CSV with relative path
        const tempJmxContent = this.jmxGenerator.generate(params);
        updatedJmxContent = this.fileWriter.updateCSVReferencesInJMX(tempJmxContent, csvFileName);
      } else {
        // Generate JMX content without CSV references
        updatedJmxContent = this.jmxGenerator.generate(params);
      }

      // Write JMX file to output directory
      const jmxFilePath = this.fileWriter.writeJMXFile(jmxFileName, updatedJmxContent);

      // 🤖 AUTOMATIC AI VALIDATION AND ENHANCEMENT
      let aiValidationReport = '';
      let finalJMXContent = updatedJmxContent;
      let finalJMXPath = jmxFilePath;
      let enhancedJMXInfo = null;
      
      try {
        console.log('🤖 Running automatic AI validation...');
        
        // Run AI validation with auto-correction enabled
        const aiValidation = await this.aiValidationService.validateWithAI(updatedJmxContent, {
          mode: 'comprehensive',
          autoCorrect: true,
          outputToFile: false
        });
        
        // Check if enhancements were applied
        if (aiValidation.enhancedJmxContent && aiValidation.enhancedJmxContent !== updatedJmxContent) {
          console.log('✅ AI enhancements applied automatically');
          
          // Save the enhanced version as the final output
          const enhancedFileName = jmxFileName.replace('.jmx', '_ai_enhanced.jmx');
          const enhancedFilePath = this.fileWriter.writeJMXFile(enhancedFileName, aiValidation.enhancedJmxContent);
          
          // Update final content and path
          finalJMXContent = aiValidation.enhancedJmxContent;
          finalJMXPath = enhancedFilePath;
          
          enhancedJMXInfo = {
            enhancedFilePath,
            originalPath: jmxFilePath,
            enhancedFileName,
            originalFileName: jmxFileName
          };
        }
        
        // Generate comprehensive validation report
        const issuesFixed = aiValidation.issues.filter(issue => issue.corrected).length;
        const totalIssues = aiValidation.issues.length;
        
        aiValidationReport = `
🤖 **Automatic AI Validation & Enhancement Results**

**Performance Score:** ${aiValidation.performanceScore}/100
**Issues Analyzed:** ${totalIssues}
**Issues Auto-Fixed:** ${issuesFixed}
**Analysis Mode:** ${aiValidation.analysisMode}

${totalIssues > 0 ? `
**Issues Found:**
${aiValidation.issues.map((issue, index) => 
  `${index + 1}. **${issue.type}** ${issue.corrected ? '✅ FIXED' : '⚠️'}
   - ${issue.description}
   ${issue.corrected ? `   - Auto-applied: ${issue.correctionApplied}` : ''}
   - Severity: ${issue.severity}
   ${issue.line ? `- Line: ${issue.line}` : ''}`
).join('\n')}
` : '✅ No issues found - JMX file is well-structured!'}

${enhancedJMXInfo ? `
🚀 **Enhanced Version Created**
Your JMX file has been automatically improved and saved as the final output.
- Original: ${enhancedJMXInfo.originalFileName}
- Enhanced: ${enhancedJMXInfo.enhancedFileName} ← **Final Output**
` : ''}

${aiValidation.enhancements.length > 0 ? `
**Available Enhancements:**
${aiValidation.enhancements.map(enhancement => 
  `• ${enhancement.description} (${enhancement.impact})`
).join('\n')}
` : ''}`;

      } catch (aiError) {
        console.warn('⚠️ AI validation failed:', aiError.message);
        aiValidationReport = '\n⚠️ AI validation temporarily unavailable. JMX file generated successfully.';
      }

      // Prepare response content
      const content = [
        {
          type: 'text',
          text: `JMeter test script generated successfully for: ${params.testName}
          
📁 **Final Output File:**
• ${enhancedJMXInfo ? `Enhanced JMX: ${enhancedJMXInfo.enhancedFileName}` : `JMX File: ${jmxFileName}`} ← **Ready for use!**${csvFileName ? `\n• CSV File: ${this.fileWriter.getAbsoluteCSVPath(csvFileName)}` : ''}${enhancedJMXInfo ? `\n• Original JMX: ${enhancedJMXInfo.originalFileName} (for reference)` : ''}

✅ **AI-Enhanced and Ready for JMeter!**
${enhancedJMXInfo ? 'Your JMX file has been automatically optimized with AI enhancements.' : 'Your JMX file has been validated and is ready to use.'}

${aiValidationReport}`
        },
        {
          type: 'resource',
          resource: {
            name: enhancedJMXInfo ? enhancedJMXInfo.enhancedFileName : jmxFileName,
            mimeType: 'application/xml',
            blob: finalJMXContent
          }
        }
      ];

      // Include CSV file in response if generated
      if (params.csvDataSet && csvFileName) {
        const csvContent = this.generateCSVContent(params.csvDataSet);
        content.push({
          type: 'resource',
          resource: {
            name: csvFileName,
            mimeType: 'text/csv',
            blob: csvContent
          }
        });
      }

      // Add instructions
      content.push({
        type: 'text',
        text: this.generateInstructions(params)
      });

      // Return both the JMX content and instructions
      return {
        content: content
      };
    } catch (error) {
      throw new Error(`Failed to generate JMeter script: ${error.message}`);
    }
  }

  async generateFromApiSchema(params) {
    try {
      const { schemaUrl, endpoint, authConfig, testConfig } = params;
      
      // Parse API schema
      const apiData = await this.apiSchemaHandler.parseApiSchema(schemaUrl);
      
      // Find the requested endpoint
      let targetEndpoint;
      if (endpoint.operationId) {
        targetEndpoint = apiData.endpoints.find(ep => ep.operationId === endpoint.operationId);
      } else if (endpoint.path && endpoint.method) {
        targetEndpoint = apiData.endpoints.find(ep => 
          ep.path === endpoint.path && ep.method.toUpperCase() === endpoint.method.toUpperCase()
        );
      } else if (endpoint.tag) {
        const endpointsByTag = this.apiSchemaHandler.findEndpointByTag(apiData.endpoints, endpoint.tag);
        targetEndpoint = endpointsByTag[0]; // Take the first match
      }
      
      if (!targetEndpoint) {
        throw new Error(`Endpoint not found: ${JSON.stringify(endpoint)}`);
      }

      // Get authentication method
      const authMethod = (authConfig && authConfig.method) ? 
        apiData.authMethods.find(auth => auth.name === authConfig.method) : 
        apiData.authMethods[0]; // Use first available auth method

      if (!authMethod) {
        throw new Error('No authentication method found in API schema');
      }

      // Generate authentication request
      const authRequest = this.apiSchemaHandler.generateAuthenticationRequest(authMethod, authConfig ? authConfig.credentials : {});
      
      // Generate business request from endpoint
      const businessRequest = this.apiSchemaHandler.generateRequestFromEndpoint(targetEndpoint, authMethod, apiData.info.baseUrl);
      
      // Create correlated test sequence
      const requests = this.correlationHandler.generateTestSequence(authRequest, [businessRequest]);
      
      // Build test plan
      const testPlan = {
        testName: `${apiData.info.title} - ${targetEndpoint.summary || targetEndpoint.operationId}`,
        baseUrl: apiData.info.baseUrl,
        requests: requests,
        threadGroup: (testConfig && testConfig.threadGroup) ? testConfig.threadGroup : {
          numThreads: 10,
          rampUpTime: 30,
          loops: 5
        },
        csvDataSet: authConfig ? authConfig.csvDataSet : undefined
      };

      // Generate filename for JMX file
      const jmxFileName = this.fileWriter.generateFilename(testPlan.testName, 'jmx');
      
      // Generate CSV filename if needed and update JMX
      let csvFileName = null;
      let updatedJmxContent = null;
      
      if (testPlan.csvDataSet) {
        csvFileName = testPlan.csvDataSet.fileName.endsWith('.csv') ? 
          testPlan.csvDataSet.fileName : 
          testPlan.csvDataSet.fileName + '.csv';
        
        // Write CSV file to sample_data directory
        const csvContent = this.generateCSVContent(testPlan.csvDataSet);
        this.fileWriter.writeCSVFile(csvFileName, csvContent);
        
        // Update JMX to reference CSV with relative path
        const tempJmxContent = this.jmxGenerator.generate(testPlan);
        updatedJmxContent = this.fileWriter.updateCSVReferencesInJMX(tempJmxContent, csvFileName);
      } else {
        // Generate JMX content without CSV references
        updatedJmxContent = this.jmxGenerator.generate(testPlan);
      }

      // Write JMX file to output directory
      const jmxFilePath = this.fileWriter.writeJMXFile(jmxFileName, updatedJmxContent);

      const content = [
        {
          type: 'text',
          text: `JMeter test script generated from API schema: ${schemaUrl}
Target endpoint: ${targetEndpoint.method} ${targetEndpoint.path}
Authentication: ${authMethod.type} (${authMethod.name})

📁 **Files Created:**
• JMX File: ${jmxFilePath}${csvFileName ? `\n• CSV File: ${this.fileWriter.getAbsoluteCSVPath(csvFileName)}` : ''}

✅ Files are ready for use with JMeter!`
        },
        {
          type: 'resource',
          resource: {
            name: jmxFileName,
            mimeType: 'application/xml',
            blob: updatedJmxContent
          }
        }
      ];

      // Add CSV file if configured
      if (testPlan.csvDataSet && csvFileName) {
        const csvContent = this.generateCSVContent(testPlan.csvDataSet);
        content.push({
          type: 'resource',
          resource: {
            name: csvFileName,
            mimeType: 'text/csv',
            blob: csvContent
          }
        });
      }

      content.push({
        type: 'text',
        text: this.generateApiSchemaInstructions(testPlan, apiData, authMethod)
      });

      return { content };
    } catch (error) {
      throw new Error(`Failed to generate JMeter script from API schema: ${error.message}`);
    }
  }

  async generateInventreeTestPlan(params) {
    // Use the new generic API test generation with InvenTree-specific configuration
    return await this.generateApiTestWithTokens({
      apiType: 'inventree',
      baseUrl: params.baseUrl || 'https://demo.inventree.org',
      testName: 'InvenTree Purchase Order Test',
      businessRequests: [
        {
          name: 'Get Suppliers',
          method: 'GET',
          path: '/api/company/?is_supplier=true',
          headers: {
            'Accept': 'application/json'
          },
          extractors: [
            {
              variableName: 'supplier_id',
              jsonPath: '$[0].pk',
              defaultValue: '1'
            }
          ],
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            },
            {
              type: 'jsonPath',
              jsonPath: '$[0]'
            }
          ]
        },
        {
          name: 'Create Purchase Order',
          method: 'POST',
          path: '/api/order/po/',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            supplier: '${supplier_id}',
            reference: 'PO${__counter(TRUE,0001)}',
            description: 'Test Purchase Order - ${__time()}',
            target_date: '${__timeShift(yyyy-MM-dd,,P30D,)}'
          }, null, 2),
          extractors: [
            {
              variableName: 'purchase_order_id',
              jsonPath: '$.pk',
              defaultValue: 'NO_ID'
            },
            {
              variableName: 'purchase_order_reference',
              jsonPath: '$.reference',
              defaultValue: 'NO_REF'
            }
          ],
          assertions: [
            {
              type: 'responseCode',
              value: '201'
            },
            {
              type: 'jsonPath',
              jsonPath: '$.pk'
            }
          ]
        },
        {
          name: 'Get Purchase Order Details',
          method: 'GET',
          path: '/api/order/po/${purchase_order_id}/',
          headers: {
            'Accept': 'application/json'
          },
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            },
            {
              type: 'jsonPath',
              jsonPath: '$.pk'
            }
          ]
        },
        {
          name: 'Search Purchase Order by Reference',
          method: 'GET',
          path: '/api/order/po/?reference=${purchase_order_reference}',
          headers: {
            'Accept': 'application/json'
          },
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            },
            {
              type: 'jsonPath',
              jsonPath: '$.results[0].reference'
            }
          ]
        }
      ],
      threadGroup: {
        numThreads: params.numThreads || 5,
        rampUpTime: params.rampUpTime || 60,
        loops: params.loops || 3
      }
    });
  }

  /**
   * Generic method to generate API tests with token management
   * @param {Object} config - Configuration for API test generation
   * @returns {Object} Generated test files
   */
  async generateApiTestWithTokens(config) {
    try {
      const { 
        apiType, 
        baseUrl, 
        testName, 
        businessRequests = [], 
        threadGroup = {},
        customEndpoints = null,
        credentials = {}
      } = config;

      // Generate CSV configuration for the API type
      const csvConfig = this.tokenManager.generateCSVConfig(apiType, {
        fileName: `${apiType}_credentials.csv`
      });

      // Generate authentication flow with business requests
      const authFlowConfig = {
        apiType,
        baseUrl,
        businessRequests,
        customEndpoints,
        credentials
      };

      const allRequests = this.tokenManager.generateAuthFlow(authFlowConfig);

      // Build complete test plan
      const testPlan = {
        testName: testName || `${apiType.toUpperCase()} API Test`,
        baseUrl,
        requests: allRequests,
        threadGroup: {
          numThreads: threadGroup.numThreads || 5,
          rampUpTime: threadGroup.rampUpTime || 60,
          loops: threadGroup.loops || 3
        },
        csvDataSet: {
          fileName: csvConfig.fileName,
          variableNames: csvConfig.variableNames
        }
      };

      // Generate JMX and CSV content
      const result = await this.generateJMeterScript(testPlan);

      // Convert content format to files format for consistency
      const files = result.content.filter(item => item.type === 'resource').map(item => ({
        name: item.resource.name,
        content: item.resource.blob
      }));

      return { files };

    } catch (error) {
      throw new Error(`Failed to generate API test with tokens: ${error.message}`);
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   */
  async generateInventreeTestPlanLegacy(params) {
    try {
      // Configuration based on authentication method
      const authMethod = params.authMethod || 'dynamic'; // 'dynamic' or 'admin'
      
      // Try to use API schema first, fall back to manual configuration if not available
      let config;
      
      try {
        const inventreeSchema = 'https://demo.inventree.org/api/schema/';
        
        if (authMethod === 'admin') {
          // Use pre-created admin tokens
          config = {
            schemaUrl: inventreeSchema,
            endpoint: {
              tag: 'order',
              path: '/api/order/po/',
              method: 'POST'
            },
            authConfig: {
              method: 'admin_token',
              csvDataSet: {
                fileName: 'inventree_admin_tokens.csv',
                variableNames: 'username,api_token'
              }
            },
            testConfig: {
              threadGroup: {
                numThreads: params.numThreads || 5,
                rampUpTime: params.rampUpTime || 60,
                loops: params.loops || 3
              }
            }
          };
        } else {
          // Use dynamic token fetching (default)
          config = {
            schemaUrl: inventreeSchema,
            endpoint: {
              tag: 'order',
              path: '/api/order/po/',
              method: 'POST'
            },
            authConfig: {
              method: 'token',
              credentials: {
                username: '${username}',
                password: '${password}'
              },
              csvDataSet: {
                fileName: 'inventree_users.csv',
                variableNames: 'username,password'
              }
            },
            testConfig: {
              threadGroup: {
                numThreads: params.numThreads || 5,
                rampUpTime: params.rampUpTime || 60,
                loops: params.loops || 3
              }
            }
          };
        }
        
        return await this.generateFromApiSchema(config);
        
      } catch (schemaError) {
        console.log('Schema not available, using fallback manual configuration...');
        
        // Fallback to manual configuration based on auth method
        let fallbackConfig;
        
        if (authMethod === 'admin') {
          // Admin token authentication - no dynamic token fetching needed
          fallbackConfig = {
            testName: 'InvenTree Purchase Order Test (Admin Tokens)',
            baseUrl: params.baseUrl || 'https://demo.inventree.org',
            requests: [
              {
                name: 'Get Suppliers',
                method: 'GET',
                path: '/api/company/?is_supplier=true',
                headers: {
                  'Authorization': 'Token ${api_token}',
                  'Accept': 'application/json'
                },
                extractors: [
                  {
                    variableName: 'supplier_id',
                    jsonPath: '$.results[0].pk',
                    defaultValue: '1'
                  }
                ],
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.results'
                  }
                ]
              },
              {
                name: 'Create Purchase Order',
                method: 'POST',
                path: '/api/order/po/',
                headers: {
                  'Authorization': 'Token ${api_token}',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  supplier: '${supplier_id}',
                  reference: 'PO-ADMIN-${__time(yyyy-MM-dd)}-${__counter(FALSE,)}',
                  description: 'Test Purchase Order (Admin Token) - ${__time()}',
                  target_date: '${__timeShift(yyyy-MM-dd,,P30D,)}'
                }, null, 2),
                extractors: [
                  {
                    variableName: 'purchase_order_id',
                    jsonPath: '$.pk',
                    defaultValue: 'NO_ID'
                  },
                  {
                    variableName: 'purchase_order_reference',
                    jsonPath: '$.reference',
                    defaultValue: 'NO_REF'
                  }
                ],
                assertions: [
                  {
                    type: 'responseCode',
                    value: '201'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.pk'
                  }
                ]
              },
              {
                name: 'Get Purchase Order Details',
                method: 'GET',
                path: '/api/order/po/${purchase_order_id}/',
                headers: {
                  'Authorization': 'Token ${api_token}',
                  'Accept': 'application/json'
                },
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.pk'
                  }
                ]
              },
              {
                name: 'Search Purchase Order by Reference',
                method: 'GET',
                path: '/api/order/po/?reference=${purchase_order_reference}',
                headers: {
                  'Authorization': 'Token ${api_token}',
                  'Accept': 'application/json'
                },
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.results[0].reference'
                  }
                ]
              }
            ],
            threadGroup: {
              numThreads: params.numThreads || 5,
              rampUpTime: params.rampUpTime || 60,
              loops: params.loops || 3
            },
            csvDataSet: {
              fileName: 'inventree_admin_tokens.csv',
              variableNames: 'username,api_token'
            }
          };
        } else {
          // Dynamic token authentication (original method)
          fallbackConfig = {
            testName: 'InvenTree Purchase Order Test',
            baseUrl: params.baseUrl || 'https://demo.inventree.org',
            requests: [
              {
                name: 'Get Auth Token',
                method: 'POST',
                path: '/api/user/token/',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: '{"username": "${username}", "password": "${password}"}',
                extractors: [
                  {
                    variableName: 'inventree_token',
                    jsonPath: '$.token',
                    defaultValue: 'NO_TOKEN_FOUND'
                  }
                ],
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.token'
                  }
                ]
              },
              {
                name: 'Get Suppliers',
                method: 'GET',
                path: '/api/company/?is_supplier=true',
                headers: {
                  'Authorization': 'Token ${inventree_token}',
                  'Accept': 'application/json'
                },
                extractors: [
                  {
                    variableName: 'supplier_id',
                    jsonPath: '$.results[0].pk',
                    defaultValue: '1'
                  }
                ],
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  }
                ]
              },
              {
                name: 'Create Purchase Order',
                method: 'POST',
                path: '/api/order/po/',
                headers: {
                  'Authorization': 'Token ${inventree_token}',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  supplier: '${supplier_id}',
                  reference: 'PO-${__time(yyyy-MM-dd)}-${__counter(FALSE,)}',
                  description: 'Test Purchase Order - ${__time()}',
                  target_date: '${__timeShift(yyyy-MM-dd,,P30D,)}'
                }, null, 2),
                extractors: [
                  {
                    variableName: 'purchase_order_id',
                    jsonPath: '$.pk',
                    defaultValue: 'NO_ID'
                  },
                  {
                    variableName: 'purchase_order_reference',
                    jsonPath: '$.reference',
                    defaultValue: 'NO_REF'
                  }
                ],
                assertions: [
                  {
                    type: 'responseCode',
                    value: '201'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.pk'
                  }
                ]
              },
              {
                name: 'Get Purchase Order Details',
                method: 'GET',
                path: '/api/order/po/${purchase_order_id}/',
                headers: {
                  'Authorization': 'Token ${inventree_token}',
                  'Accept': 'application/json'
                },
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.pk'
                  }
                ]
              },
              {
                name: 'Search Purchase Order by Reference',
                method: 'GET',
                path: '/api/order/po/?reference=${purchase_order_reference}',
                headers: {
                  'Authorization': 'Token ${inventree_token}',
                  'Accept': 'application/json'
                },
                assertions: [
                  {
                    type: 'responseCode',
                    value: '200'
                  },
                  {
                    type: 'jsonPath',
                    jsonPath: '$.results[0].reference'
                  }
                ]
              }
            ],
            threadGroup: {
              numThreads: params.numThreads || 5,
              rampUpTime: params.rampUpTime || 60,
              loops: params.loops || 3
            },
            csvDataSet: {
              fileName: 'inventree_users.csv',
              variableNames: 'username,password'
            }
          };
        }
        
        const result = await this.generateJMeterScript(fallbackConfig);
        
        // Convert content format to files format for consistency
        const files = result.content.filter(item => item.type === 'resource').map(item => ({
          name: item.resource.name,
          content: item.resource.blob
        }));
        
        return { files };
      }
      
    } catch (error) {
      throw new Error(`Failed to generate InvenTree test plan: ${error.message}`);
    }
  }

  generateCSVContent(csvConfig) {
    // Generate sample CSV content based on the variable names
    const variables = csvConfig.variableNames.split(',').map(v => v.trim());
    let csvContent = variables.join(',') + '\n';
    
    // Check if this is a known API type pattern
    const fileName = csvConfig.fileName || '';
    let apiType = 'generic';
    
    if (fileName.includes('inventree')) {
      apiType = 'inventree';
    } else if (fileName.includes('oauth2')) {
      apiType = 'oauth2';
    } else if (fileName.includes('jwt')) {
      apiType = 'jwt';
    }

    // Try to use TokenManager for known API types
    try {
      const tokenConfig = this.tokenManager.generateCSVConfig(apiType);
      if (tokenConfig.variableNames === csvConfig.variableNames) {
        // Use TokenManager's sample data
        csvContent += tokenConfig.sampleData.join('\n') + '\n';
        return csvContent;
      }
    } catch (error) {
      // Fall back to original logic if TokenManager doesn't support this format
    }

    // Original logic for backward compatibility
    if (variables.includes('username') && variables.includes('password')) {
      // Authentication data for dynamic token fetching
      if (apiType === 'inventree') {
        // Real InvenTree demo credentials
        csvContent += 'allaccess,nolimits\n';
        csvContent += 'admin,inventree\n';
        csvContent += 'reader,readonly\n';
        csvContent += 'engineer,partsonly\n';
        csvContent += 'demo,demo123\n';
      } else {
        csvContent += 'admin,inventree\n';
        csvContent += 'demo,demo123\n';
        csvContent += 'test,testpass\n';
        csvContent += 'user1,password1\n';
        csvContent += 'user2,password2\n';
      }
    } else if (variables.includes('username') && variables.includes('api_token')) {
      // Admin token data - pre-created tokens
      csvContent += 'admin,9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b\n';
      csvContent += 'demo,8e13b2a0b0f1e8d8a4f4a4b4c4d4e4f4g4h4i4j\n';
      csvContent += 'test,7d12a1a0a0e1d7c7a3e3a3b3c3d3e3f3g3h3i3j\n';
      csvContent += 'user1,6c11a0a0a0d1c6b6a2d2a2b2c2d2e2f2g2h2i2j\n';
      csvContent += 'user2,5b10a0a0a0c1b5a5a1c1a1b1c1d1e1f1g1h1i1j\n';
    } else if (variables.includes('client_id') && variables.includes('client_secret')) {
      // OAuth2 credentials
      csvContent += 'demo_client,demo_secret,read write\n';
      csvContent += 'test_client,test_secret,read\n';
      csvContent += 'api_client,api_secret,admin\n';
      csvContent += 'mobile_client,mobile_secret,read write\n';
      csvContent += 'web_client,web_secret,read write delete\n';
    } else if (variables.includes('userId')) {
      // User ID data
      for (let i = 1; i <= 5; i++) {
        const row = variables.map(variable => {
          switch (variable.toLowerCase()) {
            case 'userid': return i.toString();
            case 'username': return `user${i}`;
            case 'email': return `user${i}@example.com`;
            case 'name': return `User ${i}`;
            default: return `value${i}`;
          }
        }).join(',');
        csvContent += row + '\n';
      }
    } else {
      // Generic data
      for (let i = 1; i <= 5; i++) {
        const row = variables.map((variable, index) => `${variable}${i}`).join(',');
        csvContent += row + '\n';
      }
    }
    
    return csvContent;
  }

  generateInstructions(params) {
    let instructions = '\n## Instructions:\n\n';
    instructions += '1. Save the JMX file to your desired location\n';
    instructions += `2. Open the file in JMeter GUI or run via command line: jmeter -n -t ${params.testName.replace(/\s+/g, '_').toLowerCase()}.jmx -l results.jtl\n`;
    
    if (params.csvDataSet) {
      instructions += `3. The CSV data file "${params.csvDataSet.fileName}" is automatically generated and included\n`;
      instructions += `   • Place the CSV file in the same directory as the JMX file\n`;
      instructions += `   • CSV contains sample data with columns: ${params.csvDataSet.variableNames}\n`;
      instructions += `   • Edit the CSV file with your actual test data as needed\n`;
    }
    
    instructions += '\n## Parameterization:\n';
    instructions += '- Variables can be referenced using ${variableName} syntax\n';
    if (params.csvDataSet) {
      instructions += '- CSV data set variables are automatically available in all samplers\n';
      instructions += '- Each thread/user will use a different row from the CSV file\n';
    }
    
    instructions += '\n## Correlation:\n';
    params.requests.forEach(request => {
      if (request.extractors && request.extractors.length > 0) {
        instructions += `\n### ${request.name}:\n`;
        request.extractors.forEach(extractor => {
          instructions += `- Extracts "${extractor.variableName}" using ${extractor.jsonPath ? 'JSON Path' : 'Regex'}\n`;
        });
      }
    });
    
    return instructions;
  }

  generateApiSchemaInstructions(testPlan, apiData, authMethod) {
    let instructions = '\n## API Schema Test Instructions:\n\n';
    instructions += `**API:** ${apiData.info.title} v${apiData.info.version}\n`;
    instructions += `**Base URL:** ${apiData.info.baseUrl}\n`;
    instructions += `**Authentication:** ${authMethod.type} (${authMethod.name})\n\n`;
    
    instructions += '### Setup:\n';
    instructions += '1. Save the JMX file to your local machine\n';
    instructions += '2. Create a CSV file with authentication credentials:\n\n';
    
    if (authMethod.type === 'oauth2') {
      instructions += '```csv\n';
      if (authMethod.flows?.clientCredentials) {
        instructions += 'client_id,client_secret,scope\n';
        instructions += 'your_client_id,your_client_secret,read write\n';
      } else if (authMethod.flows?.password) {
        instructions += 'username,password,client_id,client_secret\n';
        instructions += 'user@example.com,password123,client_id,client_secret\n';
      }
      instructions += '```\n\n';
    } else {
      instructions += '```csv\n';
      instructions += 'username,password\n';
      instructions += 'user@example.com,password123\n';
      instructions += '```\n\n';
    }
    
    instructions += '### Execution:\n';
    instructions += `3. Run: jmeter -n -t ${testPlan.testName.replace(/\s+/g, '_').toLowerCase()}.jmx -l results.jtl\n\n`;
    
    instructions += '### Test Flow:\n';
    testPlan.requests.forEach((request, index) => {
      instructions += `${index + 1}. **${request.name}**\n`;
      instructions += `   - Method: ${request.method}\n`;
      instructions += `   - Path: ${request.path}\n`;
      if (request.extractors && request.extractors.length > 0) {
        instructions += `   - Extracts: ${request.extractors.map(e => e.variableName).join(', ')}\n`;
      }
    });
    
    instructions += '\n### Token Correlation:\n';
    instructions += '- Authentication tokens are automatically extracted and reused\n';
    instructions += '- Variables like ${auth_token} are available for subsequent requests\n';
    instructions += '- Token extraction uses JSON Path: $.access_token or $.token\n';
    
    return instructions;
  }
}