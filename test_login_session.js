const http = require('http');

console.log('Testing login session persistence...');

// Step 1: First login to get a session cookie
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

const loginReq = http.request(loginOptions, (loginRes) => {
  console.log(`LOGIN STATUS: ${loginRes.statusCode}`);
  
  // Get the session cookie
  const cookies = loginRes.headers['set-cookie'];
  if (!cookies || cookies.length === 0) {
    console.error('No session cookie received!');
    return;
  }
  
  console.log('Session cookie received.');
  
  // Step 2: Use the session cookie to access a protected route
  const dashboardOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/game/dashboard',
    method: 'GET',
    headers: {
      'Cookie': cookies[0]
    }
  };
  
  // Small delay to make sure session is fully established
  setTimeout(() => {
    console.log('Attempting to access protected dashboard route...');
    
    const dashboardReq = http.request(dashboardOptions, (dashboardRes) => {
      console.log(`DASHBOARD STATUS: ${dashboardRes.statusCode}`);
      
      let responseData = '';
      
      // Collect response data
      dashboardRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // When the response is complete
      dashboardRes.on('end', () => {
        // Check if we got HTML from the dashboard or a redirect
        if (dashboardRes.statusCode === 200 && responseData.includes('Crossword Game Dashboard')) {
          console.log('Session test PASSED: Successfully accessed dashboard with session cookie');
        } else if (dashboardRes.statusCode === 302 && dashboardRes.headers.location === '/auth/login') {
          console.log('Session test FAILED: Redirected to login page - session not persistent');
        } else {
          console.log('Session test INCONCLUSIVE: Unexpected response');
          console.log('Response preview:', responseData.substring(0, 100) + '...');
        }
      });
    });
    
    dashboardReq.on('error', (e) => {
      console.error(`Problem with dashboard request: ${e.message}`);
    });
    
    dashboardReq.end();
  }, 500);
});

// Handle login request errors
loginReq.on('error', (e) => {
  console.error(`Problem with login request: ${e.message}`);
});

// Write login form data to request body
loginReq.write(loginFormData);
loginReq.end();

console.log('Login request sent, waiting for response...');
