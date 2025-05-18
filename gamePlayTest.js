const http = require('http');
const assert = require('assert');
const querystring = require('querystring');

console.log('Starting Gameplay Testing...');

// Global variables
let sessionCookie = null;
let testUserEmail = `test_${Date.now()}@example.com`;
let testUsername = `testuser_${Date.now()}`;
let testPassword = 'TestPassword123';
let savedPuzzleId = null;

// Register a test user and login
async function setupTestUser() {
  console.log('Creating test user for gameplay testing...');
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

// Test starting a game at each difficulty level
async function testGameStart(level) {
  console.log(`Testing game start with ${level} difficulty...`);
  return new Promise((resolve, reject) => {
    if (!sessionCookie) {
      console.error('❌ No session cookie available for testing game start');
      resolve(false);
      return;
    }

    const postData = querystring.stringify({
      level: level
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
          const hasControls = data.includes('game-controls');
          const hasTimer = data.includes('timer');
          
          if (hasGrid && hasClues && hasControls && hasTimer) {
            console.log(`✅ Starting ${level} game successful`);
            console.log('✅ Crossword grid, clues, controls, and timer are present');
            
            // Extract puzzle ID for later tests
            const puzzleIdMatch = data.match(/puzzleId=(\d+)/);
            if (puzzleIdMatch && puzzleIdMatch[1]) {
              savedPuzzleId = puzzleIdMatch[1];
              console.log(`Found puzzle ID: ${savedPuzzleId}`);
            } else {
              // Try another method to find the puzzle ID
              const puzzleIdAltMatch = data.match(/data-puzzle-id="(\d+)"/);
              if (puzzleIdAltMatch && puzzleIdAltMatch[1]) {
                savedPuzzleId = puzzleIdAltMatch[1];
                console.log(`Found puzzle ID (alt method): ${savedPuzzleId}`);
              } else {
                console.log('Could not find puzzleId in response');
              }
            }
            
            resolve(true);
          } else {
            console.error('❌ Game content not found in response');
            resolve(false);
          }
        } else {
          console.error(`❌ Starting ${level} game failed. Status:`, res.statusCode);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${level} game start error:`, error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test saving game progress
async function testSaveProgress() {
  console.log('Testing save game progress functionality...');
  return new Promise((resolve, reject) => {
    if (!sessionCookie || !savedPuzzleId) {
      console.error('❌ Missing session cookie or puzzle ID for testing save progress');
      console.log('Session cookie:', sessionCookie ? 'present' : 'missing');
      console.log('Puzzle ID:', savedPuzzleId || 'missing');
      resolve(false);
      return;
    }

    // Simulate some filled-in cells
    const progress = {
      '0,0': 'N',
      '1,0': 'O',
      '2,0': 'D',
      '3,0': 'E',
      time: 120 // 2 minutes
    };

    const postData = JSON.stringify({
      userId: 1, // This is a simplification; the server will use session data
      puzzleId: savedPuzzleId,
      progress: JSON.stringify(progress)
    });

    console.log('Sending progress save request:', postData);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie,
        'User-Agent': 'node-fetch/test-client' // Add this to help server identify test requests
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Game progress saved successfully');
          resolve(true);
        } else {
          console.error('❌ Saving game progress failed:', data);
          console.error('Status code:', res.statusCode);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Save progress error:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test the dashboard to see if saved games appear
async function testDashboardWithSavedGames() {
  console.log('Testing dashboard for saved games...');
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
          const hasSavedGames = data.includes('saved-game-item') || 
                               data.includes('Resume Game');
          
          if (hasSavedGames) {
            console.log('✅ Dashboard shows saved games');
            resolve(true);
          } else {
            console.log('❓ Dashboard does not show saved games yet');
            resolve(false);
          }
        } else {
          console.error('❌ Accessing dashboard failed:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Dashboard access error:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Run all game play tests
async function runGamePlayTests() {
  console.log('Waiting for server to be available...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n--- Setting up test user ---');
  const userSetup = await setupTestUser();
  
  if (userSetup) {
    console.log('\n--- Testing Easy Game Play ---');
    const easyGameTest = await testGameStart('easy');
    
    if (easyGameTest) {
      console.log('\n--- Testing Save Progress Functionality ---');
      await testSaveProgress();
      
      console.log('\n--- Testing Dashboard with Saved Games ---');
      await testDashboardWithSavedGames();
    }
    
    console.log('\n--- Testing Intermediate Game Play ---');
    await testGameStart('intermediate');
    
    console.log('\n--- Testing Advanced Game Play ---');
    await testGameStart('advanced');
  } else {
    console.error('Cannot proceed with tests due to user setup failure');
  }
  
  console.log('\nGame play test execution completed');
}

// Start tests
runGamePlayTests();
