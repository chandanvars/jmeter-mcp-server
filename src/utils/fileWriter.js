import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

/**
 * File writer utility for JMeter MCP Server
 * Ensures JMX files go to output/ and CSV files go to sample_data/
 */
export class FileWriter {
  constructor() {
    // Use existing output directory structure
    this.outputDir = path.join(projectRoot, 'output');
    this.sampleDataDir = path.join(projectRoot, 'sample_data');
    
    // Only ensure directories exist if they don't exist, don't create duplicates
    this.ensureDirectories();
  }

  /**
   * Ensure output and sample_data directories exist (only if needed)
   */
  ensureDirectories() {
    // Check if output directory exists, if not create it
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Check if sample_data directory exists, if not create it  
    if (!fs.existsSync(this.sampleDataDir)) {
      fs.mkdirSync(this.sampleDataDir, { recursive: true });
    }
  }

  /**
   * Write JMX file to output directory
   * @param {string} filename - Name of the JMX file
   * @param {string} content - JMX content
   * @returns {string} - Full path of written file
   */
  writeJMXFile(filename, content) {
    // Ensure .jmx extension
    if (!filename.endsWith('.jmx')) {
      filename += '.jmx';
    }
    
    const fullPath = path.join(this.outputDir, filename);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ JMX file written: ${fullPath}`);
    return fullPath;
  }

  /**
   * Write CSV file to sample_data directory
   * @param {string} filename - Name of the CSV file
   * @param {string} content - CSV content
   * @returns {string} - Full path of written file
   */
  writeCSVFile(filename, content) {
    // Ensure .csv extension
    if (!filename.endsWith('.csv')) {
      filename += '.csv';
    }
    
    const fullPath = path.join(this.sampleDataDir, filename);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ CSV file written: ${fullPath}`);
    return fullPath;
  }

  /**
   * Update CSV file references in JMX content to use sample_data path
   * @param {string} jmxContent - Original JMX content
   * @param {string} csvFilename - CSV filename
   * @returns {string} - Updated JMX content with correct CSV path
   */
  updateCSVReferencesInJMX(jmxContent, csvFilename) {
    // Create relative path from output to sample_data
    const relativePath = `../sample_data/${csvFilename}`;
    
    // Replace CSV filename references with full relative path
    const updatedContent = jmxContent.replace(
      new RegExp(`<stringProp name="filename">${csvFilename}</stringProp>`, 'g'),
      `<stringProp name="filename">${relativePath}</stringProp>`
    );
    
    // Also handle cases where filename might not include .csv extension
    const baseFilename = csvFilename.replace('.csv', '');
    const updatedContent2 = updatedContent.replace(
      new RegExp(`<stringProp name="filename">${baseFilename}</stringProp>`, 'g'),
      `<stringProp name="filename">${relativePath}</stringProp>`
    );
    
    return updatedContent2;
  }

  /**
   * Get absolute path for CSV file reference in JMX (for Windows compatibility)
   * @param {string} csvFilename - CSV filename
   * @returns {string} - Absolute path for CSV file
   */
  getAbsoluteCSVPath(csvFilename) {
    // Ensure .csv extension
    if (!csvFilename.endsWith('.csv')) {
      csvFilename += '.csv';
    }
    
    return path.join(this.sampleDataDir, csvFilename);
  }

  /**
   * Get relative path for CSV file reference in JMX
   * @param {string} csvFilename - CSV filename
   * @returns {string} - Relative path from output to sample_data
   */
  getRelativeCSVPath(csvFilename) {
    // Ensure .csv extension
    if (!csvFilename.endsWith('.csv')) {
      csvFilename += '.csv';
    }
    
    return `../sample_data/${csvFilename}`;
  }

  /**
   * Clean filename to be filesystem-safe
   * @param {string} filename - Original filename
   * @returns {string} - Clean filename
   */
  cleanFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9\s\-_\.]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .toLowerCase();
  }

  /**
   * Generate filename from test name
   * @param {string} testName - Test name
   * @param {string} extension - File extension (.jmx or .csv)
   * @returns {string} - Generated filename
   */
  generateFilename(testName, extension) {
    const cleanName = this.cleanFilename(testName);
    if (!extension.startsWith('.')) {
      extension = '.' + extension;
    }
    return cleanName + extension;
  }

  /**
   * List files in output directory
   * @returns {Array} - Array of JMX files in output directory
   */
  listJMXFiles() {
    if (!fs.existsSync(this.outputDir)) {
      return [];
    }
    
    return fs.readdirSync(this.outputDir)
      .filter(file => file.endsWith('.jmx'))
      .map(file => path.join(this.outputDir, file));
  }

  /**
   * List files in sample_data directory
   * @returns {Array} - Array of CSV files in sample_data directory
   */
  listCSVFiles() {
    if (!fs.existsSync(this.sampleDataDir)) {
      return [];
    }
    
    return fs.readdirSync(this.sampleDataDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(this.sampleDataDir, file));
  }

  /**
   * Get file stats and summary
   * @returns {Object} - Summary of files in both directories
   */
  getFilesSummary() {
    const jmxFiles = this.listJMXFiles();
    const csvFiles = this.listCSVFiles();
    
    return {
      outputDir: this.outputDir,
      sampleDataDir: this.sampleDataDir,
      jmxFiles: {
        count: jmxFiles.length,
        files: jmxFiles.map(f => path.basename(f))
      },
      csvFiles: {
        count: csvFiles.length,
        files: csvFiles.map(f => path.basename(f))
      }
    };
  }
}

export default FileWriter;
