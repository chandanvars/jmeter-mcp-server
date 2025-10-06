# Quick Reference: Prompt-Based JMeter Test Generation

## 🚀 Quick Start

### Step 1: Generate a Test Prompt
Choose one of these tools based on your needs:

| Tool | Use Case | Example |
|------|----------|---------|
| `generate_jmeter_script` | Basic REST API testing | Create load test for API endpoints |
| `generate_ui_flow_script` | Web UI flow testing | Test login → dashboard flow |
| `generate_from_api_schema` | OpenAPI/Swagger testing | Test API from schema URL |

### Step 2: Generate JMX File
Use the `execute_jmx_prompt` tool to create the actual JMX file from your prompt.

---

## 📋 Common Commands

### In Copilot Chat
```bash
# Generate a basic test prompt
"Create a JMeter test for testing https://api.example.com with GET /users endpoint"

# Generate JMX file from prompt
@workspace /jmx_prompt
```

### Using MCP Tools
```javascript
// 1. Generate prompt
{
  "tool": "generate_jmeter_script",
  "testName": "My API Test",
  "baseUrl": "https://api.example.com",
  "requests": [{"name": "Get Users", "method": "GET", "path": "/users"}]
}

// 2. Execute prompt
{
  "tool": "execute_jmx_prompt"
}
```

---

## 📁 File Locations

| File Type | Location | Purpose |
|-----------|----------|---------|
| Prompt | `.github/prompts/jmx_prompt.prompt.md` | Test specification |
| JMX File | `output/[testname].jmx` | Generated test file |
| CSV Data | `sample_data/[testname]_data.csv` | Test data |

---

## 🔄 Complete Workflow Examples

### Example 1: Basic API Load Test
```
1. User: "Create JMeter test for JSONPlaceholder API"
   → Prompt generated at .github/prompts/jmx_prompt.prompt.md

2. User: "@workspace /jmx_prompt"
   → JMX file generated at output/jsonplaceholder_test.jmx

3. Run test: jmeter -n -t output/jsonplaceholder_test.jmx -l results.jtl
```

### Example 2: UI Flow with CSV Data
```
1. User: "Create login test flow with CSV data"
   → Prompt + CSV sample generated

2. [Optional] Edit .github/prompts/jmx_prompt.prompt.md to customize

3. User: "Execute JMX prompt"
   → JMX file generated with CSV parameterization

4. Update sample_data/login_test_data.csv with real data

5. Run test: jmeter -n -t output/login_test.jmx -l results.jtl
```

### Example 3: API Schema Test
```
1. User: "Generate test from Swagger at https://api.example.com/swagger.json"
   → Prompt generated with schema details

2. Review prompt to verify endpoints

3. User: "Generate JMX file"
   → JMX file created with API calls

4. Run test
```

---

## 🛠️ Tool Parameters

### generate_jmeter_script
```javascript
{
  "testName": "string (required)",
  "baseUrl": "string (required)",
  "requests": [
    {
      "name": "string (required)",
      "method": "GET|POST|PUT|DELETE (required)",
      "path": "string (required)",
      "headers": "object (optional)",
      "body": "string (optional)"
    }
  ],
  "threadGroup": {
    "numThreads": "number (default: 10)",
    "rampUpTime": "number (default: 10)",
    "loops": "number (default: 1)"
  }
}
```

### generate_ui_flow_script
```javascript
{
  "testName": "string (required)",
  "baseUrl": "string (required)",
  "flowDescription": "string (required)",
  "threadCount": "number (default: 10)",
  "rampUp": "number (default: 30)"
}
```

### execute_jmx_prompt
```javascript
{
  "promptFile": "string (optional, default: .github/prompts/jmx_prompt.prompt.md)",
  "outputFileName": "string (optional)"
}
```

---

## ❗ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Prompt file not found" | Run a generation tool first to create the prompt |
| "JMX generation failed" | Check prompt file format and required fields |
| "CSV not loading in JMeter" | Verify CSV file path and variable names match |

---

## 💡 Pro Tips

1. **Review Before Generating**: Always review the prompt file before executing it
2. **Reuse Prompts**: Save and reuse prompts for similar tests
3. **Customize**: Edit prompt files to fine-tune test parameters
4. **Version Control**: Keep prompt files in git for team collaboration
5. **Batch Generation**: Generate multiple JMX files from different prompts

---

## 🎯 Next Steps

1. ✅ Generate your first test prompt
2. ✅ Review the generated prompt file
3. ✅ Execute the prompt to create JMX file
4. ✅ Run the test in JMeter
5. ✅ Analyze results and iterate

---

## 📚 Additional Resources

- **Full Documentation**: [PROMPT_WORKFLOW.md](PROMPT_WORKFLOW.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Main README**: [README.md](README.md)

---

## 🆘 Getting Help

**Common Questions:**
- How do I modify a test? → Edit the prompt file and re-execute
- Can I use custom templates? → Yes, copy and modify the prompt file
- How do I run tests? → Use JMeter CLI: `jmeter -n -t output/test.jmx -l results.jtl`

**Support:**
- Create an issue on GitHub
- Check existing documentation
- Review example prompts in the codebase
