/**
 * Scenario Validator
 * Validates and automatically corrects UI flow scenarios to ensure compatibility with the parser
 * Resolves common issues and standardizes input before JMX generation
 */

export class ScenarioValidator {
  constructor() {
    this.validationRules = this.initializeValidationRules();
    this.correctionPatterns = this.initializeCorrectionPatterns();
    this.commonScenarios = this.initializeCommonScenarios();
  }

  /**
   * Main validation and correction method
   * @param {string} flowDescription - The raw UI flow description
   * @param {Object} params - Additional parameters like baseUrl, testName
   * @returns {Object} - Validated and corrected flow with suggestions
   */
  async validateAndCorrect(flowDescription, params = {}) {
    try {
      let correctedFlow = flowDescription;
      const issues = [];
      const corrections = [];
      const suggestions = [];

      // Step 1: Basic validation and normalization
      const normalizedResult = this.normalizeFlow(correctedFlow);
      correctedFlow = normalizedResult.flow;
      issues.push(...normalizedResult.issues);
      corrections.push(...normalizedResult.corrections);

      // Step 2: Validate flow structure
      const structureResult = this.validateFlowStructure(correctedFlow);
      correctedFlow = structureResult.flow;
      issues.push(...structureResult.issues);
      corrections.push(...structureResult.corrections);

      // Step 3: Fix common parsing issues
      const parsingResult = this.fixParsingIssues(correctedFlow);
      correctedFlow = parsingResult.flow;
      issues.push(...parsingResult.issues);
      corrections.push(...parsingResult.corrections);

      // Step 4: Enhance with missing elements
      const enhancementResult = this.enhanceFlow(correctedFlow, params);
      correctedFlow = enhancementResult.flow;
      suggestions.push(...enhancementResult.suggestions);
      corrections.push(...enhancementResult.corrections);

      // Step 5: Validate against parser patterns
      const parserResult = await this.validateAgainstParser(correctedFlow);
      if (!parserResult.isValid) {
        const fixResult = this.fixParserCompatibility(correctedFlow, parserResult.errors);
        correctedFlow = fixResult.flow;
        corrections.push(...fixResult.corrections);
      }

      // Step 6: Final validation
      const finalValidation = this.performFinalValidation(correctedFlow);

      return {
        success: true,
        originalFlow: flowDescription,
        correctedFlow,
        wasModified: correctedFlow !== flowDescription,
        issues: this.deduplicateArray(issues),
        corrections: this.deduplicateArray(corrections),
        suggestions: this.deduplicateArray(suggestions),
        validation: finalValidation,
        confidence: this.calculateConfidence(issues, corrections)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalFlow: flowDescription,
        correctedFlow: flowDescription,
        wasModified: false
      };
    }
  }

  /**
   * Initialize validation rules
   */
  initializeValidationRules() {
    return {
      minLength: 10,
      maxLength: 5000,
      requiredActions: ['navigate', 'click', 'fill'],
      prohibitedPatterns: [
        /malicious|harmful|illegal/i,
        /\<script\>/i,
        /javascript:/i
      ],
      navigationPatterns: [
        /go to|navigate to|visit|open|browse to|access/i,
        /start at|begin at|load/i
      ],
      actionPatterns: [
        /click|tap|press|select|choose/i,
        /enter|type|input|fill|write/i,
        /submit|send|login|register/i
      ]
    };
  }

