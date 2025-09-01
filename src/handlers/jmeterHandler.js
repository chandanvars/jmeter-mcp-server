import { JMXGenerator } from '../generators/jmxGenerator.js';
import { FileWriter } from '../utils/fileWriter.js';
import { SuccessMessageGenerator } from '../utils/successMessageGenerator.js';
import fs from 'fs';
import path from 'path';

/**
 * JMeter Handler for MCP Server
 * Handles JMeter script generation, file operations, and response formatting
 */
export class JMeterHandler {
  constructor() {
    this.jmxGenerator = new JMXGenerator();
    this.fileWriter = new FileWriter();
  }

  /**
   * Generate JMeter script and handle file operations
   * @param {Object} args - Tool arguments
   * @returns {Object} - MCP response object
   */
  async generateJMeterScript(args) {
    try {
      console.log(`Generating JMeter script for: ${args.testName}`);
      
      // Generate JMX content
      const jmxContent = this.jmxGenerator.generate(args);
      
      if (!jmxContent) {
        throw new Error('Failed to generate JMX content');
      }
      
      // Clean up test name to create valid filename
      const safeTestName = this.fileWriter.cleanFilename(args.testName || 'jmeter_test');
      const jmxFilename = `${safeTestName}.jmx`;
      
      // Write JMX file
      const jmxPath = this.fileWriter.writeJMXFile(jmxFilename, jmxContent);
      console.log(`JMX file written to: ${jmxPath}`);

      // Check if file exists after writing
      if (!fs.existsSync(jmxPath)) {
        throw new Error(`Failed to write JMX file to: ${jmxPath}`);
      }
      
      // Generate CSV data if needed
      let csvPath = null;
      if (args.csvDataSet) {
        const csvFilename = `${safeTestName}_data.csv`;
        const csvHeaders = args.csvDataSet.variableNames || '';
        const csvContent = this.generateCSVContent(csvHeaders, args.csvDataSet.values);
        csvPath = this.fileWriter.writeCSVFile(csvFilename, csvContent);
        console.log(`CSV file written to: ${csvPath}`);
        
        // Update JMX file with correct CSV path references
        const updatedJmxContent = this.fileWriter.updateCSVReferencesInJMX(jmxContent, csvFilename);
        this.fileWriter.writeJMXFile(jmxFilename, updatedJmxContent);
      }
      
      // Create success response with file references
      const result = {
        success: true,
        message: `JMeter script generated successfully: ${jmxFilename}`,
        filePaths: {
          jmx: jmxPath,
          csv: csvPath
        },
        content: [
          {
            type: 'file_reference',
            name: 'output_file',
            file_type: 'jmx',
            path: jmxPath
          }
        ]
      };
      
      if (csvPath) {
        result.content.push({
          type: 'file_reference',
          name: 'data_file',
          file_type: 'csv',
          path: csvPath
        });
      }
      
      // Generate formatted success message using the shared utility
      return SuccessMessageGenerator.generateJMeterScriptSuccess(result, args);
    } catch (error) {
      console.error(`Error generating JMeter script: ${error.message}`);
      console.error(error.stack);
      
      return {
        content: [
          {
            type: 'error',
            text: `Failed to generate JMeter script: ${error.message}`
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

  /**
   * Generate JMeter test from API schema (placeholder)
   * @param {Object} args - Tool arguments
   * @returns {Object} - MCP response object
   */
  async generateFromApiSchema(args) {
    try {
      // For now, this is a placeholder that converts schema-based args to basic JMeter script
      console.log(`Generating JMeter script from API schema: ${args.schemaUrl}`);
      
      // Convert API schema args to basic JMeter format
      const basicArgs = {
        testName: 'API Schema Test',
        baseUrl: args.schemaUrl ? new URL(args.schemaUrl).origin : 'https://api.example.com',
        requests: args.endpoint ? [{
          name: `${args.endpoint.method || 'GET'} ${args.endpoint.path || '/'}`,
          method: args.endpoint.method || 'GET',
          path: args.endpoint.path || '/',
          headers: { 'Content-Type': 'application/json' }
        }] : [{
          name: 'Default API Request',
          method: 'GET',
          path: '/',
          headers: { 'Content-Type': 'application/json' }
        }],
        threadGroup: args.testConfig?.threadGroup || { numThreads: 10, rampUpTime: 30, loops: 5 }
      };
      
      return await this.generateJMeterScript(basicArgs);
    } catch (error) {
      console.error(`Error generating from API schema: ${error.message}`);
      return {
        content: [
          {
            type: 'error',
            text: `Failed to generate from API schema: ${error.message}`
          }
        ]
      };
    }
  }

}

export default JMeterHandler;
