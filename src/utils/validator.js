import Joi from 'joi';

const testPlanSchema = Joi.object({
  testName: Joi.string().required(),
  baseUrl: Joi.string().uri().required(),
  requests: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
      path: Joi.string().required(),
      headers: Joi.object().pattern(Joi.string(), Joi.string()),
      body: Joi.string(),
      extractors: Joi.array().items(
        Joi.object({
          variableName: Joi.string().required(),
          jsonPath: Joi.string(),
          regex: Joi.string(),
          defaultValue: Joi.string()
        }).xor('jsonPath', 'regex')
      ),
      assertions: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('responseCode', 'responseTime', 'jsonPath', 'contains').required(),
          value: Joi.string(),
          jsonPath: Joi.string(),
          expectedValue: Joi.string()
        })
      ),
      preProcessor: Joi.object({
        type: Joi.string().valid('beanshell').required(),
        script: Joi.string().required()
      })
    })
  ).min(1).required(),
  threadGroup: Joi.object({
    numThreads: Joi.number().positive().default(10),
    rampUpTime: Joi.number().positive().default(10),
    loops: Joi.number().positive().default(1)
  }),
  csvDataSet: Joi.object({
    fileName: Joi.string().required(),
    variableNames: Joi.string().required(),
    delimiter: Joi.string().default(',')
  }),
  defaultHeaders: Joi.object().pattern(Joi.string(), Joi.string())
});

export function validateTestPlan(data) {
  return testPlanSchema.validate(data);
}