  /**
   * Initialize correction patterns
   */
  initializeCorrectionPatterns() {
    return {
      // Fix common typos and variations
      typos: [
        { pattern: /loggin|log-in|log_in/gi, replacement: 'login' },
        { pattern: /signin|sign-in|sign_in/gi, replacement: 'sign in' },
        { pattern: /signup|sign-up|sign_up/gi, replacement: 'sign up' },
        { pattern: /registor|regester/gi, replacement: 'register' },
        { pattern: /submitt|sumbit/gi, replacement: 'submit' },
        { pattern: /clik|clck/gi, replacement: 'click' },
        { pattern: /naviage|naviagte/gi, replacement: 'navigate' }
      ],

      // Standardize action verbs
      actionVerbs: [
        { pattern: /tap on|press on|hit/gi, replacement: 'click' },
        { pattern: /key in|input in|type in/gi, replacement: 'enter' },
        { pattern: /browse to|go to|visit/gi, replacement: 'navigate to' },
        { pattern: /look for|search for/gi, replacement: 'search' }
      ],

      // Fix URL patterns
      urls: [
        { pattern: /http:\/\/(?!localhost)/gi, replacement: 'https://' },
        { pattern: /www\.([^\/\s]+)(?!\.)/gi, replacement: 'https://www.$1.com' }
      ],

      // Standardize selectors
      selectors: [
        { pattern: /user name|user-name|user_name/gi, replacement: 'username' },
        { pattern: /pass word|pass-word|pass_word/gi, replacement: 'password' },
        { pattern: /e-mail|e_mail/gi, replacement: 'email' }
      ]
    };
  }

  /**
   * Initialize common scenario patterns
   */
  initializeCommonScenarios() {
    return {
      login: {
        keywords: ['login', 'sign in', 'authenticate'],
        requiredSteps: ['navigate', 'fill username', 'fill password', 'click login'],
        template: 'Navigate to login page. Enter username. Enter password. Click login button.'
      },
      registration: {
        keywords: ['register', 'sign up', 'create account'],
        requiredSteps: ['navigate', 'fill details', 'submit'],
        template: 'Navigate to registration page. Fill in user details. Submit registration form.'
      },
      ecommerce: {
        keywords: ['shop', 'buy', 'purchase', 'cart', 'checkout'],
        requiredSteps: ['navigate', 'search', 'select', 'add to cart', 'checkout'],
        template: 'Navigate to store. Search for product. Select item. Add to cart. Proceed to checkout.'
      },
      search: {
        keywords: ['search', 'find', 'look for'],
        requiredSteps: ['navigate', 'enter search', 'submit search'],
        template: 'Navigate to search page. Enter search terms. Submit search.'
      }
    };
  }

  /**
   * Normalize the flow description
   */
  normalizeFlow(flowDescription) {
    let flow = flowDescription.trim();
    const issues = [];
    const corrections = [];

    // Check minimum length
    if (flow.length < this.validationRules.minLength) {
      issues.push(`Flow description too short (${flow.length} chars, minimum ${this.validationRules.minLength})`);
      
      // Try to expand with common scenario template
      const scenario = this.detectScenarioType(flow);
      if (scenario) {
        flow = scenario.template;
        corrections.push(`Expanded short description using ${scenario.type} template`);
      } else {
        flow = `Navigate to homepage. ${flow}. Wait for page load.`;
        corrections.push('Expanded short description with basic navigation and wait steps');
      }
    }

    // Check maximum length
    if (flow.length > this.validationRules.maxLength) {
      issues.push(`Flow description too long (${flow.length} chars, maximum ${this.validationRules.maxLength})`);
      flow = flow.substring(0, this.validationRules.maxLength - 3) + '...';
      corrections.push('Truncated overly long description');
    }

    // Check for prohibited content
    for (const pattern of this.validationRules.prohibitedPatterns) {
      if (pattern.test(flow)) {
        issues.push('Contains prohibited content');
        flow = flow.replace(pattern, '[REMOVED]');
        corrections.push('Removed prohibited content');
      }
    }

    // Apply typo corrections
    for (const correction of this.correctionPatterns.typos) {
      const originalFlow = flow;
      flow = flow.replace(correction.pattern, correction.replacement);
      if (flow !== originalFlow) {
        corrections.push(`Fixed typo: ${correction.pattern.source} → ${correction.replacement}`);
      }
    }

    // Standardize action verbs
    for (const correction of this.correctionPatterns.actionVerbs) {
      const originalFlow = flow;
      flow = flow.replace(correction.pattern, correction.replacement);
      if (flow !== originalFlow) {
        corrections.push(`Standardized action: ${correction.pattern.source} → ${correction.replacement}`);
      }
    }

    return { flow, issues, corrections };
  }

