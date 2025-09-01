import { v4 as uuidv4 } from 'uuid';

export class SamplerGenerator {
  addHTTPSampler(parent, request, baseUrl) {
    const sampler = parent.ele('HTTPSamplerProxy', {
      guiclass: 'HttpTestSampleGui',
      testclass: 'HTTPSamplerProxy',
      testname: request.name,
      enabled: 'true'
    });

    // Do NOT parse URL - let HTTP Request Defaults handle domain/port/protocol
    // This ensures JMX files work properly in JMeter GUI
    
    // Add HTTP Arguments element (required for all HTTP samplers)
    const httpArguments = sampler.ele('elementProp', {
      name: 'HTTPsampler.Arguments',
      elementType: 'Arguments',
      guiclass: 'HTTPArgumentsPanel',
      testclass: 'Arguments',
      testname: 'User Defined Variables',
      enabled: 'true'
    });
    
    const collectionProp = httpArguments.ele('collectionProp', { name: 'Arguments.arguments' });
    
    // Handle form data for POST requests (parse body into form fields)
    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
      // Check if it's form data (key=value&key=value format)
      if (request.body.includes('=') && request.body.includes('&') || !request.body.startsWith('{')) {
        // Parse form data into individual arguments
        const formData = new URLSearchParams(request.body);
        for (const [paramName, paramValue] of formData.entries()) {
          const httpArg = collectionProp.ele('elementProp', {
            name: paramName,
            elementType: 'HTTPArgument'
          });
          httpArg.ele('boolProp', { name: 'HTTPArgument.always_encode' }).txt('false');
          httpArg.ele('stringProp', { name: 'Argument.value' }).txt(paramValue);
          httpArg.ele('stringProp', { name: 'Argument.metadata' }).txt('=');
          httpArg.ele('stringProp', { name: 'Argument.name' }).txt(paramName);
        }
      } else {
        // Handle raw body (JSON, XML, etc.)
        const httpArg = collectionProp.ele('elementProp', {
          name: '',
          elementType: 'HTTPArgument'
        });
        httpArg.ele('boolProp', { name: 'HTTPArgument.always_encode' }).txt('false');
        httpArg.ele('stringProp', { name: 'Argument.value' }).txt(request.body);
        httpArg.ele('stringProp', { name: 'Argument.metadata' }).txt('=');
      }
    }
    
    // Handle query parameters if present
    if (request.queryParams) {
      Object.entries(request.queryParams).forEach(([paramName, paramValue]) => {
        const httpArg = collectionProp.ele('elementProp', {
          name: paramName,
          elementType: 'HTTPArgument'
        });
        httpArg.ele('boolProp', { name: 'HTTPArgument.always_encode' }).txt('false');
        httpArg.ele('stringProp', { name: 'Argument.value' }).txt(paramValue);
        httpArg.ele('stringProp', { name: 'Argument.metadata' }).txt('=');
        httpArg.ele('stringProp', { name: 'Argument.name' }).txt(paramName);
        httpArg.ele('boolProp', { name: 'HTTPArgument.use_equals' }).txt('true');
      });
    }

    // HTTP Sampler properties - CRITICAL: Use empty domain/port/protocol to use defaults
    sampler.ele('stringProp', { name: 'HTTPSampler.domain' }).txt('');
    sampler.ele('stringProp', { name: 'HTTPSampler.port' }).txt('');
    sampler.ele('stringProp', { name: 'HTTPSampler.protocol' }).txt('');
    sampler.ele('stringProp', { name: 'HTTPSampler.contentEncoding' }).txt('');
    // CRITICAL FIX: Ensure path is relative and doesn't contain full URL
    const cleanPath = this.extractCleanPath(request.path);
    sampler.ele('stringProp', { name: 'HTTPSampler.path' }).txt(cleanPath);
    sampler.ele('stringProp', { name: 'HTTPSampler.method' }).txt(request.method);
    sampler.ele('boolProp', { name: 'HTTPSampler.follow_redirects' }).txt('true');
    sampler.ele('boolProp', { name: 'HTTPSampler.auto_redirects' }).txt('false');
    sampler.ele('boolProp', { name: 'HTTPSampler.use_keepalive' }).txt('true');
    sampler.ele('boolProp', { name: 'HTTPSampler.DO_MULTIPART_POST' }).txt('false');
    sampler.ele('stringProp', { name: 'HTTPSampler.embedded_url_re' }).txt('');
    sampler.ele('stringProp', { name: 'HTTPSampler.connect_timeout' }).txt('');
    sampler.ele('stringProp', { name: 'HTTPSampler.response_timeout' }).txt('');

