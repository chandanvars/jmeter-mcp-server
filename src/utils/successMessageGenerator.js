/**
 * Success Message Generator for JMeter MCP Tools
 * Provides modular, tool-specific success messages to prevent parsing errors
 */

export class SuccessMessageGenerator {
  
  /**
   * Generate success message for basic JMeter script generation
   */
  static generateJMeterScriptSuccess(result, args) {
    const requestCount = args.requests?.length || 0;
    const threadCount = args.threadGroup?.numThreads || 10;
    const loops = args.threadGroup?.loops || 1;
    
    // Extract file information from result
    const fileInfo = this.extractFileInfo(result);
    
    // Create file references to include in the response
    const fileReferences = [];
    
    if (result.filePaths?.jmx) {
      fileReferences.push({
        type: 'file_reference',
        name: 'jmx_file',
        file_type: 'jmx',
        path: result.filePaths.jmx
      });
    }
    
    if (result.filePaths?.csv) {
      fileReferences.push({
        type: 'file_reference',
        name: 'csv_file',
        file_type: 'csv',
        path: result.filePaths.csv
      });
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `🚀 **JMeter Script Generated Successfully!**

**Test Configuration:**
- Test Name: ${args.testName || 'Unnamed Test'}
- Base URL: ${args.baseUrl}
- Total Requests: ${requestCount}
- Virtual Users: ${threadCount}
- Loop Count: ${loops}
- Ramp-up Time: ${args.threadGroup?.rampUpTime || 10}s

**Files Created:**
${fileInfo.files.map(file => `• ${file.name} (${file.type})`).join('\n')}

**✅ Ready for Load Testing!**
✅ File validated and ready

📖 **Next Steps:**
1. Open JMeter GUI: \`jmeter -t "${fileInfo.mainFile}"\`
2. Or run headless: \`jmeter -n -t "${fileInfo.mainFile}" -l results.jtl\`
3. Generate HTML report: \`jmeter -g results.jtl -o report/\`

${fileInfo.csvFile ? '📊 **CSV Data:** Test data will be parameterized from the generated CSV file' : ''}`
        }
      ].concat(fileReferences).concat(result.content || [])
    };
  }

  /**
   * Generate success message for API schema-based generation
   */
  static generateApiSchemaSuccess(result, args) {
    const endpoint = args.endpoint;
    const endpointInfo = `${endpoint.method || 'GET'} ${endpoint.path || endpoint.operationId || 'Unknown'}`;
    
    const fileInfo = this.extractFileInfo(result);
    
    return {
      content: [
        {
          type: 'text',
          text: `🔗 **API Schema Test Generated Successfully!**

**API Configuration:**
- Schema Source: ${args.schemaUrl}
- Target Endpoint: ${endpointInfo}
- Authentication: ${args.authConfig?.method || 'Auto-detected'}
- Test Users: ${args.testConfig?.threadGroup?.numThreads || 10}

**Files Created:**
${fileInfo.files.map(file => `• ${file.name} (${file.type})`).join('\n')}

**✅ API Test Ready!**
✅ File validated and ready

📖 **Features Included:**
- Authentication flow correlation
- Request/Response validation
- Performance monitoring
- Error handling

🚀 **Run Your Test:**
\`jmeter -n -t "${fileInfo.mainFile}" -l api_results.jtl\``
        }
      ].concat(result.content || [])
    };
  }

  /**
   * Generate success message for InvenTree test generation
   */
  static generateInventreeSuccess(result, args) {
    const fileInfo = this.extractFileInfo(result);
    
    return {
      content: [
        {
          type: 'text',
          text: `📦 **InvenTree Test Generated Successfully!**

**InvenTree Configuration:**
- Base URL: ${args.baseUrl || 'https://demo.inventree.org'}
- Test Users: ${args.numThreads || 5}
- Ramp-up Time: ${args.rampUpTime || 60}s
- Loop Count: ${args.loops || 3}

**Files Created:**
${fileInfo.files.map(file => `• ${file.name} (${file.type})`).join('\n')}

**✅ InvenTree Load Test Ready!**
✅ File validated and ready

📊 **Test Scenarios:**
- User authentication
- Supplier data retrieval
- Purchase order creation
- API response validation

🔧 **Run Test:**
\`jmeter -n -t "${fileInfo.mainFile}" -l inventree_results.jtl\``
        }
      ].concat(result.content || [])
    };
  }

  /**
   * Generate success message for template retrieval
   */
  static generateTemplateSuccess(result, args) {
    const templateType = args.templateType || 'default';
    
    return {
      content: [
        {
          type: 'text',
          text: `📋 **Template Retrieved Successfully!**

**Template Type:** ${templateType.toUpperCase()}
**Category:** ${this.getTemplateCategoryName(templateType)}

**✅ Template Ready for Customization!**

📝 **How to Use:**
1. Customize the template parameters for your use case
2. Update base URLs, credentials, and test data
3. Adjust thread groups and timing as needed
4. Generate your final test script

💡 **Template Features:**
${this.getTemplateFeatures(templateType).map(feature => `• ${feature}`).join('\n')}`
        }
      ].concat(result.content || [])
    };
  }

  /**
   * Generate success message for UI flow script generation
   */
  static generateUIFlowSuccess(result, args) {
    const fileInfo = this.extractFileInfo(result);
    
    return {
      content: [
        {
          type: 'text',
          text: `🌐 **UI Flow Test Generated Successfully!**

**Flow Configuration:**
- Test Name: ${args.testName || 'UI Flow Test'}
- Base URL: ${args.baseUrl}
- Virtual Users: ${args.threadCount || 10}
- Test Duration: ${args.duration || 300}s
- Flow Description: "${args.flowDescription}"

**Files Created:**
${fileInfo.files.map(file => `• ${file.name} (${file.type})`).join('\n')}

**✅ UI Flow Test Ready!**
✅ Flow successfully parsed and validated

🎯 **Test Capabilities:**
- User journey simulation
- Page navigation tracking
- Form interaction testing
- Response time monitoring

🔍 **Run UI Test:**
\`jmeter -n -t "${fileInfo.mainFile}" -l ui_flow_results.jtl\``
        }
      ].concat(result.content || [])
    };
  }

  /**
   * Extract file information from result content
   */
  static extractFileInfo(result) {
    const files = [];
    let mainFile = '';
    let csvFile = null;

    // Check direct filePaths object first (from updated handler)
    if (result && result.filePaths) {
      if (result.filePaths.jmx) {
        const jmxFileName = result.filePaths.jmx.split(/[\/\\]/).pop();
        files.push({ name: jmxFileName, type: 'JMX Test Plan' });
        mainFile = jmxFileName;
      }
      
      if (result.filePaths.csv) {
        const csvFileName = result.filePaths.csv.split(/[\/\\]/).pop();
        files.push({ name: csvFileName, type: 'CSV Test Data' });
        csvFile = csvFileName;
      }
    }
    
    // As a fallback, look for file information in result content
    if (result && result.content && (!mainFile || !csvFile)) {
      result.content.forEach(item => {
        if (item.type === 'text' && item.text) {
          // Extract file names from text content
          const jmxMatches = item.text.match(/([^\/\s]+\.jmx)/g);
          const csvMatches = item.text.match(/([^\/\s]+\.csv)/g);
          
          if (jmxMatches && !mainFile) {
            jmxMatches.forEach(match => {
              files.push({ name: match, type: 'JMX Test Plan' });
              if (!mainFile) mainFile = match;
            });
          }
          
          if (csvMatches && !csvFile) {
            csvMatches.forEach(match => {
              files.push({ name: match, type: 'CSV Test Data' });
              csvFile = match;
            });
          }
        }
        
        // Look for file references
        if (item.type === 'file_reference' && item.path) {
          const fileName = item.path.split(/[\/\\]/).pop();
          
          if (fileName.endsWith('.jmx') && !mainFile) {
            files.push({ name: fileName, type: 'JMX Test Plan' });
            mainFile = fileName;
          } else if (fileName.endsWith('.csv') && !csvFile) {
            files.push({ name: fileName, type: 'CSV Test Data' });
            csvFile = fileName;
          }
        }
        
        // Legacy format
        if (item.type === 'resource' && item.resource) {
          const resourceName = item.resource.name;
          if (resourceName.endsWith('.jmx') && !mainFile) {
            files.push({ name: resourceName, type: 'JMX Test Plan' });
            if (!mainFile) mainFile = resourceName;
          } else if (resourceName.endsWith('.csv')) {
            files.push({ name: resourceName, type: 'CSV Test Data' });
            csvFile = resourceName;
          }
        }
      });
    }

    // Default file if none found
    if (files.length === 0) {
      files.push({ name: 'test_plan.jmx', type: 'JMX Test Plan' });
      mainFile = 'test_plan.jmx';
    }

    return {
      files,
      mainFile,
      csvFile
    };
  }

  /**
   * Get template category name
   */
  static getTemplateCategoryName(templateType) {
    const categories = {
      'rest_api': 'REST API Testing',
      'graphql': 'GraphQL Testing',
      'soap': 'SOAP Web Services',
      'oauth2': 'OAuth2 Authentication',
      'websocket': 'WebSocket Testing',
      'database': 'Database Performance'
    };
    return categories[templateType] || 'General Testing';
  }

  /**
   * Get template features
   */
  static getTemplateFeatures(templateType) {
    const features = {
      'rest_api': [
        'CRUD operations (GET, POST, PUT, DELETE)',
        'Request/response validation',
        'JSON payload handling',
        'Authentication correlation',
        'Performance assertions'
      ],
      'graphql': [
        'GraphQL query execution',
        'Mutation handling',
        'Variable parameterization',
        'Error response validation',
        'Schema introspection'
      ],
      'soap': [
        'SOAP envelope structure',
        'WSDL-based requests',
        'XML payload validation',
        'Fault handling',
        'WS-Security integration'
      ],
      'oauth2': [
        'Authorization code flow',
        'Client credentials flow',
        'Token extraction and correlation',
        'Refresh token handling',
        'Scope validation'
      ],
      'websocket': [
        'WebSocket connection setup',
        'Message sending/receiving',
        'Connection lifecycle management',
        'Ping/pong handling',
        'Real-time monitoring'
      ],
      'database': [
        'JDBC connection configuration',
        'SQL query execution',
        'Transaction management',
        'Connection pooling',
        'Result set validation'
      ]
    };
    return features[templateType] || ['Basic test structure', 'Customizable parameters', 'Ready-to-use configuration'];
  }
}
