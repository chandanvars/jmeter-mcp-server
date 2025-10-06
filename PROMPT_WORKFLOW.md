# JMeter MCP Server - Prompt-Based Workflow

## Overview

The JMeter MCP Server now uses a **two-step prompt-based workflow** for generating JMeter test files:

1. **Step 1: Generate Prompt** - Convert your natural language request into a structured prompt
2. **Step 2: Execute Prompt** - Use the prompt to generate the actual JMX file

This approach allows you to:
- Review and modify test specifications before generation
- Use Copilot Chat commands to generate JMX files
- Maintain better control over test generation
- Leverage prompt engineering for better results

---

## Workflow Steps

### Step 1: Generate Test Prompt

Use one of the following MCP tools to generate a test prompt:

#### Option A: Basic JMeter Script
```javascript
// Use the generate_jmeter_script tool with your test configuration
{
  testName: "API Load Test",
  baseUrl: "https://api.example.com",
  requests: [
    {
      name: "Get Users",
      method: "GET",
      path: "/users"
    }
  ],
  threadGroup: {
    numThreads: 10,
    rampUpTime: 30,
    loops: 5
  }
}
```

#### Option B: API Schema-Based
```javascript
// Use the generate_from_api_schema tool
{
  schemaUrl: "https://petstore.swagger.io/v2/swagger.json",
  endpoint: {
    operationId: "addPet"
  },
  authConfig: {
    method: "oauth2"
  }
}
```

#### Option C: UI Flow Description
```javascript
// Use the generate_ui_flow_script tool
{
  testName: "Login Flow Test",
  baseUrl: "https://example.com",
  flowDescription: "Navigate to login page, fill username with test@example.com, fill password with password123, click login button, verify dashboard appears"
}
```

**Result:** A prompt file is saved to `.github/prompts/jmx_prompt.prompt.md`

---

### Step 2: Execute Prompt to Generate JMX

Once the prompt is generated, use one of these methods to create the JMX file:

#### Method A: Using MCP Tool
```javascript
// Use the execute_jmx_prompt tool
{
  promptFile: ".github/prompts/jmx_prompt.prompt.md",
  outputFileName: "my_test.jmx"  // Optional
}
```

#### Method B: Using Copilot Chat Command
```bash
@workspace /jmx_prompt
```

#### Method C: Manual Review and Modification
1. Open `.github/prompts/jmx_prompt.prompt.md`
2. Review and modify the specifications
3. Run `execute_jmx_prompt` tool

**Result:** JMX file is generated and saved to the `output` folder

---

## Example Complete Workflow

### Example 1: Simple REST API Test

**Step 1 - Generate Prompt:**
```
User: Create a JMeter test for testing JSONPlaceholder API with 20 users
```

The MCP server generates a prompt file with:
- Test name: "JSONPlaceholder API Test"
- Base URL: "https://jsonplaceholder.typicode.com"
- Requests: GET /posts, GET /users
- Thread group: 20 users, 30s ramp-up

**Step 2 - Execute Prompt:**
```
User: @workspace /jmx_prompt
```

The JMX file is generated at: `output/jsonplaceholder_api_test.jmx`

---

### Example 2: UI Flow with Data Parameterization

**Step 1 - Generate Prompt:**
```
User: Create a login test flow with CSV data for multiple users
```

The MCP server generates:
- Prompt file with UI flow specifications
- Sample CSV file with test data

**Step 2 - Review and Modify:**
- Open `.github/prompts/jmx_prompt.prompt.md`
- Adjust the flow steps if needed
- Update CSV data in `sample_data` folder

**Step 3 - Execute Prompt:**
```
User: Execute the JMX prompt
```

Result:
- `output/login_test.jmx` - JMeter test file
- Uses `sample_data/login_test_data.csv` for parameterization

---

## Prompt File Structure

The generated prompt file contains:

```markdown
# JMeter Test Generation Specification

## Test Configuration
**Test Name:** [Your test name]
**Base URL:** [Your base URL]

## Load Configuration
- **Number of Threads (Users):** [Number]
- **Ramp-Up Time (seconds):** [Seconds]
- **Loop Count:** [Count]

## Test Requests
### Request 1: [Name]
- **Method:** GET/POST/PUT/DELETE
- **Path:** /api/endpoint
- **Headers:** [Headers]
- **Body:** [Request body]
- **Extractors:** [Response extractors]
- **Assertions:** [Validation rules]

## CSV Data Configuration
[CSV parameterization settings]

## Instructions for JMX Generation
[Detailed generation instructions]
```

---

## Benefits of This Approach

### 1. **Review Before Generation**
- See exactly what will be generated
- Modify specifications before creating JMX
- Catch configuration errors early

### 2. **Reusability**
- Save prompts for future use
- Share test specifications with team
- Version control test configurations

### 3. **Flexibility**
- Mix natural language with structured data
- Leverage Copilot for intelligent generation
- Customize prompts for specific needs

### 4. **Better Control**
- Separate specification from implementation
- Edit prompts without regenerating
- Fine-tune test parameters

---

## File Locations

- **Prompt Files:** `.github/prompts/jmx_prompt.prompt.md`
- **JMX Output:** `output/[test_name].jmx`
- **CSV Data:** `sample_data/[test_name]_data.csv`

---

## Troubleshooting

### Problem: Prompt file not found
**Solution:** Run one of the generation tools first to create the prompt file

### Problem: JMX generation fails
**Solution:** 
1. Check prompt file format
2. Verify all required fields are present
3. Ensure test configuration is valid

### Problem: CSV data not loading
**Solution:**
1. Verify CSV file path in prompt
2. Check CSV file exists in `sample_data` folder
3. Ensure variable names match CSV headers

---

## Migration from Direct Generation

If you were using the old direct JMX generation:

**Before:**
```
User: Generate a JMeter test for my API
→ JMX file created immediately
```

**Now:**
```
User: Generate a JMeter test for my API
→ Prompt file created

User: @workspace /jmx_prompt
→ JMX file created from prompt
```

---

## Advanced Usage

### Custom Prompts
You can create custom prompt templates by:
1. Copying the generated prompt file
2. Modifying it for your needs
3. Using it with `execute_jmx_prompt`

### Batch Generation
Generate multiple JMX files from different prompts:
```javascript
execute_jmx_prompt({ promptFile: "prompts/test1.prompt.md", outputFileName: "test1.jmx" })
execute_jmx_prompt({ promptFile: "prompts/test2.prompt.md", outputFileName: "test2.jmx" })
```

---

## Next Steps

1. Try the new workflow with a simple test
2. Explore the generated prompt files
3. Customize prompts for your use cases
4. Share feedback and improvements

Happy Testing! 🚀
