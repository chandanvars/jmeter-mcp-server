# JMeter MCP Server Helper Script
# Use this script to interact with the JMeter MCP server from VS Code

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("generate", "template", "inventree")]
    [string]$Action,
    
    [string]$TestName = "API Load Test",
    [string]$BaseUrl = "https://api.example.com",
    [string]$TemplateType = "rest_api",
    [int]$Threads = 10,
    [int]$RampUp = 30,
    [int]$Loops = 5
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $scriptPath "src\index.js"

Write-Host "🚀 JMeter MCP Server Helper" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow

switch ($Action) {
    "generate" {
        Write-Host "Generating JMeter test plan..." -ForegroundColor Blue
        $request = @{
            jsonrpc = "2.0"
            id = 1
            method = "tools/call"
            params = @{
                name = "generate_jmeter_script"
                arguments = @{
                    testName = $TestName
                    baseUrl = $BaseUrl
                    requests = @(
                        @{
                            name = "Health Check"
                            method = "GET"
                            path = "/health"
                            assertions = @(
                                @{
                                    type = "responseCode"
                                    value = "200"
                                }
                            )
                        }
                    )
                    threadGroup = @{
                        numThreads = $Threads
                        rampUpTime = $RampUp
                        loops = $Loops
                    }
                }
            }
        } | ConvertTo-Json -Depth 10
        
        $request | node $serverPath
    }
    
    "template" {
        Write-Host "Fetching template: $TemplateType" -ForegroundColor Blue
        $request = @{
            jsonrpc = "2.0"
            id = 1
            method = "tools/call"
            params = @{
                name = "get_templates"
                arguments = @{
                    templateType = $TemplateType
                }
            }
        } | ConvertTo-Json -Depth 5
        
        $request | node $serverPath
    }
    
    "inventree" {
        Write-Host "Generating InvenTree test plan..." -ForegroundColor Blue
        $request = @{
            jsonrpc = "2.0"
            id = 1
            method = "tools/call"
            params = @{
                name = "generate_inventree_test"
                arguments = @{
                    numThreads = $Threads
                    rampUpTime = $RampUp
                    loops = $Loops
                }
            }
        } | ConvertTo-Json -Depth 5
        
        $request | node $serverPath
    }
}

Write-Host "✅ Operation completed!" -ForegroundColor Green
