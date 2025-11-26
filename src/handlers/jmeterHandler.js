import { FileWriter } from '../utils/fileWriter.js';
import { PromptGenerator } from '../utils/promptGenerator.js';
import fs from 'fs';
import path from 'path';

/**
 * JMeter Handler for MCP Server
 * Handles JMeter script generation, file operations, and response formatting
 */
export class JMeterHandler {
  constructor() {
    this.fileWriter = new FileWriter();
    this.promptGenerator = new PromptGenerator();
  }

  /**
   * Generate JMeter script prompt and save to jmx_prompt.prompt.md
   * @param {Object} args - Tool arguments
   * @returns {Object} - MCP response object
   */
  async generateJMeterScript(args) {
    try {
      console.log(`Generating JMeter test prompt for: ${args.testName}`);
      
      // Generate prompt content from test configuration
      const promptContent = this.promptGenerator.generateJMeterPrompt(args);
      
      if (!promptContent) {
        throw new Error('Failed to generate prompt content');
      }
      
      // Save prompt to file
      const promptPath = this.promptGenerator.savePrompt(promptContent);
      console.log(`Prompt saved to: ${promptPath}`);

      // Check if file exists after writing
      if (!fs.existsSync(promptPath)) {
        throw new Error(`Failed to write prompt file to: ${promptPath}`);
      }
      
      // Generate CSV data if needed (save sample for reference)
      let csvInfo = null;
      if (args.csvDataSet) {
        const safeTestName = this.fileWriter.cleanFilename(args.testName || 'jmeter_test');
        const csvFilename = `${safeTestName}_data.csv`;
        const csvHeaders = args.csvDataSet.variableNames || '';
        const csvContent = this.generateCSVContent(csvHeaders, args.csvDataSet.values);
        const csvPath = this.fileWriter.writeCSVFile(csvFilename, csvContent);
        console.log(`CSV sample data written to: ${csvPath}`);
        csvInfo = {
          filename: csvFilename,
          path: csvPath,
          variables: csvHeaders
        };
      }
      
      // Create success response with prompt file reference
      const content = [
        {
          type: 'text',
          text: `✅ **JMeter Test Prompt Generated Successfully!**

**Test Configuration:** ${args.testName}
**Base URL:** ${args.baseUrl}
**Requests:** ${args.requests ? args.requests.length : 0} HTTP samplers
**Load Config:** ${args.threadGroup?.numThreads || 10} users, ${args.threadGroup?.rampUpTime || 10}s ramp-up

📝 **Prompt File Saved:** \`${path.basename(promptPath)}\`

The prompt has been saved to: \`${promptPath}\`

${csvInfo ? `📊 **CSV Sample Data Created:** \`${csvInfo.filename}\`
Variables: ${csvInfo.variables}\n\n` : ''}**Next Steps:**
1. Review the generated prompt at: \`.github/prompts/jmx_prompt.prompt.md\`
2. Use the \`execute_jmx_prompt\` tool or command to generate the actual JMX file
3. The JMX file will be saved to the \`output\` folder

**To generate the JMX file, use one of these methods:**
- Run: \`@workspace /jmx_prompt\` command in Copilot Chat
- Call the \`execute_jmx_prompt\` MCP tool
- Or manually process the prompt file

The prompt contains all the specifications needed to generate a complete JMeter test script with:
✅ HTTP samplers for all ${args.requests ? args.requests.length : 0} requests
✅ Thread group configuration (${args.threadGroup?.numThreads || 10} users)
✅ Response extractors for correlation
✅ Assertions for validation
✅ Timers and listeners${csvInfo ? '\n✅ CSV parameterization configuration' : ''}`
        },
        {
          type: 'file_reference',
          name: 'prompt_file',
          file_type: 'markdown',
          path: promptPath
        }
      ];
      
      if (csvInfo) {
        content.push({
          type: 'file_reference',
          name: 'csv_sample_data',
          file_type: 'csv',
          path: csvInfo.path
        });
      }
      
      return { content };
    } catch (error) {
      console.error(`Error generating JMeter prompt: ${error.message}`);
      console.error(error.stack);
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Error generating JMeter prompt:** ${error.message}\n\nPlease check your test configuration and try again.`
          }
        ]
      };
    }
  }

  /**
   * Generate CSV content from headers and values
   * @param {string} headers - CSV header row
   * @param {Array} values - CSV data rows
   * @returns {string} - CSV content
   */
  generateCSVContent(headers, values) {
    const headerRow = headers || '';
    let rows = [];
    
    if (headerRow) {
      rows.push(headerRow);
    }
    
    if (values && Array.isArray(values)) {
      rows = rows.concat(values.map(row => {
        if (Array.isArray(row)) {
          return row.join(',');
        } else if (typeof row === 'string') {
          return row;
        }
        return '';
      }));
    }
    
    return rows.join('\n');
  }
}

export default JMeterHandler;
