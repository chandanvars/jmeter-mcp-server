# 🎯 Ready-to-Use Prompts for JMeter MCP Server

Copy and paste these prompts directly into Claude Desktop to test your JMeter MCP Server!

## �️ UI Testing Prompts (NEW!)

### 1. Login Flow UI Test
```
Generate a JMeter UI test for a login workflow:
- Open https://the-internet.herokuapp.com/login
- Enter username: tomsmith
- Enter passwor## 🔧 Template Requests

### API Testing Templates

### Get REST API Template
```
Get me a REST API template for testing CRUD operations
```

### Get GraphQL Template  
```
Show me a GraphQL testing template with queries and mutations
```

### Get OAuth2 Template
```
Provide an OAuth2 authentication flow testing template
```

### UI Testing Templates

### Get UI Testing Template
```
Show me a comprehensive UI testing template with common web interactions
```

### Get Login Flow Template
```
Provide a reusable login flow template for web applications
```

### Get E-commerce UI Template
```
Get me an e-commerce testing template covering shopping cart workflows
```

### Get Form Testing Template
```
Show me a form testing template with validation and error handling
```ssword!
- Click login button
- Verify successful login message appears
- 3 users, 10-second ramp-up, 2 loops
- Include screenshot capture on failures
```

### 2. E-commerce Shopping Cart UI Test
```
Create a comprehensive e-commerce UI test:
- Navigate to https://demo.opencart.com
- Search for "MacBook"
- Add first product to cart
- Go to checkout page
- Fill guest checkout form with sample data
- Verify cart total and product details
- 5 users, 30-second ramp-up, 3 loops
- Add response time assertions < 3000ms
```

### 3. Form Submission UI Test
```
Generate a form testing scenario:
- Open https://httpbin.org/forms/post
- Fill all form fields with random data
- Submit the form
- Verify successful submission response
- Extract form data from response
- Use CSV data for form field values
- 10 users, 20-second ramp-up, 5 loops
```

### 4. Multi-Page Navigation UI Test
```
Create a multi-page navigation test:
- Start at https://example.com
- Navigate through 5 different pages
- Verify page titles and key elements
- Check for broken links
- Measure page load times
- Include correlation for session management
- 8 users, 45-second ramp-up, 4 loops
```

### 5. Dynamic Content UI Test
```
Generate a test for dynamic web content:
- Open https://the-internet.herokuapp.com/dynamic_content
- Refresh page multiple times
- Verify content changes each time
- Extract dynamic elements using CSS selectors
- Validate all images load properly
- 15 users, 1-minute ramp-up, 6 loops
```

### 6. File Upload UI Test
```
Create a file upload test scenario:
- Navigate to https://the-internet.herokuapp.com/upload
- Select and upload a test file
- Verify successful upload message
- Download the uploaded file
- Validate file integrity
- 5 users, 30-second ramp-up, 3 loops
- Include file size assertions
```

### 7. JavaScript-Heavy SPA Test
```
Generate a Single Page Application test:
- Test https://todomvc.com/examples/react
- Add multiple todo items
- Mark some as completed
- Filter by completed/active
- Clear completed todos
- Verify DOM updates and state changes
- 12 users, 2-minute ramp-up, 4 loops
```

### 8. Authentication & Session UI Test
```
Create a comprehensive authentication test:
- Login to https://the-internet.herokuapp.com/login
- Navigate to secure area
- Perform authenticated actions
- Logout and verify session termination
- Test session timeout scenarios
- Include CSRF token handling
- 10 users, 1-minute ramp-up, 5 loops
```

### 9. Responsive Design UI Test
```
Generate a responsive web design test:
- Test https://getbootstrap.com/docs/5.0/examples/
- Simulate different screen sizes (mobile, tablet, desktop)
- Verify responsive behavior
- Check mobile navigation menu
- Validate touch interactions
- 8 users, 30-second ramp-up, 3 loops
```

### 10. Error Handling UI Test
```
Create an error scenario testing suite:
- Test 404 pages and error handling
- Submit invalid form data
- Test broken links and missing resources
- Verify error messages are user-friendly
- Check error page redirects
- Include negative testing scenarios
- 6 users, 20-second ramp-up, 4 loops
```

### 11. Performance-Critical UI Test
```
Generate a performance-focused UI test:
- Load https://httpbin.org/drip?duration=5&numbytes=1024
- Measure First Contentful Paint (FCP)
- Track JavaScript execution time
- Monitor network waterfall
- Test with simulated slow network
- 20 users, 3-minute ramp-up, 2 loops
- Include performance budgets
```

### 12. Cross-Browser Simulation UI Test
```
Create a cross-browser compatibility test:
- Test the same workflow across different user agents
- Simulate Chrome, Firefox, Safari, Edge browsers
- Verify consistent behavior across browsers
- Check browser-specific features
- Test fallback functionality
- 4 users per browser, 1-minute ramp-up, 3 loops
```

## �🔐 Generic Token Management (NEW!)

