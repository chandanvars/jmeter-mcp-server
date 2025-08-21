/**
 * AI JMX Issue Analyzer and Corrector
 * Provides intelligent analysis and automatic correction of JMX file issues
 */

import { validateTestPlan } from '../utils/validator.js';

export class AIJMXAssistant {
  constructor() {
    this.knownIssues = new Map();
    this.correctionRules = new Map();
    this.initializeIssueDatabase();
  }

  /**
   * Initialize database of known JMX issues and their corrections
   */
  initializeIssueDatabase() {
    // Common JMX Issues and their AI-driven solutions
    this.addIssuePattern({
      id: 'missing_csv_file_path',
      pattern: /<stringProp name="filename">([^<]+\.csv)<\/stringProp>/,
      severity: 'high',
      description: 'CSV file path is not relative to JMX file location',
      aiCorrection: {
        type: 'path_correction',
        logic: 'Convert absolute paths to relative paths from output/ to sample_data/'
      }
    });

    this.addIssuePattern({
      id: 'invalid_thread_count',
      pattern: /<stringProp name="ThreadGroup\.num_threads">(\d+)<\/stringProp>/,
      severity: 'medium',
      description: 'Thread count may be too high for system resources',
      aiCorrection: {
        type: 'performance_optimization',
        logic: 'Suggest optimal thread count based on system capabilities'
      }
    });

    this.addIssuePattern({
      id: 'missing_response_assertions',
      pattern: /<HTTPSamplerProxy[^>]*>/,
      severity: 'medium',
      description: 'HTTP requests lack response validation assertions',
      aiCorrection: {
        type: 'test_completeness',
        logic: 'Add appropriate response code and content assertions'
      }
    });

    this.addIssuePattern({
      id: 'correlation_extraction_missing',
      pattern: /<HTTPSamplerProxy.*testname="([^"]*login[^"]*)"[^>]*>/i,
      severity: 'high',
      description: 'Login request missing token extraction for subsequent requests',
      aiCorrection: {
        type: 'correlation_enhancement',
        logic: 'Add JSON/Regex extractors for authentication tokens'
      }
    });

    this.addIssuePattern({
      id: 'hardcoded_values',
      pattern: />(https?:\/\/[^<]+)</g,
      severity: 'low',
      description: 'Hardcoded URLs should be parameterized',
      aiCorrection: {
        type: 'parameterization',
        logic: 'Replace hardcoded values with JMeter variables'
      }
    });

    this.addIssuePattern({
      id: 'missing_cookie_manager',
      pattern: /<TestPlan[^>]*>/,
      severity: 'medium',
      description: 'Test plan missing cookie management for session handling',
      aiCorrection: {
        type: 'session_management',
        logic: 'Add HTTP Cookie Manager to maintain session state'
      }
    });

    this.addIssuePattern({
      id: 'incorrect_content_type',
      pattern: /<elementProp name="HTTPsampler\.Arguments".*?<\/elementProp>/s,
      severity: 'medium',
      description: 'POST requests may have incorrect Content-Type headers',
      aiCorrection: {
        type: 'header_optimization',
        logic: 'Analyze request body and suggest appropriate Content-Type'
      }
    });

    this.addIssuePattern({
      id: 'missing_timers',
      pattern: /<HTTPSamplerProxy[^>]*>/g,
      severity: 'low',
      description: 'Requests lack realistic timing delays',
      aiCorrection: {
        type: 'realistic_simulation',
        logic: 'Add appropriate think times between requests'
      }
    });
  }

  /**
   * Add a new issue pattern to the database
   */
  addIssuePattern(issue) {
    this.knownIssues.set(issue.id, issue);
  }

