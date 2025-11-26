---
agent: agent
model: Claude Sonnet 4 (copilot)
---

# JMeter Test Generation Specification

## Test Configuration

**Test Name:** Basic UI Login Test
**Base URL:** https://the-internet.herokuapp.com

## Load Configuration

- **Number of Threads (Users):** 3
- **Ramp-Up Time (seconds):** 15
- **Loop Count:** 2

## Test Requests

### Request 1: Open Login Page

- **Method:** GET
- **Path:** /login
- **Headers:**
  - `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36`
- **Assertions:**
  - Type: responseCode
    - Expected: `200`
  - Type: containsText
    - Expected: `Login Page`

### Request 2: Submit Login Form

- **Method:** POST
- **Path:** /authenticate
- **Headers:**
  - `Content-Type: application/x-www-form-urlencoded`
  - `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36`
- **Body:**
```json
username=tomsmith&password=SuperSecretPassword!
```
- **Response Extractors:**
  - Variable: `loginSuccess`
    - Regex: `(You logged into a secure area!)`
    - Default: `LOGIN_FAILED`
- **Assertions:**
  - Type: responseCode
    - Expected: `200`
  - Type: containsText
    - Expected: `You logged into a secure area!`

### Request 3: Access Secure Area

- **Method:** GET
- **Path:** /secure
- **Headers:**
  - `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36`
- **Assertions:**
  - Type: responseCode
    - Expected: `200`
  - Type: containsText
    - Expected: `Secure Area`
  - Type: containsText
    - Expected: `Welcome to the Secure Area`

## CSV Data Configuration

_No CSV data configuration_

## Default Headers

_No default headers specified_

## Timers Configuration

_Default timer settings will be used_

## Result Listeners

- view_results_tree

---

## Instructions for JMX Generation

When executing this prompt:
1. Read the test configuration above
2. Generate a complete JMeter JMX file with all specified components
3. Include proper thread groups, samplers, extractors, and assertions
4. Add correlation handlers for dynamic values
5. Configure CSV data sets for parameterization
6. Save the output JMX file to the `output` folder
7. Save any CSV data files to the `sample_data` folder

## Success Criteria

- JMX file is valid and can be opened in JMeter GUI
- All HTTP samplers are properly configured
- Extractors and assertions are in place
- CSV parameterization is working correctly
- Thread group settings match the specification