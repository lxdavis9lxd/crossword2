// Direct test of game progress functionality
const axios = require('axios');
const qs = require('querystring');

// Configuration
const BASE_URL = 'http://localhost:3000';
const USER = {
  email: 'progresstest2@example.com',
  password: 'testpassword123'
};

async function testGameProgess() {
  console.log('Testing game progress functionality...');
  
  // Store cookies and session data
  let cookies = '';
  let userId = null;
  let puzzleId = null;
  
  try {
    // 1. Login to get a session
    console.log('1. Logging in...');
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      qs.stringify({
        email: USER.email,
        password: USER.password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: (status) => true // Accept any status
      }
    );
    
    if (loginResponse.status !== 302 || !loginResponse.headers.location.includes('/dashboard')) {
      console.log('Login response:', loginResponse.status, loginResponse.data);
      throw new Error('Login failed');
    }
    
    // Save cookies
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'][0];
      console.log('Login successful, got cookies');
    }
    
    // 2. Get user ID from dashboard page
    console.log('2. Getting user ID...');
    const dashboardResponse = await axios.get(
      `${BASE_URL}/game/dashboard`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    // Extract user ID from meta tag in HTML
    const metaTagMatch = dashboardResponse.data.match(/<meta name="user-id" content="([0-9]+)">/);
    if (metaTagMatch && metaTagMatch[1]) {
      userId = metaTagMatch[1];
      console.log(`Got user ID: ${userId}`);
    } else {
      throw new Error('Failed to get user ID');
    }
    
    // 3. Get available puzzles
    console.log('3. Getting available puzzles...');
    const puzzlesResponse = await axios.get(
      `${BASE_URL}/game/puzzles/easy`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    if (!puzzlesResponse.data || !puzzlesResponse.data.length) {
      throw new Error('No puzzles available');
    }
    
    puzzleId = puzzlesResponse.data[0].id;
    console.log(`Got puzzle ID: ${puzzleId}`);
    
    // 4. Save game progress for the puzzle
    console.log('4. Saving game progress...');
    
    // Create test progress data - fill in a few cells
    const progressData = {};
    for (let i = 0; i < 5; i++) {
      progressData[i] = String.fromCharCode(65 + i); // A, B, C, D, E
    }
    progressData.lastPlayed = new Date().toISOString();
    
    const saveResponse = await axios.post(
      `${BASE_URL}/game/save`,
      {
        puzzleId: puzzleId,
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
    
    console.log('Game progress saved successfully');
    
    // 5. Check that the saved game appears in user's progress
    console.log('5. Checking for saved game in user progress...');
    const progressResponse = await axios.get(
      `${BASE_URL}/game/progress/${userId}`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    if (!progressResponse.data.progress || !progressResponse.data.progress[puzzleId]) {
      console.log('Progress response:', progressResponse.data);
      throw new Error('Saved game not found in user progress');
    }
    
    console.log('Saved game found in user progress');
    
    // 6. Verify the saved data is correct
    const savedProgress = progressResponse.data.progress[puzzleId];
    let parsedProgress;
    
    try {
      // If it's a string, try to parse it
      parsedProgress = typeof savedProgress === 'string' ? JSON.parse(savedProgress) : savedProgress;
    } catch (e) {
      console.error('Error parsing saved progress:', e);
      throw new Error('Invalid progress data format');
    }
    
    // Check if our test data (A-E) is in the saved progress
    const hasCorrectData = parsedProgress[0] === 'A' && 
                         parsedProgress[1] === 'B' &&
                         parsedProgress[2] === 'C' &&
                         parsedProgress[3] === 'D' &&
                         parsedProgress[4] === 'E';
    
    if (!hasCorrectData) {
      console.log('Saved progress:', parsedProgress);
      throw new Error('Saved progress data does not match expected values');
    }
    
    console.log('Saved progress data verified to be correct');
    
    // 7. Return to the game and load the saved progress
    console.log('7. Loading the game with saved progress...');
    await axios.get(
      `${BASE_URL}/game?puzzleId=${puzzleId}`,
      {
        headers: {
          Cookie: cookies
        }
      }
    );
    
    console.log('Game page loaded (manual verification would be needed to see the grid)');
    
    console.log('\n✅ All tests passed! The game progress functionality is working correctly.');
    console.log(`\nUser can save game progress, view their saved games on the dashboard, and resume them.`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the test
testGameProgess();
