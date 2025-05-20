const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function verifyAdminLogin() {
  try {
    console.log('Attempting to login as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      emailOrUsername: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login response status:', response.status);
    console.log('Login response headers:', JSON.stringify(response.headers, null, 2));
    
    if (response.headers['set-cookie']) {
      console.log('Login successful! Session cookie obtained.');
      const cookies = response.headers['set-cookie'][0];
      
      // Test admin access
      console.log('\nTesting admin dashboard access...');
      const adminResponse = await axios.get(`${BASE_URL}/admin`, {
        headers: {
          Cookie: cookies
        }
      });
      
      console.log('Admin dashboard response status:', adminResponse.status);
      console.log('Admin access successful!');
      
    } else {
      console.log('Login failed: No session cookie received');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

verifyAdminLogin();