### 17. OAuth2 Client Credentials Flow
```
Generate a test with OAuth2 client credentials authentication:
- Token endpoint: https://auth.example.com/oauth/token
- Protected endpoint: https://api.example.com/protected-resource
- Extract access_token and use in Authorization header
- Include proper error handling
- 5 users, 30-second ramp-up, 3 loops
```

### 18. JWT Token with RefreshAuthentication Examples

### 17. OAuth2 Client Credentials Flow## 13. InvenTree with Real Demo Credentials ✅ RECOMMENDED
```
Generate an InvenTree API test with real demo credentials:
- Use the new generic token management system
- Include real InvenTree demo credentials (allaccess/nolimits)
- Extract the last sales order created and set the counter for new sales order
- Create new purchase order with the latest counter set from above step. Purchase order id pattern is PO{ref:04d}
- Direct arrays are returned in responses instead of results arrays, implement assertions using direct arrays.
- Test purchase order creation workflow
- 5 users, 60-second ramp-up, 3 loops
```

```
Generate an InvenTree API test with real demo credentials:
- Use the new generic token management system
- Include real InvenTree demo credentials (allaccess/nolimits)
- Extract the last sales order created and set the counter for new sales order
- Create new sales order with the latest counter set from above step. Sales order id pattern is SO{ref:04d}
- Direct arrays are returned in responses instead of results arrays, implement assertions using direct arrays.
- Test purchase order creation workflow
- 5 users, 60-second ramp-up, 3 loops
```

### 14. OAuth2 API Test with Client Credentials
```
Generate an OAuth2 API test:
- API Type: oauth2
- Base URL: https://api.example.com
- Include client credentials flow
- Test user profile endpoints
- 10 users, 90-second ramp-up, 5 loops
```

### 15. JWT API Test
```
Generate a JWT-based API test:
- API Type: jwt
- Base URL: https://api.jwt-example.com
- Include username/password to JWT flow
- Test protected resources
- 8 users, 60-second ramp-up, 4 loops
```

### 16. Custom API with Token Management
```
Generate a custom API test with token management:
- API Type: custom
- Custom token endpoint: /auth/token/create
- Custom authentication method
- Include business logic requests
- 15 users, 2-minute ramp-up, 3 loops
```:

## 🚀 Quick Start Prompts

### API Testing Quick Starts

### 1. Simple API Test
```
Generate a basic JMeter test script for testing https://httpbin.org with these requests:
- GET /get
- POST /post with sample JSON data
Use 5 users, 10-second ramp-up, 3 loops
```

### 2. E-commerce API Test
```
Create a JMeter test for an online store API at https://fakestoreapi.com:
- GET /products (browse catalog)
- GET /products/1 (view product details)  
- POST /auth/login (user login)
- Use 10 concurrent users, 30-second ramp-up, 5 loops
- Add response time assertions under 1000ms
```

### UI Testing Quick Starts

### 3. Simple Login UI Test
```
Generate a basic UI test for login functionality:
- Open https://the-internet.herokuapp.com/login
- Enter credentials and submit
- Verify successful login
- 3 users, 15-second ramp-up, 2 loops
```

### 4. Basic Form Submission UI Test
```
Create a simple form testing scenario:
- Navigate to a contact form page
- Fill out all required fields
- Submit and verify success message
- 5 users, 20-second ramp-up, 3 loops
```

### 5. CSV Parameterized Test
```
Generate a JMeter test using CSV data:
- Base URL: https://reqres.in/api
- Test endpoint: POST /users
- CSV file: "test_users.csv" with columns: name,job,email
- Request body: {"name": "${name}", "job": "${job}", "email": "${email}"}
- 20 users, 1-minute ramp-up, 2 loops
```

### 6. Advanced Correlation Test
```
Create a JMeter test with response correlation:
- Base URL: https://jsonplaceholder.typicode.com
- Step 1: GET /users/1 (extract user data)
- Step 2: POST /posts using extracted userId
- Extract userId from first response using JSONPath: $.id
- 15 users, 45-second ramp-up, 4 loops
```

### 7. Performance Test with Multiple Endpoints
```
Generate a comprehensive API performance test:
- Base URL: https://api.github.com
- Endpoints:
  - GET /users/octocat
  - GET /users/octocat/repos
  - GET /repos/octocat/Hello-World
- Add response code assertions (200)
- Add response time assertions (< 2000ms)
- 50 users, 2-minute ramp-up, 10 loops
```

## � API Schema-Based Testing (NEW!)

### 6. Generate from Swagger/OpenAPI Schema
```
Generate a JMeter test from the Petstore API schema:
- Schema URL: https://petstore.swagger.io/v2/swagger.json
- Target endpoint: addPet operation
- Include OAuth2 authentication
- Use 10 users, 30-second ramp-up, 5 loops
```

### 7. Test Any API with Schema URL
```
Create a JMeter test from API schema with these parameters:
- Schema URL: https://api.apis.guru/v2/specs/github.com/1.1.4/swagger.json
- Find an endpoint with the tag "users"
- Include authentication if available
- Use correlation for token management
- 15 users, 45-second ramp-up, 3 loops
```

### 8. InvenTree API Test (Specialized) ✅ WORKING
```
Generate a complete InvenTree API test for purchase order creation:
- Use demo InvenTree instance
- Include authentication flow with token correlation
- Test purchase order creation and validation
- 5 users, 60-second ramp-up, 3 loops
```

