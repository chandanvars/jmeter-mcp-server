/**
 * Prompt to UI Flow Parser
 * Converts natural language descriptions of user flows into actionable test steps
 */

export class PromptToFlowParser {
  constructor() {
    this.actionPatterns = this.initializeActionPatterns();
    this.elementPatterns = this.initializeElementPatterns();
    this.dataPatterns = this.initializeDataPatterns();
  }

  /**
   * Parse natural language prompt into structured UI flow steps
   */
  async parsePrompt(prompt) {
    try {
      const steps = [];
      const sentences = this.splitIntoSentences(prompt);
      
      for (const sentence of sentences) {
        const step = await this.parseSentence(sentence);
        if (step) {
          steps.push(step);
        }
      }

      return {
        success: true,
        steps,
        originalPrompt: prompt
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalPrompt: prompt
      };
    }
  }

  /**
   * Parse individual sentence into UI action
   */
  async parseSentence(sentence) {
    const cleanSentence = sentence.toLowerCase().trim();
    const originalSentence = sentence.trim();
    
    // Skip empty or very short sentences
    if (cleanSentence.length < 3) return null;

    // Fill/input patterns should be checked BEFORE navigation patterns
    // to prevent username values from being interpreted as URLs
    if (this.matchesPattern(cleanSentence, this.actionPatterns.fill)) {
      return this.parseFillAction(originalSentence);
    }
    
    // Navigation patterns
    if (this.matchesPattern(cleanSentence, this.actionPatterns.navigate)) {
      return this.parseNavigateAction(originalSentence);
    }
    
    // Search patterns
    if (this.matchesPattern(cleanSentence, this.actionPatterns.search)) {
      return this.parseSearchAction(originalSentence);
    }
    
    // Click patterns
    if (this.matchesPattern(cleanSentence, this.actionPatterns.click)) {
      return this.parseClickAction(originalSentence);
    }
    
    // Submit patterns
    if (this.matchesPattern(cleanSentence, this.actionPatterns.submit)) {
      return this.parseSubmitAction(originalSentence);
    }
    
    // Wait patterns
    if (this.matchesPattern(cleanSentence, this.actionPatterns.wait)) {
      return this.parseWaitAction(originalSentence);
    }

    // If no pattern matches, try to infer action
    return this.inferAction(originalSentence);
  }

  /**
   * Initialize action pattern recognition
   */
  initializeActionPatterns() {
    return {
      navigate: [
        /go to|navigate to|visit|open|browse to/,
        /access|load|start at/,
        /begin at|start with/
      ],
      click: [
        /click|tap|press|select/,
        /choose|pick|hit/,
        /activate|trigger/,
        /add to cart|add to basket/,
        /proceed to|continue to/
      ],
      search: [
        /search|find|look for|query/
      ],
      fill: [
        /enter|type|input|fill/,
        /write.*in|insert.*in|add.*in/,  // More specific - require "in" context for add
        /provide|specify/
      ],
      submit: [
        /submit|send|post/,
        /login|sign in|authenticate/,
        /register|sign up|create account/
      ],
      wait: [
        /wait|pause|delay/,
        /hold|sleep|timeout/
      ]
    };
  }

  /**
   * Initialize element identification patterns
   */
  initializeElementPatterns() {
    return {
      login: {
        email: ['email', 'e-mail', 'username', 'user name', 'login', 'account'],
        password: ['password', 'pass', 'secret', 'credentials'],
        button: ['login button', 'sign in', 'submit', 'enter', 'go']
      },
      forms: {
        firstName: ['first name', 'given name', 'fname'],
        lastName: ['last name', 'surname', 'family name', 'lname'],
        phone: ['phone', 'telephone', 'mobile', 'cell'],
        address: ['address', 'street', 'location']
      },
      navigation: {
        menu: ['menu', 'navigation', 'nav'],
        home: ['home', 'homepage', 'main page'],
        profile: ['profile', 'account', 'user settings'],
        logout: ['logout', 'sign out', 'exit']
      },
      ecommerce: {
        search: ['search', 'find', 'look for'],
        cart: ['cart', 'basket', 'shopping cart'],
        checkout: ['checkout', 'pay', 'purchase', 'buy'],
        product: ['product', 'item', 'goods']
      }
    };
  }

