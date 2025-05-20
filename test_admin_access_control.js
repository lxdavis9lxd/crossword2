const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('./models');
const { User } = db;
const bcrypt = require('bcrypt');

// Configuration
const BASE_URL = 'http://localhost:3000';
let adminCookie = null;
let regularUserCookie = null;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a log file
const logFile = path.join(logsDir, `admin_access_control_${Date.now()}.log`);
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
async function setupTestUser() {
  log('Setting up a regular test user...');
  
  try {
    // Check if test user already exists
    let testUser = await User.findOne({ where: { username: 'testuser' } });
    
    if (testUser) {
      log('Test user already exists, resetting password...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser.password = hashedPassword;
      await testUser.save();
    } else {
      log('Creating new test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      });
    }
    
    log('Test user setup complete');
    return true;
  } catch (error) {
    logError('Failed to set up test user', error);
    return false;
  }
}

async function loginAsUser(username, password) {
  log(`Attempting to login as ${username}...`);
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/auth/login`,
      data: {
        emailOrUsername: username,
        password: password
      },
      headers: {
        'Content-Type': 'application/json'
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    log(`Login response status for ${username}: ${response.status}`);
    
    if (response.headers['set-cookie']) {
      const cookie = response.headers['set-cookie'][0];
      log(`Login successful for ${username}! Session cookie obtained`);
      return cookie;
    } else {
      log(`No session cookie received for ${username}`);
      return null;
    }
  } catch (error) {
    logError(`Login request failed for ${username}`, error);
    return null;
  }
}

async function testRouteAccess(route, description, cookie) {
  if (!cookie) {
    log(`Skipping ${description} test - No session cookie`);
    return { status: -1, success: false, reason: 'No cookie' };
  }
  
  log(`Testing ${description} with cookie...`);
  try {
    const response = await axios({
      method: 'get',
      url: `${BASE_URL}${route}`,
      headers: {
        Cookie: cookie
      },
      maxRedirects: 0,
      validateStatus: () => true // Accept all status codes to check for 403/401
    });
    
    log(`${description} test - Status: ${response.status}`);
    
    // Check if access was successful (200) or redirected to login (302)
    const accessGranted = response.status === 200;
    const accessDenied = response.status === 401 || response.status === 403;
    const redirected = response.status === 302;
    
    return {
      status: response.status,
      success: accessGranted,
      redirectLocation: redirected ? response.headers.location : null,
      reason: accessDenied ? 'Access denied' : 
              redirected ? 'Redirected' : 
              accessGranted ? 'Access granted' : 'Other error'
    };
  } catch (error) {
    logError(`${description} test failed`, error);
    return { status: -1, success: false, reason: 'Error' };
  }
}

// Main test function
async function runTests() {
  log('=========================================');
  log('  ADMIN ACCESS CONTROL TEST');
  log('=========================================');
  
  // Set up test user
  const testUserSetup = await setupTestUser();
  if (!testUserSetup) {
    log('Cannot continue tests - Failed to set up test user');
    return;
  }
  
  // Login as admin
  adminCookie = await loginAsUser('admin', 'admin123');
  if (!adminCookie) {
    log('Cannot continue tests - Failed to login as admin');
    return;
  }
  
  // Login as regular user
  regularUserCookie = await loginAsUser('testuser', 'password123');
  if (!regularUserCookie) {
    log('Cannot continue tests - Failed to login as regular user');
    return;
  }
  
  // Define admin routes to test
  const adminRoutes = [
    { route: '/admin', description: 'Admin dashboard' },
    { route: '/admin/users', description: 'User management' },
    { route: '/admin/puzzles', description: 'Puzzle management' },
    { route: '/admin/import-puzzles', description: 'Import puzzles page' }
  ];
  
  // Test admin access with admin cookie
  log('\n----- Testing admin routes with admin user -----');
  const adminResults = [];
  for (const routeInfo of adminRoutes) {
    const result = await testRouteAccess(routeInfo.route, routeInfo.description, adminCookie);
    adminResults.push({
      route: routeInfo.route,
      description: routeInfo.description,
      ...result
    });
  }
  
  // Test admin access with regular user cookie
  log('\n----- Testing admin routes with regular user -----');
  const regularUserResults = [];
  for (const routeInfo of adminRoutes) {
    const result = await testRouteAccess(routeInfo.route, routeInfo.description, regularUserCookie);
    regularUserResults.push({
      route: routeInfo.route,
      description: routeInfo.description,
      ...result
    });
  }
  
  // Print results
  log('\n=========================================');
  log('  TEST RESULTS');
  log('=========================================');
  
  log('\nAdmin User Access:');
  adminResults.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    log(`${icon} ${result.description}: ${result.status} - ${result.reason}`);
  });
  
  log('\nRegular User Access:');
  regularUserResults.forEach(result => {
    // For regular users, success is actually a FAILURE in access control
    // We expect them to be denied or redirected
    const expectedDenied = !result.success || result.status === 302;
    const icon = expectedDenied ? '✅' : '❌';
    log(`${icon} ${result.description}: ${result.status} - ${result.reason}`);
  });
  
  // Determine overall success
  const adminAccessSuccessful = adminResults.every(result => result.success);
  const regularUserDenied = regularUserResults.every(result => !result.success || result.status === 302);
  const overallSuccess = adminAccessSuccessful && regularUserDenied;
  
  log('\nSummary:');
  log(`Admin user can access admin pages: ${adminAccessSuccessful ? '✅ YES' : '❌ NO'}`);
  log(`Regular user blocked from admin pages: ${regularUserDenied ? '✅ YES' : '❌ NO'}`);
  log(`\nOverall Test Result: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
  log(`\nDetailed logs available at: ${logFile}`);
  
  return {
    adminAccessSuccessful,
    regularUserDenied,
    overallSuccess
  };
}

// Run the tests
runTests()
  .then(results => {
    log('Tests completed');
    
    // Close database connection
    db.sequelize.close().then(() => {
      console.log('Database connection closed');
      logStream.end();
    });
  })
  .catch(error => {
    logError('Unhandled error during tests', error);
    
    // Close database connection
    db.sequelize.close().then(() => {
      console.log('Database connection closed');
      logStream.end();
    });
  });
