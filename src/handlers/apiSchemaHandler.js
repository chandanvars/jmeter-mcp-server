import axios from 'axios';
import SwaggerParser from 'swagger-parser';
import yaml from 'yaml';

export class ApiSchemaHandler {
  constructor() {
    this.authEndpoints = new Map();
    this.apiSpecs = new Map();
  }

  async parseApiSchema(url) {
    try {
      console.log(`Fetching API schema from: ${url}`);
      
      // First try to fetch the content
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json, application/yaml, text/yaml, text/plain'
        }
      });

      let apiSpec;
      
      // Try to parse as JSON first, then YAML
      try {
        apiSpec = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } catch (jsonError) {
        try {
          apiSpec = yaml.parse(response.data);
        } catch (yamlError) {
          throw new Error('Unable to parse API schema as JSON or YAML');
        }
      }

      // Validate and dereference the spec using swagger-parser
      const parsedSpec = await SwaggerParser.dereference(apiSpec);
      
      this.apiSpecs.set(url, parsedSpec);
      
      return {
        spec: parsedSpec,
        info: this.extractApiInfo(parsedSpec),
        authMethods: this.extractAuthMethods(parsedSpec),
        endpoints: this.extractEndpoints(parsedSpec)
      };
    } catch (error) {
      throw new Error(`Failed to parse API schema from ${url}: ${error.message}`);
    }
  }

  extractApiInfo(spec) {
    return {
      title: spec.info?.title || 'Unknown API',
      version: spec.info?.version || '1.0.0',
      description: spec.info?.description || '',
      baseUrl: this.getBaseUrl(spec),
      servers: spec.servers || []
    };
  }

  getBaseUrl(spec) {
    if (spec.servers && spec.servers.length > 0) {
      return spec.servers[0].url;
    }
    if (spec.host) {
      const scheme = spec.schemes && spec.schemes.length > 0 ? spec.schemes[0] : 'https';
      const basePath = spec.basePath || '';
      return `${scheme}://${spec.host}${basePath}`;
    }
    return '';
  }

  extractAuthMethods(spec) {
    const authMethods = [];
    
    // OpenAPI 3.x security schemes
    if (spec.components?.securitySchemes) {
      Object.entries(spec.components.securitySchemes).forEach(([name, scheme]) => {
        authMethods.push({
          name,
          type: scheme.type,
          scheme: scheme.scheme,
          bearerFormat: scheme.bearerFormat,
          in: scheme.in,
          paramName: scheme.name,
          flows: scheme.flows,
          tokenUrl: scheme.flows?.clientCredentials?.tokenUrl || 
                   scheme.flows?.password?.tokenUrl ||
                   scheme.flows?.authorizationCode?.tokenUrl
        });
      });
    }
    
    // Swagger 2.0 security definitions
    if (spec.securityDefinitions) {
      Object.entries(spec.securityDefinitions).forEach(([name, scheme]) => {
        authMethods.push({
          name,
          type: scheme.type,
          in: scheme.in,
          paramName: scheme.name,
          flow: scheme.flow,
          tokenUrl: scheme.tokenUrl,
          authorizationUrl: scheme.authorizationUrl
        });
      });
    }

    return authMethods;
  }

  extractEndpoints(spec) {
    const endpoints = [];
    const paths = spec.paths || {};

    Object.entries(paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (typeof operation === 'object' && operation.operationId) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary,
            description: operation.description,
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses,
            security: operation.security || spec.security || [],
            tags: operation.tags || []
          });
        }
      });
    });

    return endpoints;
  }

  generateAuthenticationRequest(authMethod, credentials = {}) {
    const authRequest = {
      name: `Get ${authMethod.name} Token`,
      method: 'POST',
      path: '',
      headers: {
        'Content-Type': 'application/json'
      },
      extractors: [
        {
          variableName: 'auth_token',
          jsonPath: '$.access_token',
          defaultValue: ''
        }
      ]
    };

    if (authMethod.type === 'oauth2') {
      if (authMethod.tokenUrl) {
        const tokenUrl = new URL(authMethod.tokenUrl);
        authRequest.path = tokenUrl.pathname;
        
        // Client credentials flow
        if (authMethod.flows?.clientCredentials) {
          authRequest.body = JSON.stringify({
            grant_type: 'client_credentials',
            client_id: credentials.clientId || '${client_id}',
            client_secret: credentials.clientSecret || '${client_secret}',
            scope: credentials.scope || authMethod.flows.clientCredentials.scopes ? Object.keys(authMethod.flows.clientCredentials.scopes).join(' ') : ''
          });
        }
        // Password flow
        else if (authMethod.flows?.password) {
          authRequest.body = JSON.stringify({
            grant_type: 'password',
            username: credentials.username || '${username}',
            password: credentials.password || '${password}',
            client_id: credentials.clientId || '${client_id}',
            client_secret: credentials.clientSecret || '${client_secret}'
          });
        }
      }
    }
    // Basic auth token endpoint
    else if (authMethod.type === 'http' && authMethod.scheme === 'bearer') {
      // Look for a login/token endpoint in the API
      authRequest.path = '/auth/login'; // Default, should be configurable
      authRequest.body = JSON.stringify({
        username: credentials.username || '${username}',
        password: credentials.password || '${password}'
      });
    }

    return authRequest;
  }

  addAuthenticationToRequest(request, authMethod, tokenVariable = 'auth_token') {
    if (!request.headers) {
      request.headers = {};
    }

    switch (authMethod.type) {
      case 'http':
        if (authMethod.scheme === 'bearer') {
          request.headers['Authorization'] = `Bearer \${${tokenVariable}}`;
        } else if (authMethod.scheme === 'basic') {
          request.headers['Authorization'] = `Basic \${encoded_credentials}`;
        }
        break;
      case 'apiKey':
        if (authMethod.in === 'header') {
          request.headers[authMethod.paramName] = `\${${tokenVariable}}`;
        } else if (authMethod.in === 'query') {
          // Add query parameter logic here
          if (!request.queryParams) {
            request.queryParams = {};
          }
          request.queryParams[authMethod.paramName] = `\${${tokenVariable}}`;
        }
        break;
      case 'oauth2':
        request.headers['Authorization'] = `Bearer \${${tokenVariable}}`;
        break;
    }

    return request;
  }

  generateRequestFromEndpoint(endpoint, authMethod = null, baseUrl = '') {
    const request = {
      name: endpoint.summary || endpoint.operationId || `${endpoint.method} ${endpoint.path}`,
      method: endpoint.method,
      path: endpoint.path,
      headers: {}
    };

    // Add Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestBody) {
      const contentTypes = Object.keys(endpoint.requestBody.content || {});
      if (contentTypes.length > 0) {
        request.headers['Content-Type'] = contentTypes[0];
      }

      // Generate sample request body
      if (endpoint.requestBody.content) {
        const firstContentType = contentTypes[0];
        const schema = endpoint.requestBody.content[firstContentType]?.schema;
        if (schema) {
          request.body = this.generateSampleBody(schema);
        }
      }
    }

    // Add authentication if provided
    if (authMethod) {
      this.addAuthenticationToRequest(request, authMethod);
    }

    // Add response assertions
    request.assertions = [
      {
        type: 'response_code',
        value: '200'
      }
    ];

    return request;
  }

  generateSampleBody(schema) {
    if (!schema) return '{}';

    const generateSampleValue = (prop) => {
      switch (prop.type) {
        case 'string':
          return prop.example || prop.default || 'sample_string';
        case 'integer':
        case 'number':
          return prop.example || prop.default || 1;
        case 'boolean':
          return prop.example || prop.default || true;
        case 'array':
          return [generateSampleValue(prop.items || { type: 'string' })];
        case 'object':
          return generateSampleObject(prop);
        default:
          return null;
      }
    };

    const generateSampleObject = (objSchema) => {
      const obj = {};
      if (objSchema.properties) {
        Object.entries(objSchema.properties).forEach(([key, prop]) => {
          obj[key] = generateSampleValue(prop);
        });
      }
      return obj;
    };

    if (schema.type === 'object' || schema.properties) {
      return JSON.stringify(generateSampleObject(schema), null, 2);
    }

    return JSON.stringify(generateSampleValue(schema), null, 2);
  }

  findEndpointByTag(endpoints, tag) {
    return endpoints.filter(endpoint => 
      endpoint.tags && endpoint.tags.some(t => 
        t.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  findEndpointByPath(endpoints, pathPattern) {
    return endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(pathPattern.toLowerCase()) ||
      endpoint.operationId?.toLowerCase().includes(pathPattern.toLowerCase())
    );
  }
}
