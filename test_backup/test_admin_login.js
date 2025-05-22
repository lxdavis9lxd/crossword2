const axios = require('axios');
const qs = require('querystring');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Initialize axios with cookie jar support
const client = wrapper(axios.create({ 
  jar: new tough.CookieJar() 
}));
const cookieJar = client.defaults.jar;

// Base URL for our application
const baseUrl = 'http://localhost:3000';

async function testAdminLogin() {
  console.log('Starting admin login test...');
  
  try {
    // Step 1: Login as admin
    console.log('Attempting to login as admin...');
    const loginResponse = await client.post(
      `${baseUrl}/auth/login`,
      qs.stringify({
        emailOrUsername: 'admin',
        password: 'admin123'
      }),
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      }
    ).catch(err => {
      if (err.response) {
        return err.response;
      }
      throw err;
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    const cookies = await cookieJar.getCookies(baseUrl);
    console.log('Cookies after login:', cookies);
    
    // Step 2: Try to access admin dashboard
    console.log('\nAttempting to access admin dashboard...');
    const adminResponse = await client.get(
      `${baseUrl}/admin`,
      {
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: status => true // Accept any status code
      }
    ).catch(err => {
      if (err.response) {
        return err.response;
      }
      throw err;
    });

    console.log('Admin dashboard response status:', adminResponse.status);
    if (adminResponse.status === 200) {
      console.log('Successfully accessed admin dashboard!');
    } else {
      console.log('Failed to access admin dashboard.');
      // Check the content of the response to see error message
      if (adminResponse.data && typeof adminResponse.data === 'string') {
        if (adminResponse.data.includes('Access Denied')) {
          console.log('Error: Access Denied - User session does not have admin role.');
        } else {
          console.log('Response content excerpt:', adminResponse.data.substring(0, 200) + '...');
        }
      }
    }
    
  } catch (error) {
    console.error('Error during admin login test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAdminLogin();