### 8a. InvenTree API Test with Admin Tokens ✅ NEW!
```
Generate InvenTree test using admin-created tokens:
- Use authMethod: 'admin'
- Pre-created tokens from admin interface
- Better performance for load testing
- 10 users, 45-second ramp-up, 5 loops
```

### 9. Authentication with Token Correlation
```
Generate a test from API schema with advanced authentication:
- Schema URL: https://api.example.com/swagger.json
- Target endpoint: POST /api/orders
- Authentication method: Bearer token from /auth/login
- Extract token using JSONPath: $.access_token
- Include token in all subsequent requests
- 20 users, 2-minute ramp-up, 5 loops
```

### 10. Multi-Step API Workflow from Schema
```
Create a complex workflow test from API schema:
- Schema URL: https://petstore.swagger.io/v2/swagger.json
- Step 1: Login/authenticate
- Step 2: Create a pet (extract pet ID)
- Step 3: Update the pet using extracted ID
- Step 4: Get pet details for verification
- Use proper correlation between all steps
- 10 users, 1-minute ramp-up, 2 loops
```

## �🔧 Template Requests

### Get REST API Template
```
Get me a REST API template for testing CRUD operations
```

### Get GraphQL Template  
```
Show me a GraphQL testing template with queries and mutations
```

### Get OAuth2 Template
```
Provide an OAuth2 authentication flow testing template
```

## � Advanced Authentication Examples

### 11. OAuth2 Client Credentials Flow
```
Generate a test with OAuth2 client credentials authentication:
- Token endpoint: https://auth.example.com/oauth/token
- Protected endpoint: https://api.example.com/protected-resource
- Extract access_token and use in Authorization header
- Include proper error handling
- 5 users, 30-second ramp-up, 3 loops
```

### 12. JWT Token with Refresh
```
Create a test with JWT token management:
- Login endpoint: POST /api/auth/login
- Extract both access_token and refresh_token
- Use access_token for API calls
- Implement token refresh logic
- Test multiple protected endpoints
- 15 users, 1-minute ramp-up, 5 loops
```

## �💡 Testing Your Setup

1. **Copy any prompt above**
2. **Paste into Claude Desktop**
3. **The MCP server should generate a complete JMeter script**
4. **Check the output folder for generated .jmx files and sample_data folder for .csv files**

📁 **File Organization:**
- **JMX Files:** All generated JMeter test scripts (.jmx) are saved to the `output/` directory
- **CSV Files:** All test data files (.csv) are saved to the `sample_data/` directory
- **Relative Paths:** JMX files automatically reference CSV files using relative paths (`../sample_data/filename.csv`)

This organization ensures that:
✅ Files are properly separated by type
✅ JMeter can find CSV data files from any location
✅ Projects remain portable and easy to share
✅ Version control is simplified with clear directory structure

## ✅ Success Indicators

When working correctly, you should see:
- ✅ Claude Desktop recognizes JMeter tools
- ✅ Detailed JMeter scripts are generated
- ✅ Files appear in the output directory
- ✅ Scripts include all requested features (users, ramp-up, assertions, etc.)
- ✅ **API Features:** Schema parsing and authentication flow generation
- ✅ **API Features:** Token correlation and extraction working properly
- ✅ **NEW UI Features:** Web browser simulation and page interaction
- ✅ **NEW UI Features:** Form handling and element selection
- ✅ **NEW UI Features:** Screenshot capture and visual validation
- ✅ **NEW UI Features:** JavaScript execution and SPA testing
- ✅ **NEW UI Features:** Responsive design and cross-browser testing

## 🚨 If Something's Not Working

1. **Restart Claude Desktop completely**
2. **Verify config file**: Check `%APPDATA%\Claude\claude_desktop_config.json`
3. **Test server manually**: Run `npm test` in your server directory
4. **Check file paths**: Ensure the path in config matches your server location
5. **For API schema issues**: Verify the schema URL is accessible and contains valid OpenAPI/Swagger spec

## 🌟 New Features Summary

### API Testing Features
- **API Schema Support**: Generate tests directly from Swagger/OpenAPI URLs
- **Advanced Authentication**: OAuth2, JWT, and token-based authentication
- **Correlation Engine**: Automatic token extraction and reuse
- **InvenTree Integration**: Specialized support for InvenTree API testing
- **Enhanced Error Handling**: Better error messages and troubleshooting

### UI Testing Features (NEW!)
- **Web Browser Simulation**: Full browser-based testing capabilities
- **Element Interaction**: Click, type, select, and navigate web elements
- **Form Handling**: Automated form filling and submission testing
- **Visual Validation**: Screenshot capture and visual regression testing
- **JavaScript Support**: Test Single Page Applications (SPAs) and dynamic content
- **Responsive Testing**: Multi-device and cross-browser simulation
- **Performance Monitoring**: Page load times and rendering metrics
- **Session Management**: Cookie handling and authentication state
- **Error Scenarios**: Negative testing and error condition validation
- **File Operations**: Upload/download testing and file validation
