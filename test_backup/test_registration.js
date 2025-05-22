// Script to test user registration
const axios = require('axios');

// Test user data
const testUsers = [
  {
    username: 'testuser1',
    email: 'testuser1@example.com',
    password: 'password123'
  },
  {
    username: 'testuser2',
    email: 'testuser2@example.com',
    password: 'securepass'
  }
];

// Set proper Content-Type for form submission
const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

// Function to convert object to URL encoded form data
function encodeFormData(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

// Function to register users
async function testRegistration() {
  try {
    console.log('Starting registration tests...');
    
    // Test registration for each user
    for (const user of testUsers) {
      try {
        console.log(`Attempting to register user: ${user.username}`);
        const encodedData = encodeFormData(user);
        const response = await axios.post('http://localhost:3000/auth/register', encodedData, config);
        console.log(`User ${user.username} registered successfully!`);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
      } catch (error) {
        if (error.response) {
          console.error(`Registration failed for ${user.username}:`, error.response.data);
          console.error('Status:', error.response.status);
          console.error('Headers:', JSON.stringify(error.response.headers));
        } else if (error.request) {
          console.error(`No response received for ${user.username}:`, error.request);
        } else {
          console.error(`Request error for ${user.username}:`, error.message);
        }
        console.error('Error config:', JSON.stringify(error.config));
      }
    }
    
    console.log('\nTest completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRegistration();

// Run the test
testRegistration();
