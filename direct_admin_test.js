const axios = require('axios');
const db = require('./models');
const { User } = db;
const bcrypt = require('bcrypt');

const BASE_URL = 'http://localhost:3000';

// Helper functions
async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    const admin = await User.findOne({ where: { username: 'admin' } });
    
    if (admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin password reset to admin123');
      return true;
    } else {
      console.log('Admin user not found');
      return false;
    }
  } catch (error) {
    console.error('Error resetting admin password:', error.message);
    return false;
  }
}

async function testServerConnection() {
  try {
    console.log('Testing server connection...');
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    console.log(`Server connection successful: Status ${response.status}`);
    return true;
  } catch (error) {
    console.error('Server connection failed:', error.message);
    return false;
  }
}

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      emailOrUsername: 'admin',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    console.log(`Login response status: ${response.status}`);
    
    if (response.headers['set-cookie']) {
      console.log('Session cookie received');
      return response.headers['set-cookie'][0];
    } else {
      console.log('No session cookie received');
      console.log('Response data:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Login request failed:', error.message);
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
      console.log('Response data:', error.response.data);
    }
    return null;
  }
}

async function testAdminAccess(cookie) {
  if (!cookie) {
    console.log('No cookie provided, skipping admin access test');
    return false;
  }
  
  try {
    console.log('Testing admin dashboard access...');
    const response = await axios.get(`${BASE_URL}/admin`, {
      headers: { Cookie: cookie },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    console.log(`Admin dashboard access: Status ${response.status}`);
    return true;
  } catch (error) {
    console.error('Admin dashboard access failed:', error.message);
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
      console.log('Response data:', error.response.data);
    }
    return false;
  }
}

// Main function
async function runTests() {
  console.log('=======================================');
  console.log('ADMIN FEATURE TEST - COMPREHENSIVE');
  console.log('=======================================');
  
  // Step 1: Reset admin password
  const passwordReset = await resetAdminPassword();
  if (!passwordReset) {
    console.log('Unable to reset admin password. Continuing anyway...');
  }
  
  // Step 2: Check server connection
  const serverRunning = await testServerConnection();
  if (!serverRunning) {
    console.error('Server is not running. Please start the server first.');
    process.exit(1);
  }
  
  // Step 3: Test admin login
  const cookie = await testAdminLogin();
  
  // Step 4: Test admin dashboard access
  if (cookie) {
    const adminAccessSuccessful = await testAdminAccess(cookie);
    console.log(`\nAdmin Access Test: ${adminAccessSuccessful ? '✅ SUCCESS' : '❌ FAILED'}`);
  } else {
    console.log('\nAdmin Access Test: ❌ SKIPPED (No session cookie)');
  }
  
  console.log('\n=======================================');
}

// Run the tests
runTests()
  .then(() => {
    console.log('Tests completed.');
    db.sequelize.close().then(() => {
      console.log('Database connection closed.');
      process.exit(0);
    });
  })
  .catch(error => {
    console.error('Unhandled error during testing:', error);
    db.sequelize.close().then(() => {
      process.exit(1);
    });
  });
