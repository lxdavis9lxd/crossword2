const http = require('http');
const assert = require('assert');

console.log('Starting tests for crossword application...');

// Test server connection
function testServerConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, 200);
          console.log('✅ Server connection test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Server connection test failed:', error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Server connection test failed:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Test auth routes
function testAuthRoutes() {
  return new Promise((resolve, reject) => {
    const routes = ['/auth/login', '/auth/register'];
    let passedTests = 0;

    for (const route of routes) {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: route,
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            assert.strictEqual(res.statusCode, 200);
            console.log(`✅ Route test for ${route} passed`);
            passedTests++;
            if (passedTests === routes.length) {
              resolve(true);
            }
          } catch (error) {
            console.error(`❌ Route test for ${route} failed:`, error.message);
            if (passedTests === routes.length) {
              resolve(false);
            }
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ Route test for ${route} failed:`, error.message);
        if (passedTests === routes.length) {
          resolve(false);
        }
      });

      req.end();
    }
  });
}

// Run tests 
async function runTests() {
  console.log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    await testAuthRoutes();
  } else {
    console.error('Cannot test routes because server is not running');
  }
  
  console.log('Test execution completed');
}

runTests();
