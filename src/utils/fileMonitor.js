import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const outputDir = path.join(projectRoot, 'output');

/**
 * File Monitor to prevent AI-enhanced files from being created
 */
export class FileMonitor {
  constructor() {
    this.isMonitoring = false;
    this.watcher = null;
  }

  /**
   * Start monitoring the output directory for AI-enhanced files
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    try {
      this.watcher = fs.watch(outputDir, (eventType, filename) => {
        if (filename && (filename.includes('_ai_enhanced') || filename.includes('ai_enhanced'))) {
          const filePath = path.join(outputDir, filename);
          
          // Small delay to ensure file is fully written before attempting to delete
          setTimeout(() => {
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🚫 Automatically removed AI-enhanced file: ${filename}`);
              }
            } catch (error) {
              console.error(`Error removing AI-enhanced file ${filename}:`, error.message);
            }
          }, 100);
        }
      });

      this.isMonitoring = true;
      console.log('📁 File monitor started - AI-enhanced files will be automatically removed');
    } catch (error) {
      console.error('Error starting file monitor:', error.message);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.isMonitoring = false;
      console.log('📁 File monitor stopped');
    }
  }

  /**
   * Remove any existing AI-enhanced files
   */
  cleanupExistingFiles() {
    try {
      const files = fs.readdirSync(outputDir);
      const aiEnhancedFiles = files.filter(file => 
        file.includes('_ai_enhanced') || file.includes('ai_enhanced')
      );

      aiEnhancedFiles.forEach(file => {
        const filePath = path.join(outputDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed existing AI-enhanced file: ${file}`);
        } catch (error) {
          console.error(`Error removing ${file}:`, error.message);
        }
      });

      if (aiEnhancedFiles.length === 0) {
        console.log('✅ No AI-enhanced files found to remove');
      }
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }
}

export default FileMonitor;
