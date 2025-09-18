# JMeter MCP Server - Unit Tests

This directory contains comprehensive unit tests for the JMeter MCP Server, specifically focusing on CSV-based test generation functionality.

## Test Files

### 1. `test-jmeter-csv-generation.js`
**Unit Tests for JMeter CSV Generation**

Tests the core functionality for generating JMeter scripts with CSV data parameterization:

- ✅ **CSV Content Generation**: Validates CSV header and data row creation
- ✅ **JMeter Script Generation**: Tests complete JMX file generation with CSV integration
- ✅ **JMX Content Validation**: Ensures generated JMX contains all required elements
- ✅ **Request Body Templating**: Validates variable placeholder substitution
- ✅ **Error Handling**: Tests edge cases and error scenarios

**Run:** `npm run test-unit`

### 2. `test-complete-user-creation.js`
**Integration Test for Complete User Creation Scenario**

Validates the complete user story from the requirements:

- **Base URL**: `https://reqres.in/api`
- **Endpoint**: `POST /users`
- **CSV File**: `test_users.csv` with columns: name, job, email
- **Request Body**: `{"name": "${name}", "job": "${job}", "email": "${email}"}`
- **Load Configuration**: 20 users, 1-minute ramp-up, 2 loops

**Run:** `npm run test-integration`

### 3. `test-transports.js`
**Transport Layer Tests**

Tests both HTTP and stdio transport modes for the MCP server.

**Run:** `npm run test-transports`

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test-unit        # Unit tests only
npm run test-integration # Integration tests only
npm run test-transports  # Transport tests only
```

## Test Coverage

The test suite validates:

1. **Core Functionality**:
   - JMeter script generation
   - CSV data file creation
   - Request templating with variables

2. **Specific Requirements**:
   - POST requests to `/users` endpoint
   - JSON request body with CSV variables
   - Correct thread group configuration
   - CSV data set configuration

3. **Quality Assurance**:
   - File creation verification
   - Content validation
   - Error handling
   - Edge case scenarios

## Generated Test Artifacts

When tests run, they create:

- **JMX Files**: `output/user_creation_api_test.jmx`
- **CSV Files**: `sample_data/user_creation_api_test_data.csv`
- **Sample Data**: `sample_data/test_users.csv` (20 test users)

## Validation Criteria

Each test validates:

- ✅ Correct HTTP method (POST)
- ✅ Proper endpoint path (/users)
- ✅ Thread configuration (20 users, 60s ramp-up, 2 loops)
- ✅ CSV variable names (name, job, email)
- ✅ Request body template with variables
- ✅ File existence and content accuracy

## Usage Example

The generated JMeter test can be executed with:

```bash
cd output
jmeter -n -t user_creation_api_test.jmx -l results.jtl
```

This will perform:
- **40 total requests** (20 users × 2 loops)
- **CSV data rotation** through 20 user records
- **POST requests** to https://reqres.in/api/users
- **JSON payloads** with parameterized user data