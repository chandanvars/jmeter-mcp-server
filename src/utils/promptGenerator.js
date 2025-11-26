/**
 * Prompt Generator Utility
 * Generates natural language prompts for JMeter test specifications
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class PromptGenerator {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.projectRoot = path.resolve(__dirname, '../..');
    this.promptsDir = path.join(this.projectRoot, '.github', 'prompts');
    this.promptFilePath = path.join(this.promptsDir, 'jmx_prompt.prompt.md');
  }

  /**
   * Ensure prompts directory exists
   */
  ensurePromptsDirectory() {
    if (!fs.existsSync(this.promptsDir)) {
      fs.mkdirSync(this.promptsDir, { recursive: true });
    }
  }

  /**
   * Generate JMeter test prompt from test configuration
   * @param {Object} config - Test configuration
   * @returns {string} - Generated prompt
   */
  generateJMeterPrompt(config) {
    const {
      testName,
      baseUrl,
      requests = [],
      threadGroup = {},
      csvDataSet,
      defaultHeaders = {},
      timers = {},
      listeners = ['view_results_tree'],
      additionalConfig = {}
    } = config;

    // Build prompt sections
    const sections = [];

    // Frontmatter
    sections.push(`---`);
    sections.push(`agent: agent`);
    sections.push(`model: Claude Sonnet 4 (copilot)`);
    sections.push(`---`);
    sections.push('');

    // Header
    sections.push(`# JMeter Test Generation Specification`);
    sections.push('');

    // Test Configuration
    sections.push(`## Test Configuration`);
    sections.push('');
    sections.push(`**Test Name:** ${testName || 'Performance Test'}`);
    sections.push(`**Base URL:** ${baseUrl || 'https://api.example.com'}`);
    sections.push('');

    // Load Configuration
    sections.push(`## Load Configuration`);
    sections.push('');
    sections.push(`- **Number of Threads (Users):** ${threadGroup.numThreads || 10}`);
    sections.push(`- **Ramp-Up Time (seconds):** ${threadGroup.rampUpTime || 10}`);
    sections.push(`- **Loop Count:** ${threadGroup.loops || 1}`);
    if (threadGroup.duration) {
      sections.push(`- **Duration (seconds):** ${threadGroup.duration}`);
    }
    sections.push('');

    // Test Requests
    sections.push(`## Test Requests`);
    sections.push('');
    if (requests.length > 0) {
      requests.forEach((request, index) => {
        sections.push(`### Request ${index + 1}: ${request.name}`);
        sections.push('');
        sections.push(`- **Method:** ${request.method}`);
        sections.push(`- **Path:** ${request.path}`);
        
        if (request.headers && Object.keys(request.headers).length > 0) {
          sections.push(`- **Headers:**`);
          Object.entries(request.headers).forEach(([key, value]) => {
            sections.push(`  - \`${key}: ${value}\``);
          });
        }
        
        if (request.body) {
          sections.push(`- **Body:**`);
          sections.push('```json');
          sections.push(request.body);
          sections.push('```');
        }
        
        if (request.parameters && request.parameters.length > 0) {
          sections.push(`- **URL Parameters:**`);
          request.parameters.forEach(param => {
            sections.push(`  - \`${param.name}=${param.value}\``);
          });
        }
        
        if (request.extractors && request.extractors.length > 0) {
          sections.push(`- **Response Extractors:**`);
          request.extractors.forEach(extractor => {
            sections.push(`  - Variable: \`${extractor.variableName}\``);
            if (extractor.jsonPath) {
              sections.push(`    - JSON Path: \`${extractor.jsonPath}\``);
            }
            if (extractor.regex) {
              sections.push(`    - Regex: \`${extractor.regex}\``);
            }
            if (extractor.defaultValue) {
              sections.push(`    - Default: \`${extractor.defaultValue}\``);
            }
          });
        }
        
        if (request.assertions && request.assertions.length > 0) {
          sections.push(`- **Assertions:**`);
          request.assertions.forEach(assertion => {
            sections.push(`  - Type: ${assertion.type}`);
            sections.push(`    - Expected: \`${assertion.value || assertion.expectedValue}\``);
            if (assertion.jsonPath) {
              sections.push(`    - JSON Path: \`${assertion.jsonPath}\``);
            }
          });
        }
        
        sections.push('');
      });
    } else {
      sections.push('_No requests specified_');
      sections.push('');
    }

    // CSV Data Configuration
    sections.push(`## CSV Data Configuration`);
    sections.push('');
    if (csvDataSet) {
      sections.push(`- **File Name:** ${csvDataSet.fileName}`);
      sections.push(`- **Variable Names:** ${csvDataSet.variableNames}`);
      sections.push(`- **Delimiter:** ${csvDataSet.delimiter || ','}`);
      sections.push(`- **Ignore First Line:** ${csvDataSet.ignoreFirstLine !== false}`);
      sections.push(`- **Recycle on EOF:** ${csvDataSet.recycle !== false}`);
      sections.push(`- **Stop Thread on EOF:** ${csvDataSet.stopThread === true}`);
    } else {
      sections.push('_No CSV data configuration_');
    }
    sections.push('');

    // Default Headers
    sections.push(`## Default Headers`);
    sections.push('');
    if (Object.keys(defaultHeaders).length > 0) {
      Object.entries(defaultHeaders).forEach(([key, value]) => {
        sections.push(`- \`${key}: ${value}\``);
      });
    } else {
      sections.push('_No default headers specified_');
    }
    sections.push('');

    // Timers Configuration
    sections.push(`## Timers Configuration`);
    sections.push('');
    if (timers && Object.keys(timers).length > 0) {
      sections.push(`- **Type:** ${timers.type || 'gaussian'}`);
      if (timers.constantDelay) {
        sections.push(`- **Constant Delay:** ${timers.constantDelay} ms`);
      }
      if (timers.randomDelay) {
        sections.push(`- **Random Delay:** ${timers.randomDelay} ms`);
      }
      if (timers.throughput) {
        sections.push(`- **Throughput:** ${timers.throughput} requests/minute`);
      }
    } else {
      sections.push('_Default timer settings will be used_');
    }
    sections.push('');

    // Result Listeners
    sections.push(`## Result Listeners`);
    sections.push('');
    if (listeners && listeners.length > 0) {
      listeners.forEach(listener => {
        sections.push(`- ${listener}`);
      });
    } else {
      sections.push('- view_results_tree (default)');
    }
    sections.push('');

    // Additional Configuration
    if (additionalConfig && Object.keys(additionalConfig).length > 0) {
      sections.push(`## Additional Configuration`);
      sections.push('');
      sections.push('```json');
      sections.push(JSON.stringify(additionalConfig, null, 2));
      sections.push('```');
      sections.push('');
    }

    // Instructions
    sections.push('---');
    sections.push('');
    sections.push('## Instructions for JMX Generation');
    sections.push('');
    sections.push('When executing this prompt:');
    sections.push('1. Read the test configuration above');
    sections.push('2. Generate a complete JMeter JMX file with all specified components');
    sections.push('3. Include proper thread groups, samplers, extractors, and assertions');
    sections.push('4. Add correlation handlers for dynamic values');
    sections.push('5. Configure CSV data sets for parameterization');
    sections.push('6. Save the output JMX file to the `output` folder');
    sections.push('7. Save any CSV data files to the `sample_data` folder');
    sections.push('');
    sections.push('## Success Criteria');
    sections.push('');
    sections.push('- JMX file is valid and can be opened in JMeter GUI');
    sections.push('- All HTTP samplers are properly configured');
    sections.push('- Extractors and assertions are in place');
    sections.push('- CSV parameterization is working correctly');
    sections.push('- Thread group settings match the specification');

    return sections.join('\n');
  }

  /**
   * Save prompt to file
   * @param {string} prompt - The prompt content
   * @returns {string} - Path to saved file
   */
  savePrompt(prompt) {
    this.ensurePromptsDirectory();
    fs.writeFileSync(this.promptFilePath, prompt, 'utf8');
    return this.promptFilePath;
  }

  /**
   * Read prompt from file
   * @returns {string} - Prompt content
   */
  readPrompt() {
    if (fs.existsSync(this.promptFilePath)) {
      return fs.readFileSync(this.promptFilePath, 'utf8');
    }
    return null;
  }

  /**
   * Get prompt file path
   * @returns {string} - Absolute path to prompt file
   */
  getPromptFilePath() {
    return this.promptFilePath;
  }
}

export default PromptGenerator;
