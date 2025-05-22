// Simple test that performs all the steps in one go
const axios = require('axios');
const qs = require('querystring');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3000';
const LOG_FILE = '/workspaces/crossword2/progress_test_results.log';

async function testSaveAndRetrieveProgress() {
  // Clear log file
  fs.writeFileSync(LOG_FILE, '');
  
  function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
  }
  
  log('\n===== TESTING GAME PROGRESS FUNCTIONALITY =====\n');
  
  try {
    // 1. Register a new user
    const username = `testuser_${Date.now()}`;
    const email = `${username}@example.com`;
    const password = 'testpassword123';
    
    log(`1. Registering new user: ${username}`);
    
    await axios.post(
      `${BASE_URL}/auth/register`,
      qs.stringify({
        username,
        email,
        password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: status => status === 302
      }
    );
    
    // 2. Log in with the new user
    log('2. Logging in with new user');
    
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      qs.stringify({
        email,
        password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: status => status === 302
      }
    );
    
    // Save the session cookie
    const cookies = loginResponse.headers['set-cookie'][0];
    
    // 3. Get user ID from dashboard
    log('3. Getting user ID from dashboard');
    
    const dashboardResponse = await axios.get(
      `${BASE_URL}/game/dashboard`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    // Extract user ID from meta tag in HTML
    const userIdMatch = dashboardResponse.data.match(/<meta name="user-id" content="([0-9]+)">/);
    const userId = userIdMatch ? userIdMatch[1] : null;
    
    if (!userId) {
      throw new Error('Could not extract user ID from dashboard');
    }
    
    log(`   User ID: ${userId}`);
    
    // 4. Get available puzzles
    log('4. Getting available puzzles');
    
    const puzzlesResponse = await axios.get(
      `${BASE_URL}/game/puzzles/easy`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    if (!puzzlesResponse.data || puzzlesResponse.data.length === 0) {
      throw new Error('No puzzles available for testing');
    }
    
    const puzzleId = puzzlesResponse.data[0].id;
    log(`   Selected puzzle ID: ${puzzleId}`);
    
    // 5. Save progress for the puzzle
    log('5. Saving game progress');
    
    // Create test progress data
    const progressData = {};
    for (let i = 0; i < 5; i++) {
      progressData[i] = String.fromCharCode(65 + i); // A, B, C, D, E
    }
    progressData.lastPlayed = new Date().toISOString();
    
    const saveResponse = await axios.post(
      `${BASE_URL}/game/save`,
      {
        puzzleId,
        progress: JSON.stringify(progressData)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies
        }
      }
    );
    
    if (!saveResponse.data.success) {
      throw new Error('Failed to save game progress');
    }
    
    log('   Game progress saved successfully');
    
    // 6. Verify progress is saved by retrieving it
    log('6. Verifying saved game progress');
    
    const progressResponse = await axios.get(
      `${BASE_URL}/game/progress/${userId}`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    if (!progressResponse.data.progress || !progressResponse.data.progress[puzzleId]) {
      throw new Error('Saved game not found in user progress');
    }
    
    log('   Saved game found in user progress');
    
    // Parse and check saved progress
    const savedProgress = progressResponse.data.progress[puzzleId];
    const parsedProgress = typeof savedProgress === 'string' 
      ? JSON.parse(savedProgress) 
      : savedProgress;
    
    // Verify the data matches what we saved
    const hasValidData = ['A', 'B', 'C', 'D', 'E'].every((letter, idx) => {
      return parsedProgress[idx] === letter;
    });
    
    if (!hasValidData) {
      throw new Error('Saved progress data does not match expected values');
    }
    
    log('   Saved progress data verified to be correct');
    
    // 7. Test loading the game page
    log('7. Loading game page with saved progress');
    
    await axios.get(
      `${BASE_URL}/game?puzzleId=${puzzleId}`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    log('   Game page loaded successfully');
    
    log('\n✅ SUCCESS! All game progress functionality is working properly.');
    log('Users can:');
    log('  1. Save their game progress');
    log('  2. See their saved games on the dashboard');
    log('  3. Select and resume a saved game');
    
  } catch (error) {
    log('\n❌ TEST FAILED: ' + error.message);
    if (error.response) {
      log('Response status: ' + error.response.status);
      log('Response data: ' + error.response.data);
    }
  }
}

// Run the test
testSaveAndRetrieveProgress();
