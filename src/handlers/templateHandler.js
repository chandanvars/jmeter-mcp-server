import { templates } from '../templates/jmxTemplates.js';

export class TemplateHandler {
  async getTemplate(params) {
    const { templateType } = params;
    
    const template = templates[templateType];
    if (!template) {
      throw new Error(`Template type "${templateType}" not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Template for ${templateType}:`
        },
        {
          type: 'text',
          text: '```json\n' + JSON.stringify(template, null, 2) + '\n```'
        }
      ]
    };
  }
}