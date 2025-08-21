import { create } from 'xmlbuilder2';
import { JMXTemplates } from './jmxTemplates.js';
import { Parameterizer } from './parameterizer.js';

export class JMXGenerator {
  constructor() {
    this.templates = new JMXTemplates();
    this.parameterizer = new Parameterizer();
  }

  async generateJMX(config) {
    const { testName, threadCount, rampUp, duration, requests, correlations } = config;

    // Create root JMX structure
    const jmx = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('jmeterTestPlan', {
        version: '1.2',
        properties: '5.0',
        jmeter: '5.6.2'
      });

    const hashTree = jmx.ele('hashTree');
    
    // Add Test Plan
    const testPlan = this.templates.createTestPlan(testName);
    hashTree.ele(testPlan);
    
    const testPlanHashTree = hashTree.ele('hashTree');
    
    // Add Thread Group
    const threadGroup = this.templates.createThreadGroup(threadCount, rampUp, duration);
    testPlanHashTree.ele(threadGroup);
    
    const threadGroupHashTree = testPlanHashTree.ele('hashTree');
    
    // Add HTTP Request Defaults
    const httpDefaults = this.templates.createHTTPRequestDefaults(config.baseUrl);
    threadGroupHashTree.ele(httpDefaults);
    threadGroupHashTree.ele('hashTree');
    
    // Add Cookie Manager
    const cookieManager = this.templates.createCookieManager();
    threadGroupHashTree.ele(cookieManager);
    threadGroupHashTree.ele('hashTree');
    
    // Add Cache Manager
    const cacheManager = this.templates.createCacheManager();
    threadGroupHashTree.ele(cacheManager);
    threadGroupHashTree.ele('hashTree');
    
    // Add parameterized requests
    for (const request of requests) {
      const parameterizedRequest = this.parameterizer.parameterizeRequest(request);
      const correlatedRequest = this.applyCorrelations(parameterizedRequest, correlations);
      
      const httpSampler = this.templates.createHTTPSampler(correlatedRequest);
      threadGroupHashTree.ele(httpSampler);
      
      const samplerHashTree = threadGroupHashTree.ele('hashTree');
      
      // Add extractors for correlations
      const extractors = this.createExtractors(request, correlations);
      for (const extractor of extractors) {
        samplerHashTree.ele(extractor);
        samplerHashTree.ele('hashTree');
      }
      
      // Add assertions if needed
      if (request.assertions) {
        const assertion = this.templates.createResponseAssertion(request.assertions);
        samplerHashTree.ele(assertion);
        samplerHashTree.ele('hashTree');
      }
    }
    
    // Add listeners
    const summaryReport = this.templates.createSummaryReport();
    threadGroupHashTree.ele(summaryReport);
    threadGroupHashTree.ele('hashTree');
    
    const viewResultsTree = this.templates.createViewResultsTree();
    threadGroupHashTree.ele(viewResultsTree);
    threadGroupHashTree.ele('hashTree');
    
    // Convert to XML string
    return jmx.end({ prettyPrint: true });
  }

  applyCorrelations(request, correlations) {
    const correlatedRequest = { ...request };
    
    // Apply correlations to URL parameters
    if (correlatedRequest.query) {
      for (const [key, value] of Object.entries(correlatedRequest.query)) {
        const correlation = correlations.find(c => 
          c.targetRequestId === request.id && 
          c.type === 'url_parameter' && 
          c.parameterName === key
        );
        
        if (correlation) {
          correlatedRequest.query[key] = `\${${correlation.variableName}}`;
        }
      }
    }
    
    // Apply correlations to headers
    if (correlatedRequest.headers) {
      for (const [key, value] of Object.entries(correlatedRequest.headers)) {
        const correlation = correlations.find(c => 
          c.targetRequestId === request.id && 
          c.type === 'header' && 
          c.headerName === key
        );
        
        if (correlation) {
          correlatedRequest.headers[key] = `\${${correlation.variableName}}`;
        }
      }
    }
    
    // Apply correlations to post data
    if (correlatedRequest.postData) {
      try {
        const postData = JSON.parse(correlatedRequest.postData);
        const correlatedPostData = this.applyJsonCorrelations(
          postData,
          correlations.filter(c => c.targetRequestId === request.id && c.type === 'post_data')
        );
        correlatedRequest.postData = JSON.stringify(correlatedPostData);
      } catch (e) {
        // Handle form data
        const formData = new URLSearchParams(correlatedRequest.postData);
        const correlatedFormData = new URLSearchParams();
        
        for (const [key, value] of formData) {
          const correlation = correlations.find(c => 
            c.targetRequestId === request.id && 
            c.type === 'form_data' && 
            c.fieldName === key
          );
          
          if (correlation) {
            correlatedFormData.append(key, `\${${correlation.variableName}}`);
          } else {
            correlatedFormData.append(key, value);
          }
        }
        
        correlatedRequest.postData = correlatedFormData.toString();
      }
    }
    
    return correlatedRequest;
  }

  applyJsonCorrelations(obj, correlations) {
    const result = { ...obj };
    
    for (const correlation of correlations) {
      const path = correlation.jsonPath.split('.');
      let current = result;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) break;
        current = current[path[i]];
      }
      
      if (current && path.length > 0) {
        current[path[path.length - 1]] = `\${${correlation.variableName}}`;
      }
    }
    
    return result;
  }

  createExtractors(request, correlations) {
    const extractors = [];
    const requestCorrelations = correlations.filter(c => c.sourceRequestId === request.id);
    
    for (const correlation of requestCorrelations) {
      let extractor;
      
      switch (correlation.extractionType) {
        case 'json':
          extractor = this.templates.createJSONExtractor({
            variableName: correlation.variableName,
            jsonPath: correlation.extractionPattern,
            matchNumber: 1
          });
          break;
        case 'css':
          extractor = this.templates.createCSSExtractor({
            variableName: correlation.variableName,
            cssSelector: correlation.extractionPattern,
            attribute: ''
          });
          break;
        case 'regex':
          extractor = this.templates.createRegexExtractor({
            variableName: correlation.variableName,
            regex: correlation.extractionPattern,
            template: '$1$',
            matchNumber: 1
          });
          break;
      }
      
      if (extractor) {
        extractors.push(extractor);
      }
    }
    
    return extractors;
  }
}
