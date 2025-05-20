// Simple login test
const axios = require('axios');
const qs = require('querystring');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3000/auth/login',
      data: qs.stringify({
        emailOrUsername: 'admin@example.com',
        password: 'Admin123!'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      validateStatus: function(status) {
        return status < 500; // Accept all status codes less than 500
      }
    });

    console.log(`Status code: ${response.status}`);
    console.log(`Response headers:`, response.headers);
    
    if (response.headers['set-cookie']) {
      console.log('Cookies received ✅');
    } else {
      console.log('No cookies received ❌');
    }
    
    if (response.status === 302) {
      console.log(`Redirect location: ${response.headers.location}`);
    }
    
    console.log(`Response data: ${typeof response.data === 'string' ? response.data : JSON.stringify(response.data)}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
