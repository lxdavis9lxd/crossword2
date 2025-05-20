const axios = require('axios');

// Set the base URL for the API
const BASE_URL = 'http://localhost:3000';

// Function to test admin login
async function testAdminLogin() {
  console.log('Testing admin login...');
  
  try {
    // 1. First test if the server is running
    console.log('Step 1: Checking if server is running...');
    try {
      const serverResponse = await axios.get(BASE_URL);
      console.log(`Server is running. Status: ${serverResponse.status}`);
    } catch (error) {
      throw new Error(`Server not reachable: ${error.message}`);
    }
    
    // 2. Try to login
    console.log('Step 2: Attempting to login as admin...');
    const loginData = {
      emailOrUsername: 'admin',
      password: 'admin123'
    };
    
    console.log('Login data:', loginData);
    
    const loginResponse = await axios({
      method: 'post',
      url: `${BASE_URL}/auth/login`,
      data: loginData,
      headers: {
        'Content-Type': 'application/json'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all responses except server errors
      }
    });
    
    console.log(`Login response status code: ${loginResponse.status}`);
    console.log('Response headers:', loginResponse.headers);
    
    if (loginResponse.status >= 300 && loginResponse.status < 400) {
      console.log('Response contains redirect. This may be expected behavior.');
      console.log('Redirect location:', loginResponse.headers.location);
    }
    
    if (loginResponse.headers['set-cookie']) {
      console.log('Login successful! Session cookie received.');
      console.log('Cookie:', loginResponse.headers['set-cookie'][0]);
      return true;
    } else {
      console.log('Login response data:', loginResponse.data);
      console.log('No session cookie found. Login may have failed.');
      return false;
    }
  } catch (error) {
    console.error('Error during admin login test:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    return false;
  }
}

// Main function
async function main() {
  console.log('=== ADMIN LOGIN TEST ===');
  const loginSuccess = await testAdminLogin();
  console.log(`\nTest result: ${loginSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
}

// Run the test
main().catch(error => {
  console.error('Unhandled error:', error);
});
