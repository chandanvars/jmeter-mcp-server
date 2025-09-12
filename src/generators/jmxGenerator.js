import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import { SamplerGenerator } from './samplerGenerator.js';
import { ConfigGenerator } from './configGenerator.js';

export class JMXGenerator {
  constructor() {
    this.samplerGenerator = new SamplerGenerator();
    this.configGenerator = new ConfigGenerator();
  }

  generate(params) {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('jmeterTestPlan', {
        version: '1.2',
        properties: '5.0',  // Use format "5.0" instead of "JMeter"
        jmeter: '5.6.2'
      });

    const root = doc.ele('hashTree');
    
    // Add Test Plan
    this.addTestPlan(root, params.testName);
    
    const testPlanTree = root.ele('hashTree');
    
    // Add Thread Group
    this.addThreadGroup(testPlanTree, params.threadGroup || {});
    
    const threadGroupTree = testPlanTree.ele('hashTree');
    
    // Add CSV Data Set if specified
    if (params.csvDataSet) {
      this.configGenerator.addCSVDataSet(threadGroupTree, params.csvDataSet);
      threadGroupTree.ele('hashTree');
    }
    
    // Add HTTP Request Defaults
    this.configGenerator.addHTTPRequestDefaults(threadGroupTree, params.baseUrl);
    threadGroupTree.ele('hashTree');
    
    // Add Header Manager
    if (params.defaultHeaders) {
      this.configGenerator.addHeaderManager(threadGroupTree, params.defaultHeaders);
      threadGroupTree.ele('hashTree');
    }
    
    // Add HTTP Samplers
    params.requests.forEach(request => {
      this.samplerGenerator.addHTTPSampler(threadGroupTree, request, params.baseUrl);
    });
    
    // Add Constant Throughput Timer if specified
    if (params.throughput) {
      this.configGenerator.addConstantThroughputTimer(threadGroupTree, params.throughput);
      threadGroupTree.ele('hashTree');
    }
    
    // Add Random Timer if specified
    if (params.randomTimer) {
      this.configGenerator.addUniformRandomTimer(
        threadGroupTree, 
        params.randomTimer.constantDelay, 
        params.randomTimer.randomRange
      );
      threadGroupTree.ele('hashTree');
    }
    
    // Add Results Tree Listener
    this.addResultsTreeListener(threadGroupTree);
    threadGroupTree.ele('hashTree');
    
    return doc.end({ prettyPrint: true });
  }

  addTestPlan(parent, testName) {
    const testPlan = parent.ele('TestPlan', {
      guiclass: 'TestPlanGui',
      testclass: 'TestPlan',
      testname: testName || 'Test Plan',
      enabled: 'true'
    });
    
    // Order matters! Add properties in the exact order JMeter expects
    testPlan.ele('stringProp', { name: 'TestPlan.comments' }).txt('');
    testPlan.ele('boolProp', { name: 'TestPlan.functional_mode' }).txt('false');
    testPlan.ele('boolProp', { name: 'TestPlan.tearDown_on_shutdown' }).txt('true');
    testPlan.ele('boolProp', { name: 'TestPlan.serialize_threadgroups' }).txt('false');
    
    // This is the critical part - must match JMeter's exact structure for ArgumentsPanel
    const argumentsProp = testPlan.ele('elementProp', {
      name: 'TestPlan.arguments',
      elementType: 'Arguments',
      guiclass: 'ArgumentsPanel',
      testclass: 'Arguments',
      testname: 'User Defined Variables',
      enabled: 'true'
    });
    
    // In JMeter, Arguments.arguments must be a proper collection
    // Adding explicit empty text content to prevent null values
    argumentsProp.ele('collectionProp', { name: 'Arguments.arguments' }).txt('');
    
    // This must come after the arguments
    testPlan.ele('stringProp', { name: 'TestPlan.user_define_classpath' }).txt('');
  }

  addThreadGroup(parent, config) {
    const threadGroup = parent.ele('ThreadGroup', {
      guiclass: 'ThreadGroupGui',
      testclass: 'ThreadGroup',
      testname: config.testname || 'Thread Group',
      enabled: 'true'
    });
    
    // Order matters - add properties in JMeter's expected order
    threadGroup.ele('stringProp', { name: 'ThreadGroup.on_sample_error' }).txt('continue');
    
    // Loop Controller with exact structure
    const loopController = threadGroup.ele('elementProp', {
      name: 'ThreadGroup.main_controller',
      elementType: 'LoopController',
      guiclass: 'LoopControlPanel',
      testclass: 'LoopController',
      testname: 'Loop Controller',
      enabled: 'true'
    });
    
    // Handle different loop configurations
    const loops = config.duration ? -1 : (config.loops || 1);
    const continueForever = config.duration ? true : false;
    
    loopController.ele('boolProp', { name: 'LoopController.continue_forever' }).txt(String(continueForever));
    loopController.ele('stringProp', { name: 'LoopController.loops' }).txt(String(loops));
    
    // Thread Group properties in order - handle multiple parameter formats
    const numThreads = config.threads || config.numThreads || 10;
    const rampUpTime = config.rampUp || config.rampUpTime || 10;
    const duration = config.duration || '';
    const delay = config.delay || '';
    
    threadGroup.ele('stringProp', { name: 'ThreadGroup.num_threads' }).txt(String(numThreads));
    threadGroup.ele('stringProp', { name: 'ThreadGroup.ramp_time' }).txt(String(rampUpTime));
    
    // Handle scheduler - enable it only if duration is specified
    const useScheduler = Boolean(duration);
    threadGroup.ele('boolProp', { name: 'ThreadGroup.scheduler' }).txt(String(useScheduler));
    threadGroup.ele('stringProp', { name: 'ThreadGroup.duration' }).txt(String(duration));
    threadGroup.ele('stringProp', { name: 'ThreadGroup.delay' }).txt(String(delay));
    threadGroup.ele('boolProp', { name: 'ThreadGroup.same_user_on_next_iteration' }).txt('true');
  }

