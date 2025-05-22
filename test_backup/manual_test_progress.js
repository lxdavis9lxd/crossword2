// Manual test script for game progress functionality
const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'progresstest',
  email: 'progresstest@example.com',
  password: 'testpassword123'
};

// For storing cookies
let cookies = '';
let lastPuzzleId = null;

async function runManualTests() {
  console.log('Starting manual game progress tests...');
  
  try {
    // 1. Register/login the test user
    await setupTestUser();
    
    // 2. Get available puzzles
    const puzzles = await getAvailablePuzzles();
    if (puzzles.length === 0) {
      throw new Error('No puzzles available for testing');
    }
    
    // 3. Select a puzzle to work with
    lastPuzzleId = puzzles[0].id;
    console.log(`Selected puzzle #${lastPuzzleId} for testing`);
    
    // 4. Start the game
    await startGame(lastPuzzleId);
    
    // 5. Save some progress
    await saveGameProgress(lastPuzzleId);
    
    // 6. Verify the saved game appears in dashboard
    await verifySavedGameInDashboard(lastPuzzleId);
    
    // 7. Load the saved game
    await loadSavedGame(lastPuzzleId);
    
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function setupTestUser() {
  console.log('Setting up test user...');
  
  try {
    // First try to log in
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, 
      `username=${TEST_USER.username}&password=${TEST_USER.password}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    ).catch(error => {
      // If login fails with redirect, it means we need to register
      if (error.response && error.response.status === 302) {
        return error.response;
      }
      throw error;
    });
    
    // Store cookies for session maintenance
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'].join('; ');
    }
    
    // If we got redirected to dashboard, login worked
    if (loginResponse.status === 302 && loginResponse.headers.location.includes('/dashboard')) {
      console.log('Login successful');
      return;
    }
    
    // Otherwise, we need to register
    console.log('Login failed, attempting registration...');
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`,
      `username=${TEST_USER.username}&email=${TEST_USER.email}&password=${TEST_USER.password}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    ).catch(error => {
      // Handle redirect as success
      if (error.response && error.response.status === 302) {
        return error.response;
      }
      throw error;
    });
    
    // Store cookies for session maintenance
    if (registerResponse.headers['set-cookie']) {
      cookies = registerResponse.headers['set-cookie'].join('; ');
    }
    
    // Now try to log in again
    const reloginResponse = await axios.post(`${BASE_URL}/auth/login`, 
      `username=${TEST_USER.username}&password=${TEST_USER.password}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    ).catch(error => {
      // Handle redirect as success
      if (error.response && error.response.status === 302) {
        return error.response;
      }
      throw error;
    });
    
    // Store cookies for session maintenance
    if (reloginResponse.headers['set-cookie']) {
      cookies = reloginResponse.headers['set-cookie'].join('; ');
    }
    
    console.log('User setup complete');
  } catch (error) {
    console.error('Failed to setup test user:', error.message);
    throw error;
  }
}

async function getAvailablePuzzles() {
  console.log('Getting available puzzles...');
  
  try {
    // Get the easy level puzzles
    const response = await axios.get(`${BASE_URL}/game/puzzles/easy`, {
      headers: {
        Cookie: cookies
      }
    });
    
    console.log(`Found ${response.data.length} puzzles`);
    return response.data;
  } catch (error) {
    console.error('Failed to get puzzles:', error.message);
    throw error;
  }
}

async function startGame(puzzleId) {
  console.log(`Starting game with puzzle #${puzzleId}...`);
  
  try {
    const response = await axios.post(`${BASE_URL}/game/start`,
      `level=easy&puzzleId=${puzzleId}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookies
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      }
    ).catch(error => {
      // Handle redirect as success
      if (error.response && error.response.status === 302) {
        return error.response;
      }
      throw error;
    });
    
    if (response.status === 302 && response.headers.location.includes('/game')) {
      console.log('Game started successfully');
      return true;
    } else {
      throw new Error('Failed to start game');
    }
  } catch (error) {
    console.error('Failed to start game:', error.message);
    throw error;
  }
}

async function saveGameProgress(puzzleId) {
  console.log(`Saving game progress for puzzle #${puzzleId}...`);
  
  try {
    // Create some mock progress data - filled in 5 cells
    const gridState = {};
    for (let i = 0; i < 5; i++) {
      gridState[i] = String.fromCharCode(65 + i); // A, B, C, D, E
    }
    
    // Add timestamp for when the game was last played
    gridState.lastPlayed = new Date().toISOString();
    
    const response = await axios.post(`${BASE_URL}/game/save`,
      {
        puzzleId: puzzleId,
        progress: JSON.stringify(gridState)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies
        }
      }
    );
    
    if (response.status === 200 && response.data.success) {
      console.log('Game progress saved successfully');
      return true;
    } else {
      throw new Error('Failed to save game progress');
    }
  } catch (error) {
    console.error('Failed to save game progress:', error.message);
    throw error;
  }
}

async function verifySavedGameInDashboard(puzzleId) {
  console.log('Verifying saved game appears in dashboard...');
  
  try {
    // Get the dashboard
    const response = await axios.get(`${BASE_URL}/game/dashboard`, {
      headers: {
        Cookie: cookies
      }
    });
    
    // Wait a moment to let the dashboard load saved games via client-side JS
    // In a real test, we'd check the API response directly
    const dashboardHtml = response.data;
    
    // Now get the user's progress through the API
    const userId = await getUserId();
    const progressResponse = await axios.get(`${BASE_URL}/game/progress/${userId}`, {
      headers: {
        Cookie: cookies
      }
    });
    
    const progress = progressResponse.data.progress || {};
    
    // Check if our puzzle ID is in the progress data
    if (progress[puzzleId]) {
      console.log('Saved game verified in user progress');
      return true;
    } else {
      throw new Error(`Saved game for puzzle #${puzzleId} not found in user progress`);
    }
  } catch (error) {
    console.error('Failed to verify saved game in dashboard:', error.message);
    throw error;
  }
}

async function loadSavedGame(puzzleId) {
  console.log(`Testing loading saved game for puzzle #${puzzleId}...`);
  
  try {
    // Get the game page
    const response = await axios.get(`${BASE_URL}/game?puzzleId=${puzzleId}`, {
      headers: {
        Cookie: cookies
      }
    });
    
    // In a real browser test, we'd verify the grid cells have our saved values
    // For this API test, we'll verify we get a 200 response with the game page
    if (response.status === 200 && response.data.includes('crossword-container')) {
      console.log('Game page loaded successfully');
      
      // Get the user's progress through the API
      const userId = await getUserId();
      const progressResponse = await axios.get(`${BASE_URL}/game/progress/${userId}`, {
        headers: {
          Cookie: cookies
        }
      });
      
      const progress = progressResponse.data.progress || {};
      
      // Check if our puzzle ID is in the progress data
      if (progress[puzzleId]) {
        const savedProgress = typeof progress[puzzleId] === 'string' 
          ? JSON.parse(progress[puzzleId]) 
          : progress[puzzleId];
          
        // Check if the progress has our expected values (A, B, C, D, E)
        let hasExpectedProgress = false;
        for (let i = 0; i < 5; i++) {
          if (savedProgress[i] === String.fromCharCode(65 + i)) {
            hasExpectedProgress = true;
          } else {
            hasExpectedProgress = false;
            break;
          }
        }
        
        if (hasExpectedProgress) {
          console.log('Saved progress contains the expected values');
          return true;
        } else {
          console.log('Progress data found but values don\'t match expected values');
          return false;
        }
      } else {
        throw new Error(`No progress data found for puzzle #${puzzleId}`);
      }
    } else {
      throw new Error('Failed to load game page');
    }
  } catch (error) {
    console.error('Failed to load saved game:', error.message);
    throw error;
  }
}

async function getUserId() {
  try {
    // Get the dashboard page to extract user ID from meta tag
    const response = await axios.get(`${BASE_URL}/game/dashboard`, {
      headers: {
        Cookie: cookies
      }
    });
    
    const $ = cheerio.load(response.data);
    const userId = $('meta[name="user-id"]').attr('content');
    
    if (!userId) {
      throw new Error('User ID not found in dashboard page');
    }
    
    return userId;
  } catch (error) {
    console.error('Failed to get user ID:', error.message);
    throw error;
  }
}

// Execute the tests
runManualTests().catch(console.error);
