const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

async function testAdminSession() {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));
  
  try {
    console.log('Testing admin login and session...');
    
    // Login
    const loginResponse = await client.post(
      'http://localhost:3000/auth/login',
      new URLSearchParams({
        emailOrUsername: 'admin',
        password: 'admin123'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: () => true
      }
    );
    
    console.log('Login response status:', loginResponse.status);
    
    // Check session
    const sessionResponse = await client.get(
      'http://localhost:3000/debug-session',
      {
        validateStatus: () => true
      }
    );
    
    console.log('Session response:', sessionResponse.data);
    
    // Try admin page
    const adminResponse = await client.get(
      'http://localhost:3000/admin',
      {
        validateStatus: () => true
      }
    );
    
    console.log('Admin response status:', adminResponse.status);
    if (adminResponse.status === 200) {
      console.log('Successfully accessed admin dashboard!');
    } else if (adminResponse.status === 403) {
      console.log('Access denied to admin dashboard.');
    } else {
      console.log('Unexpected status from admin dashboard:', adminResponse.status);
    }
    
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testAdminSession();
