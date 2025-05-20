// Simple login check
const axios = require('axios');

async function checkAccess() {
  try {
    console.log('Trying to access the admin dashboard...');
    const response = await axios.get('http://localhost:3000/admin');
    console.log(`Status: ${response.status}`);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      if (error.response.status === 403) {
        console.log('Access denied - authentication is working correctly');
      }
    }
  }
}

checkAccess();
