export class TokenManager {
  constructor() {
    this.tokenEndpoints = {
      // InvenTree token endpoints
      inventree: {
        create: '/api/user/token/',
        list: '/api/user/token/',
        delete: '/api/user/token/{token}/',
        authMethod: 'basic' // username:password
      },
      // Generic OAuth2 endpoints
      oauth2: {
        create: '/oauth/token',
        refresh: '/oauth/token',
        revoke: '/oauth/revoke',
        authMethod: 'client_credentials'
      },
      // JWT endpoints
      jwt: {
        create: '/auth/login',
        refresh: '/auth/refresh',
        verify: '/auth/verify',
        authMethod: 'json_body'
      }
    };
  }

  /**
   * Generate token creation request for any API type
   * @param {Object} config - Token configuration
   * @param {string} config.apiType - Type of API (inventree, oauth2, jwt, custom)
   * @param {string} config.baseUrl - Base URL of the API
   * @param {Object} config.credentials - Authentication credentials
   * @param {Object} config.customEndpoints - Custom endpoints if apiType is 'custom'
   * @returns {Object} JMeter request configuration
   */
  generateTokenCreationRequest(config) {
    const { apiType, baseUrl, credentials, customEndpoints } = config;
    
    // Get endpoint configuration
    const endpoints = customEndpoints || this.tokenEndpoints[apiType];
    if (!endpoints) {
      throw new Error(`Unsupported API type: ${apiType}. Use 'custom' with customEndpoints.`);
    }

    const request = {
      name: 'Create/Fetch Authentication Token',
      method: 'POST',
      path: endpoints.create,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      extractors: [],
      assertions: []
    };

    // Configure authentication based on method
    switch (endpoints.authMethod) {
      case 'basic':
        // Basic authentication (InvenTree style) - Use BeanShell PreProcessor for proper encoding
        request.method = 'GET'; // InvenTree uses GET for token retrieval
        // We'll add a BeanShell PreProcessor to handle base64 encoding properly
        request.preProcessor = {
          type: 'beanshell',
          script: `
            String username = vars.get("username");
            String password = vars.get("password");
            String credentials = username + ":" + password;
            String encodedCredentials = new String(org.apache.commons.codec.binary.Base64.encodeBase64(credentials.getBytes()));
            vars.put("auth_header", "Basic " + encodedCredentials);
          `
        };
        request.headers['Authorization'] = '${auth_header}';
        request.extractors.push({
          variableName: 'auth_token',
          jsonPath: '$.token',
          defaultValue: 'NO_TOKEN_FOUND'
        });
        break;

      case 'json_body':
        // JSON body authentication (JWT style)
        request.body = JSON.stringify({
          username: '${username}',
          password: '${password}'
        });
        request.extractors.push({
          variableName: 'auth_token',
          jsonPath: '$.access_token',
          defaultValue: 'NO_TOKEN_FOUND'
        });
        break;

      case 'client_credentials':
        // OAuth2 client credentials
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.body = 'grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}&scope=${scope}';
        request.extractors.push({
          variableName: 'auth_token',
          jsonPath: '$.access_token',
          defaultValue: 'NO_TOKEN_FOUND'
        });
        break;

      case 'custom':
        // Custom authentication - use provided configuration
        if (credentials.body) {
          request.body = credentials.body;
        }
        if (credentials.headers) {
          Object.assign(request.headers, credentials.headers);
        }
        if (credentials.extractors) {
          request.extractors.push(...credentials.extractors);
        }
        break;
    }

    // Add standard assertions
    request.assertions.push(
      {
        type: 'responseCode',
        value: '200'
      },
      {
        type: 'jsonPath',
        jsonPath: request.extractors[0]?.jsonPath || '$.token'
      }
    );

    return request;
  }

  /**
   * Generate token usage headers for API requests
   * @param {string} apiType - Type of API
   * @param {string} tokenVariable - Variable name containing the token
   * @returns {Object} Headers object
   */
  generateTokenHeaders(apiType, tokenVariable = 'auth_token') {
    const headers = {};

    switch (apiType) {
      case 'inventree':
        headers['Authorization'] = `Token \${${tokenVariable}}`;
        break;
      
      case 'oauth2':
      case 'jwt':
        headers['Authorization'] = `Bearer \${${tokenVariable}}`;
        break;
      
      default:
        // Generic bearer token
        headers['Authorization'] = `Bearer \${${tokenVariable}}`;
    }

    return headers;
  }

  /**
   * Generate CSV configuration for different authentication types
   * @param {string} apiType - Type of API
   * @param {Object} options - Additional options
   * @returns {Object} CSV configuration
   */
  generateCSVConfig(apiType, options = {}) {
    const config = {
      fileName: `${apiType}_credentials.csv`,
      variableNames: '',
      sampleData: []
    };

    switch (apiType) {
      case 'inventree':
        config.variableNames = 'username,password';
        config.sampleData = [
          'allaccess,nolimits',  // Real InvenTree demo credentials
          'admin,inventree',
          'reader,readonly',
          'engineer,partsonly'
        ];
        break;

      case 'oauth2':
        config.variableNames = 'client_id,client_secret,scope';
        config.sampleData = [
          'demo_client,demo_secret,read write',
          'test_client,test_secret,read',
          'api_client,api_secret,admin'
        ];
        break;

      case 'jwt':
        config.variableNames = 'username,password';
        config.sampleData = [
          'user@example.com,password123',
          'admin@example.com,admin123',
          'test@example.com,test123'
        ];
        break;

      default:
        config.variableNames = 'username,password';
        config.sampleData = [
          'user1,pass1',
          'user2,pass2',
          'user3,pass3'
        ];
    }

    if (options.fileName) {
      config.fileName = options.fileName;
    }

    return config;
  }

  /**
   * Generate complete authentication flow for any API
   * @param {Object} config - Authentication flow configuration
   * @returns {Array} Array of JMeter requests
   */
  generateAuthFlow(config) {
    const { apiType, baseUrl, businessRequests = [], tokenVariable = 'auth_token' } = config;
    
    const requests = [];

    // 1. Add token creation request
    const tokenRequest = this.generateTokenCreationRequest(config);
    requests.push(tokenRequest);

    // 2. Add business requests with token authentication
    const tokenHeaders = this.generateTokenHeaders(apiType, tokenVariable);
    
    businessRequests.forEach(businessRequest => {
      const authenticatedRequest = {
        ...businessRequest,
        headers: {
          ...businessRequest.headers,
          ...tokenHeaders
        }
      };
      requests.push(authenticatedRequest);
    });

    return requests;
  }

  /**
   * Get supported API types and their configurations
   * @returns {Object} Supported API types with descriptions
   */
  getSupportedApiTypes() {
    return {
      inventree: {
        description: 'InvenTree inventory management system',
        authMethod: 'Token-based with basic auth for token retrieval',
        example: 'https://demo.inventree.org'
      },
      oauth2: {
        description: 'OAuth2 client credentials flow',
        authMethod: 'Bearer token with client credentials',
        example: 'Any OAuth2 compliant API'
      },
      jwt: {
        description: 'JSON Web Token authentication',
        authMethod: 'Bearer token with username/password',
        example: 'Modern REST APIs with JWT'
      },
      custom: {
        description: 'Custom API with user-defined endpoints',
        authMethod: 'User-defined authentication flow',
        example: 'Any API with custom auth requirements'
      }
    };
  }
}
