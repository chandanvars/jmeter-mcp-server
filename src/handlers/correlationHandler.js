export class CorrelationHandler {
  constructor() {
    this.correlationRules = new Map();
    this.extractors = new Map();
  }

  addCorrelationRule(name, config) {
    this.correlationRules.set(name, {
      extractorType: config.extractorType || 'json', // json, regex, xpath
      extractorExpression: config.extractorExpression,
      variableName: config.variableName,
      defaultValue: config.defaultValue || '',
      scope: config.scope || 'global', // global, thread, test
      template: config.template || null,
      description: config.description || ''
    });
  }

  createJSONExtractor(config) {
    return {
      name: `JSON Extractor - ${config.variableName}`,
      testclass: 'JSONPostProcessor',
      guiclass: 'JSONPostProcessorGui',
      enabled: 'true',
      properties: {
        'JSONPostProcessor.referenceNames': config.variableName,
        'JSONPostProcessor.jsonPathExprs': config.extractorExpression,
        'JSONPostProcessor.defaultValues': config.defaultValue,
        'JSONPostProcessor.match_numbers': '1',
        'JSONPostProcessor.compute_concat': 'false'
      }
    };
  }

  createRegexExtractor(config) {
    return {
      name: `RegEx Extractor - ${config.variableName}`,
      testclass: 'RegexExtractor',
      guiclass: 'RegexExtractorGui',
      enabled: 'true',
      properties: {
        'RegexExtractor.useHeaders': 'false',
        'RegexExtractor.refname': config.variableName,
        'RegexExtractor.regex': config.extractorExpression,
        'RegexExtractor.template': config.template || '$1$',
        'RegexExtractor.default': config.defaultValue,
        'RegexExtractor.match_number': '1'
      }
    };
  }

  createXPathExtractor(config) {
    return {
      name: `XPath Extractor - ${config.variableName}`,
      testclass: 'XPathExtractor',
      guiclass: 'XPathExtractorGui',
      enabled: 'true',
      properties: {
        'XPathExtractor.refname': config.variableName,
        'XPathExtractor.xpathQuery': config.extractorExpression,
        'XPathExtractor.default': config.defaultValue,
        'XPathExtractor.tolerant': 'false',
        'XPathExtractor.namespace': 'false',
        'XPathExtractor.validate': 'false',
        'XPathExtractor.whitespace': 'false',
        'XPathExtractor.fragment': 'false',
        'XPathExtractor.matchNumber': '1'
      }
    };
  }

  getExtractorConfig(ruleName) {
    return this.correlationRules.get(ruleName);
  }

  generateExtractor(ruleName) {
    const config = this.correlationRules.get(ruleName);
    if (!config) {
      throw new Error(`Correlation rule '${ruleName}' not found`);
    }

    switch (config.extractorType.toLowerCase()) {
      case 'json':
        return this.createJSONExtractor(config);
      case 'regex':
        return this.createRegexExtractor(config);
      case 'xpath':
        return this.createXPathExtractor(config);
      default:
        throw new Error(`Unsupported extractor type: ${config.extractorType}`);
    }
  }

  // Pre-defined correlation rules for common authentication patterns
  setupCommonAuthCorrelations() {
    // OAuth2 Token Extraction
    this.addCorrelationRule('oauth2_access_token', {
      extractorType: 'json',
      extractorExpression: '$.access_token',
      variableName: 'auth_token',
      defaultValue: 'NO_TOKEN_FOUND',
      description: 'Extracts OAuth2 access token from response'
    });

    this.addCorrelationRule('oauth2_refresh_token', {
      extractorType: 'json',
      extractorExpression: '$.refresh_token',
      variableName: 'refresh_token',
      defaultValue: '',
      description: 'Extracts OAuth2 refresh token from response'
    });

    // JWT Token Extraction
    this.addCorrelationRule('jwt_token', {
      extractorType: 'json',
      extractorExpression: '$.token',
      variableName: 'jwt_token',
      defaultValue: 'NO_TOKEN_FOUND',
      description: 'Extracts JWT token from response'
    });

    // Session ID Extraction
    this.addCorrelationRule('session_id', {
      extractorType: 'json',
      extractorExpression: '$.sessionId',
      variableName: 'session_id',
      defaultValue: '',
      description: 'Extracts session ID from response'
    });

    // API Key Extraction
    this.addCorrelationRule('api_key', {
      extractorType: 'json',
      extractorExpression: '$.apiKey',
      variableName: 'api_key',
      defaultValue: '',
      description: 'Extracts API key from response'
    });

    // User ID Extraction
    this.addCorrelationRule('user_id', {
      extractorType: 'json',
      extractorExpression: '$.userId',
      variableName: 'user_id',
      defaultValue: '',
      description: 'Extracts user ID from response'
    });

    // CSRF Token Extraction
    this.addCorrelationRule('csrf_token', {
      extractorType: 'regex',
      extractorExpression: 'name="_token" value="([^"]+)"',
      variableName: 'csrf_token',
      template: '$1$',
      defaultValue: '',
      description: 'Extracts CSRF token from HTML form'
    });

    // InvenTree specific tokens
    this.addCorrelationRule('inventree_token', {
      extractorType: 'json',
      extractorExpression: '$.token',
      variableName: 'inventree_token',
      defaultValue: 'NO_TOKEN_FOUND',
      description: 'Extracts InvenTree authentication token'
    });
  }

  generateCorrelatedRequest(baseRequest, correlationRules = []) {
    const request = { ...baseRequest };
    
    // Add extractors for correlation
    if (correlationRules.length > 0) {
      request.extractors = correlationRules.map(ruleName => {
        const config = this.getExtractorConfig(ruleName);
        return {
          variableName: config.variableName,
          jsonPath: config.extractorType === 'json' ? config.extractorExpression : null,
          regex: config.extractorType === 'regex' ? config.extractorExpression : null,
          xpath: config.extractorType === 'xpath' ? config.extractorExpression : null,
          template: config.template,
          defaultValue: config.defaultValue
        };
      });
    }

    return request;
  }

  createParameterizedRequest(template, variables = {}) {
    let requestBody = template.body;
    let requestPath = template.path;
    let requestHeaders = { ...template.headers };

    // Replace variables in body
    if (requestBody) {
      Object.entries(variables).forEach(([key, value]) => {
        const variablePattern = new RegExp(`\\$\\{${key}\\}`, 'g');
        requestBody = requestBody.replace(variablePattern, value);
      });
    }

    // Replace variables in path
    Object.entries(variables).forEach(([key, value]) => {
      const variablePattern = new RegExp(`\\$\\{${key}\\}`, 'g');
      requestPath = requestPath.replace(variablePattern, value);
    });

    // Replace variables in headers
    Object.entries(requestHeaders).forEach(([headerName, headerValue]) => {
      Object.entries(variables).forEach(([key, value]) => {
        const variablePattern = new RegExp(`\\$\\{${key}\\}`, 'g');
        requestHeaders[headerName] = headerValue.replace(variablePattern, value);
      });
    });

    return {
      ...template,
      path: requestPath,
      body: requestBody,
      headers: requestHeaders
    };
  }

  generateTestSequence(authRequest, businessRequests, correlationChain = []) {
    const sequence = [];

    // Add authentication request with token extraction
    const authWithExtraction = this.generateCorrelatedRequest(authRequest, ['oauth2_access_token', 'jwt_token', 'inventree_token']);
    sequence.push(authWithExtraction);

    // Add business requests with token usage
    businessRequests.forEach(request => {
      const authenticatedRequest = { ...request };
      
      // Ensure Authorization header uses extracted token
      if (!authenticatedRequest.headers) {
        authenticatedRequest.headers = {};
      }
      
      // Add token to Authorization header if not already present
      if (!authenticatedRequest.headers['Authorization']) {
        authenticatedRequest.headers['Authorization'] = 'Bearer ${auth_token}';
      }

      // Apply any additional correlation rules
      const correlatedRequest = this.generateCorrelatedRequest(authenticatedRequest, correlationChain);
      sequence.push(correlatedRequest);
    });

    return sequence;
  }

  generateCSVDataForAuth(authType = 'basic', count = 10) {
    const csvData = [];
    
    switch (authType) {
      case 'oauth2_client_credentials':
        csvData.push('client_id,client_secret,scope');
        for (let i = 1; i <= count; i++) {
          csvData.push(`client_${i},secret_${i},read write`);
        }
        break;
      
      case 'oauth2_password':
        csvData.push('username,password,client_id,client_secret');
        for (let i = 1; i <= count; i++) {
          csvData.push(`user${i}@example.com,password${i},client_id,client_secret`);
        }
        break;
      
      case 'basic':
        csvData.push('username,password');
        for (let i = 1; i <= count; i++) {
          csvData.push(`user${i}@example.com,password${i}`);
        }
        break;
      
      default:
        csvData.push('username,password');
        csvData.push('testuser@example.com,testpassword');
    }

    return csvData.join('\n');
  }
}
