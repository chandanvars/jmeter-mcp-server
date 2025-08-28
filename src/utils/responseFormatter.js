/**
 * Response Formatter for JMeter MCP Tools
 * Ensures consistent response structure and prevents parsing errors
 */

export class ResponseFormatter {
  
  /**
   * Format a successful tool response with validation
   */
  static formatSuccess(toolName, result, args, logMessage = null) {
    try {
      // Log success message if provided
      if (logMessage) {
        console.error(logMessage);
      }
      
      // Validate result structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid result structure from handler');
      }
      
      // Ensure content array exists
      if (!result.content || !Array.isArray(result.content)) {
        // Create a basic content structure if missing
        result.content = [
          {
            type: 'text',
            text: `✅ ${toolName} completed successfully`
          }
        ];
      }
      
      // Validate each content item
      result.content = result.content.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn(`Warning: Invalid content item ${index} in ${toolName} response`);
          return {
            type: 'text',
            text: 'Content item unavailable'
          };
        }
        
        // Ensure type property exists
        if (!item.type) {
          item.type = 'text';
        }
        
        // Validate text content
        if (item.type === 'text' && !item.text) {
          item.text = 'Content unavailable';
        }
        
        // Validate resource content
        if (item.type === 'resource') {
          if (!item.resource) {
            console.warn(`Warning: Resource content missing in ${toolName} response`);
            return {
              type: 'text',
              text: 'Resource content unavailable'
            };
          }
          
          // Ensure resource has required properties
          if (!item.resource.name) {
            item.resource.name = 'output_file';
          }
          if (!item.resource.mimeType) {
            item.resource.mimeType = 'text/plain';
          }
        }
        
        return item;
      });
      
      // Add metadata for debugging
      result._metadata = {
        toolName,
        timestamp: new Date().toISOString(),
        validated: true,
        contentCount: result.content.length
      };
      
      return result;
      
    } catch (error) {
      console.error(`Error formatting ${toolName} response: ${error.message}`);
      
      // Return a safe fallback response
      return {
        content: [
          {
            type: 'text',
            text: `✅ ${toolName} completed successfully\n\n⚠️ Response formatting issue detected. Operation completed but display may be limited.\n\nError: ${error.message}`
          }
        ],
        _metadata: {
          toolName,
          timestamp: new Date().toISOString(),
          validated: false,
          error: error.message
        }
      };
    }
  }
  
  /**
   * Format an error response with consistent structure
   */
  static formatError(toolName, error, args = {}) {
    console.error(`❌ Error executing tool '${toolName}': ${error.message}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error in ${toolName}**\n\n${error.message}\n\n**Parameters received:**\n${JSON.stringify(args, null, 2)}\n\n**Troubleshooting:**\n${this.getTroubleshootingTips(toolName)}`
        }
      ],
      isError: true,
      _metadata: {
        toolName,
        timestamp: new Date().toISOString(),
        error: error.message,
        args: Object.keys(args)
      }
    };
  }
  
  /**
   * Get tool-specific troubleshooting tips
   */
  static getTroubleshootingTips(toolName) {
    const tips = {
      'generate_jmeter_script': [
        'Check that all required parameters are provided (testName, baseUrl, requests)',
        'Ensure requests array contains valid HTTP methods',
        'Verify JSON syntax in request bodies',
        'Check that baseUrl is a valid URL format'
      ],
      'generate_from_api_schema': [
        'Ensure the schema URL is accessible and returns valid OpenAPI/Swagger JSON',
        'Check that the endpoint specification is correct',
        'Verify authentication configuration if provided',
        'Ensure the API schema contains the requested endpoint'
      ],
      'generate_inventree_test': [
        'Check that the InvenTree baseUrl is accessible',
        'Verify thread group parameters are valid numbers',
        'Ensure the InvenTree API is available'
      ],
      'get_templates': [
        'Check that templateType is one of: rest_api, graphql, soap, oauth2, websocket, database',
        'Verify the template system is properly initialized'
      ],
      'generate_ui_flow_script': [
        'Ensure flowDescription is a clear, detailed description',
        'Check that baseUrl is a valid web application URL',
        'Verify thread configuration parameters',
        'Use common action terms like: click, fill, navigate, wait'
      ],

    };
    
    return tips[toolName]?.map(tip => `- ${tip}`).join('\n') || 
           '- Check that all required parameters are provided\n- Ensure URLs are valid and accessible\n- Verify input data format and structure';
  }
  
  /**
   * Enhance result with additional metadata and validation
   */
  static enhanceResult(result, toolName, args) {
    if (!result || typeof result !== 'object') {
      return this.formatError(toolName, new Error('Invalid result from handler'), args);
    }
    
    // Add enhanced success indicators
    if (result.content && Array.isArray(result.content)) {
      // Add a summary header to the first text content
      const firstTextIndex = result.content.findIndex(item => item.type === 'text');
      if (firstTextIndex >= 0) {
        const originalText = result.content[firstTextIndex].text || '';
        
        // Add tool execution summary
        result.content[firstTextIndex].text = this.addExecutionSummary(toolName, args) + '\n\n' + originalText;
      }
    }
    
    return result;
  }
  
  /**
   * Add execution summary to response
   */
  static addExecutionSummary(toolName, args) {
    const summaries = {
      'generate_jmeter_script': `🎯 **JMeter Script Generation**\nTool: ${toolName}\nTest: ${args.testName || 'Unnamed'}\nRequests: ${args.requests?.length || 0}\nUsers: ${args.threadGroup?.numThreads || 10}`,
      'generate_from_api_schema': `🔗 **API Schema Generation**\nTool: ${toolName}\nSchema: ${args.schemaUrl}\nEndpoint: ${args.endpoint?.path || 'Auto-selected'}`,
      'generate_inventree_test': `📦 **InvenTree Test Generation**\nTool: ${toolName}\nBase URL: ${args.baseUrl || 'Default'}\nUsers: ${args.numThreads || 5}`,
      'get_templates': `📋 **Template Retrieval**\nTool: ${toolName}\nType: ${args.templateType || 'default'}`,
      'generate_ui_flow_script': `🌐 **UI Flow Generation**\nTool: ${toolName}\nTest: ${args.testName || 'UI Flow'}\nUsers: ${args.threadCount || 10}`
    };
    
    return summaries[toolName] || `✅ **${toolName}**\nTool executed successfully`;
  }
}
