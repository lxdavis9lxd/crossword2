const http = require('http');

console.log('Sending test login request with invalid credentials...');

// Form data to be sent in the request body (wrong password)
const formData = 'email=testuser123@example.com&password=wrongpassword';

// Request options
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': formData.length
  }
};

// Create a request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  // Collect response data
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  // When the response is complete
  res.on('end', () => {
    console.log('RESPONSE BODY:', responseData);
    if (res.statusCode === 302) {
      console.log('Login successful! Redirected to:', res.headers.location);
    } else if (res.statusCode === 500) {
      console.log('Server error occurred.');
    } else if (res.statusCode === 400) {
      console.log('Login failed: Invalid credentials');
    } else {
      console.log('Login failed with status code:', res.statusCode);
    }
  });
});

// Handle request errors
req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write form data to request body
req.write(formData);
req.end();

console.log('Request sent, waiting for response...');
