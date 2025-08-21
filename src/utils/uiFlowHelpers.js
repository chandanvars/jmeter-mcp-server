/**
 * Helper utilities for JMeter UI Flow Generation
 */

export class UIFlowHelpers {
  /**
   * Generate CSS selectors for common web elements
   */
  static getCommonSelectors() {
    return {
      // Login forms
      login: {
        email: ['#email', '#input-email', 'input[name="email"]', 'input[type="email"]'],
        username: ['#username', '#input-username', 'input[name="username"]'],
        password: ['#password', '#input-password', 'input[name="password"]', 'input[type="password"]'],
        loginButton: ['#login', 'input[type="submit"]', 'button[type="submit"]', '.login-btn', '.btn-login']
      },
      
      // Registration forms
      registration: {
        firstName: ['#first-name', '#firstname', 'input[name="first_name"]'],
        lastName: ['#last-name', '#lastname', 'input[name="last_name"]'],
        email: ['#email', '#reg-email', 'input[name="email"]'],
        password: ['#password', '#reg-password', 'input[name="password"]'],
        confirmPassword: ['#confirm-password', '#password-confirm', 'input[name="password_confirm"]'],
        submitButton: ['#register', '#signup', '.register-btn', '.signup-btn']
      },
      
      // E-commerce
      ecommerce: {
        searchBox: ['#search', '.search-input', 'input[name="search"]'],
        addToCart: ['.add-to-cart', '#add-to-cart', 'button[name="add-to-cart"]'],
        cart: ['#cart', '.cart-link', '.shopping-cart'],
        checkout: ['#checkout', '.checkout-btn', '.proceed-checkout'],
        quantity: ['#quantity', 'input[name="quantity"]']
      },
      
      // Navigation
      navigation: {
        menu: ['.menu', '.nav', '.navigation', '#menu'],
        dropdown: ['.dropdown', '.dropdown-menu'],
        breadcrumb: ['.breadcrumb', '.breadcrumbs'],
        pagination: ['.pagination', '.pager']
      }
    };
  }

  /**
   * Validate flow step configuration
   */
  static validateFlowStep(step) {
    const errors = [];
    
    if (!step.action) {
      errors.push('Action is required');
    } else {
      const validActions = ['navigate', 'click', 'fill', 'submit', 'wait'];
      if (!validActions.includes(step.action)) {
        errors.push(`Invalid action: ${step.action}. Valid actions: ${validActions.join(', ')}`);
      }
    }
    
    if (['click', 'fill', 'submit'].includes(step.action) && !step.selector) {
      errors.push(`Selector is required for action: ${step.action}`);
    }
    
    if (step.action === 'fill' && (!step.data || !step.data.value)) {
      errors.push('Value is required for fill action');
    }
    
    if (step.action === 'navigate' && (!step.data || !step.data.url)) {
      errors.push('URL is required for navigate action');
    }
    
    if (step.action === 'wait' && step.data && step.data.timeout) {
      if (typeof step.data.timeout !== 'number' || step.data.timeout < 0) {
        errors.push('Timeout must be a positive number');
      }
    }
    
    return errors;
  }

  /**
   * Generate sample flow configurations for common scenarios
   */
  static getSampleFlows() {
    return {
      loginFlow: {
        testName: 'User Login Flow',
        baseUrl: 'https://example.com',
        flowSteps: [
          { action: 'navigate', data: { url: 'https://example.com/login' } },
          { action: 'fill', selector: '#email', data: { value: 'test@example.com' } },
          { action: 'fill', selector: '#password', data: { value: 'password123' } },
          { action: 'click', selector: '#login-button' },
          { action: 'wait', data: { timeout: 2000 } }
        ]
      },
      
      registrationFlow: {
        testName: 'User Registration Flow',
        baseUrl: 'https://example.com',
        flowSteps: [
          { action: 'navigate', data: { url: 'https://example.com/register' } },
          { action: 'fill', selector: '#first-name', data: { value: 'John' } },
          { action: 'fill', selector: '#last-name', data: { value: 'Doe' } },
          { action: 'fill', selector: '#email', data: { value: 'john.doe@example.com' } },
          { action: 'fill', selector: '#password', data: { value: 'securepassword' } },
          { action: 'fill', selector: '#confirm-password', data: { value: 'securepassword' } },
          { action: 'click', selector: '#register-button' },
          { action: 'wait', data: { timeout: 3000 } }
        ]
      },
      
      ecommerceFlow: {
        testName: 'E-commerce Purchase Flow',
        baseUrl: 'https://shop.example.com',
        flowSteps: [
          { action: 'navigate', data: { url: 'https://shop.example.com' } },
          { action: 'fill', selector: '#search', data: { value: 'laptop' } },
          { action: 'click', selector: '.search-button' },
          { action: 'wait', data: { timeout: 2000 } },
          { action: 'click', selector: '.product-item:first-child' },
          { action: 'click', selector: '.add-to-cart' },
          { action: 'click', selector: '.cart-icon' },
          { action: 'click', selector: '.checkout-button' }
        ]
      },
      
      bankingFlow: {
        testName: 'Online Banking Transfer',
        baseUrl: 'https://bank.example.com',
        flowSteps: [
          { action: 'navigate', data: { url: 'https://bank.example.com/login' } },
          { action: 'fill', selector: '#username', data: { value: '${username}' } },
          { action: 'fill', selector: '#password', data: { value: '${password}' } },
          { action: 'click', selector: '#login-submit' },
          { action: 'wait', data: { timeout: 3000 } },
          { action: 'click', selector: '.transfer-menu' },
          { action: 'fill', selector: '#from-account', data: { value: 'checking' } },
          { action: 'fill', selector: '#to-account', data: { value: 'savings' } },
          { action: 'fill', selector: '#amount', data: { value: '100.00' } },
          { action: 'click', selector: '#transfer-submit' }
        ]
      }
    };
  }

