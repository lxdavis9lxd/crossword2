const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123!';
let sessionCookie = null;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a log file
const logFile = path.join(logsDir, `admin_test_${Date.now()}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Logging functions
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

function logError(message, error) {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] ERROR: ${message}`;
  
  if (error) {
    formattedMessage += `\n  ${error.message}`;
    if (error.response) {
      formattedMessage += `\n  Status: ${error.response.status}`;
      formattedMessage += `\n  Data: ${JSON.stringify(error.response.data)}`;
    }
    formattedMessage += `\n  Stack: ${error.stack}`;
  }
  
  console.error(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

// Helper functions
async function checkServerStatus() {
  log('Checking server status...');
  try {
    const response = await axios.get(BASE_URL);
    log(`Server is running. Status: ${response.status}`);
    return true;
  } catch (error) {
    logError('Server connection failed', error);
    return false;
  }
}

async function loginAsAdmin() {
  log(`Attempting to login as ${ADMIN_USERNAME}...`);
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/v1/auth/login`,
      data: {
        emailOrUsername: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    log(`Login response status: ${response.status}`);
    
    if (response.headers['set-cookie']) {
      sessionCookie = response.headers['set-cookie'][0];
      log('Login successful! Session cookie obtained');
      return true;
    } else {
      log('No session cookie received');
      return false;
    }
  } catch (error) {
    logError('Login request failed', error);
    return false;
  }
}

async function testAdminRoute(route, description) {
  if (!sessionCookie) {
    log(`Skipping ${description} test - No session cookie`);
    return false;
  }
  
  log(`Testing ${description}...`);
  try {
    const response = await axios({
      method: 'get',
      url: `${BASE_URL}${route}`,
      headers: {
        Cookie: sessionCookie
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    log(`${description} test - Status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    logError(`${description} test failed`, error);
    return false;
  }
}

// Main test function
async function runTests() {
  log('=========================================');
  log('  COMPREHENSIVE ADMIN FEATURES TEST');
  log('=========================================');
  
  // Test 1: Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    log('Cannot continue tests - Server is not running');
    return;
  }
  
  // Test 2: Admin login
  const loginSuccessful = await loginAsAdmin();
  if (!loginSuccessful) {
    log('Cannot continue tests - Login failed');
    return;
  }
  
  // Test 3: Admin dashboard
  const dashboardSuccessful = await testAdminRoute('/v1/admin', 'Admin dashboard');
  
  // Test 4: User management
  const userManagementSuccessful = await testAdminRoute('/v1/admin/users', 'User management');
  
  // Test 5: Puzzle management
  const puzzleManagementSuccessful = await testAdminRoute('/v1/admin/puzzles', 'Puzzle management');
  
  // Test 6: Import puzzles page
  const importPageSuccessful = await testAdminRoute('/v1/admin/import-puzzles', 'Import puzzles page');
  
  // Test 7: Try downloading puzzle template
  log('Testing puzzle template download...');
  let templateSuccessful = false;
  try {
    const response = await axios({
      method: 'get',
      url: `${BASE_URL}/v1/admin/puzzle-template`,
      headers: {
        Cookie: sessionCookie
      },
      responseType: 'stream',
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    if (response.status === 200) {
      log('Puzzle template download successful');
      templateSuccessful = true;
    } else {
      log(`Puzzle template download failed. Status: ${response.status}`);
    }
  } catch (error) {
    logError('Puzzle template download failed', error);
  }
  
  // Test 8: Check for admin UI elements on normal pages
  log('\nTesting admin UI elements on user-facing pages...');
  const uiTests = [
    { route: '/v1/game/dashboard', name: 'Dashboard Page' }
    // The other tests require specific user data or puzzle data that might not exist
    // { route: '/v1/achievements', name: 'Achievements Page' },
    // { route: '/v1/game/1', name: 'Game Page' }
  ];
  
  const uiTestResults = {};
  
  for (const test of uiTests) {
    log(`Checking admin UI elements on ${test.name}...`);
    try {
      const response = await axios({
        method: 'get',
        url: `${BASE_URL}${test.route}`,
        headers: {
          Cookie: sessionCookie
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });
      
      // Check if admin button is present in the HTML response
      const hasAdminButton = response.data.includes('admin-button') && 
                            response.data.includes('Admin Dashboard');
      
      uiTestResults[test.name] = hasAdminButton;
      log(`${test.name} admin UI test: ${hasAdminButton ? '✅ PASS' : '❌ FAIL'}`);
    } catch (error) {
      logError(`Admin UI test for ${test.name} failed`, error);
      uiTestResults[test.name] = false;
    }
  }
  
  // Print results
  log('\n=========================================');
  log('  TEST RESULTS');
  log('=========================================');
  log(`Server Status: ${serverRunning ? '✅ PASS' : '❌ FAIL'}`);
  log(`Admin Login: ${loginSuccessful ? '✅ PASS' : '❌ FAIL'}`);
  log(`Admin Dashboard: ${dashboardSuccessful ? '✅ PASS' : '❌ FAIL'}`);
  log(`User Management: ${userManagementSuccessful ? '✅ PASS' : '❌ FAIL'}`);
  log(`Puzzle Management: ${puzzleManagementSuccessful ? '✅ PASS' : '❌ FAIL'}`);
  log(`Import Page: ${importPageSuccessful ? '✅ PASS' : '❌ FAIL'}`);
  log(`Template Download: ${templateSuccessful ? '✅ PASS' : '❌ FAIL'}`);
  
  log('\nAdmin UI Elements:');
  Object.keys(uiTestResults).forEach(page => {
    log(`${page}: ${uiTestResults[page] ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const overallSuccess = loginSuccessful && dashboardSuccessful && 
                         userManagementSuccessful && puzzleManagementSuccessful && 
                         importPageSuccessful && templateSuccessful;
  
  log(`\nOverall Test Result: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
  log(`\nDetailed logs available at: ${logFile}`);
}

// Run the tests
runTests()
  .then(() => {
    log('Tests completed');
    logStream.end();
  })
  .catch(error => {
    logError('Unhandled error during tests', error);
    logStream.end();
  });