  addResultsTreeListener(parent) {
    const listener = parent.ele('ResultCollector', {
      guiclass: 'ViewResultsFullVisualizer',
      testclass: 'ResultCollector',
      testname: 'View Results Tree',
      enabled: 'true'
    });
    
    listener.ele('boolProp', { name: 'ResultCollector.error_logging' }).txt('false');
    
    const objProp = listener.ele('objProp');
    objProp.ele('name').txt('saveConfig');
    const saveConfig = objProp.ele('value', { class: 'SampleSaveConfiguration' });
    
    // Add various save configuration properties
    saveConfig.ele('time').txt('true');
    saveConfig.ele('latency').txt('true');
    saveConfig.ele('timestamp').txt('true');
    saveConfig.ele('success').txt('true');
    saveConfig.ele('label').txt('true');
    saveConfig.ele('code').txt('true');
    saveConfig.ele('message').txt('true');
    saveConfig.ele('threadName').txt('true');
    saveConfig.ele('dataType').txt('true');
    saveConfig.ele('encoding').txt('false');
    saveConfig.ele('assertions').txt('true');
    saveConfig.ele('subresults').txt('true');
    saveConfig.ele('responseData').txt('false');
    saveConfig.ele('samplerData').txt('false');
    saveConfig.ele('xml').txt('false');
    saveConfig.ele('fieldNames').txt('true');
    saveConfig.ele('responseHeaders').txt('false');
    saveConfig.ele('requestHeaders').txt('false');
    saveConfig.ele('responseDataOnError').txt('false');
    saveConfig.ele('saveAssertionResultsFailureMessage').txt('true');
    saveConfig.ele('assertionsResultsToSave').txt('0');
    saveConfig.ele('bytes').txt('true');
    saveConfig.ele('sentBytes').txt('true');
    saveConfig.ele('url').txt('true');
    saveConfig.ele('threadCounts').txt('true');
    saveConfig.ele('idleTime').txt('true');
    saveConfig.ele('connectTime').txt('true');
    
    listener.ele('stringProp', { name: 'filename' }).txt('');
  }

  generateUIFlowJMX(params) {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('jmeterTestPlan', {
        version: '1.2',
        properties: '5.0',
        jmeter: '5.6.2'
      });

    const root = doc.ele('hashTree');
    
    // Add Test Plan
    this.addTestPlan(root, params.testName || 'UI Flow Test');
    
    const testPlanTree = root.ele('hashTree');
    
    // Add Thread Group
    this.addThreadGroup(testPlanTree, params.threadGroup || {});
    
    const threadGroupTree = testPlanTree.ele('hashTree');
    
    // Add HTTP Request Defaults for the base URL
    this.configGenerator.addHTTPRequestDefaults(threadGroupTree, params.baseUrl);
    threadGroupTree.ele('hashTree');
    
    // Add Header Manager with common headers for UI interactions
    const uiHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...params.defaultHeaders
    };
    this.configGenerator.addHeaderManager(threadGroupTree, uiHeaders);
    threadGroupTree.ele('hashTree');
    
    // Add HTTP Samplers for each UI step
    params.requests.forEach((request, index) => {
      this.samplerGenerator.addHTTPSampler(threadGroupTree, {
        ...request,
        name: request.name || `UI Step ${index + 1}: ${request.action || request.method}`
      }, params.baseUrl);
      
      // Add a small delay between UI actions to simulate human behavior
      if (index < params.requests.length - 1) {
        this.addUniformRandomTimer(threadGroupTree, 1000, 2000);
        threadGroupTree.ele('hashTree');
      }
    });
    
    // Add Results Tree Listener
    this.addResultsTreeListener(threadGroupTree);
    threadGroupTree.ele('hashTree');
    
    return doc.end({ prettyPrint: true });
  }

  addUniformRandomTimer(parent, constantDelay, randomRange) {
    const timer = parent.ele('UniformRandomTimer', {
      guiclass: 'UniformRandomTimerGui',
      testclass: 'UniformRandomTimer',
      testname: 'Uniform Random Timer',
      enabled: 'true'
    });
    
    timer.ele('stringProp', { name: 'ConstantTimer.delay' }).txt(String(constantDelay));
    timer.ele('stringProp', { name: 'RandomTimer.range' }).txt(String(randomRange));
  }
}