const http = require('http');

console.log('Sending test registration request...');

// Form data to be sent in the request body
const formData = 'username=testuser123&email=testuser123@example.com&password=password123';

// Request options
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/register',
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
      console.log('Registration successful! Redirected to:', res.headers.location);
    } else if (res.statusCode === 500) {
      console.log('Server error occurred.');
    } else {
      console.log('Registration failed with status code:', res.statusCode);
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
