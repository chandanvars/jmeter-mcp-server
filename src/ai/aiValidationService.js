/**
 * AI JMX Validation Service
 * Integrates AI assistance into the JMeter MCP Server workflow
 */

import { AIJMXAssistant } from './aiJMXAssistant.js';
import { FileWriter } from '../utils/fileWriter.js';

export class AIValidationService {
  constructor() {
    this.aiAssistant = new AIJMXAssistant();
    this.fileWriter = new FileWriter();
  }

  /**
   * Validate and provide AI assistance for generated JMX content
   * @param {string} jmxContent - The generated JMX content
   * @param {Object} testContext - Context about the test plan
   * @returns {Object} - Validation results with AI suggestions
   */
  /**
   * Validate JMX content with AI analysis and optional auto-correction
   * @param {string} jmxContent - JMX content to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation results with issues and enhancements
   */
  async validateWithAI(jmxContent, options = {}) {
    try {
      // Handle both old and new method signatures
      if (typeof options === 'object' && (options.mode || options.autoCorrect !== undefined)) {
        // New signature with options object
        const { mode = 'standard', autoCorrect = false, outputToFile = false } = options;
        
        // Run analysis
        const analysis = await this.aiAssistant.analyzeJMXIssues(jmxContent);
        
        let enhancedJmxContent = null;
        
        if (autoCorrect) {
          // Apply auto-corrections
          const corrections = analysis.corrections || [];
          const applicableCorrections = corrections.filter(c => c.autoApplicable);
          
          if (applicableCorrections.length > 0) {
            const correctionResult = await this.aiAssistant.applyCorrections(jmxContent, applicableCorrections);
            enhancedJmxContent = correctionResult.correctedContent;
            
            // Mark issues as corrected
            analysis.issues.forEach(issue => {
              const hasCorrection = applicableCorrections.find(c => c.issueId === issue.id);
              if (hasCorrection) {
                issue.corrected = true;
                issue.correctionApplied = hasCorrection.description;
              }
            });
          }
          
          if (outputToFile && enhancedJmxContent) {
            const fileName = `enhanced_${Date.now()}.jmx`;
            await this.fileWriter.writeJMXFile(enhancedJmxContent, fileName);
          }
        }
        
        return {
          issues: analysis.issues || [],
          performanceScore: analysis.performanceScore || 0,
          enhancedJmxContent,
          enhancements: analysis.corrections || [],
          analysisMode: mode,
          performanceAnalysis: `Performance analysis completed in ${mode} mode`
        };
      } else {
        // Original signature - delegate to validateJMX
        return this.validateJMX(jmxContent, options);
      }
    } catch (error) {
      throw new Error(`AI validation failed: ${error.message}`);
    }
  }

  /**
   * Analyze JMX content without auto-correction
   * @param {string} jmxContent - JMX content to analyze
   * @param {string} mode - Analysis mode (quick, standard, comprehensive)
   * @returns {Object} Analysis results
   */
  async analyzeJMX(jmxContent, mode = 'standard') {
    try {
      const analysis = await this.aiAssistant.analyzeJMXIssues(jmxContent);
      
      return {
        issues: analysis.issues || [],
        performanceScore: analysis.performanceScore || 0,
        mode: mode,
        summary: `Analysis completed in ${mode} mode - ${analysis.issues?.length || 0} issues found`
      };
    } catch (error) {
      throw new Error(`JMX analysis failed: ${error.message}`);
    }
  }

  /**
   * Original validateJMX method for backward compatibility
   */
  async validateJMX(jmxContent, testContext = {}) {
    try {
      // Run AI analysis
      const analysis = await this.aiAssistant.analyzeJMXIssues(jmxContent, testContext);
      
      // Generate validation report
      const validationReport = this.generateValidationReport(analysis, testContext);
      
      // Ensure corrections array exists
      const corrections = analysis.corrections || [];
      
      // Prepare user-friendly response
      const response = {
        isValid: analysis.criticalIssues === 0,
        hasWarnings: analysis.warnings > 0,
        hasSuggestions: analysis.suggestions > 0,
        analysis,
        report: validationReport,
        autoCorrections: corrections.filter(c => c.autoApplicable),
        manualRecommendations: corrections.filter(c => !c.autoApplicable)
      };

      return response;
    } catch (error) {
      throw new Error(`AI validation failed: ${error.message}`);
    }
  }