  /**
   * Validate flow structure
   */
  validateFlowStructure(flowDescription) {
    let flow = flowDescription;
    const issues = [];
    const corrections = [];

    // Ensure proper sentence structure
    if (!flow.endsWith('.') && !flow.endsWith('!') && !flow.endsWith('?')) {
      flow += '.';
      corrections.push('Added missing sentence termination');
    }

    // Check for proper action sequence
    const hasNavigation = this.validationRules.navigationPatterns.some(pattern => pattern.test(flow));
    const hasActions = this.validationRules.actionPatterns.some(pattern => pattern.test(flow));

    if (!hasNavigation) {
      issues.push('Missing navigation step');
      flow = `Navigate to application. ${flow}`;
      corrections.push('Added missing navigation step');
    }

    if (!hasActions) {
      issues.push('Missing user actions');
      flow += ' Click submit button.';
      corrections.push('Added missing user action');
    }

    // Fix common sentence separation issues
    flow = flow.replace(/([.!?])\s*([a-z])/g, '$1 $2'.replace(/\s+([a-z])/, (match, letter) => ` ${letter.toUpperCase()}`));
    flow = flow.replace(/,\s*([A-Z])/g, '. $1');

    // Ensure steps are properly separated
    if (!flow.includes('.') && !flow.includes(',')) {
      // Single long sentence - try to break it down
      const stepKeywords = ['then', 'next', 'after', 'and then', 'followed by'];
      for (const keyword of stepKeywords) {
        flow = flow.replace(new RegExp(keyword, 'gi'), '. Then');
      }
      if (flow.indexOf('. Then') > 0) {
        corrections.push('Added sentence breaks for better step separation');
      }
    }

    return { flow, issues, corrections };
  }

  /**
   * Fix common parsing issues
   */
  fixParsingIssues(flowDescription) {
    let flow = flowDescription;
    const issues = [];
    const corrections = [];

    // Fix URL patterns
    for (const correction of this.correctionPatterns.urls) {
      const originalFlow = flow;
      flow = flow.replace(correction.pattern, correction.replacement);
      if (flow !== originalFlow) {
        corrections.push(`Fixed URL format: ${correction.pattern.source}`);
      }
    }

    // Fix selector patterns
    for (const correction of this.correctionPatterns.selectors) {
      const originalFlow = flow;
      flow = flow.replace(correction.pattern, correction.replacement);
      if (flow !== originalFlow) {
        corrections.push(`Standardized field name: ${correction.pattern.source} → ${correction.replacement}`);
      }
    }

    // Fix ambiguous references
    flow = this.fixAmbiguousReferences(flow, corrections);

    // Ensure quoted values for form inputs
    flow = this.ensureQuotedValues(flow, corrections);

    // Fix action-target associations
    flow = this.fixActionTargetAssociations(flow, corrections);

    return { flow, issues, corrections };
  }

  /**
   * Fix ambiguous references in the flow
   */
  fixAmbiguousReferences(flow, corrections) {
    // Fix pronoun references
    const pronounFixes = [
      { pattern: /click it(?!\w)/gi, replacement: 'click the button' },
      { pattern: /select it(?!\w)/gi, replacement: 'select the option' },
      { pattern: /fill it(?!\w)/gi, replacement: 'fill the field with "test data"' },
      { pattern: /submit it(?!\w)/gi, replacement: 'submit the form' },
      { pattern: /enter it(?!\w)/gi, replacement: 'enter "test data"' },
      { pattern: /type it(?!\w)/gi, replacement: 'type "test data"' }
    ];

    for (const fix of pronounFixes) {
      const original = flow;
      flow = flow.replace(fix.pattern, fix.replacement);
      if (flow !== original) {
        corrections.push(`Fixed ambiguous reference: ${fix.pattern.source} → ${fix.replacement}`);
      }
    }

    // Fix incomplete action descriptions
    const incompleteFixes = [
      { pattern: /enter\s+(?=and|then|\.|,|$)/gi, replacement: 'enter "test data"' },
      { pattern: /click\s+(?=and|then|\.|,|$)/gi, replacement: 'click the button' },
      { pattern: /search\s+(?=and|then|\.|,|$)/gi, replacement: 'search for "products"' },
      { pattern: /fill\s+(?=and|then|\.|,|$)/gi, replacement: 'fill field with "test data"' },
      { pattern: /type\s+(?=and|then|\.|,|$)/gi, replacement: 'type "test data"' }
    ];

    for (const fix of incompleteFixes) {
      const original = flow;
      flow = flow.replace(fix.pattern, fix.replacement);
      if (flow !== original) {
        corrections.push(`Completed incomplete action: ${fix.pattern.source} → ${fix.replacement}`);
      }
    }

    return flow;
  }

