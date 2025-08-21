import { patterns } from './patterns.js';
import * as cheerio from 'cheerio';

export class CorrelationEngine {
  async analyzeRequests(requests) {
    const correlations = [];
    
    for (let i = 0; i < requests.length - 1; i++) {
      const currentRequest = requests[i];
      const nextRequests = requests.slice(i + 1);
      
      // Check for correlations in subsequent requests
      for (const nextRequest of nextRequests) {
        const foundCorrelations = await this.findCorrelations(
          currentRequest,
          nextRequest
        );
        
        correlations.push(...foundCorrelations);
      }
    }

    return this.deduplicateCorrelations(correlations);
  }

  async findCorrelations(sourceRequest, targetRequest) {
    const correlations = [];
    
    if (!sourceRequest.response || !sourceRequest.response.body) {
      return correlations;
    }

    // Check URL parameters
    const urlCorrelations = this.findUrlCorrelations(
      sourceRequest,
      targetRequest
    );
    correlations.push(...urlCorrelations);

    // Check headers
    const headerCorrelations = this.findHeaderCorrelations(
      sourceRequest,
      targetRequest
    );
    correlations.push(...headerCorrelations);

    // Check post data
    const postDataCorrelations = this.findPostDataCorrelations(
      sourceRequest,
      targetRequest
    );
    correlations.push(...postDataCorrelations);

    return correlations;
  }

  findUrlCorrelations(sourceRequest, targetRequest) {
    const correlations = [];
    const targetUrl = new URL(targetRequest.url);
    
    for (const [key, value] of targetUrl.searchParams) {
      for (const pattern of patterns) {
        if (pattern.regex.test(key) || pattern.regex.test(value)) {
          const extraction = this.extractValue(
            sourceRequest.response.body,
            value,
            pattern
          );
          
          if (extraction) {
            correlations.push({
              type: 'url_parameter',
              sourceRequestId: sourceRequest.id,
              targetRequestId: targetRequest.id,
              parameterName: key,
              extractionPattern: extraction.pattern,
              extractionType: pattern.type,
              variableName: `${pattern.type}_${key}`
            });
          }
        }
      }
    }
    
    return correlations;
  }

  findHeaderCorrelations(sourceRequest, targetRequest) {
    const correlations = [];
    
    for (const [key, value] of Object.entries(targetRequest.headers)) {
      for (const pattern of patterns) {
        if (pattern.regex.test(value)) {
          const extraction = this.extractValue(
            sourceRequest.response.body,
            value,
            pattern
          );
          
          if (extraction) {
            correlations.push({
              type: 'header',
              sourceRequestId: sourceRequest.id,
              targetRequestId: targetRequest.id,
              headerName: key,
              extractionPattern: extraction.pattern,
              extractionType: pattern.type,
              variableName: `${pattern.type}_${key.replace('-', '_')}`
            });
          }
        }
      }
    }
    
    return correlations;
  }

  findPostDataCorrelations(sourceRequest, targetRequest) {
    const correlations = [];
    
    if (!targetRequest.postData) return correlations;
    
    try {
      const postData = JSON.parse(targetRequest.postData);
      
      const findInObject = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            findInObject(value, currentPath);
          } else if (typeof value === 'string') {
            for (const pattern of patterns) {
              if (pattern.regex.test(value)) {
                const extraction = this.extractValue(
                  sourceRequest.response.body,
                  value,
                  pattern
                );
                
                if (extraction) {
                  correlations.push({
                    type: 'post_data',
                    sourceRequestId: sourceRequest.id,
                    targetRequestId: targetRequest.id,
                    jsonPath: currentPath,
                    extractionPattern: extraction.pattern,
                    extractionType: pattern.type,
                    variableName: `${pattern.type}_${currentPath.replace('.', '_')}`
                  });
                }
              }
            }
          }
        }
      };
      
      findInObject(postData);
    } catch (e) {
      // Not JSON, try form data
      const formData = new URLSearchParams(targetRequest.postData);
      for (const [key, value] of formData) {
        for (const pattern of patterns) {
          if (pattern.regex.test(value)) {
            const extraction = this.extractValue(
              sourceRequest.response.body,
              value,
              pattern
            );
            
            if (extraction) {
              correlations.push({
                type: 'form_data',
                sourceRequestId: sourceRequest.id,
                targetRequestId: targetRequest.id,
                fieldName: key,
                extractionPattern: extraction.pattern,
                extractionType: pattern.type,
                variableName: `${pattern.type}_${key}`
              });
            }
          }
        }
      }
    }
    
    return correlations;
  }

  extractValue(responseBody, targetValue, pattern) {
    if (!responseBody) return null;
    
    // Try JSON extraction
    try {
      const json = JSON.parse(responseBody);
      const path = this.findJsonPath(json, targetValue);
      if (path) {
        return {
          pattern: `$.${path}`,
          type: 'json'
        };
      }
    } catch (e) {
      // Not JSON
    }
    
    // Try HTML extraction
    try {
      const $ = cheerio.load(responseBody);
      const element = $(`*:contains("${targetValue}")`).first();
      if (element.length) {
        return {
          pattern: this.generateCssSelector(element),
          type: 'css'
        };
      }
    } catch (e) {
      // Not HTML
    }
    
    // Try regex extraction
    const regexPattern = this.generateRegexPattern(responseBody, targetValue);
    if (regexPattern) {
      return {
        pattern: regexPattern,
        type: 'regex'
      };
    }
    
    return null;
  }

  findJsonPath(obj, targetValue, currentPath = '') {
    for (const [key, value] of Object.entries(obj)) {
      const path = currentPath ? `${currentPath}.${key}` : key;
      
      if (value === targetValue) {
        return path;
      } else if (typeof value === 'object' && value !== null) {
        const found = this.findJsonPath(value, targetValue, path);
        if (found) return found;
      }
    }
    return null;
  }

  generateCssSelector(element) {
    // Generate a unique CSS selector for the element
    const tag = element.prop('tagName').toLowerCase();
    const id = element.attr('id');
    const classes = element.attr('class');
    
    if (id) {
      return `#${id}`;
    } else if (classes) {
      return `${tag}.${classes.split(' ').join('.')}`;
    } else {
      // Generate based on position
      const index = element.index();
      const parent = element.parent();
      if (parent.length) {
        const parentSelector = this.generateCssSelector(parent);
        return `${parentSelector} > ${tag}:nth-child(${index + 1})`;
      }
      return tag;
    }
  }

  generateRegexPattern(text, value) {
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const contextLength = 20;
    
    const index = text.indexOf(value);
    if (index === -1) return null;
    
    const before = text.substring(Math.max(0, index - contextLength), index);
    const after = text.substring(index + value.length, index + value.length + contextLength);
    
    return `${before}(.+?)${after}`;
  }

  deduplicateCorrelations(correlations) {
    const unique = new Map();
    
    for (const correlation of correlations) {
      const key = `${correlation.sourceRequestId}-${correlation.targetRequestId}-${correlation.variableName}`;
      if (!unique.has(key)) {
        unique.set(key, correlation);
      }
    }
    
    return Array.from(unique.values());
  }
}