  /**
   * Auto-correct JMX issues using AI suggestions
   * @param {string} jmxContent - Original JMX content
   * @param {Object} testContext - Test context
   * @param {Object} options - Correction options
   * @returns {Object} - Corrected content and applied changes
   */
  async autoCorrectJMX(jmxContent, testContext = {}, options = {}) {
    const {
      applyCritical = true,
      applyWarnings = false,
      applySuggestions = false
    } = options;

    try {
      // Analyze the JMX content
      const analysis = await this.aiAssistant.analyzeJMXIssues(jmxContent, testContext);
      
      // Ensure corrections array exists
      const corrections = analysis.corrections || [];
      
      // Filter corrections based on options
      const correctionsToApply = corrections.filter(correction => {
        if (correction.severity === 'high' && applyCritical) return true;
        if (correction.severity === 'medium' && applyWarnings) return true;
        if (correction.severity === 'low' && applySuggestions) return true;
        return false;
      });

      // Apply corrections
      const correctionResult = await this.aiAssistant.applyCorrections(jmxContent, correctionsToApply);
      
      // Re-analyze corrected content
      const newAnalysis = await this.aiAssistant.analyzeJMXIssues(correctionResult.correctedContent, testContext);

      return {
        originalContent: jmxContent,
        correctedContent: correctionResult.correctedContent,
        appliedCorrections: correctionResult.appliedCorrections,
        originalIssues: analysis.totalIssues,
        remainingIssues: newAnalysis.totalIssues,
        improvementScore: newAnalysis.performance.score - analysis.performance.score,
        correctionStats: correctionResult.stats
      };
    } catch (error) {
      throw new Error(`AI auto-correction failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport(analysis, testContext) {
    const report = {
      summary: this.generateSummary(analysis),
      performanceAnalysis: this.generatePerformanceAnalysis(analysis),
      issueBreakdown: this.generateIssueBreakdown(analysis),
      recommendations: this.generateRecommendations(analysis),
      correctionPreview: this.generateCorrectionPreview(analysis.corrections)
    };

    return report;
  }

  /**
   * Generate validation summary
   */
  generateSummary(analysis) {
    const statusEmoji = analysis.criticalIssues === 0 ? '✅' : '⚠️';
    const gradeEmoji = this.getGradeEmoji(analysis.performance.grade);
    
    return `${statusEmoji} **AI Validation Complete**

🎯 **Overall Score:** ${analysis.performance.score}/100 (${analysis.performance.grade}) ${gradeEmoji}
📊 **Issues Found:** ${analysis.totalIssues} total
🚨 **Critical:** ${analysis.criticalIssues} | ⚠️ **Warnings:** ${analysis.warnings} | 💡 **Suggestions:** ${analysis.suggestions}

**Status:** ${analysis.criticalIssues === 0 ? 'Ready for use' : 'Requires attention'}`;
  }

  /**
   * Generate performance analysis section
   */
  generatePerformanceAnalysis(analysis) {
    let performanceText = '## 🚀 Performance Analysis\n\n';
    
    analysis.performance.recommendations.forEach(recommendation => {
      performanceText += `• ${recommendation}\n`;
    });

    if (analysis.performance.score >= 90) {
      performanceText += '\n🏆 **Excellent!** Your test plan follows JMeter best practices.';
    } else if (analysis.performance.score >= 70) {
      performanceText += '\n👍 **Good!** Minor optimizations can improve test reliability.';
    } else {
      performanceText += '\n🔧 **Needs Work!** Several improvements recommended for optimal performance.';
    }

    return performanceText;
  }

  /**
   * Generate issue breakdown
   */
  generateIssueBreakdown(analysis) {
    if (analysis.issues.length === 0) {
      return '## ✅ No Issues Found\n\nYour JMX file appears to be well-configured!';
    }

    let breakdown = '## 🔍 Detailed Issue Analysis\n\n';
    
    const groupedIssues = this.groupIssuesBySeverity(analysis.issues);
    
    ['high', 'medium', 'low'].forEach(severity => {
      const issues = groupedIssues[severity] || [];
      if (issues.length === 0) return;

      const severityInfo = {
        high: { emoji: '🚨', label: 'Critical Issues', color: 'red' },
        medium: { emoji: '⚠️', label: 'Warnings', color: 'orange' },
        low: { emoji: '💡', label: 'Suggestions', color: 'blue' }
      };

      const info = severityInfo[severity];
      breakdown += `### ${info.emoji} ${info.label} (${issues.length})\n\n`;

      issues.forEach((issue, index) => {
        breakdown += `${index + 1}. **${issue.description}**\n`;
        breakdown += `   📍 Line ${issue.location.line}\n`;
        breakdown += `   💬 ${issue.aiInsight}\n`;
        if (issue.suggestedFix) {
          breakdown += `   🔧 **Fix:** ${issue.suggestedFix.explanation}\n`;
        }
        breakdown += '\n';
      });
    });

    return breakdown;
  }