  /**
   * Main AI analysis function - analyzes JMX content for issues
   * @param {string} jmxContent - The JMX file content to analyze
   * @param {Object} context - Additional context about the test plan
   * @returns {Object} - Analysis results with identified issues and suggestions
   */
  async analyzeJMXIssues(jmxContent, context = {}) {
    const analysis = {
      timestamp: new Date().toISOString(),
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      suggestions: 0,
      issues: [],
      corrections: [],
      performance: {
        score: 100,
        recommendations: []
      }
    };

    // Run AI-powered issue detection
    for (const [issueId, issueConfig] of this.knownIssues) {
      const detectedIssues = await this.detectIssue(jmxContent, issueConfig, context);
      analysis.issues.push(...detectedIssues);
    }

    // Categorize issues by severity
    analysis.issues.forEach(issue => {
      analysis.totalIssues++;
      switch (issue.severity) {
        case 'high':
          analysis.criticalIssues++;
          break;
        case 'medium':
          analysis.warnings++;
          break;
        case 'low':
          analysis.suggestions++;
          break;
      }
    });

    // Generate AI corrections
    analysis.corrections = await this.generateCorrections(jmxContent, analysis.issues, context);

    // Calculate performance score
    analysis.performance = this.calculatePerformanceScore(analysis.issues, context);
    analysis.performanceScore = analysis.performance.score; // Add for compatibility

    return analysis;
  }

  /**
   * Detect specific issue in JMX content
   */
  async detectIssue(jmxContent, issueConfig, context) {
    const detectedIssues = [];
    const matches = jmxContent.matchAll(new RegExp(issueConfig.pattern, 'g'));

    for (const match of matches) {
      const issue = {
        id: issueConfig.id,
        type: issueConfig.id, // Add type property using the id
        severity: issueConfig.severity,
        description: issueConfig.description,
        element: `Line ${this.getLineNumber(jmxContent, match.index)}`, // Add element property
        location: {
          line: this.getLineNumber(jmxContent, match.index),
          column: this.getColumnNumber(jmxContent, match.index),
          snippet: this.getContextSnippet(jmxContent, match.index)
        },
        aiInsight: await this.generateAIInsight(issueConfig, match, context),
        suggestion: await this.generateSuggestedFix(issueConfig, match, context) // Rename for consistency
      };

      detectedIssues.push(issue);
    }

    return detectedIssues;
  }

  /**
   * Generate AI-powered insights for detected issues
   */
  async generateAIInsight(issueConfig, match, context) {
    const insights = {
      'missing_csv_file_path': () => {
        const filePath = match[1];
        return `The CSV file path "${filePath}" appears to be absolute or incorrectly relative. 
                JMeter best practices recommend using relative paths from the JMX file location. 
                This ensures portability across different environments and systems.`;
      },

      'invalid_thread_count': () => {
        const threadCount = parseInt(match[1]);
        const recommendation = threadCount > 100 ? 
          'Consider starting with fewer threads and gradually increasing during load testing' :
          'Thread count appears reasonable for most scenarios';
        return `Thread count: ${threadCount}. ${recommendation}. 
                High thread counts can overwhelm system resources and produce unrealistic load patterns.`;
      },

      'missing_response_assertions': () => {
        return `HTTP requests without response assertions cannot validate if the application is working correctly. 
                Adding assertions helps detect functional failures during load testing, not just performance issues.`;
      },

      'correlation_extraction_missing': () => {
        return `Login requests typically return authentication tokens that must be extracted and used in subsequent requests. 
                Missing correlation can cause authentication failures and unrealistic test scenarios.`;
      },

      'hardcoded_values': () => {
        const url = match[1];
        return `Hardcoded URL "${url}" reduces test flexibility. 
                Parameterizing URLs allows easy environment switching (dev, staging, production) and test customization.`;
      },

      'missing_cookie_manager': () => {
        return `Web applications often use cookies for session management. 
                Without HTTP Cookie Manager, JMeter cannot maintain session state, leading to authentication issues.`;
      },

      'incorrect_content_type': () => {
        return `Request Content-Type headers should match the body format (application/json for JSON, application/x-www-form-urlencoded for forms). 
                Incorrect headers can cause server-side parsing errors.`;
      },

      'missing_timers': () => {
        return `Real users don't send requests immediately after responses. 
                Adding think times creates more realistic load patterns and prevents overwhelming the server.`;
      }
    };

    const generator = insights[issueConfig.id];
    return generator ? generator() : 'AI analysis suggests reviewing this configuration for optimization opportunities.';
  }

