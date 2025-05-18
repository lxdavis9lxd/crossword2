const http = require('http');
const assert = require('assert');
const querystring = require('querystring');

console.log('Starting game functionality tests...');

// Global variables
let sessionCookie = null;
let testUserEmail = `test_${Date.now()}@example.com`;
let testUsername = `testuser_${Date.now()}`;
let testPassword = 'TestPassword123';

// Register a test user and login
async function setupTestUser() {
  try {
    // Register user
    await new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        username: testUsername,
        email: testUserEmail,
        password: testPassword
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 302) {
            console.log('✅ User registration successful');
            resolve(true);
          } else {
            console.error('❌ User registration failed:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ User registration error:', error.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });

    // Login user
    return await new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        email: testUserEmail,
        password: testPassword
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        // Store session cookie for later tests
        if (res.headers['set-cookie']) {
          sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 302 && sessionCookie) {
            console.log('✅ User login successful');
            resolve(true);
          } else {
            console.error('❌ User login failed:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ User login error:', error.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error in setupTestUser:', error);
    return false;
  }
}

// Test access to game dashboard
async function testGameDashboard() {
  return new Promise((resolve, reject) => {
    if (!sessionCookie) {
      console.error('❌ No session cookie available for testing dashboard');
      resolve(false);
      return;
    }

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/dashboard',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Access to game dashboard successful');
          resolve(true);
        } else {
          console.error('❌ Access to game dashboard failed:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Game dashboard access error:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Test starting an easy game
async function testStartEasyGame() {
  return new Promise((resolve, reject) => {
    if (!sessionCookie) {
      console.error('❌ No session cookie available for testing game start');
      resolve(false);
      return;
    }

    const postData = querystring.stringify({
      level: 'easy'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': sessionCookie
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Check if the response contains the expected game content
          const hasGrid = data.includes('crossword-grid');
          const hasClues = data.includes('clues-container');
          
          if (hasGrid && hasClues) {
            console.log('✅ Starting easy game successful');
            console.log('✅ Crossword grid and clues are present');
            resolve(true);
          } else {
            console.error('❌ Game content not found in response');
            resolve(false);
          }
        } else {
          console.error('❌ Starting easy game failed. Status:', res.statusCode);
          console.error('Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Game start error:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test fetching puzzles by level
async function testFetchPuzzlesByLevel() {
  return new Promise((resolve, reject) => {
    if (!sessionCookie) {
      console.error('❌ No session cookie available for testing puzzle fetch');
      resolve(false);
      return;
    }

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/puzzles/easy',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const puzzles = JSON.parse(data);
            
            if (Array.isArray(puzzles) && puzzles.length > 0) {
              console.log(`✅ Fetched ${puzzles.length} easy puzzles successfully`);
              resolve(true);
            } else {
              console.error('❌ No puzzles found in the response');
              resolve(false);
            }
          } catch (error) {
            console.error('❌ Error parsing puzzles response:', error.message);
            resolve(false);
          }
        } else {
          console.error('❌ Fetching puzzles failed:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Puzzle fetch error:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Waiting for server to be available...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n--- Setting up test user ---');
  const userSetup = await setupTestUser();
  
  if (userSetup) {
    console.log('\n--- Testing Game Dashboard ---');
    await testGameDashboard();
    
    console.log('\n--- Testing Easy Game Start ---');
    await testStartEasyGame();
    
    console.log('\n--- Testing Puzzle Fetching ---');
    await testFetchPuzzlesByLevel();
  } else {
    console.error('Cannot proceed with tests due to user setup failure');
  }
  
  console.log('\nGame functionality test execution completed');
}

// Start tests
runTests();
