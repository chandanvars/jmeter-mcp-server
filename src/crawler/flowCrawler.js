import puppeteer from 'puppeteer';
import { RequestRecorder } from './requestRecorder.js';

export class FlowCrawler {
  constructor() {
    this.requestRecorder = new RequestRecorder();
  }

  async crawlFlow(baseUrl, flowSteps) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Setup request interception
    await page.setRequestInterception(true);
    
    const requests = [];
    
    page.on('request', (request) => {
      this.requestRecorder.recordRequest(request, requests);
      request.continue();
    });

    page.on('response', (response) => {
      this.requestRecorder.recordResponse(response, requests);
    });

    try {
      // Navigate to base URL
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });

      // Execute flow steps
      for (const step of flowSteps) {
        await this.executeStep(page, step);
        await page.waitForNetworkIdle();
      }

      // Process and clean recorded requests
      const processedRequests = this.requestRecorder.processRequests(requests);
      
      return processedRequests;
    } finally {
      await browser.close();
    }
  }

  async executeStep(page, step) {
    switch (step.action) {
      case 'click':
        await page.click(step.selector);
        break;
      case 'fill':
        await page.type(step.selector, step.data.value);
        break;
      case 'submit':
        await page.click(step.selector);
        break;
      case 'navigate':
        await page.goto(step.data.url);
        break;
      case 'wait':
        await page.waitForTimeout(step.data.timeout || 1000);
        break;
      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }
}