  /**
   * Ensure values for form inputs are properly quoted
   */
  ensureQuotedValues(flow, corrections) {
    // Pattern to find input actions without quoted values
    const inputPatterns = [
      {
        pattern: /(?:enter|type|input|fill)\s+(?!["'])([\w\s@.-]+?)(?=\s+(?:in|into|to|and|then|\.|$))/gi,
        description: 'Added quotes around input values'
      }
    ];

    for (const inputPattern of inputPatterns) {
      let modifiedFlow = flow;
      const matches = [...flow.matchAll(inputPattern.pattern)];
      for (const match of matches) {
        const value = match[1].trim();
        // Don't quote if it's already quoted, a field name, or common words that shouldn't be quoted
        if (!value.includes('"') && !value.includes("'") && 
            !value.includes('field') && !value.includes('box') && 
            !value.includes('button') && !value.includes('page') &&
            !['in', 'to', 'the', 'and', 'or', 'with'].includes(value.toLowerCase())) {
          const quotedValue = `"${value}"`;
          modifiedFlow = modifiedFlow.replace(match[0], match[0].replace(value, quotedValue));
          corrections.push(`${inputPattern.description}: ${value} → ${quotedValue}`);
        }
      }
      flow = modifiedFlow;
    }

    // Handle specific patterns that might not be caught by the general pattern
    const specificPatterns = [
      { from: /enter\s+stuff/gi, to: 'enter "test data"', desc: 'Specified default test data' },
      { from: /type\s+data/gi, to: 'type "sample data"', desc: 'Specified sample data' },
      { from: /input\s+text/gi, to: 'input "sample text"', desc: 'Specified sample text' }
    ];

    for (const pattern of specificPatterns) {
      const originalFlow = flow;
      flow = flow.replace(pattern.from, pattern.to);
      if (flow !== originalFlow) {
        corrections.push(pattern.desc);
      }
    }

    return flow;
  }

  /**
   * Fix action-target associations
   */
  fixActionTargetAssociations(flow, corrections) {
    // Ensure login actions target appropriate elements
    const loginFixes = [
      {
        pattern: /enter\s+username\s+(?!in|into)/gi,
        replacement: 'enter username in username field',
        description: 'Added target specification for username entry'
      },
      {
        pattern: /enter\s+password\s+(?!in|into)/gi,
        replacement: 'enter password in password field',
        description: 'Added target specification for password entry'
      },
      {
        pattern: /click\s+login\s+(?!button|btn)/gi,
        replacement: 'click login button',
        description: 'Added button specification for login click'
      }
    ];

    for (const fix of loginFixes) {
      const original = flow;
      flow = flow.replace(fix.pattern, fix.replacement);
      if (flow !== original) {
        corrections.push(fix.description);
      }
    }

    return flow;
  }

  /**
   * Enhance flow with missing elements
   */
  enhanceFlow(flowDescription, params) {
    let flow = flowDescription;
    const suggestions = [];
    const corrections = [];

    // Add base URL if navigation is missing specific URL
    if (params.baseUrl && !flow.includes('http') && flow.includes('navigate')) {
      const urlPattern = /navigate to (?!http)(\w+)/gi;
      flow = flow.replace(urlPattern, (match, path) => {
        const fullUrl = `${params.baseUrl}/${path}`;
        corrections.push(`Enhanced navigation with full URL: ${match} → navigate to ${fullUrl}`);
        return `navigate to ${fullUrl}`;
      });
    }

    // Add wait steps after form submissions
    if (flow.includes('submit') || flow.includes('login') || flow.includes('register')) {
      if (!flow.includes('wait')) {
        flow += ' Wait for page to load.';
        corrections.push('Added wait step after form submission');
      }
    }

    // Suggest additional validations
    if (flow.includes('login')) {
      suggestions.push('Consider adding verification step after login (e.g., "verify dashboard appears")');
    }

    if (flow.includes('register') || flow.includes('sign up')) {
      suggestions.push('Consider adding email verification or confirmation step');
    }

    if (flow.includes('purchase') || flow.includes('checkout')) {
      suggestions.push('Consider adding payment validation and order confirmation steps');
    }

    // Add error handling suggestions
    suggestions.push('Consider adding error handling scenarios (invalid credentials, network timeouts, etc.)');
    
    return { flow, suggestions, corrections };
  }

  /**
   * Validate against parser using actual parser
   */
  async validateAgainstParser(flowDescription) {
    try {
      // Import the parser dynamically to avoid circular dependencies
      const { PromptToFlowParser } = await import('../parsers/promptToFlowParser.js');
      const parser = new PromptToFlowParser();
      
      const result = await parser.parsePrompt(flowDescription);
      
      if (!result.success) {
        return {
          isValid: false,
          errors: [result.error],
          steps: []
        };
      }

      const validation = parser.validateFlowSteps(result.steps);
      
      return {
        isValid: validation.isValid,
        errors: validation.errors || [],
        steps: result.steps || []
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Parser validation failed: ${error.message}`],
        steps: []
      };
    }
  }

  /**
   * Fix parser compatibility issues
   */
  fixParserCompatibility(flowDescription, errors) {
    let flow = flowDescription;
    const corrections = [];

    for (const error of errors) {
      if (error.includes('Missing action')) {
        flow = this.addMissingActions(flow);
        corrections.push('Added missing action steps');
      }

      if (error.includes('Missing selector')) {
        flow = this.addMissingSelectors(flow);
        corrections.push('Added missing element selectors');
      }

      if (error.includes('Missing value')) {
        flow = this.addMissingValues(flow);
        corrections.push('Added missing input values');
      }

      if (error.includes('Missing URL')) {
        flow = this.addMissingUrls(flow);
        corrections.push('Added missing navigation URLs');
      }
    }

    // Additional comprehensive value fixing
    flow = this.ensureAllValuesPresent(flow, corrections);

    return { flow, corrections };
  }

  /**
   * Ensure all fill actions have values
   */
  ensureAllValuesPresent(flow, corrections) {
    // Find all fill/enter actions and ensure they have values
    let modifiedFlow = flow;
    
    // Handle structured form data patterns (like "- First name: John")
    modifiedFlow = this.handleStructuredFormData(modifiedFlow, corrections);
    
    // Pattern to catch various fill scenarios
    const fillPatterns = [
      { pattern: /\b(enter|type|input|fill)\s+([^"'\n.]+?)(?=\s*(?:in|into|to|\.|,|and|then|$))/gi, defaultValue: 'test data' },
      { pattern: /\b(enter|type|input|fill)\s+$/gi, defaultValue: 'test data' },
      { pattern: /\b(enter|type|input|fill)\s+(?=in|into|to)/gi, defaultValue: 'test data' }
    ];

    for (const fillPattern of fillPatterns) {
      modifiedFlow = modifiedFlow.replace(fillPattern.pattern, (match, action, value) => {
        // If value is present but not quoted and not a field reference
        if (value && value.trim() && 
            !value.includes('"') && !value.includes("'") && 
            !value.includes('field') && !value.includes('button') &&
            !value.includes('page') && !value.includes('box') &&
            !value.includes('with') && !value.includes('the')) {
          corrections.push(`Added quotes around value: ${value.trim()}`);
          return `${action} "${value.trim()}"`;
        }
        // If no value at all
        else if (!value || !value.trim()) {
          corrections.push(`Added default value for ${action} action`);
          return `${action} "${fillPattern.defaultValue}"`;
        }
        return match;
      });
    }

    // Handle specific patterns that might still have issues
    const specificFixes = [
      { from: /fill field(?!\s+with)/gi, to: 'fill field with "test data"', desc: 'Added missing value for fill field' },
      { from: /fill the field(?!\s+with)/gi, to: 'fill the field with "test data"', desc: 'Added missing value for fill the field' },
      { from: /enter\s+in\s+/gi, to: 'enter "test data" in ', desc: 'Added missing value before field target' },
      { from: /type\s+in\s+/gi, to: 'type "test data" in ', desc: 'Added missing value before field target' }
    ];

    for (const fix of specificFixes) {
      const original = modifiedFlow;
      modifiedFlow = modifiedFlow.replace(fix.from, fix.to);
      if (modifiedFlow !== original) {
        corrections.push(fix.desc);
      }
    }

    return modifiedFlow;
  }

  /**
   * Handle structured form data patterns like "- First name: John"
   */
  handleStructuredFormData(flow, corrections) {
    let modifiedFlow = flow;
    
    // Pattern to find structured form data lists
    const structuredDataPattern = /Fill\s+[\w\s]+\s+form\s+with\s+[\w\s]+:\s*((?:\s*-\s*[^:]+:\s*[^\n]+\n?)+)/gi;
    
    modifiedFlow = modifiedFlow.replace(structuredDataPattern, (match, dataList) => {
      corrections.push('Converted structured form data to individual fill actions');
      
      // Extract individual field:value pairs
      const fieldValuePairs = dataList.match(/-\s*([^:]+):\s*([^\n]+)/g) || [];
      
      const fillActions = fieldValuePairs.map(pair => {
        const match = pair.match(/-\s*([^:]+):\s*([^\n]+)/);
        if (match) {
          const fieldName = match[1].trim().toLowerCase().replace(/\s+/g, '');
          const value = match[2].trim();
          return `Fill ${fieldName} field with "${value}".`;
        }
        return '';
      }).filter(action => action);
      
      return fillActions.join(' ');
    });
    
    // Handle remaining "Fill X: Y" patterns not in lists
    modifiedFlow = modifiedFlow.replace(/Fill\s+([^:]+):\s*([^\.\n]+)/gi, (match, field, value) => {
      const fieldName = field.trim().toLowerCase().replace(/\s+/g, '');
      const fieldValue = value.trim();
      corrections.push(`Converted direct field assignment to fill action: ${match}`);
      return `Fill ${fieldName} field with "${fieldValue}"`;
    });
    
    // Handle "- Field: Value" patterns that weren't caught above
    modifiedFlow = modifiedFlow.replace(/-\s*([^:]+):\s*([^\n]+)/g, (match, field, value) => {
      const fieldName = field.trim().toLowerCase().replace(/\s+/g, '');
      const fieldValue = value.trim();
      corrections.push(`Converted list item to fill action: ${match}`);
      return `Fill ${fieldName} field with "${fieldValue}".`;
    });
    
    return modifiedFlow;
  }

  /**
   * Add missing actions to flow
   */
  addMissingActions(flow) {
    if (!flow.toLowerCase().includes('navigate') && !flow.toLowerCase().includes('go to')) {
      flow = `Navigate to application homepage. ${flow}`;
    }

    if (!flow.toLowerCase().includes('click') && !flow.toLowerCase().includes('submit')) {
      flow += ' Click submit button.';
    }

    return flow;
  }

  /**
   * Add missing selectors to flow
   */
  addMissingSelectors(flow) {
    // Add field specifications for common inputs
    flow = flow.replace(/enter\s+([^"'\s]+)(?!\s+in)/gi, 'enter $1 in $1 field');
    flow = flow.replace(/click\s+(?!button|btn|link)(\w+)(?!\s+button)/gi, 'click $1 button');
    
    return flow;
  }

  /**
   * Add missing values to flow
   */
  addMissingValues(flow) {
    // Add default values for common inputs
    const valueReplacements = [
      { pattern: /enter\s+in\s+username/gi, replacement: 'enter "testuser" in username' },
      { pattern: /enter\s+in\s+password/gi, replacement: 'enter "password123" in password' },
      { pattern: /enter\s+in\s+email/gi, replacement: 'enter "test@example.com" in email' },
      { pattern: /search\s+for$/gi, replacement: 'search for "products"' },
      { pattern: /enter\s+stuff/gi, replacement: 'enter "test data"' },
      { pattern: /enter\s+(?!["'])([\w\s@.-]+?)(?=\s+(?:in|into|to|and|then|\.|$))/gi, replacement: 'enter "$1"' }
    ];

    for (const replacement of valueReplacements) {
      flow = flow.replace(replacement.pattern, replacement.replacement);
    }

    // Fix any remaining unquoted values in fill actions
    flow = flow.replace(/(?:enter|type|input|fill)\s+([^"'\s,]+)(?=\s+(?:in|into|to))/gi, (match, value) => {
      if (!value.includes('"') && !value.includes("'")) {
        return match.replace(value, `"${value}"`);
      }
      return match;
    });

    return flow;
  }

  /**
   * Add missing URLs to flow
   */
  addMissingUrls(flow) {
    // Add default URLs for common navigation
    const urlReplacements = [
      { pattern: /navigate to login(?!\s+page)/gi, replacement: 'navigate to login page' },
      { pattern: /go to home(?!\s+page)/gi, replacement: 'go to home page' },
      { pattern: /visit dashboard/gi, replacement: 'visit dashboard page' }
    ];

    for (const replacement of urlReplacements) {
      flow = flow.replace(replacement.pattern, replacement.replacement);
    }

    // Add specific paths where missing
    flow = flow.replace(/navigate to (\w+) page/gi, 'navigate to /$1');

    return flow;
  }

  /**
   * Perform final validation
   */
  performFinalValidation(flowDescription) {
    const validationResults = {
      hasNavigation: this.validationRules.navigationPatterns.some(p => p.test(flowDescription)),
      hasActions: this.validationRules.actionPatterns.some(p => p.test(flowDescription)),
      hasProperStructure: flowDescription.includes('.') || flowDescription.includes(','),
      lengthAppropriate: flowDescription.length >= this.validationRules.minLength,
      noProhibitedContent: !this.validationRules.prohibitedPatterns.some(p => p.test(flowDescription))
    };

    const overallValid = Object.values(validationResults).every(result => result === true);

    return {
      isValid: overallValid,
      details: validationResults,
      score: Object.values(validationResults).filter(Boolean).length / Object.keys(validationResults).length
    };
  }

  /**
   * Detect scenario type from flow description
   */
  detectScenarioType(flowDescription) {
    const lowerFlow = flowDescription.toLowerCase();
    
    for (const [type, scenario] of Object.entries(this.commonScenarios)) {
      if (scenario.keywords.some(keyword => lowerFlow.includes(keyword))) {
        return { type, ...scenario };
      }
    }
    
    return null;
  }

  /**
   * Calculate confidence score for corrections
   */
  calculateConfidence(issues, corrections) {
    const totalProblems = issues.length;
    const totalCorrections = corrections.length;
    
    if (totalProblems === 0) return 1.0; // Perfect
    
    const correctionRatio = totalCorrections / totalProblems;
    return Math.min(correctionRatio * 0.8, 0.95); // Cap at 95% confidence
  }

  /**
   * Remove duplicate items from array
   */
  deduplicateArray(array) {
    return [...new Set(array)];
  }

  /**
   * Get validation summary for debugging
   */
  getValidationSummary(result) {
    return {
      wasModified: result.wasModified,
      issuesFound: result.issues?.length || 0,
      correctionsMade: result.corrections?.length || 0,
      suggestionsProvided: result.suggestions?.length || 0,
      finalValidation: result.validation?.isValid || false,
      confidence: result.confidence || 0
    };
  }
}

export default ScenarioValidator;