  /**
   * Generate recommendations section
   */
  generateRecommendations(analysis) {
    let recommendations = '## 🎯 AI Recommendations\n\n';
    
    if (analysis.criticalIssues > 0) {
      recommendations += '### 🚨 Immediate Actions Required\n';
      recommendations += '1. **Address critical issues first** - These can cause test failures\n';
      recommendations += '2. **Test after fixes** - Verify corrections work as expected\n';
      recommendations += '3. **Review correlations** - Ensure dynamic data is properly extracted\n\n';
    }

    if (analysis.warnings > 0) {
      recommendations += '### ⚠️ Recommended Improvements\n';
      recommendations += '1. **Add response assertions** - Validate application behavior\n';
      recommendations += '2. **Optimize thread settings** - Match your testing goals\n';
      recommendations += '3. **Review parameterization** - Reduce hardcoded values\n\n';
    }

    if (analysis.suggestions > 0) {
      recommendations += '### 💡 Best Practice Suggestions\n';
      recommendations += '1. **Add think times** - Create realistic user behavior\n';
      recommendations += '2. **Include monitoring** - Add performance listeners\n';
      recommendations += '3. **Document test scenarios** - Add descriptive comments\n\n';
    }

    recommendations += '### 🎯 Next Steps\n';
    recommendations += '1. **Apply auto-corrections** for critical and warning issues\n';
    recommendations += '2. **Review manual recommendations** that require your decision\n';
    recommendations += '3. **Test your JMX file** in JMeter to verify functionality\n';
    recommendations += '4. **Run a small load test** before scaling up\n';

    return recommendations;
  }

  /**
   * Generate correction preview
   */
  generateCorrectionPreview(corrections) {
    if (corrections.length === 0) {
      return '## ✅ No Corrections Needed\n\nYour JMX file is already optimized!';
    }

    let preview = '## 🔧 Available Corrections\n\n';
    
    const autoCorrections = corrections.filter(c => c.autoApplicable);
    const manualCorrections = corrections.filter(c => !c.autoApplicable);

    if (autoCorrections.length > 0) {
      preview += `### 🤖 Auto-Applicable (${autoCorrections.length})\n`;
      preview += 'These corrections can be applied automatically:\n\n';
      
      autoCorrections.forEach((correction, index) => {
        preview += `${index + 1}. **${correction.description}**\n`;
        preview += `   💡 ${correction.explanation}\n`;
        preview += `   ⚡ Auto-apply: Yes\n\n`;
      });
    }

    if (manualCorrections.length > 0) {
      preview += `### 👤 Manual Review Required (${manualCorrections.length})\n`;
      preview += 'These corrections require your review:\n\n';
      
      manualCorrections.forEach((correction, index) => {
        preview += `${index + 1}. **${correction.description}**\n`;
        preview += `   💡 ${correction.explanation}\n`;
        preview += `   👤 Review needed: Yes\n\n`;
      });
    }

    return preview;
  }

  /**
   * Group issues by severity
   */
  groupIssuesBySeverity(issues) {
    return issues.reduce((groups, issue) => {
      const severity = issue.severity;
      if (!groups[severity]) {
        groups[severity] = [];
      }
      groups[severity].push(issue);
      return groups;
    }, {});
  }

  /**
   * Get emoji for performance grade
   */
  getGradeEmoji(grade) {
    const emojis = {
      'A': '🏆',
      'B': '🥈',
      'C': '🥉',
      'D': '⚠️',
      'F': '🚨'
    };
    return emojis[grade] || '❓';
  }

  /**
   * Generate improved JMX content with AI corrections
   * @param {string} testName - Name of the test
   * @param {string} originalJMX - Original JMX content
   * @param {Object} testContext - Test context
   * @returns {Object} - Enhanced content with AI improvements
   */
  async generateEnhancedJMX(testName, originalJMX, testContext = {}) {
    try {
      // Apply auto-corrections for critical and warning issues
      const correctionResult = await this.autoCorrectJMX(originalJMX, testContext, {
        applyCritical: true,
        applyWarnings: true,
        applySuggestions: false
      });

      // Write the improved JMX file
      const enhancedFileName = `${testName}_ai_enhanced.jmx`;
      const enhancedFilePath = this.fileWriter.writeJMXFile(enhancedFileName, correctionResult.correctedContent);

      // Generate comparison report
      const report = this.generateComparisonReport(correctionResult);

      return {
        enhancedFilePath,
        enhancedContent: correctionResult.correctedContent,
        improvementReport: report,
        appliedCorrections: correctionResult.appliedCorrections
      };
    } catch (error) {
      throw new Error(`Failed to generate enhanced JMX: ${error.message}`);
    }
  }

  /**
   * Generate comparison report between original and enhanced JMX
   */
  generateComparisonReport(correctionResult) {
    return `## 🚀 AI Enhancement Report

### 📊 Improvement Summary
- **Original Issues:** ${correctionResult.originalIssues}
- **Remaining Issues:** ${correctionResult.remainingIssues}
- **Issues Fixed:** ${correctionResult.originalIssues - correctionResult.remainingIssues}
- **Score Improvement:** +${correctionResult.improvementScore} points

### 🔧 Applied Corrections (${correctionResult.appliedCorrections.length})
${correctionResult.appliedCorrections.map((correction, index) => 
  `${index + 1}. **${correction.description}** - ${correction.explanation}`
).join('\n')}

### 🎯 Benefits
✅ **Improved Reliability** - Fixed critical issues that could cause test failures
✅ **Better Performance** - Optimized configurations for efficient testing
✅ **Enhanced Portability** - Fixed path and configuration issues
✅ **Best Practices** - Applied JMeter industry standards

Your enhanced JMX file is ready for production use! 🎉`;
  }
}

export default AIValidationService;