    const samplerTree = parent.ele('hashTree');

    // Add BeanShell PreProcessor if specified
    if (request.preProcessor && request.preProcessor.type === 'beanshell') {
      this.addBeanShellPreProcessor(samplerTree, request.preProcessor.script);
      samplerTree.ele('hashTree');
    }

    // Add Headers
    if (request.headers) {
      this.addHeaderManager(samplerTree, request.headers);
      samplerTree.ele('hashTree');
    }

    // Add Extractors
    if (request.extractors) {
      request.extractors.forEach(extractor => {
        if (extractor.jsonPath) {
          this.addJSONExtractor(samplerTree, extractor);
        } else if (extractor.regex) {
          this.addRegexExtractor(samplerTree, extractor);
        }
        samplerTree.ele('hashTree');
      });
    }

    // Add Assertions
    if (request.assertions) {
      request.assertions.forEach(assertion => {
        this.addAssertion(samplerTree, assertion);
        samplerTree.ele('hashTree');
      });
    }
  }

  /**
   * Extract clean path from potentially malformed path/URL
   */
  extractCleanPath(path) {
    if (!path) return '/';
    
    // If it's a full URL, extract just the path
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const url = new URL(path);
        return url.pathname + url.search;
      } catch (e) {
        return '/';
      }
    }
    
    // If it starts with domain name but no protocol, extract path
    if (path.includes('.') && !path.startsWith('/')) {
      const slashIndex = path.indexOf('/');
      if (slashIndex > 0) {
        return path.substring(slashIndex);
      }
      return '/';
    }
    
    // Ensure it starts with /
    return path.startsWith('/') ? path : '/' + path;
  }

  addHeaderManager(parent, headers) {
    const headerManager = parent.ele('HeaderManager', {
      guiclass: 'HeaderPanel',
      testclass: 'HeaderManager',
      testname: 'HTTP Header Manager',
      enabled: 'true'
    });

    const collectionProp = headerManager.ele('collectionProp', { name: 'HeaderManager.headers' });
    
    Object.entries(headers).forEach(([name, value]) => {
      const header = collectionProp.ele('elementProp', {
        name: '',
        elementType: 'Header'
      });
      header.ele('stringProp', { name: 'Header.name' }).txt(name);
      header.ele('stringProp', { name: 'Header.value' }).txt(value);
    });
  }

  addJSONExtractor(parent, extractor) {
    const jsonExtractor = parent.ele('JSONPostProcessor', {
      guiclass: 'JSONPostProcessorGui',
      testclass: 'JSONPostProcessor',
      testname: `JSON Extractor - ${extractor.variableName}`,
      enabled: 'true'
    });

    jsonExtractor.ele('stringProp', { name: 'JSONPostProcessor.referenceNames' }).txt(extractor.variableName);
    jsonExtractor.ele('stringProp', { name: 'JSONPostProcessor.jsonPathExprs' }).txt(extractor.jsonPath);
    jsonExtractor.ele('stringProp', { name: 'JSONPostProcessor.match_numbers' }).txt('1');
    jsonExtractor.ele('stringProp', { name: 'JSONPostProcessor.defaultValues' }).txt(extractor.defaultValue || 'NOT_FOUND');
    jsonExtractor.ele('boolProp', { name: 'JSONPostProcessor.compute_concat' }).txt('false');
    jsonExtractor.ele('stringProp', { name: 'JSONPostProcessor.Scope' }).txt('main');
  }

  addRegexExtractor(parent, extractor) {
    const regexExtractor = parent.ele('RegexExtractor', {
      guiclass: 'RegexExtractorGui',
      testclass: 'RegexExtractor',
      testname: `Regex Extractor - ${extractor.variableName}`,
      enabled: 'true'
    });

    regexExtractor.ele('stringProp', { name: 'RegexExtractor.useHeaders' }).txt('false');
    regexExtractor.ele('stringProp', { name: 'RegexExtractor.refname' }).txt(extractor.variableName);
    regexExtractor.ele('stringProp', { name: 'RegexExtractor.regex' }).txt(extractor.regex);
    regexExtractor.ele('stringProp', { name: 'RegexExtractor.template' }).txt('$1$');
    regexExtractor.ele('stringProp', { name: 'RegexExtractor.default' }).txt(extractor.defaultValue || 'NOT_FOUND');
    regexExtractor.ele('stringProp', { name: 'RegexExtractor.match_number' }).txt('1');
  }

  addAssertion(parent, assertion) {
    switch (assertion.type) {
      case 'responseCode':
        this.addResponseCodeAssertion(parent, assertion.value);
        break;
      case 'responseTime':
        this.addDurationAssertion(parent, assertion.value);
        break;
      case 'jsonPath':
        this.addJSONAssertion(parent, assertion);
        break;
      case 'containsText':
      case 'contains':
        this.addContainsAssertion(parent, assertion.value);
        break;
    }
  }

  addResponseCodeAssertion(parent, code) {
    const assertion = parent.ele('ResponseAssertion', {
      guiclass: 'AssertionGui',
      testclass: 'ResponseAssertion',
      testname: 'Response Code Assertion',
      enabled: 'true'
    });

    const collectionProp = assertion.ele('collectionProp', { name: 'Assertion.test_strings' });
    // Use a hash-based name for the stringProp to avoid collisions
    const hash = Math.abs(code.toString().split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0));
    collectionProp.ele('stringProp', { name: hash.toString() }).txt(code.toString());
    
    assertion.ele('stringProp', { name: 'Assertion.custom_message' }).txt('');
    assertion.ele('stringProp', { name: 'Assertion.test_field' }).txt('Assertion.response_code');
    assertion.ele('boolProp', { name: 'Assertion.assume_success' }).txt('false');
    assertion.ele('intProp', { name: 'Assertion.test_type' }).txt('8');
  }

  addDurationAssertion(parent, duration) {
    const assertion = parent.ele('DurationAssertion', {
      guiclass: 'DurationAssertionGui',
      testclass: 'DurationAssertion',
      testname: 'Duration Assertion',
      enabled: 'true'
    });

    assertion.ele('stringProp', { name: 'DurationAssertion.duration' }).txt(duration);
  }

  addJSONAssertion(parent, assertion) {
    const jsonAssertion = parent.ele('JSONPathAssertion', {
      guiclass: 'JSONPathAssertionGui',
      testclass: 'JSONPathAssertion',
      testname: 'JSON Assertion',
      enabled: 'true'
    });

    jsonAssertion.ele('stringProp', { name: 'JSON_PATH' }).txt(assertion.jsonPath);
    jsonAssertion.ele('stringProp', { name: 'EXPECTED_VALUE' }).txt(assertion.expectedValue || '');
    jsonAssertion.ele('boolProp', { name: 'JSONVALIDATION' }).txt(assertion.expectedValue ? 'true' : 'false');
    jsonAssertion.ele('boolProp', { name: 'EXPECT_NULL' }).txt('false');
    jsonAssertion.ele('boolProp', { name: 'INVERT' }).txt('false');
  }

  addContainsAssertion(parent, text) {
    const assertion = parent.ele('ResponseAssertion', {
      guiclass: 'AssertionGui',
      testclass: 'ResponseAssertion',
      testname: 'Contains Assertion',
      enabled: 'true'
    });

    const collectionProp = assertion.ele('collectionProp', { name: 'Assertion.test_strings' });
    // Generate a hash for the string prop name to ensure uniqueness
    const hash = Math.abs(text.toString().split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff, 0));
    collectionProp.ele('stringProp', { name: hash.toString() }).txt(text.toString());
    
    assertion.ele('stringProp', { name: 'Assertion.custom_message' }).txt('');
    assertion.ele('stringProp', { name: 'Assertion.test_field' }).txt('Assertion.response_data');
    assertion.ele('boolProp', { name: 'Assertion.assume_success' }).txt('false');
    assertion.ele('intProp', { name: 'Assertion.test_type' }).txt('16'); // Contains
  }

  addBeanShellPreProcessor(parent, script) {
    const beanShell = parent.ele('BeanShellPreProcessor', {
      guiclass: 'TestBeanGUI',
      testclass: 'BeanShellPreProcessor',
      testname: 'BeanShell PreProcessor',
      enabled: 'true'
    });

    beanShell.ele('stringProp', { name: 'script' }).txt(script);
    beanShell.ele('stringProp', { name: 'parameters' }).txt('');
    beanShell.ele('boolProp', { name: 'resetInterpreter' }).txt('false');
  }
}