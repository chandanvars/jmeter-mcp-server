export const templates = {
  rest_api: {
    testName: "REST API Test",
    baseUrl: "https://api.example.com",
    defaultHeaders: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    threadGroup: {
      numThreads: 10,
      rampUpTime: 10,
      loops: 1
    },
    csvDataSet: {
      fileName: "test_data.csv",
      variableNames: "username,password,userId"
    },
    requests: [
      {
        name: "Login",
        method: "POST",
        path: "/auth/login",
        body: '{"username":"${username}","password":"${password}"}',
        extractors: [
          {
            variableName: "authToken",
            jsonPath: "$.token",
            defaultValue: "NO_TOKEN"
          }
        ],
        assertions: [
          {
            type: "responseCode",
            value: "200"
          }
        ]
      },
      {
        name: "Get User Profile",
        method: "GET",
        path: "/users/${userId}",
        headers: {
          "Authorization": "Bearer ${authToken}"
        },
        assertions: [
          {
            type: "responseCode",
            value: "200"
          },
          {
            type: "jsonPath",
            jsonPath: "$.id",
            expectedValue: "${userId}"
          }
        ]
      }
    ]
  },
  
  oauth2: {
    testName: "OAuth2 API Test",
    baseUrl: "https://api.example.com",
    requests: [
      {
        name: "Get Access Token",
        method: "POST",
        path: "/oauth/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}",
        extractors: [
          {
            variableName: "access_token",
            jsonPath: "$.access_token",
            defaultValue: "NO_TOKEN"
          }
        ],
        assertions: [
          {
            type: "responseCode",
            value: "200"
          }
        ]
      },
      {
        name: "API Call with Token",
        method: "GET",
        path: "/api/resource",
        headers: {
          "Authorization": "Bearer ${access_token}"
        },
        assertions: [
          {
            type: "responseCode",
            value: "200"
          }
        ]
      }
    ]
  }
};