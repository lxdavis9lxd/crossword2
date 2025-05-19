// Test user setup script
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'progresstest2',
  email: 'progresstest2@example.com',
  password: 'testpassword123'
};

async function setupTestUser() {
  console.log('Setting up test user...');
  
  try {
    // Try direct user registration first
    console.log('Attempting registration...');
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, 
        `username=${TEST_USER.username}&email=${TEST_USER.email}&password=${TEST_USER.password}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          maxRedirects: 0,
          validateStatus: (status) => true // Accept any status to inspect
        });
      
      console.log('Registration response status:', registerResponse.status);
      console.log('Registration response headers:', registerResponse.headers);
      
      if (registerResponse.status === 302) {
        console.log('Registration successful, redirected to:', registerResponse.headers.location);
      } else if (registerResponse.status >= 400) {
        console.log('Registration failed with status:', registerResponse.status);
        console.log('Response data:', registerResponse.data);
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
      }
    }
    
    // Now try to log in
    console.log('\nAttempting login...');
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, 
        `email=${TEST_USER.email}&password=${TEST_USER.password}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          maxRedirects: 0,
          validateStatus: (status) => true // Accept any status to inspect
        });
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login response headers:', loginResponse.headers);
      
      if (loginResponse.status === 302) {
        console.log('Login successful, redirected to:', loginResponse.headers.location);
      } else if (loginResponse.status >= 400) {
        console.log('Login failed with status:', loginResponse.status);
        console.log('Response data:', loginResponse.data);
      }
    } catch (error) {
      console.error('Login error:', error.message);
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Test user setup failed:', error.message);
  }
}

// Run the test
setupTestUser().catch(console.error);
