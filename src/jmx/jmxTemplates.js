export class JMXTemplates {
  createTestPlan(name) {
    return {
      TestPlan: {
        '@guiclass': 'TestPlanGui',
        '@testclass': 'TestPlan',
        '@testname': name,
        '@enabled': 'true',
        stringProp: [
          { '@name': 'TestPlan.comments', '#text': '' },
          { '@name': 'TestPlan.user_define_classpath', '#text': '' }
        ],
        boolProp: [
          { '@name': 'TestPlan.serialize_threadgroups', '#text': 'false' },
          { '@name': 'TestPlan.functional_mode', '#text': 'false' }
        ],
        elementProp: {
          '@name': 'TestPlan.user_defined_variables',
          '@elementType': 'Arguments',
          '@guiclass': 'ArgumentsPanel',
          '@testclass': 'Arguments',
          collectionProp: { '@name': 'Arguments.arguments' }
        }
      }
    };
  }

  createThreadGroup(threadCount, rampUp, duration) {
    return {
      ThreadGroup: {
        '@guiclass': 'ThreadGroupGui',
        '@testclass': 'ThreadGroup',
        '@testname': 'Thread Group',
        '@enabled': 'true',
        stringProp: [
          { '@name': 'ThreadGroup.on_sample_error', '#text': 'continue' },
          { '@name': 'ThreadGroup.num_threads', '#text': threadCount.toString() },
          { '@name': 'ThreadGroup.ramp_time', '#text': rampUp.toString() },
          { '@name': 'ThreadGroup.duration', '#text': duration.toString() },
          { '@name': 'ThreadGroup.delay', '#text': '0' }
        ],
        boolProp: [
          { '@name': 'ThreadGroup.scheduler', '#text': 'true' },
          { '@name': 'ThreadGroup.same_user_on_next_iteration', '#text': 'true' }
        ],
        elementProp: {
          '@name': 'ThreadGroup.main_controller',
          '@elementType': 'LoopController',
          '@guiclass': 'LoopControlPanel',
          '@testclass': 'LoopController',
          boolProp: { '@name': 'LoopController.continue_forever', '#text': 'false' },
          intProp: { '@name': 'LoopController.loops', '#text': '-1' }
        }
      }
    };
  }

  createHTTPSampler(request) {
    // DO NOT parse URL - let HTTP Request Defaults handle domain/port/protocol
    // This ensures JMX files work properly in JMeter GUI
    
    return {
      HTTPSamplerProxy: {
        '@guiclass': 'HttpTestSampleGui',
        '@testclass': 'HTTPSamplerProxy',
        '@testname': request.name || request.path,
        '@enabled': 'true',
        elementProp: [
          {
            '@name': 'HTTPsampler.Arguments',
            '@elementType': 'Arguments',
            '@guiclass': 'HTTPArgumentsPanel',
            '@testclass': 'Arguments',
            collectionProp: {
              '@name': 'Arguments.arguments',
              elementProp: this.createArguments(request)
            }
          }
        ],
        stringProp: [
          { '@name': 'HTTPSampler.domain', '#text': '' },
          { '@name': 'HTTPSampler.port', '#text': '' },
          { '@name': 'HTTPSampler.protocol', '#text': '' },
          { '@name': 'HTTPSampler.contentEncoding', '#text': '' },
          { '@name': 'HTTPSampler.path', '#text': request.path },
          { '@name': 'HTTPSampler.method', '#text': request.method },
          { '@name': 'HTTPSampler.follow_redirects', '#text': 'true' },
          { '@name': 'HTTPSampler.auto_redirects', '#text': 'false' },
          { '@name': 'HTTPSampler.use_keepalive', '#text': 'true' },
          { '@name': 'HTTPSampler.DO_MULTIPART_POST', '#text': 'false' }
        ],
        boolProp: [
          { '@name': 'HTTPSampler.postBodyRaw', '#text': request.postData ? 'true' : 'false' }
        ]
      }
    };
  }

  createArguments(request) {
    const args = [];
    
    if (request.postData && request.headers['content-type']?.includes('application/json')) {
      args.push({
        '@name': '',
        '@elementType': 'HTTPArgument',
        boolProp: { '@name': 'HTTPArgument.always_encode', '#text': 'false' },
        stringProp: [
          { '@name': 'Argument.value', '#text': request.postData },
          { '@name': 'Argument.metadata', '#text': '=' }
        ]
      });
    } else if (request.query) {
      for (const [key, value] of Object.entries(request.query)) {
        args.push({
          '@name': key,
          '@elementType': 'HTTPArgument',
          boolProp: { '@name': 'HTTPArgument.always_encode', '#text': 'true' },
          stringProp: [
            { '@name': 'Argument.name', '#text': key },
            { '@name': 'Argument.value', '#text': value },
            { '@name': 'Argument.metadata', '#text': '=' },
            { '@name': 'HTTPArgument.use_equals', '#text': 'true' }
          ]
        });
      }
    }
    
    return args;
  }

  createHTTPRequestDefaults(baseUrl) {
    const url = new URL(baseUrl);
    
    return {
      ConfigTestElement: {
        '@guiclass': 'HttpDefaultsGui',
        '@testclass': 'ConfigTestElement',
        '@testname': 'HTTP Request Defaults',
        '@enabled': 'true',
        elementProp: {
          '@name': 'HTTPsampler.Arguments',
          '@elementType': 'Arguments',
          '@guiclass': 'HTTPArgumentsPanel',
          '@testclass': 'Arguments',
          collectionProp: { '@name': 'Arguments.arguments' }
        },
        stringProp: [
          { '@name': 'HTTPSampler.domain', '#text': url.hostname },
          { '@name': 'HTTPSampler.port', '#text': url.port || (url.protocol === 'https:' ? '443' : '80') },
          { '@name': 'HTTPSampler.protocol', '#text': url.protocol.replace(':', '') }
        ]
      }
    };
  }

  createCookieManager() {
    return {
      CookieManager: {
        '@guiclass': 'CookiePanel',
        '@testclass': 'CookieManager',
        '@testname': 'HTTP Cookie Manager',
        '@enabled': 'true',
        boolProp: [
          { '@name': 'CookieManager.clearEachIteration', '#text': 'false' },
          { '@name': 'CookieManager.controlledByThreadGroup', '#text': 'false' }
        ],
        stringProp: { '@name': 'CookieManager.policy', '#text': 'standard' }
      }
    };
  }

  createCacheManager() {
    return {
      CacheManager: {
        '@guiclass': 'CacheManagerGui',
        '@testclass': 'CacheManager',
        '@testname': 'HTTP Cache Manager',
        '@enabled': 'true',
        boolProp: [
          { '@name': 'clearEachIteration', '#text': 'false' },
          { '@name': 'useExpires', '#text': 'true' }
        ]
      }
    };
  }

  createJSONExtractor(config) {
    return {
      JSONPostProcessor: {
        '@guiclass': 'JSONPostProcessorGui',
        '@testclass': 'JSONPostProcessor',
        '@testname': `Extract ${config.variableName}`,
        '@enabled': 'true',
        stringProp: [
          { '@name': 'JSONPostProcessor.referenceNames', '#text': config.variableName },
          { '@name': 'JSONPostProcessor.jsonPathExprs', '#text': config.jsonPath },
          { '@name': 'JSONPostProcessor.match_numbers', '#text': config.matchNumber.toString() },
          { '@name': 'JSONPostProcessor.defaultValues', '#text': 'NOT_FOUND' }
        ]
      }
    };
  }

  createRegexExtractor(config) {
    return {
      RegexExtractor: {
        '@guiclass': 'RegexExtractorGui',
        '@testclass': 'RegexExtractor',
        '@testname': `Extract ${config.variableName}`,
        '@enabled': 'true',
        stringProp: [
          { '@name': 'RegexExtractor.useHeaders', '#text': 'false' },
          { '@name': 'RegexExtractor.refname', '#text': config.variableName },
          { '@name': 'RegexExtractor.regex', '#text': config.regex },
          { '@name': 'RegexExtractor.template', '#text': config.template },
          { '@name': 'RegexExtractor.default', '#text': 'NOT_FOUND' },
          { '@name': 'RegexExtractor.match_number', '#text': config.matchNumber.toString() }
        ]
      }
    };
  }

  createCSSExtractor(config) {
    return {
      HtmlExtractor: {
        '@guiclass': 'HtmlExtractorGui',
        '@testclass': 'HtmlExtractor',
        '@testname': `Extract ${config.variableName}`,
        '@enabled': 'true',
        stringProp: [
          { '@name': 'HtmlExtractor.refname', '#text': config.variableName },
          { '@name': 'HtmlExtractor.expr', '#text': config.cssSelector },
          { '@name': 'HtmlExtractor.attribute', '#text': config.attribute },
          { '@name': 'HtmlExtractor.default', '#text': 'NOT_FOUND' },
          { '@name': 'HtmlExtractor.match_number', '#text': '1' }
        ]
      }
    };
  }

  createResponseAssertion(assertions) {
    return {
      ResponseAssertion: {
        '@guiclass': 'AssertionGui',
        '@testclass': 'ResponseAssertion',
        '@testname': 'Response Assertion',
        '@enabled': 'true',
        collectionProp: {
          '@name': 'Assertion.test_strings',
          stringProp: assertions.patterns.map(p => ({ '#text': p }))
        },
        stringProp: [
          { '@name': 'Assertion.test_field', '#text': assertions.field || 'Assertion.response_data' },
          { '@name': 'Assertion.assume_success', '#text': 'false' },
          { '@name': 'Assertion.test_type', '#text': assertions.type || '2' }
        ]
      }
    };
  }

  createSummaryReport() {
    return {
      ResultCollector: {
        '@guiclass': 'SummaryReport',
        '@testclass': 'ResultCollector',
        '@testname': 'Summary Report',
        '@enabled': 'true',
        boolProp: [
          { '@name': 'ResultCollector.error_logging', '#text': 'false' }
        ],
        objProp: {
          name: 'saveConfig',
          value: {
            '@class': 'SampleSaveConfiguration',
            time: 'true',
            latency: 'true',
            timestamp: 'true',
            success: 'true',
            label: 'true',
            code: 'true',
            message: 'true',
            threadName: 'true',
            dataType: 'true',
            encoding: 'false',
            assertions: 'true',
            subresults: 'true',
            responseData: 'false',
            samplerData: 'false',
            xml: 'false',
            fieldNames: 'true',
            responseHeaders: 'false',
            requestHeaders: 'false',
            responseDataOnError: 'false',
            saveAssertionResultsFailureMessage: 'true',
            assertionsResultsToSave: '0',
            bytes: 'true',
            sentBytes: 'true',
            url: 'true',
            threadCounts: 'true',
            idleTime: 'true',
            connectTime: 'true'
          }
        },
        stringProp: [
          { '@name': 'filename', '#text': '' }
        ]
      }
    };
  }

  createViewResultsTree() {
    return {
      ResultCollector: {
        '@guiclass': 'ViewResultsFullVisualizer',
        '@testclass': 'ResultCollector',
        '@testname': 'View Results Tree',
        '@enabled': 'true',
        boolProp: [
          { '@name': 'ResultCollector.error_logging', '#text': 'false' }
        ],
        objProp: {
          name: 'saveConfig',
          value: {
            '@class': 'SampleSaveConfiguration',
            time: 'true',
            latency: 'true',
            timestamp: 'true',
            success: 'true',
            label: 'true',
            code: 'true',
            message: 'true',
            threadName: 'true',
            dataType: 'true',
            encoding: 'false',
            assertions: 'true',
            subresults: 'true',
            responseData: 'false',
            samplerData: 'false',
            xml: 'false',
            fieldNames: 'true',
            responseHeaders: 'false',
            requestHeaders: 'false',
            responseDataOnError: 'false',
            saveAssertionResultsFailureMessage: 'true',
            assertionsResultsToSave: '0',
            bytes: 'true',
            sentBytes: 'true',
            url: 'true',
            threadCounts: 'true',
            idleTime: 'true',
            connectTime: 'true'
          }
        },
        stringProp: [
          { '@name': 'filename', '#text': '' }
        ]
      }
    };
  }
}
