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
  },

  inventree: {
    testName: "InvenTree API Test",
    baseUrl: "https://demo.inventree.org",
    threadGroup: {
      numThreads: 5,
      rampUpTime: 60,
      loops: 3
    },
    csvDataSet: {
      fileName: "inventree_data.csv",
      variableNames: "username,password,supplier_name,part_number"
    },
    requests: [
      {
        name: "1. Authenticate with InvenTree",
        method: "POST",
        path: "/api/user/token/",
        headers: {
          "Content-Type": "application/json"
        },
        body: '{"username":"allaccess","password":"nolimits"}',
        extractors: [
          {
            variableName: "auth_token",
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
        name: "2. Get Latest Sales Order",
        method: "GET",
        path: "/api/order/so/?ordering=-pk&limit=1",
        headers: {
          "Authorization": "Token ${auth_token}",
          "Content-Type": "application/json"
        },
        extractors: [
          {
            variableName: "last_so_ref",
            jsonPath: "$[0].reference",
            defaultValue: "SO0000"
          }
        ],
        assertions: [
          {
            type: "responseCode",
            value: "200"
          },
          {
            type: "containsText",
            value: "["
          }
        ]
      },
      {
        name: "3. Get Supplier for PO",
        method: "GET",
        path: "/api/company/?is_supplier=true&limit=1",
        headers: {
          "Authorization": "Token ${auth_token}",
          "Content-Type": "application/json"
        },
        extractors: [
          {
            variableName: "supplier_id",
            jsonPath: "$[0].pk",
            defaultValue: "1"
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
        name: "4. Create Purchase Order with PO Pattern",
        method: "POST",
        path: "/api/order/po/",
        headers: {
          "Authorization": "Token ${auth_token}",
          "Content-Type": "application/json"
        },
        body: '{"supplier":"${supplier_id}","description":"JMeter Load Test PO - Based on SO counter","reference":"PO${__counter(TRUE,)}_${__time(mmss)}","issue_date":"${__time(yyyy-MM-dd)}"}',
        extractors: [
          {
            variableName: "new_po_id",
            jsonPath: "$.pk",
            defaultValue: "NO_PO"
          },
          {
            variableName: "new_po_ref",
            jsonPath: "$.reference",
            defaultValue: "NO_REF"
          }
        ],
        assertions: [
          {
            type: "responseCode",
            value: "201"
          },
          {
            type: "containsText",
            value: "PO"
          }
        ]
      },
      {
        name: "5. Verify Purchase Order Created",
        method: "GET",
        path: "/api/order/po/${new_po_id}/",
        headers: {
          "Authorization": "Token ${auth_token}",
          "Content-Type": "application/json"
        },
        assertions: [
          {
            type: "responseCode",
            value: "200"
          },
          {
            type: "containsText",
            value: "JMeter Load Test PO"
          }
        ]
      }
    ]
  }
};