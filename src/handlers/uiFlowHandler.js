/**
 * UI Flow Handler
 * Handles generation of JMeter scripts from UI flow descriptions
 */

import { PromptToFlowParser } from '../parsers/promptToFlowParser.js';
import { JMXGenerator } from '../generators/jmxGenerator.js';
import { validateTestPlan } from '../utils/validator.js';
import { FileWriter } from '../utils/fileWriter.js';
import { ScenarioValidator } from '../validators/scenarioValidator.js';

export class UIFlowHandler {
  constructor() {
    this.promptParser = new PromptToFlowParser();
    this.jmxGenerator = new JMXGenerator();
    this.fileWriter = new FileWriter();
    this.scenarioValidator = new ScenarioValidator();
  }

  /**
   * Generate JMeter script from UI flow prompt
   */
  async generateUIFlowScript(params) {
    try {
      const { 
        testName, 
        baseUrl, 
        flowDescription, 
        threadGroup = { numThreads: 10, rampUpTime: 30, loops: 1 },
        csvDataSet 
      } = params;

      // STEP 1: Validate and correct the flow description using ScenarioValidator
      console.log('🔍 Validating and correcting flow description...');
      const validationResult = await this.scenarioValidator.validateAndCorrect(
        flowDescription, 
        { baseUrl, testName }
      );

      if (!validationResult.success) {
        throw new Error(`Flow validation failed: ${validationResult.error}`);
      }

      // Use the corrected flow for parsing
      const correctedFlowDescription = validationResult.correctedFlow;
      console.log(`✅ Flow validation complete. Modified: ${validationResult.wasModified}`);

      // STEP 2: Parse the corrected flow description into actionable steps
      console.log('🔄 Parsing corrected flow into actionable steps...');
      const parseResult = await this.promptParser.parsePrompt(correctedFlowDescription);
      
      if (!parseResult.success) {
        // If parsing fails even after validation, try one more correction attempt
        console.log('⚠️ Initial parsing failed, attempting additional corrections...');
        const fallbackResult = await this.scenarioValidator.validateAndCorrect(
          flowDescription + '. Navigate to homepage. Click submit button. Wait for response.',
          { baseUrl, testName }
        );
        
        if (fallbackResult.success) {
          const fallbackParseResult = await this.promptParser.parsePrompt(fallbackResult.correctedFlow);
          if (fallbackParseResult.success) {
            Object.assign(parseResult, fallbackParseResult);
            validationResult.corrections.push('Applied fallback corrections for parsing compatibility');
          } else {
            throw new Error(`Failed to parse flow description even after corrections: ${parseResult.error}`);
          }
        } else {
          throw new Error(`Failed to parse flow description: ${parseResult.error}`);
        }
      }

      // STEP 3: Validate the generated steps
      console.log('✅ Validating generated flow steps...');
      const validation = this.promptParser.validateFlowSteps(parseResult.steps);
      if (!validation.isValid) {
        throw new Error(`Invalid flow steps: ${validation.errors.join(', ')}`);
      }

      // Convert parsed steps to HTTP requests (simulated)
      const httpRequests = this.convertStepsToRequests(parseResult.steps, baseUrl);

      // Create JMeter test plan structure
      const testPlan = {
        testName,
        baseUrl,
        requests: httpRequests,
        threadGroup,
        csvDataSet,
        flowSteps: parseResult.steps,
        originalPrompt: flowDescription,
        correctedPrompt: correctedFlowDescription,
        validationResult // Include validation details in test plan
      };

      // Generate filename for JMX file
      const jmxFileName = this.fileWriter.generateFilename(testName, 'jmx');
      
      // Generate CSV filename if needed and update JMX
      let csvFileName = null;
      let updatedJmxContent = null;
      
      if (csvDataSet) {
        csvFileName = csvDataSet.fileName.endsWith('.csv') ? 
          csvDataSet.fileName : 
          csvDataSet.fileName + '.csv';
        
        // Write CSV file to sample_data directory
        const csvContent = this.generateCSVContent(csvDataSet);
        this.fileWriter.writeCSVFile(csvFileName, csvContent);
        
        // Update JMX to reference CSV with relative path
        const tempJmxContent = this.jmxGenerator.generateUIFlowJMX(testPlan);
        updatedJmxContent = this.fileWriter.updateCSVReferencesInJMX(tempJmxContent, csvFileName);
      } else {
        // Generate JMX content without CSV references
        updatedJmxContent = this.jmxGenerator.generateUIFlowJMX(testPlan);
      }

      // Write JMX file to output directory
      const jmxFilePath = this.fileWriter.writeJMXFile(jmxFileName, updatedJmxContent);
      
      // Ensure file was written successfully
      if (!jmxFilePath) {
        throw new Error(`Failed to write JMX file: ${jmxFileName}`);
      }

      // Prepare response
      const content = [
        {
          type: 'text',
          text: this.generateSuccessMessage(testPlan, parseResult.steps, jmxFilePath, csvFileName, validationResult)
        },
        {
          type: 'file_reference',
          name: 'jmx_file',
          file_type: 'jmx',
          path: jmxFilePath
        }
      ];

      // Include CSV file in response if generated
      if (csvDataSet && csvFileName) {
        content.push({
          type: 'file_reference',
          name: 'csv_file',
          file_type: 'csv',
          path: this.fileWriter.getAbsoluteCSVPath(csvFileName)
        });
      }

      // Add step-by-step breakdown
      content.push({
        type: 'text',
        text: this.generateStepBreakdown(parseResult.steps)
      });

      // Add validation report if there were corrections
      if (validationResult.wasModified) {
        content.push({
          type: 'text',
          text: this.generateValidationReport(validationResult)
        });
      }

      return { 
        content,
        filePaths: {
          jmx: jmxFilePath,
          csv: csvFileName ? this.fileWriter.getAbsoluteCSVPath(csvFileName) : null
        },
        validationResult // Include validation result for debugging
      };

    } catch (error) {
      throw new Error(`UI Flow script generation failed: ${error.message}`);
    }
  }

