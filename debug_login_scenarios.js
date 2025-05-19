const http = require('http');

// Function to make HTTP requests with promises
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ res, data });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Base request options
function getLoginOptions(formData) {
  return {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': formData.length
    }
  };
}

// Test different login scenarios
async function runLoginTests() {
  console.log('======= LOGIN SCENARIO TESTING =======\n');
  
  try {
    // Test 1: Successful login
    await testScenario(
      '1. Successful Login',
      'email=testuser123@example.com&password=password123',
      (result) => {
        const { res, data } = result;
        if (res.statusCode === 302 && res.headers.location === '/game/dashboard') {
          return { passed: true, message: 'Redirected to dashboard as expected' };
        } else {
          return { 
            passed: false, 
            message: `Expected 302 redirect to /game/dashboard, but got ${res.statusCode}` +
                     (res.headers.location ? ` redirect to ${res.headers.location}` : '')
          };
        }
      }
    );
    
    // Test 2: Invalid password
    await testScenario(
      '2. Invalid Password',
      'email=testuser123@example.com&password=wrongpassword', 
      (result) => {
        const { res, data } = result;
        if (res.statusCode === 400 && data.includes('Invalid email or password')) {
          return { passed: true, message: 'Rejected with 400 status as expected' };
        } else {
          return { 
            passed: false, 
            message: `Expected 400 with "Invalid email or password", but got ${res.statusCode} ${data.substring(0, 50)}...` 
          };
        }
      }
    );
    
    // Test 3: Non-existent user
    await testScenario(
      '3. Non-existent User',
      'email=nonexistent@example.com&password=password123',
      (result) => {
        const { res, data } = result;
        if (res.statusCode === 400 && data.includes('Invalid email or password')) {
          return { passed: true, message: 'Rejected with 400 status as expected' };
        } else {
          return { 
            passed: false, 
            message: `Expected 400 with "Invalid email or password", but got ${res.statusCode} ${data.substring(0, 50)}...`
          };
        }
      }
    );
    
    // Test 4: Missing fields
    await testScenario(
      '4. Missing Fields',
      'email=testuser123@example.com',
      (result) => {
        const { res, data } = result;
        if (res.statusCode === 400 && data.includes('All fields are required')) {
          return { passed: true, message: 'Rejected with 400 status as expected' };
        } else {
          return { 
            passed: false, 
            message: `Expected 400 with "All fields are required", but got ${res.statusCode} ${data.substring(0, 50)}...`
          };
        }
      }
    );
    
    console.log('\n======= ALL LOGIN TESTS COMPLETED =======');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Helper function to run a single test scenario
async function testScenario(testName, formData, validateFn) {
  console.log(`\n----- Testing ${testName} -----`);
  console.log(`Sending request with data: ${formData}`);
  
  try {
    const options = getLoginOptions(formData);
    const result = await makeRequest(options, formData);
    
    const { res, data } = result;
    console.log(`Response Status: ${res.statusCode}`);
    
    if (data.length < 200) {
      console.log(`Response Body: ${data}`);
    } else {
      console.log(`Response Body (truncated): ${data.substring(0, 200)}...`);
    }
    
    const validation = validateFn(result);
    
    if (validation.passed) {
      console.log(`✅ Test PASSED: ${validation.message}`);
    } else {
      console.log(`❌ Test FAILED: ${validation.message}`);
    }
    
    return validation.passed;
  } catch (error) {
    console.error(`Error in test "${testName}":`, error);
    return false;
  }
}

// Run all tests
runLoginTests();
