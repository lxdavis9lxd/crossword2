const http = require('http');

console.log('Debugging session persistence issues...');

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

// Step 1: First login to get a session cookie
async function testSessionPersistence() {
  try {
    console.log('Step 1: Logging in to get session cookie');
    const loginFormData = 'email=testuser123@example.com&password=password123';
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': loginFormData.length
      }
    };
    
    const { res: loginRes, data: loginData } = await makeRequest(loginOptions, loginFormData);
    console.log(`LOGIN STATUS: ${loginRes.statusCode}`);
    
    // Check if login was successful
    if (loginRes.statusCode !== 302) {
      console.error(`Login failed with status code: ${loginRes.statusCode}`);
      console.error('Response data:', loginData);
      return;
    }
    
    // Get the session cookie
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies || cookies.length === 0) {
      console.error('No session cookie received!');
      console.error('Response headers:', JSON.stringify(loginRes.headers));
      return;
    }
    
    console.log('Session cookie received:', cookies[0]);
    
    // Step 2: Use the session cookie to access the dashboard
    console.log('\nStep 2: Attempting to access dashboard with session cookie');
    
    const dashboardOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/dashboard',
      method: 'GET',
      headers: {
        'Cookie': cookies[0]
      }
    };
    
    // Wait a bit to ensure session is stored
    console.log('Waiting 1 second to ensure session is stored...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { res: dashboardRes, data: dashboardData } = await makeRequest(dashboardOptions);
    
    console.log(`DASHBOARD STATUS: ${dashboardRes.statusCode}`);
    
    // Check if we successfully accessed the dashboard
    if (dashboardRes.statusCode === 200) {
      if (dashboardData.includes('Crossword Game Dashboard')) {
        console.log('✅ Session test PASSED: Successfully accessed dashboard with session cookie');
      } else {
        console.log('❌ Session test FAILED: Got 200 status but page content does not match dashboard');
        console.log('First 200 characters of response:', dashboardData.substring(0, 200));
      }
    } else if (dashboardRes.statusCode === 302 && dashboardRes.headers.location === '/auth/login') {
      console.log('❌ Session test FAILED: Redirected to login page - session not persistent');
      console.log('Headers:', JSON.stringify(dashboardRes.headers));
    } else {
      console.log('❓ Session test INCONCLUSIVE: Unexpected response');
      console.log(`Status code: ${dashboardRes.statusCode}`);
      console.log('Headers:', JSON.stringify(dashboardRes.headers));
      console.log('First 200 characters of response:', dashboardData.substring(0, 200));
    }
    
    // Step 3: Check session information in storage
    console.log('\nStep 3: Session debugging information');
    // This step would require server-side logging to see the session data
    console.log('- Session cookie value:', cookies[0].split(';')[0]);
    console.log('- Check server logs for session data storage details');
    
  } catch (error) {
    console.error('Error during session test:', error);
  }
}

// Run the test
testSessionPersistence();
