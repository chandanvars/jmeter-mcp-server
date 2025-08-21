import { create } from 'xmlbuilder2';

export class XMLBuilder {
  /**
   * Create a new XML document with JMeter root elements
   */
  static createJMeterDocument() {
    return create({ version: '1.0', encoding: 'UTF-8' })
      .ele('jmeterTestPlan', {
        version: '1.2',
        properties: 'JMeter',
        jmeter: '5.6.2'
      });
  }

  /**
   * Add properties to an element
   */
  static addProperties(element, properties) {
    Object.entries(properties).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        element.ele('boolProp', { name: key }).txt(value.toString());
      } else if (typeof value === 'number') {
        element.ele('intProp', { name: key }).txt(value.toString());
      } else {
        element.ele('stringProp', { name: key }).txt(value || '');
      }
    });
  }

  /**
   * Create a collection property
   */
  static createCollectionProp(parent, name, items = []) {
    const collection = parent.ele('collectionProp', { name });
    items.forEach(item => {
      if (typeof item === 'string') {
        collection.ele('stringProp').txt(item);
      } else if (typeof item === 'object') {
        this.createElementProp(collection, '', item.type || 'Argument', item.properties);
      }
    });
    return collection;
  }

  /**
   * Create an element property
   */
  static createElementProp(parent, name, elementType, properties = {}) {
    const element = parent.ele('elementProp', {
      name: name,
      elementType: elementType
    });
    
    if (properties) {
      this.addProperties(element, properties);
    }
    
    return element;
  }

  /**
   * Create a test element (generic)
   */
  static createTestElement(parent, className, guiClass, testName, enabled = true) {
    return parent.ele(className, {
      guiclass: guiClass,
      testclass: className,
      testname: testName,
      enabled: enabled.toString()
    });
  }

  /**
   * Add user defined variables
   */
  static addUserDefinedVariables(parent, variables = {}) {
    const varsElement = this.createElementProp(
      parent,
      'TestPlan.user_defined_variables',
      'Arguments',
      {
        guiclass: 'ArgumentsPanel',
        testclass: 'Arguments',
        enabled: 'true'
      }
    );

    const collection = this.createCollectionProp(varsElement, 'Arguments.arguments');
    
    Object.entries(variables).forEach(([name, value]) => {
      const arg = collection.ele('elementProp', {
        name: name,
        elementType: 'Argument'
      });
      arg.ele('stringProp', { name: 'Argument.name' }).txt(name);
      arg.ele('stringProp', { name: 'Argument.value' }).txt(value);
      arg.ele('stringProp', { name: 'Argument.metadata' }).txt('=');
    });

    return varsElement;
  }

  /**
   * Format XML output
   */
  static formatXML(xmlString) {
    // xmlbuilder2 already provides pretty printing, but this method
    // can be used for additional formatting if needed
    return xmlString;
  }

  /**
   * Validate XML structure
   */
  static validateJMeterXML(xmlString) {
    try {
      const doc = create(xmlString);
      
      // Basic validation checks
      const root = doc.root();
      if (root.node.nodeName !== 'jmeterTestPlan') {
        throw new Error('Root element must be jmeterTestPlan');
      }
      
      const version = root.att('version');
      if (!version) {
        throw new Error('JMeter test plan must have a version attribute');
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Create HTTP argument for request body
   */
  static createHTTPArgument(parent, value, alwaysEncode = false) {
    const httpArg = parent.ele('elementProp', {
      name: '',
      elementType: 'HTTPArgument'
    });
    
    httpArg.ele('boolProp', { name: 'HTTPArgument.always_encode' }).txt(alwaysEncode.toString());
    httpArg.ele('stringProp', { name: 'Argument.value' }).txt(value);
    httpArg.ele('stringProp', { name: 'Argument.metadata' }).txt('=');
    
    return httpArg;
  }

  /**
   * Add HTTP parameters
   */
  static addHTTPParameters(parent, parameters = []) {
    const args = this.createElementProp(
      parent,
      'HTTPsampler.Arguments',
      'Arguments',
      {
        guiclass: 'HTTPArgumentsPanel',
        testclass: 'Arguments',
        enabled: 'true'
      }
    );

    const collection = this.createCollectionProp(args, 'Arguments.arguments');
    
    parameters.forEach(param => {
      const arg = collection.ele('elementProp', {
        name: param.name,
        elementType: 'HTTPArgument'
      });
      
      arg.ele('boolProp', { name: 'HTTPArgument.always_encode' })
        .txt((param.encode !== false).toString());
      arg.ele('stringProp', { name: 'Argument.name' }).txt(param.name);
      arg.ele('stringProp', { name: 'Argument.value' }).txt(param.value);
      arg.ele('stringProp', { name: 'Argument.metadata' }).txt('=');
      arg.ele('boolProp', { name: 'HTTPArgument.use_equals' })
        .txt((param.useEquals !== false).toString());
    });

    return args;
  }

  /**
   * Helper to escape XML special characters
   */
  static escapeXML(str) {
    if (!str) return '';
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Create a simple data writer
   */
  static createSimpleDataWriter(parent, filename) {
    const writer = this.createTestElement(
      parent,
      'ResultCollector',
      'SimpleDataWriter',
      'Simple Data Writer',
      true
    );

    writer.ele('stringProp', { name: 'filename' }).txt(filename);
    writer.ele('boolProp', { name: 'ResultCollector.error_logging' }).txt('false');
    
    const saveConfig = writer.ele('objProp')
      .ele('name').txt('saveConfig')
      .up()
      .ele('value', { class: 'SampleSaveConfiguration' });

    // Configure what to save
    const saveOptions = {
      time: true,
      latency: true,
      timestamp: true,
      success: true,
      label: true,
      code: true,
      message: true,
      threadName: true,
      dataType: false,
      encoding: false,
      assertions: true,
      subresults: false,
      responseData: false,
      samplerData: false,
      xml: false,
      fieldNames: true,
      responseHeaders: false,
      requestHeaders: false,
      responseDataOnError: false,
      saveAssertionResultsFailureMessage: true,
      assertionsResultsToSave: 0,
      bytes: true,
      sentBytes: true,
      url: true,
      fileName: false,
      hostname: true,
      threadCounts: true,
      sampleCount: true,
      idleTime: true,
      connectTime: true
    };

    Object.entries(saveOptions).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        saveConfig.ele(key).txt(value.toString());
      } else {
        saveConfig.ele(key).txt(value.toString());
      }
    });

    return writer;
  }
}

