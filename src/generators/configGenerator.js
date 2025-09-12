export class ConfigGenerator {
  addHTTPRequestDefaults(parent, baseUrl) {
    const url = new URL(baseUrl);
    const defaults = parent.ele('ConfigTestElement', {
      guiclass: 'HttpDefaultsGui',
      testclass: 'ConfigTestElement',
      testname: 'HTTP Request Defaults',
      enabled: 'true'
    });

    // Add required HTTPsampler.Arguments element with exact JMeter structure
    const httpArguments = defaults.ele('elementProp', {
      name: 'HTTPsampler.Arguments',
      elementType: 'Arguments',
      guiclass: 'HTTPArgumentsPanel',
      testclass: 'Arguments',
      testname: 'User Defined Variables',
      enabled: 'true'
    });
    httpArguments.ele('collectionProp', { name: 'Arguments.arguments' }).txt('');

    defaults.ele('stringProp', { name: 'HTTPSampler.domain' }).txt(url.hostname);
    defaults.ele('stringProp', { name: 'HTTPSampler.port' }).txt(url.port || (url.protocol === 'https:' ? '443' : '80'));
    defaults.ele('stringProp', { name: 'HTTPSampler.protocol' }).txt(url.protocol.replace(':', ''));
    defaults.ele('stringProp', { name: 'HTTPSampler.contentEncoding' }).txt('');
    defaults.ele('stringProp', { name: 'HTTPSampler.path' }).txt('');
    defaults.ele('stringProp', { name: 'HTTPSampler.concurrentPool' }).txt('6');
    defaults.ele('stringProp', { name: 'HTTPSampler.connect_timeout' }).txt('');
    defaults.ele('stringProp', { name: 'HTTPSampler.response_timeout' }).txt('');
  }

  addCSVDataSet(parent, config) {
    const csvDataSet = parent.ele('CSVDataSet', {
      guiclass: 'TestBeanGUI',
      testclass: 'CSVDataSet',
      testname: config.testname || 'CSV Data Set Config',
      enabled: 'true'
    });

    // Handle filename - use provided fileName or filename, ensure it's not empty
    const fileName = config.fileName || config.filename || config.variableNames + '_data.csv';
    csvDataSet.ele('stringProp', { name: 'filename' }).txt(fileName);
    csvDataSet.ele('stringProp', { name: 'fileEncoding' }).txt(config.fileEncoding || 'UTF-8');
    csvDataSet.ele('stringProp', { name: 'variableNames' }).txt(config.variableNames || '');
    csvDataSet.ele('boolProp', { name: 'ignoreFirstLine' }).txt(String(config.ignoreFirstLine !== false));
    csvDataSet.ele('stringProp', { name: 'delimiter' }).txt(config.delimiter || ',');
    csvDataSet.ele('boolProp', { name: 'quotedData' }).txt(String(config.quotedData || false));
    csvDataSet.ele('boolProp', { name: 'recycle' }).txt(String(config.recycle !== false));
    csvDataSet.ele('boolProp', { name: 'stopThread' }).txt(String(config.stopThread || false));
    csvDataSet.ele('stringProp', { name: 'shareMode' }).txt(config.shareMode || 'shareMode.all');
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

  addConstantThroughputTimer(parent, throughput = 60.0, calcMode = 0) {
    const timer = parent.ele('ConstantThroughputTimer', {
      guiclass: 'TestBeanGUI',
      testclass: 'ConstantThroughputTimer',
      testname: 'Constant Throughput Timer',
      enabled: 'true'
    });

    timer.ele('stringProp', { name: 'throughput' }).txt(String(throughput));
    timer.ele('intProp', { name: 'calcMode' }).txt(String(calcMode));
    
    return timer;
  }

  addUniformRandomTimer(parent, constantDelay = 1000, randomRange = 2000) {
    const timer = parent.ele('UniformRandomTimer', {
      guiclass: 'UniformRandomTimerGui',
      testclass: 'UniformRandomTimer',
      testname: 'Random Delay',
      enabled: 'true'
    });

    timer.ele('stringProp', { name: 'ConstantTimer.delay' }).txt(String(constantDelay));
    timer.ele('stringProp', { name: 'RandomTimer.range' }).txt(String(randomRange));
    
    return timer;
  }
}