#!/usr/bin/env node

/**
 * Test script to verify both transport modes work correctly
 */

import http from 'http';
import { spawn } from 'child_process';

console.log('🧪 Testing JMeter MCP Server Transport Modes...\n');

async function testHttpTransport() {
  console.log('📡 Testing HTTP Transport Mode...');
  
  return new Promise((resolve, reject) => {
    // Start server in HTTP mode
    const server = spawn('node', ['src/index.js', '--http', '--port', '3001'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`   ${output.trim()}`);
      
      if (output.includes('Server listening on port 3001') && !serverReady) {
        serverReady = true;
        
        // Test health endpoint
        setTimeout(() => {
          const healthReq = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/health',
            method: 'GET'
          }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              try {
                const health = JSON.parse(data);
                console.log(`   ✅ Health Check: ${health.status}`);
                console.log(`   📊 Server: ${health.server} v${health.version}`);
                console.log(`   🚀 Transport: ${health.transport}`);
                console.log(`   🛠️  Tools: ${health.tools}`);
                
                server.kill('SIGTERM');
                resolve(true);
              } catch (error) {
                console.log(`   ❌ Health Check Failed: ${error.message}`);
                server.kill('SIGTERM');
                reject(error);
              }
            });
          });
          
          healthReq.on('error', (error) => {
            console.log(`   ❌ Connection Failed: ${error.message}`);
            server.kill('SIGTERM');
            reject(error);
          });
          
          healthReq.end();
        }, 2000);
      }
    });

    server.on('error', (error) => {
      console.log(`   ❌ Server Error: ${error.message}`);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverReady) {
        console.log('   ⏰ Timeout waiting for server to start');
        server.kill('SIGTERM');
        reject(new Error('Server startup timeout'));
      }
    }, 10000);
  });
}

async function testStdioTransport() {
  console.log('\n💻 Testing Stdio Transport Mode...');
  
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['src/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdioReady = false;

    server.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`   ${output.trim()}`);
      
      if (output.includes('JMeter MCP Server successfully started') && !stdioReady) {
        stdioReady = true;
        
        // Send MCP tools/list request
        const mcpRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list'
        };
        
        server.stdin.write(JSON.stringify(mcpRequest) + '\n');
      }
    });

    server.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        try {
          const response = JSON.parse(output);
          if (response.result && response.result.tools) {
            console.log(`   ✅ MCP Response: ${response.result.tools.length} tools available`);
            console.log(`   🛠️  Tools: ${response.result.tools.map(t => t.name).join(', ')}`);
            server.kill('SIGTERM');
            resolve(true);
          }
        } catch (error) {
          // Ignore JSON parse errors for other output
        }
      }
    });

    server.on('error', (error) => {
      console.log(`   ❌ Server Error: ${error.message}`);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!stdioReady) {
        console.log('   ⏰ Timeout waiting for server to start');
        server.kill('SIGTERM');
        reject(new Error('Server startup timeout'));
      }
    }, 10000);
  });
}

async function runTests() {
  try {
    // Test HTTP Transport
    await testHttpTransport();
    console.log('   🎉 HTTP Transport: PASSED\n');
    
    // Test Stdio Transport  
    await testStdioTransport();
    console.log('   🎉 Stdio Transport: PASSED\n');
    
    console.log('✅ All transport tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   📡 HTTP Transport: ✅ Working (Remote connections)');
    console.log('   💻 Stdio Transport: ✅ Working (Local MCP clients)');
    console.log('   🏥 Health Checks: ✅ Functional');
    console.log('   🛠️  MCP Tools: ✅ Available');
    console.log('\n🚀 Server is ready for both local and remote connections!');
    
  } catch (error) {
    console.error(`❌ Test Failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