// Export helper functions for common JMeter elements
export const JMeterElements = {
  /**
   * Create a Gaussian Random Timer
   */
  createGaussianTimer(parent, constantDelay = '300', deviation = '100') {
    const timer = XMLBuilder.createTestElement(
      parent,
      'GaussianRandomTimer',
      'GaussianRandomTimerGui',
      'Gaussian Random Timer',
      true
    );

    XMLBuilder.addProperties(timer, {
      'ConstantTimer.delay': constantDelay,
      'RandomTimer.range': deviation
    });

    return timer;
  },

  /**
   * Create a Uniform Random Timer
   */
  createUniformTimer(parent, constantDelay = '0', randomDelay = '1000') {
    const timer = XMLBuilder.createTestElement(
      parent,
      'UniformRandomTimer',
      'UniformRandomTimerGui',
      'Uniform Random Timer',
      true
    );

    XMLBuilder.addProperties(timer, {
      'ConstantTimer.delay': constantDelay,
      'RandomTimer.range': randomDelay
    });

    return timer;
  },

  /**
   * Create a Constant Throughput Timer
   */
  createThroughputTimer(parent, throughput = '60.0') {
    const timer = XMLBuilder.createTestElement(
      parent,
      'ConstantThroughputTimer',
      'TestBeanGUI',
      'Constant Throughput Timer',
      true
    );

    timer.ele('stringProp', { name: 'throughput' }).txt(throughput);
    timer.ele('intProp', { name: 'calcMode' }).txt('0'); // All active threads

    return timer;
  },

  /**
   * Create a Response Time Graph
   */
  createResponseTimeGraph(parent) {
    const graph = XMLBuilder.createTestElement(
      parent,
      'ResultCollector',
      'RespTimeGraphVisualizer',
      'Response Time Graph',
      true
    );

    XMLBuilder.addProperties(graph, {
      'RespTimeGraph.interval': '1000',
      'RespTimeGraph.lineWeight': '3',
      'RespTimeGraph.graphHeight': '300',
      'RespTimeGraph.graphWidth': '900'
    });

    return graph;
  }
};