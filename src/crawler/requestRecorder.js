export class RequestRecorder {
  recordRequest(request, requests) {
    const url = new URL(request.url());
    
    const recordedRequest = {
      id: Date.now() + Math.random(),
      method: request.method(),
      url: request.url(),
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: Date.now()
    };

    requests.push(recordedRequest);
  }

  recordResponse(response, requests) {
    const request = requests.find(r => r.url === response.url());
    if (request) {
      request.response = {
        status: response.status(),
        headers: response.headers(),
        body: null // Will be populated if needed
      };
    }
  }

  processRequests(requests) {
    // Filter out static resources
    return requests.filter(req => {
      const url = req.url.toLowerCase();
      return !url.match(/\.(css|js|png|jpg|jpeg|gif|ico|woff|woff2|ttf|svg)$/);
    });
  }
}