  /**
   * Generate specific fix suggestions
   */
  async generateSuggestedFix(issueConfig, match, context) {
    const fixes = {
      'missing_csv_file_path': () => {
        const filename = match[1].split(/[/\\]/).pop();
        return {
          description: 'Convert to relative path',
          originalCode: match[0],
          fixedCode: `<stringProp name="filename">../sample_data/${filename}</stringProp>`,
          explanation: 'Uses relative path from output/ to sample_data/ directory'
        };
      },

      'invalid_thread_count': () => {
        const currentThreads = parseInt(match[1]);
        const recommendedThreads = Math.min(currentThreads, 50);
        return {
          description: 'Optimize thread count',
          originalCode: match[0],
          fixedCode: match[0].replace(currentThreads.toString(), recommendedThreads.toString()),
          explanation: `Reduced from ${currentThreads} to ${recommendedThreads} threads for better performance`
        };
      },

      'missing_response_assertions': () => {
        return {
          description: 'Add response code assertion',
          insertAfter: match[0],
          newCode: `
        <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Response Code Assertion" enabled="true">
          <collectionProp name="Asserion.test_strings">
            <stringProp name="49586">200</stringProp>
          </collectionProp>
          <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>
          <boolProp name="Assertion.assume_success">false</boolProp>
          <intProp name="Assertion.test_type">1</intProp>
        </ResponseAssertion>`,
          explanation: 'Validates that HTTP response code is 200 (OK)'
        };
      },

      'correlation_extraction_missing': () => {
        return {
          description: 'Add JSON token extractor',
          insertAfter: match[0],
          newCode: `
        <JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract Auth Token" enabled="true">
          <stringProp name="JSONPostProcessor.referenceNames">auth_token</stringProp>
          <stringProp name="JSONPostProcessor.jsonPathExprs">$.token</stringProp>
          <stringProp name="JSONPostProcessor.match_numbers">1</stringProp>
          <stringProp name="JSONPostProcessor.defaultValues">TOKEN_NOT_FOUND</stringProp>
        </JSONPostProcessor>`,
          explanation: 'Extracts authentication token for use in subsequent requests'
        };
      },

      'missing_cookie_manager': () => {
        return {
          description: 'Add HTTP Cookie Manager for session handling',
          originalCode: '<TestPlan guiclass="TestPlanGui" testclass="TestPlan"',
          fixedCode: `<CookieManager guiclass="CookiePanel" testclass="CookieManager" testname="HTTP Cookie Manager" enabled="true">
          <collectionProp name="CookieManager.cookies"/>
          <boolProp name="CookieManager.clearEachIteration">false</boolProp>
        </CookieManager>
        <hashTree/>
        <TestPlan guiclass="TestPlanGui" testclass="TestPlan"`,
          explanation: 'Adds cookie management for maintaining session state across requests'
        };
      },

      'missing_timers': () => {
        return {
          description: 'Add uniform random timer for realistic think time',
          originalCode: '</hashTree>\n        <HTTPSamplerProxy',
          fixedCode: `</hashTree>
        <UniformRandomTimer guiclass="UniformRandomTimerGui" testclass="UniformRandomTimer" testname="Think Time" enabled="true">
          <stringProp name="ConstantTimer.delay">1000</stringProp>
          <stringProp name="RandomTimer.range">2000</stringProp>
        </UniformRandomTimer>
        <hashTree/>
        <HTTPSamplerProxy`,
          explanation: 'Adds realistic thinking time between user actions (1-3 seconds)'
        };
      },

      'hardcoded_values': () => {
        const url = match[1];
        const baseUrlVar = '${__property(base.url)}';
        return {
          description: 'Replace hardcoded URL with property variable',
          originalCode: `>${url}<`,
          fixedCode: `>${baseUrlVar}<`,
          explanation: `Parameterizes hardcoded URL "${url}" for environment flexibility`
        };
      }
    };

    const generator = fixes[issueConfig.id];
    return generator ? generator() : null;
  }

