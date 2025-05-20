const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3000';
let cookies = '';

async function login(emailOrUsername, password) {
  try {
    console.log(`Attempting to login as ${emailOrUsername}...`);
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      emailOrUsername,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept all 2xx and 3xx responses
      }
    });
    
    if (response.headers['set-cookie']) {
      cookies = response.headers['set-cookie'][0];
      console.log('Login successful! Session cookie obtained.');
      return true;
    }
    
    console.log('Login failed: No session cookie received');
    return false;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function getAdminDashboard() {
  try {
    console.log('Testing admin dashboard access...');
    const response = await axios.get(`${BASE_URL}/admin`, {
      headers: {
        Cookie: cookies
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log(`Admin dashboard access: ${response.status === 200 ? 'Success' : 'Failed'}`);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to access admin dashboard:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function getUsers() {
  try {
    console.log('Testing user management access...');
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: {
        Cookie: cookies
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log(`User management access: ${response.status === 200 ? 'Success' : 'Failed'}`);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to access user management:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function getPuzzles() {
  try {
    console.log('Testing puzzle management access...');
    const response = await axios.get(`${BASE_URL}/admin/puzzles`, {
      headers: {
        Cookie: cookies
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log(`Puzzle management access: ${response.status === 200 ? 'Success' : 'Failed'}`);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to access puzzle management:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function getImportPage() {
  try {
    console.log('Testing import puzzles page access...');
    const response = await axios.get(`${BASE_URL}/admin/import-puzzles`, {
      headers: {
        Cookie: cookies
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log(`Import puzzles page access: ${response.status === 200 ? 'Success' : 'Failed'}`);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to access import puzzles page:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function getPuzzleTemplate() {
  try {
    console.log('Testing puzzle template download...');
    const response = await axios.get(`${BASE_URL}/admin/puzzle-template`, {
      headers: {
        Cookie: cookies
      },
      responseType: 'stream',
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    if (response.status === 200) {
      console.log('Puzzle template download: Success');
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      // Save the template to a file
      const templatePath = path.join(tempDir, 'test-template.xlsx');
      const writer = fs.createWriteStream(templatePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Template saved to ${templatePath}`);
          resolve(true);
        });
        writer.on('error', (err) => {
          console.error('Error saving template:', err);
          reject(err);
        });
      });
    } else {
      console.log('Puzzle template download: Failed');
      return false;
    }
  } catch (error) {
    console.error('Failed to download puzzle template:', error.response ? error.response.data : error.message);
    return false;
  }
}

async function runTests() {
  console.log('==========================================');
  console.log('  ADMIN FEATURES TEST SUITE');
  console.log('==========================================');
  
  // Test 1: Login as admin
  const loginSuccess = await login('admin', 'admin123');
  if (!loginSuccess) {
    console.error('Admin login failed, cannot continue with tests.');
    return;
  }
  
  // Test 2: Access admin dashboard
  const dashboardSuccess = await getAdminDashboard();
  
  // Test 3: Access user management
  const usersSuccess = await getUsers();
  
  // Test 4: Access puzzle management
  const puzzlesSuccess = await getPuzzles();
  
  // Test 5: Access import puzzles page
  const importSuccess = await getImportPage();
  
  // Test 6: Download puzzle template
  const templateSuccess = await getPuzzleTemplate();
  
  // Summary
  console.log('\n==========================================');
  console.log('  TEST RESULTS SUMMARY');
  console.log('==========================================');
  console.log(`Admin Login: ${loginSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin Dashboard: ${dashboardSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Management: ${usersSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Puzzle Management: ${puzzlesSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Import Page: ${importSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Template Download: ${templateSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallSuccess = loginSuccess && dashboardSuccess && usersSuccess && 
                         puzzlesSuccess && importSuccess && templateSuccess;
  
  console.log(`\nOverall Test Result: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