  /**
   * Convert parsed flow steps to HTTP requests for JMeter
   */
  convertStepsToRequests(steps, baseUrl) {
    const requests = [];
    let requestCounter = 1;

    for (const step of steps) {
      const httpRequest = this.stepToHttpRequest(step, baseUrl, requestCounter);
      if (httpRequest) {
        requests.push(httpRequest);
        requestCounter++;
      }
    }

    return requests;
  }

  /**
   * Convert individual step to HTTP request
   */
  stepToHttpRequest(step, baseUrl, counter) {
    switch (step.action) {
      case 'navigate':
        const navPath = step.data && step.data.url ? step.data.url : '/';
        return {
          name: `${counter}. Navigate - ${step.description}`,
          method: 'GET',
          path: navPath,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          extractors: [],
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            }
          ]
        };

      case 'fill':
        // Fill actions usually don't generate immediate requests but we can create a validation
        const fillData = step.data && step.data.value ? step.data.value : 'test';
        const fieldType = step.fieldType || 'text';
        return {
          name: `${counter}. Fill ${fieldType} - ${step.description}`,
          method: 'GET', // Validation request
          path: '/validate_field',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          extractors: [],
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            }
          ]
        };

      case 'click':
        // Detect login button clicks and convert to POST request
        if (step.description && step.description.toLowerCase().includes('login')) {
          return {
            name: `${counter}. Submit Login Form`,
            method: 'POST',
            path: '/authenticate',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Referer': `${baseUrl}/login`
            },
            body: 'username=tomsmith&password=SuperSecretPassword!',
            extractors: [
              {
                variableName: 'loginResult',
                regex: 'You logged into a secure area!',
                defaultValue: 'LOGIN_FAILED'
              }
            ],
            assertions: [
              {
                type: 'responseCode',
                value: '200'
              },
              {
                type: 'containsText',
                value: 'You logged into a secure area!'
              }
            ]
          };
        }
        
        // Most other clicks result in navigation or AJAX calls
        return {
          name: `${counter}. Click - ${step.description}`,
          method: 'GET',
          path: '/secure', // For post-login navigation
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          extractors: this.getCommonExtractors(step),
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            },
            {
              type: 'containsText',
              value: 'Secure Area'
            }
          ]
        };

      case 'fill':
      case 'submit':
        return {
          name: `${counter}. Form Submit - ${step.description}`,
          method: 'POST',
          path: '/submit',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'action=submit',
          extractors: this.getCommonExtractors(step),
          assertions: [
            {
              type: 'responseCode',
              value: '200'
            },
            {
              type: 'containsText',
              value: 'success'
            }
          ]
        };

      case 'wait':
        // Wait actions don't generate HTTP requests
        return null;

      default:
        return null;
    }
  }

  /**
   * Extract path from URL relative to base URL
   */
  extractPath(url, baseUrl) {
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        
        if (urlObj.hostname === baseObj.hostname) {
          return urlObj.pathname + urlObj.search;
        } else {
          return url; // External URL
        }
      } catch (e) {
        return '/';
      }
    }
    
    return url.startsWith('/') ? url : '/' + url;
  }

  /**
   * Extract path from step with improved login detection
   */
  extractPathFromStep(step, baseUrl) {
    // Check if step has URL data
    if (step.data && step.data.url) {
      return this.extractPath(step.data.url, baseUrl);
    }
    
    // Fallback to description-based path extraction
    const description = step.description ? step.description.toLowerCase() : '';
    
    // Login page patterns
    if (description.includes('login') || description.includes('signin') || description.includes('sign-in')) {
      return '/login';
    }
    
    // Common page patterns
    if (description.includes('home') || description.includes('homepage')) {
      return '/';
    }
    
    if (description.includes('profile')) {
      return '/profile';
    }
    
    if (description.includes('dashboard')) {
      return '/dashboard';
    }
    
    if (description.includes('settings')) {
      return '/settings';
    }
    
    // Extract path from URL patterns in description
    const urlMatch = description.match(/(?:to|page|\/)(\/[\w\-\/]*)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Default fallback
    return '/';
  }

  /**
   * Generate form data from step
   */
  generateFormData(step) {
    if (step.selector && step.data && step.data.value) {
      // Extract field name from selector
      const fieldName = this.extractFieldName(step.selector);
      return `${fieldName}=${encodeURIComponent(step.data.value)}`;
    }
    return 'data=test';
  }

  /**
   * Extract field name from CSS selector
   */
  extractFieldName(selector) {
    // Try to extract name attribute
    const nameMatch = selector.match(/name="([^"]+)"/);
    if (nameMatch) return nameMatch[1];
    
    // Try to extract ID
    const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];
    
    // Default
    return 'field';
  }

  /**
   * Get common extractors for dynamic content
   */
  getCommonExtractors(step) {
    const extractors = [];
    
    // Add CSRF token extractor for forms
    if (step.action === 'fill' || step.action === 'submit') {
      extractors.push({
        variableName: 'csrfToken',
        regex: 'csrf[_-]?token["\']?\\s*[:=]\\s*["\']?([^"\'\\s>]+)',
        defaultValue: 'NO_TOKEN'
      });
    }
    
    // Add session ID extractor
    extractors.push({
      variableName: 'sessionId',
      regex: 'session[_-]?id["\']?\\s*[:=]\\s*["\']?([^"\'\\s>]+)',
      defaultValue: 'NO_SESSION'
    });
    
    return extractors;
  }

  /**
   * Generate success message with validation details
   */
  generateSuccessMessage(testPlan, steps, jmxFilePath, csvFileName, validationResult = null) {
    const fileName = jmxFilePath ? jmxFilePath.split(/[/\\]/).pop() : 'unknown_file.jmx';
    
    // Generate dynamic step breakdown for display
    const stepBreakdown = steps.map((step, index) => {
      const stepNum = index + 1;
      const actionType = step.action.toUpperCase();
      let details = `${stepNum}. **${actionType}**: ${step.description}`;
      
      if (step.selector) {
        details += `\n   - Target: \`${step.selector}\``;
      }
      
      if (step.data) {
        if (step.data.url) {
          details += `\n   - URL: ${step.data.url}`;
        }
        if (step.data.value) {
          details += `\n   - Value: "${step.data.value}"`;
        }
        if (step.fieldType) {
          details += `\n   - Field Type: ${step.fieldType}`;
        }
      }
      
      return details;
    }).join('\n\n');

    // Generate HTTP request breakdown
    const requestBreakdown = testPlan.requests.map((req, index) => {
      const reqNum = index + 1;
      let reqDetails = `${reqNum}. ${req.method} ${req.path} - ${req.name}`;
      
      if (req.body) {
        reqDetails += `\n   - Body: ${req.body.substring(0, 50)}${req.body.length > 50 ? '...' : ''}`;
      }
      
      if (req.assertions && req.assertions.length > 0) {
        reqDetails += `\n   - Assertions: ${req.assertions.length} validations`;
      }
      
      return reqDetails;
    }).join('\n\n');

    // Add validation information if available
    let validationInfo = '';
    if (validationResult && validationResult.wasModified) {
      validationInfo = `\n\n**🔧 Flow Validation & Auto-Corrections:**
✅ **Scenario Validator Applied**: ${validationResult.corrections.length} corrections made
📊 **Confidence Score**: ${(validationResult.confidence * 100).toFixed(1)}%
${validationResult.issues.length > 0 ? `⚠️ **Issues Resolved**: ${validationResult.issues.length} issues` : ''}
🎯 **Final Validation**: ${validationResult.validation.isValid ? 'Passed' : 'Warning'}`;
    }
    
    return `🌐 **UI Flow Script Generated Successfully!**

**Test Plan:** ${testPlan.testName}
**Base URL:** ${testPlan.baseUrl}
**Flow Description:** ${testPlan.originalPrompt}${testPlan.correctedPrompt && testPlan.correctedPrompt !== testPlan.originalPrompt ? `\n**Corrected Flow:** ${testPlan.correctedPrompt}` : ''}
**Parsed Steps:** ${steps.length} actions identified
**Generated Requests:** ${testPlan.requests.length} HTTP requests
**Load Configuration:** ${testPlan.threadGroup.numThreads} users, ${testPlan.threadGroup.rampUpTime}s ramp-up, ${testPlan.threadGroup.loops}s duration

**Generated Features:**
✅ Natural language flow parsing with auto-correction
✅ Intelligent action recognition and conversion
✅ HTTP request generation for UI interactions
✅ Cookie and session management
✅ Response extractors for dynamic data
✅ Performance monitoring listeners
✅ Scenario validation and error resolution${validationInfo}

**Parsed Flow Actions:**
${stepBreakdown}

**Generated HTTP Requests:**
${requestBreakdown}

The generated JMX file is ready for use with JMeter ✅`;
  }

  /**
   * Generate validation report
   */
  generateValidationReport(validationResult) {
    const report = [`📋 **Scenario Validation Report**\n`];

    if (validationResult.wasModified) {
      report.push(`🔧 **Auto-Corrections Applied**: ${validationResult.corrections.length} modifications made`);
      report.push(`📊 **Validation Confidence**: ${(validationResult.confidence * 100).toFixed(1)}%`);
      
      if (validationResult.issues.length > 0) {
        report.push(`\n**Issues Identified & Resolved:**`);
        validationResult.issues.forEach((issue, index) => {
          report.push(`${index + 1}. ${issue}`);
        });
      }

      if (validationResult.corrections.length > 0) {
        report.push(`\n**Corrections Applied:**`);
        validationResult.corrections.forEach((correction, index) => {
          report.push(`${index + 1}. ${correction}`);
        });
      }

      if (validationResult.suggestions.length > 0) {
        report.push(`\n**Suggestions for Enhancement:**`);
        validationResult.suggestions.forEach((suggestion, index) => {
          report.push(`${index + 1}. ${suggestion}`);
        });
      }

      const validationSummary = this.scenarioValidator.getValidationSummary(validationResult);
      report.push(`\n**Validation Summary:**`);
      report.push(`- Issues Found: ${validationSummary.issuesFound}`);
      report.push(`- Corrections Made: ${validationSummary.correctionsMade}`);
      report.push(`- Suggestions Provided: ${validationSummary.suggestionsProvided}`);
      report.push(`- Final Validation: ${validationSummary.finalValidation ? '✅ Passed' : '⚠️ Warning'}`);
      report.push(`- Confidence Score: ${(validationSummary.confidence * 100).toFixed(1)}%`);
    } else {
      report.push(`✅ **No corrections needed** - Your flow description was already compatible with the parser!`);
    }

    return report.join('\n');
  }

  /**
   * Generate step breakdown
   */
  generateStepBreakdown(steps) {
    const breakdown = steps.map((step, index) => {
      const stepNum = index + 1;
      let details = `${stepNum}. **${step.action.toUpperCase()}**: ${step.description}`;
      
      if (step.selector) {
        details += `\n   - Selector: \`${step.selector}\``;
      }
      
      if (step.data) {
        if (step.data.url) {
          details += `\n   - URL: ${step.data.url}`;
        }
        if (step.data.value) {
          details += `\n   - Value: "${step.data.value}"`;
        }
        if (step.data.timeout) {
          details += `\n   - Timeout: ${step.data.timeout}ms`;
        }
      }
      
      return details;
    }).join('\n\n');

    return `📋 **Step-by-Step Breakdown:**

${breakdown}

**Note:** The above steps have been converted into HTTP requests that simulate the browser interactions for performance testing.`;
  }

  /**
   * Get example prompts for users
   */
  getExamplePrompts() {
    return this.promptParser.getExamplePrompts();
  }

  /**
   * Validate UI flow parameters
   */
  validateUIFlowParams(params) {
    const errors = [];
    
    if (!params.testName) {
      errors.push('Test name is required');
    }
    
    if (!params.baseUrl) {
      errors.push('Base URL is required');
    }
    
    if (!params.flowDescription) {
      errors.push('Flow description is required');
    }
    
    if (params.flowDescription && params.flowDescription.trim().length < 10) {
      errors.push('Flow description must be at least 10 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate CSV content for parameterization
   */
  generateCSVContent(csvConfig) {
    const { variableNames, numRecords = 5 } = csvConfig;
    const variables = variableNames.split(',').map(v => v.trim());
    
    let csvContent = variables.join(',') + '\n';
    
    // Generate sample data based on variable names
    for (let i = 1; i <= numRecords; i++) {
      const row = variables.map(variable => {
        const varName = variable.toLowerCase();
        if (varName.includes('username') || varName.includes('user')) {
          return `user${i}@example.com`;
        } else if (varName.includes('password') || varName.includes('pass')) {
          return `password${i}23`;
        } else if (varName.includes('email')) {
          return `test${i}@example.com`;
        } else if (varName.includes('name')) {
          return `Test User ${i}`;
        } else if (varName.includes('id')) {
          return i.toString();
        } else {
          return `value${i}`;
        }
      }).join(',');
      csvContent += row + '\n';
    }
    
    return csvContent;
  }
}