  /**
   * Generate load test configurations for different scenarios
   */
  static getLoadConfigurations() {
    return {
      smoke: {
        threadCount: 1,
        rampUp: 1,
        duration: 60,
        description: 'Smoke test - single user for basic functionality'
      },
      
      light: {
        threadCount: 5,
        rampUp: 30,
        duration: 300,
        description: 'Light load - 5 users over 5 minutes'
      },
      
      moderate: {
        threadCount: 25,
        rampUp: 60,
        duration: 600,
        description: 'Moderate load - 25 users over 10 minutes'
      },
      
      heavy: {
        threadCount: 100,
        rampUp: 300,
        duration: 1800,
        description: 'Heavy load - 100 users over 30 minutes'
      },
      
      spike: {
        threadCount: 200,
        rampUp: 60,
        duration: 300,
        description: 'Spike test - 200 users ramped up quickly'
      },
      
      stress: {
        threadCount: 500,
        rampUp: 600,
        duration: 3600,
        description: 'Stress test - 500 users over 1 hour'
      }
    };
  }

  /**
   * Convert flow steps to natural language description
   */
  static describeFlow(flowSteps) {
    const descriptions = [];
    
    flowSteps.forEach((step, index) => {
      const stepNum = index + 1;
      
      switch (step.action) {
        case 'navigate':
          descriptions.push(`${stepNum}. Navigate to ${step.data.url}`);
          break;
        case 'click':
          descriptions.push(`${stepNum}. Click on element: ${step.selector}`);
          break;
        case 'fill':
          descriptions.push(`${stepNum}. Enter "${step.data.value}" in field: ${step.selector}`);
          break;
        case 'submit':
          descriptions.push(`${stepNum}. Submit form: ${step.selector}`);
          break;
        case 'wait':
          descriptions.push(`${stepNum}. Wait for ${step.data.timeout}ms`);
          break;
        default:
          descriptions.push(`${stepNum}. ${step.action} (${step.selector || 'no selector'})`);
      }
    });
    
    return descriptions;
  }

  /**
   * Estimate test duration and resource usage
   */
  static estimateTestResources(config) {
    const { threadCount, rampUp, duration, flowSteps } = config;
    
    // Estimate based on flow complexity and load
    const avgStepTime = flowSteps.length * 2; // 2 seconds per step average
    const totalIterations = Math.ceil(duration / avgStepTime) * threadCount;
    const peakUsers = threadCount;
    const testDurationMinutes = Math.ceil((rampUp + duration) / 60);
    
    // Estimate requests (assuming 2-3 HTTP requests per flow step)
    const avgRequestsPerStep = 2.5;
    const totalRequests = totalIterations * flowSteps.length * avgRequestsPerStep;
    
    return {
      estimatedTotalRequests: Math.round(totalRequests),
      peakConcurrentUsers: peakUsers,
      testDurationMinutes,
      averageRequestsPerSecond: Math.round(totalRequests / duration),
      resourceComplexity: peakUsers > 100 ? 'High' : peakUsers > 25 ? 'Medium' : 'Low'
    };
  }

  /**
   * Generate browser options for different testing scenarios
   */
  static getBrowserOptions() {
    return {
      headless: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        description: 'Fastest option, no visual browser'
      },
      
      visible: {
        headless: false,
        args: ['--no-sandbox'],
        description: 'Visible browser for debugging'
      },
      
      mobile: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 375, height: 667, isMobile: true },
        description: 'Mobile device simulation'
      },
      
      tablet: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 768, height: 1024, isMobile: true },
        description: 'Tablet device simulation'
      },
      
      highRes: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 1920, height: 1080 },
        description: 'High resolution desktop'
      }
    };
  }
}

export default UIFlowHelpers;
