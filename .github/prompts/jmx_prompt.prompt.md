---
mode: agent
---

# JMeter Test Generation Specification

## Test Configuration

**Test Name:** Audit Service API Test
**Base URL:** https://apim-uat.digiphotoglobal.cn

## Load Configuration

- **Number of Threads (Users):** 1
- **Ramp-Up Time (seconds):** 10
- **Loop Count:** -1

## Test Requests

### Request 1: Upload Metadata Audit

- **Method:** POST
- **Path:** /AuditService/audit/?limit=10&offset=0
- **Headers:**
  - `Ocp-Apim-Subscription-Key: b8ba05d43f284641a9dc946f7599f7ae`
  - `Authorization: Bearer 1758972903_iCuhE5ZKb1KJj8cx_mttNFJaW2yP5bqKHTORulXPLW8_dbe41c51bbd05450`
  - `Content-Type: application/json`
- **Body:**
```json
{
    "request_id": "f6394d53-01ac-4c3b-af4d-dec7dedeb4b9",
    "api": "upload_metadata",
    "source_system": "imix",
    "status": "SUCCESS",
    "message": "Metadata upload successful",
    "request_content": {
        "site": "demo_site",
        "venue": "demo_venue",
        "country": "US",
        "blob_url": "https://uanosadimix01.blob.core.windows.net/media/3a1dd623-ca4b-4652-b243-7b1b12302a06.jpg",
        "location": "demo_location",
        "imix_media_id": "imix_media_123",
        "media_timestamp": "2025-09-27 14:39:45"
    },
    "response_content": {
        "success": true,
        "request_id": "5e0c8812-bc38-4b10-afc3-1a0839b109ba",
        "faces_stored": 1
    },
    "request_duration_ms": 709,
    "model_used": "paravision",
    "model_call_durations_ms": [248],
    "model_call_duration_avg_ms": 248
}
```
- **Response Extractors:**
  - Variable: `C_Result`
    - Regex: `(.*?)`
    - Default: `Null`
  - Variable: `C_JsonResult`
    - JSON Path: `$.result`
    - Default: `Null`
- **Assertions:**
  - Type: responseCode
    - Expected: `200`

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