  /**
   * Apply AI-generated corrections to JMX content
   * @param {string} jmxContent - Original JMX content
   * @param {Array} corrections - Array of corrections to apply
   * @returns {string} - Corrected JMX content
   */
  async applyCorrections(jmxContent, corrections) {
    let correctedContent = jmxContent;
    let appliedCorrections = [];

    // Sort corrections by position (reverse order to maintain positions)
    const sortedCorrections = corrections
      .filter(c => c.autoApplicable)
      .sort((a, b) => b.position - a.position);

    for (const correction of sortedCorrections) {
      try {
        correctedContent = await this.applySpecificCorrection(correctedContent, correction);
        appliedCorrections.push(correction);
      } catch (error) {
        console.warn(`Failed to apply correction ${correction.id}:`, error.message);
      }
    }

    return {
      correctedContent,
      appliedCorrections,
      stats: {
        totalCorrections: corrections.length,
        appliedCorrections: appliedCorrections.length,
        failedCorrections: corrections.length - appliedCorrections.length
      }
    };
  }

  /**
   * Apply a specific correction to the content
   */
  async applySpecificCorrection(content, correction) {
    switch (correction.type) {
      case 'replace':
        return content.replace(correction.search, correction.replacement);
      
      case 'insert_after':
        const insertIndex = content.indexOf(correction.anchor) + correction.anchor.length;
        return content.slice(0, insertIndex) + correction.newContent + content.slice(insertIndex);
      
      case 'wrap':
        return content.replace(correction.target, correction.wrapper.replace('${content}', correction.target));
      
      default:
        throw new Error(`Unknown correction type: ${correction.type}`);
    }
  }

  /**
   * Generate comprehensive corrections based on detected issues
   */
  async generateCorrections(jmxContent, issues, context) {
    const corrections = [];

    for (const issue of issues) {
      const correction = await this.createCorrectionForIssue(issue, context);
      if (correction) {
        corrections.push(correction);
      }
    }

    return corrections;
  }

  /**
   * Create a specific correction for an issue
   */
  async createCorrectionForIssue(issue, context) {
    if (!issue.suggestion) return null;

    // Map suggestion fields to correction fields based on suggestion structure
    let correction = {
      id: `correction_${issue.id}_${Date.now()}`,
      issueId: issue.id,
      severity: issue.severity,
      description: issue.suggestion.description,
      explanation: issue.suggestion.explanation,
      autoApplicable: ['high', 'medium'].includes(issue.severity),
      requiresUserConfirmation: issue.severity === 'medium'
    };

    // Handle different suggestion formats
    if (issue.suggestion.originalCode && issue.suggestion.fixedCode) {
      // Replace type correction
      correction.type = 'replace';
      correction.search = issue.suggestion.originalCode;
      correction.replacement = issue.suggestion.fixedCode;
    } else if (issue.suggestion.insertAfter && issue.suggestion.newCode) {
      // Insert after type correction
      correction.type = 'insert_after';
      correction.anchor = issue.suggestion.insertAfter;
      correction.newContent = issue.suggestion.newCode;
    } else {
      // Invalid suggestion format
      return null;
    }

    return correction;
  }

  /**
   * Calculate performance score based on issues
   */
  calculatePerformanceScore(issues, context) {
    let score = 100;
    const recommendations = [];

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Generate performance recommendations
    if (score < 70) {
      recommendations.push('⚠️ Multiple critical issues detected. Review and fix high-priority items first.');
    }
    if (score < 85) {
      recommendations.push('🔧 Some optimizations recommended for better test reliability.');
    }
    if (score >= 90) {
      recommendations.push('✅ Test plan appears well-configured with minimal issues.');
    }

    return {
      score: Math.max(0, score),
      grade: this.getScoreGrade(score),
      recommendations
    };
  }

  /**
   * Get letter grade for performance score
   */
  getScoreGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Utility functions for code analysis
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getColumnNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines[lines.length - 1].length + 1;
  }

  getContextSnippet(content, index, contextSize = 50) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(content.length, index + contextSize);
    return content.substring(start, end);
  }
}

export default AIJMXAssistant;
