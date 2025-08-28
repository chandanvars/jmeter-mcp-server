# Contributing to JMeter MCP Server

Thank you for your interest in contributing to the JMeter MCP Server! This document provides guidelines and instructions for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0.0 or higher
- Git
- Basic knowledge of JMeter and MCP protocol
- Familiarity with JavaScript/ES6+ modules

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/chandanvars/jmeter-mcp-server.git
cd jmeter-mcp-server
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Tests**
```bash
npm test
npm run test-api
npm run test-xml
```

4. **Start Development Server**
```bash
npm run dev
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ modules and modern JavaScript features
- Follow consistent naming conventions:
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
- Add JSDoc comments for public methods
- Keep functions small and focused

### Project Structure
```
src/
├── handlers/          # MCP request handlers
│   ├── jmeterHandler.js
│   ├── apiSchemaHandler.js
│   └── uiFlowHandler.js
├── generators/        # Content generators
│   ├── jmxGenerator.js
│   └── configGenerator.js
├── parsers/          # Input parsers
├── utils/            # Utility functions
└── templates/        # Test templates
```

### Adding New Features

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Implement Feature**
   - Add handler in appropriate directory
   - Update main index.js if adding new tools
   - Add comprehensive error handling
   - Include input validation

3. **Add Tests**
   - Create test file following naming convention
   - Test both success and error cases
   - Include integration tests

4. **Update Documentation**
   - Update README.md if needed
   - Add examples to EXAMPLE_PROMPTS.md
   - Document new MCP tools

### Testing Guidelines

#### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Cover edge cases and error conditions

#### Integration Tests
- Test complete workflows
- Validate generated JMX files
- Test MCP protocol interactions

#### Example Test Structure
```javascript
// test-your-feature.js
import { YourHandler } from './src/handlers/yourHandler.js';

async function testYourFeature() {
  try {
    const handler = new YourHandler();
    const result = await handler.process(testData);
    
    // Assertions
    console.assert(result.success === true, 'Should succeed');
    console.log('✅ Test passed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testYourFeature();
```

## 🔧 Adding New MCP Tools

### 1. Define Tool Schema
Add to `src/index.js`:
```javascript
{
  name: 'your_tool_name',
  description: 'Description of what your tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define parameters
    },
    required: ['required_param']
  }
}
```

### 2. Implement Handler
```javascript
case 'your_tool_name':
  const yourHandler = new YourHandler();
  return await yourHandler.process(arguments);
```

### 3. Add Documentation
Update EXAMPLE_PROMPTS.md with usage examples.

## 🎯 Specific Contribution Areas

### High Priority
- **New Test Types**: Add support for new testing scenarios
- **Authentication Methods**: Implement additional auth flows
- **API Schema Support**: Enhance OpenAPI/Swagger parsing
- **Error Handling**: Improve error messages and validation
- **Performance**: Optimize generation speed

### Medium Priority
- **Templates**: Add more test templates
- **Documentation**: Improve examples and guides
- **UI Testing**: Enhance browser automation support
- **Monitoring**: Add better test result analysis

### Beginner Friendly
- **Examples**: Add more example prompts
- **Bug Fixes**: Fix reported issues
- **Documentation**: Improve existing docs
- **Tests**: Add more test coverage

## 📋 Pull Request Process

### Before Submitting
1. Ensure all tests pass
2. Update documentation
3. Add/update examples if applicable
4. Check code formatting

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated existing tests

## Documentation
- [ ] Updated README.md
- [ ] Updated EXAMPLE_PROMPTS.md
- [ ] Added JSDoc comments
```

### Review Process
1. Automated tests must pass
2. Code review by maintainers
3. Documentation review
4. Integration testing

## 🐛 Reporting Bugs

### Bug Report Template
Use the GitHub issue template and include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Generated files (if applicable)

### Critical Bugs
For security issues or critical bugs:
1. Do not open public issues
2. Email maintainers directly
3. Provide detailed reproduction steps

## 💡 Feature Requests

### Before Requesting
1. Check existing issues and discussions
2. Consider if it fits the project scope
3. Think about implementation complexity

### Good Feature Requests Include
- Clear use case description
- Examples of how it would be used
- Consideration of alternatives
- Willingness to help implement

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow GitHub community guidelines

### Communication
- Use clear, descriptive commit messages
- Comment your code thoroughly
- Be patient with review process
- Ask questions when unsure

## 🏷️ Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

### Release Checklist
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create GitHub release
- [ ] Publish to NPM (if applicable)

## 📚 Resources

### Learning Resources
- [Model Context Protocol Docs](https://github.com/modelcontextprotocol/specification)
- [JMeter Documentation](https://jmeter.apache.org/usermanual/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Development Tools
- VS Code with MCP extension
- Claude Desktop for testing
- Postman for API testing
- JMeter GUI for validation

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to make JMeter testing more accessible and powerful! 🎉
