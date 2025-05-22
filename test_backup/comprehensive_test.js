const http = require('http');
const assert = require('assert');
const querystring = require('querystring');
const { Sequelize } = require('sequelize');

console.log('Starting comprehensive tests for crossword application...');

// Global variables to store test data
let testUserEmail = `test_${Date.now()}@example.com`;
let testUsername = `testuser_${Date.now()}`;
let testPassword = 'TestPassword123';
let sessionCookie = null;

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

// Test form submission - Registration
function testRegistration() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      username: testUsername,
      email: testUserEmail,
      password: testPassword
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Should redirect to login page after successful registration
          assert.strictEqual(res.statusCode, 302);
          assert.strictEqual(res.headers.location, '/auth/login');
          console.log('✅ Registration form submission test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Registration form submission test failed:', error.message);
          console.error('Status code:', res.statusCode);
          console.error('Response data:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Registration form submission test failed:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test form submission - Login
function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      email: testUserEmail,
      password: testPassword
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      // Store session cookie for later tests
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Should redirect to dashboard after successful login
          assert.strictEqual(res.statusCode, 302);
          assert.strictEqual(res.headers.location, '/game/dashboard');
          assert.ok(sessionCookie, 'Session cookie should be set');
          console.log('✅ Login form submission test passed');
          console.log('✅ Session creation test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Login form submission test failed:', error.message);
          console.error('Status code:', res.statusCode);
          console.error('Response data:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Login form submission test failed:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test session management - Access protected route with session
function testSessionProtection() {
  return new Promise((resolve, reject) => {
    if (!sessionCookie) {
      console.error('❌ Session protection test skipped: No session cookie available');
      resolve(false);
      return;
    }

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/api/session-test',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Should return 200 for successful authentication via API
          assert.strictEqual(res.statusCode, 200);
          
          // Parse response data
          const responseData = JSON.parse(data);
          assert.strictEqual(responseData.success, true);
          
          console.log('✅ Session protection test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Session protection test failed:', error.message);
          console.error('Status code:', res.statusCode);
          if (data) {
            try {
              const responseData = JSON.parse(data);
              console.error('Response data:', responseData);
            } catch (e) {
              console.error('Response data:', data);
            }
          }
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Session protection test failed:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Test database operations 
async function testDatabaseOperations() {
  try {
    // Connect to the database directly
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: 'database.sqlite',
      logging: false
    });

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection test passed');

    // Query the user we just created using raw SQL
    const users = await sequelize.query(
      `SELECT * FROM Users WHERE email = '${testUserEmail}'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Verify the user exists in the database
    if (users && users.length > 0) {
      console.log('✅ Database user creation test passed');
      console.log(`Found user: ${users[0].username} (${users[0].email})`);
      return true;
    } else {
      console.log('❌ Database user creation test failed: User not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message);
    return false;
  }
}

// Run tests 
async function runTests() {
  console.log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    console.log('\n--- Testing Routes ---');
    await testAuthRoutes();
    
    console.log('\n--- Testing Form Submissions ---');
    const registrationSuccess = await testRegistration();
    
    if (registrationSuccess) {
      await testLogin();
      
      console.log('\n--- Testing Session Management ---');
      await testSessionProtection();
      
      console.log('\n--- Testing Database Operations ---');
      await testDatabaseOperations();
    }
  } else {
    console.error('Cannot test routes because server is not running');
  }
  
  console.log('\nTest execution completed');
}

runTests();