  /**
   * Initialize data extraction patterns
   */
  initializeDataPatterns() {
    return {
      url: /https?:\/\/[^\s]+/,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      cssSelector: /#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|\[[^\]]+\]/,
      xpath: /\/\/[^\s]+/,
      quoted: /"([^"]+)"|'([^']+)'/,
      time: /(\d+)\s*(second|minute|sec|min)s?/,
      number: /\d+/
    };
  }

  /**
   * Parse navigation action with improved page recognition
   */
  parseNavigateAction(sentence) {
    // First check for full URLs
    const urlMatch = sentence.match(this.dataPatterns.url);
    if (urlMatch) {
      return {
        action: 'navigate',
        data: { url: urlMatch[0] },
        description: `Navigate to ${urlMatch[0]}`
      };
    }

    // Handle path patterns like "/login" (with leading slash)
    const pathMatch = sentence.match(/\/[\w\-\/]+/);
    if (pathMatch) {
      return {
        action: 'navigate',
        data: { url: pathMatch[0] },
        description: `Navigate to ${pathMatch[0]}`
      };
    }

    // Handle relative navigation with quotes
    const quotedMatch = sentence.match(this.dataPatterns.quoted);
    if (quotedMatch) {
      const url = quotedMatch[1] || quotedMatch[2];
      return {
        action: 'navigate',
        data: { url },
        description: `Navigate to ${url}`
      };
    }

    // Handle common page types by recognizing page names (but NOT usernames)
    const pageTypes = {
      'login': [/(?:to|the)\s+login\s*page/i, /sign\s*in\s*page/i, /authentication\s*page/i],
      'home': [/(?:to|the)\s+home\s*page/i, /homepage/i, /main\s*page/i],
      'profile': [/(?:to|the)\s+profile\s*page/i, /account\s*page/i, /user\s*page/i],
      'dashboard': [/(?:to|the)\s+dashboard/i, /control\s*panel/i],
      'settings': [/(?:to|the)\s+settings\s*page/i, /configuration/i],
      'about': [/(?:to|the)\s+about\s*page/i, /about\s*us/i],
      'contact': [/(?:to|the)\s+contact\s*page/i, /contact\s*us/i],
      'register': [/(?:to|the)\s+register\s*page/i, /sign\s*up\s*page/i, /registration/i],
      'checkout': [/(?:to|the)\s+checkout\s*page/i, /payment\s*page/i],
      'cart': [/(?:to|the)\s+cart\s*page/i, /shopping\s*cart/i, /basket/i]
    };

    // Check for common page patterns (more restrictive to avoid usernames)
    for (const [pageName, patterns] of Object.entries(pageTypes)) {
      for (const pattern of patterns) {
        if (pattern.test(sentence)) {
          return {
            action: 'navigate',
            data: { url: `/${pageName}` },
            description: `Navigate to ${pageName} page`
          };
        }
      }
    }

    // Extract path patterns like "/login", "/about", etc.
    const pathMatchSecond = sentence.match(/\/[\w\-\/]*/);
    if (pathMatchSecond) {
      return {
        action: 'navigate',
        data: { url: pathMatchSecond[0] },
        description: `Navigate to ${pathMatchSecond[0]}`
      };
    }

    // Default fallback
    return {
      action: 'navigate',
      data: { url: '${baseUrl}' },
      description: 'Navigate to base URL'
    };
  }

  /**
   * Parse click action
   */
  /**
   * Parse search action from sentence
   */
  parseSearchAction(sentence) {
    // Extract search terms
    let searchTerm = '';
    const searchPatterns = [
      /search\s+for\s+['"]?([^'"]+)['"]?/i,
      /find\s+['"]?([^'"]+)['"]?/i,
      /look\s+for\s+['"]?([^'"]+)['"]?/i,
      /query\s+['"]?([^'"]+)['"]?/i
    ];
    
    for (const pattern of searchPatterns) {
      const match = sentence.match(pattern);
      if (match) {
        searchTerm = match[1];
        break;
      }
    }
    
    // If no specific term found, default to "products"
    if (!searchTerm) {
      searchTerm = 'products';
    }
    
    return {
      action: 'fill',
      selector: 'input[name="search"], #search, .search-input, [placeholder*="search"]',
      fieldType: 'search',
      data: { value: searchTerm },
      description: `Search for "${searchTerm}"`
    };
  }

  /**
   * Parse click action from sentence
   */
  parseClickAction(sentence) {
    // Look for CSS selector patterns
    const selectorMatch = sentence.match(this.dataPatterns.cssSelector);
    if (selectorMatch) {
      return {
        action: 'click',
        selector: selectorMatch[0],
        description: `Click ${selectorMatch[0]}`
      };
    }

    // Infer selector from element description
    const selector = this.inferSelector(sentence);
    return {
      action: 'click',
      selector,
      description: `Click ${selector}`
    };
  }

  /**
   * Parse fill/input action
   */
  parseFillAction(sentence) {
    // First, extract the value being entered (handle quoted values properly)
    let value = '';
    let fieldType = '';
    
    // Look for quoted values first (most reliable)
    const quotedMatch = sentence.match(/(['"])([^'"]+)\1/);
    if (quotedMatch) {
      value = quotedMatch[2];
    } else {
      // Look for specific patterns like "username tomsmith" or "enter tomsmith"
      const fillPatterns = [
        /(?:enter|type|input|fill)\s+(?:username|user)\s+['"]?([^'".\s,]+)['"]?/i,
        /(?:enter|type|input|fill)\s+['"]?([^'".\s,]+)['"]?\s+(?:in|into|to)/i,
        /(?:username|user)\s+['"]?([^'".\s,]+)['"]?/i,
        /(?:password)\s+['"]?([^'".\s,]+)['"]?/i
      ];
      
      for (const pattern of fillPatterns) {
        const match = sentence.match(pattern);
        if (match) {
          value = match[1];
          break;
        }
      }
    }
    
    // Determine field type and selector
    const lowerSentence = sentence.toLowerCase();
    if (lowerSentence.includes('username') || lowerSentence.includes('user')) {
      fieldType = 'username';
    } else if (lowerSentence.includes('password') || lowerSentence.includes('pass')) {
      fieldType = 'password';
    } else if (lowerSentence.includes('email')) {
      fieldType = 'email';
    } else {
      fieldType = 'text';
    }
    
    const selector = this.inferSelector(sentence, fieldType);

    return {
      action: 'fill',
      selector,
      fieldType,
      data: { value },
      description: `Enter "${value}" in ${fieldType} field`
    };
  }

  /**
   * Parse submit action
   */
  parseSubmitAction(sentence) {
    const selector = this.inferSubmitSelector(sentence);
    return {
      action: 'click', // Most submits are clicks
      selector,
      description: `Submit via ${selector}`
    };
  }

  /**
   * Parse wait action
   */
  parseWaitAction(sentence) {
    const timeMatch = sentence.match(this.dataPatterns.time);
    let timeout = 2000; // default 2 seconds
    
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2];
      
      if (unit.startsWith('min')) {
        timeout = value * 60 * 1000;
      } else {
        timeout = value * 1000;
      }
    }

    return {
      action: 'wait',
      data: { timeout },
      description: `Wait for ${timeout}ms`
    };
  }

  /**
   * Infer CSS selector from element description
   */
  inferSelector(sentence, fieldType = null) {
    // Use fieldType if provided for more accurate selectors
    if (fieldType) {
      switch (fieldType) {
        case 'username':
          return '#username, input[name="username"], input[type="text"], input[id*="user"]'.split(', ')[0];
        case 'password':
          return '#password, input[name="password"], input[type="password"]'.split(', ')[0];
        case 'email':
          return '#email, input[name="email"], input[type="email"]'.split(', ')[0];
        default:
          return 'input[type="text"]';
      }
    }

    // Check for explicit selectors first
    const selectorMatch = sentence.match(this.dataPatterns.cssSelector);
    if (selectorMatch) {
      return selectorMatch[0];
    }

    // Check login elements
    for (const [field, keywords] of Object.entries(this.elementPatterns.login)) {
      if (keywords.some(keyword => sentence.includes(keyword))) {
        switch (field) {
          case 'email':
            return '#email, #input-email, input[name="email"], input[type="email"]'.split(', ')[0];
          case 'password':
            return '#password, #input-password, input[name="password"], input[type="password"]'.split(', ')[0];
          case 'button':
            return '#login, .login-btn, input[type="submit"], button[type="submit"]'.split(', ')[0];
        }
      }
    }

    // Check form elements
    for (const [field, keywords] of Object.entries(this.elementPatterns.forms)) {
      if (keywords.some(keyword => sentence.includes(keyword))) {
        return `input[name="${field}"], #${field}`.split(', ')[0];
      }
    }

    // Check navigation elements
    for (const [element, keywords] of Object.entries(this.elementPatterns.navigation)) {
      if (keywords.some(keyword => sentence.includes(keyword))) {
        return `.${element}, #${element}`.split(', ')[0];
      }
    }

    // Check ecommerce elements
    for (const [element, keywords] of Object.entries(this.elementPatterns.ecommerce)) {
      if (keywords.some(keyword => sentence.includes(keyword))) {
        switch (element) {
          case 'search':
            return '#search, .search-input, input[name="search"]';
          case 'cart':
            return '.cart, #cart, .shopping-cart';
          case 'checkout':
            return '.checkout, #checkout, .checkout-btn';
          default:
            return `.${element}, #${element}`;
        }
      }
    }

    // Default fallback
    return 'button, .btn, input[type="submit"]';
  }

  /**
   * Infer input value from context
   */
  inferInputValue(sentence) {
    // Common test values
    if (sentence.includes('email')) {
      return 'test@example.com';
    }
    if (sentence.includes('password')) {
      return 'password123';
    }
    if (sentence.includes('username')) {
      return 'testuser';
    }
    if (sentence.includes('first name')) {
      return 'John';
    }
    if (sentence.includes('last name')) {
      return 'Doe';
    }
    if (sentence.includes('phone')) {
      return '+1234567890';
    }
    
    return 'test-value';
  }

  /**
   * Infer submit selector
   */
  inferSubmitSelector(sentence) {
    if (sentence.includes('login') || sentence.includes('sign in')) {
      return '#login, .login-btn, input[value="Login"], button[type="submit"]'.split(', ')[0];
    }
    if (sentence.includes('register') || sentence.includes('sign up')) {
      return '#register, .register-btn, input[value="Register"]'.split(', ')[0];
    }
    if (sentence.includes('submit')) {
      return 'input[type="submit"], button[type="submit"], .submit-btn';
    }
    
    return 'button[type="submit"], input[type="submit"]';
  }

  /**
   * Check if sentence matches any pattern in array
   */
  matchesPattern(sentence, patterns) {
    return patterns.some(pattern => pattern.test(sentence));
  }

  /**
   * Split text into sentences with improved handling of complex prompts
   */
  splitIntoSentences(text) {
    // First, protect quoted strings from being split
    const quotedStrings = [];
    let protectedText = text.replace(/(['"])((?:(?!\1)[^\\]|\\.)*)?\1/g, (match, quote, content) => {
      const placeholder = `__QUOTED_${quotedStrings.length}__`;
      quotedStrings.push(match);
      return placeholder;
    });

    // Split on sentence boundaries, including commas for step separation
    const sentences = protectedText
      .split(/[.!?]+|,\s*(?=(?:visit|go|navigate|search|click|add|fill|enter|type|submit|login|wait|pause))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(sentence => {
        // Restore quoted strings
        let restored = sentence;
        quotedStrings.forEach((quoted, index) => {
          restored = restored.replace(`__QUOTED_${index}__`, quoted);
        });
        return restored;
      });

    return sentences;
  }

  /**
   * Attempt to infer action from sentence when no clear pattern matches
   */
  inferAction(sentence) {
    // If sentence contains a URL, assume navigation
    if (this.dataPatterns.url.test(sentence)) {
      return this.parseNavigateAction(sentence);
    }

    // If sentence mentions entering/typing something, assume fill
    if (/enter|type|input/.test(sentence)) {
      return this.parseFillAction(sentence);
    }

    // If sentence mentions clicking something, assume click
    if (/click|press|tap/.test(sentence)) {
      return this.parseClickAction(sentence);
    }

    // Default to a comment/wait action
    return {
      action: 'wait',
      data: { timeout: 1000 },
      description: `Process: ${sentence}`
    };
  }

  /**
   * Generate example prompts for users
   */
  getExamplePrompts() {
    return [
      {
        name: 'Login Flow',
        prompt: 'Go to https://example.com/login. Enter "test@example.com" in the email field. Type "password123" in the password field. Click the login button. Wait 2 seconds.',
        description: 'Basic login flow with explicit values'
      },
      {
        name: 'E-commerce Search',
        prompt: 'Navigate to the homepage. Enter "laptop" in the search box. Click search. Select the first product. Add to cart. Go to checkout.',
        description: 'Product search and purchase flow'
      },
      {
        name: 'User Registration',
        prompt: 'Visit the signup page. Fill in first name as "John". Enter last name "Doe". Type email address. Set password. Submit the registration form.',
        description: 'New user registration process'
      },
      {
        name: 'Profile Update',
        prompt: 'Login to account. Go to profile settings. Update phone number. Change address. Save changes. Logout.',
        description: 'User profile management flow'
      }
    ];
  }

  /**
   * Validate generated flow steps
   */
  validateFlowSteps(steps) {
    const errors = [];
    
    steps.forEach((step, index) => {
      if (!step.action) {
        errors.push(`Step ${index + 1}: Missing action`);
      }
      
      if (['click', 'fill', 'submit'].includes(step.action) && !step.selector) {
        errors.push(`Step ${index + 1}: Missing selector for ${step.action} action`);
      }
      
      if (step.action === 'fill' && (!step.data || !step.data.value)) {
        errors.push(`Step ${index + 1}: Missing value for fill action`);
      }
      
      if (step.action === 'navigate' && (!step.data || !step.data.url)) {
        errors.push(`Step ${index + 1}: Missing URL for navigate action`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
