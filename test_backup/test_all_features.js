const http = require('http');

/**
 * Comprehensive test suite for the crossword game application
 */
async function runTests() {
  console.log('\n=========== COMPREHENSIVE FEATURE TESTS ===========\n');
  
  try {
    // Test login
    const loginResult = await testLoginFlow();
    
    if (loginResult.success) {
      // If login was successful, continue with other tests
      const cookie = loginResult.cookie;
      
      // Test dashboard access
      await testDashboardAccess(cookie);
      
      // Test puzzle loading
      await testPuzzleLoading(cookie);
      
      // Test saved games
      await testSavedGames(cookie);
      
      // Test error handling
      await testErrorHandling(cookie);
    }
    
    console.log('\n=========== ALL TESTS COMPLETED ===========');
  } catch (error) {
    console.error('Error in test suite:', error);
  }
}

/**
 * Make an HTTP request and return a promise
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ res, data });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Test the login flow
 */
async function testLoginFlow() {
  console.log('TEST 1: Login Flow');
  console.log('-------------------');
  
  try {
    // Test successful login
    const loginFormData = 'email=testuser123@example.com&password=password123';
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': loginFormData.length
      }
    };
    
    const { res: loginRes } = await makeRequest(loginOptions, loginFormData);
    
    if (loginRes.statusCode === 302 && loginRes.headers.location === '/game/dashboard') {
      console.log('✅ Login successful');
      
      // Get the session cookie
      const cookies = loginRes.headers['set-cookie'];
      if (!cookies || cookies.length === 0) {
        console.error('❌ No session cookie received!');
        return { success: false };
      }
      
      console.log('✅ Session cookie received:', cookies[0].split(';')[0]);
      return { success: true, cookie: cookies[0] };
    } else {
      console.error(`❌ Login failed with status code: ${loginRes.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during login test:', error);
    return { success: false };
  }
}

/**
 * Test access to the dashboard
 */
async function testDashboardAccess(cookie) {
  console.log('\nTEST 2: Dashboard Access');
  console.log('-------------------------');
  
  try {
    const dashboardOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/dashboard',
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };
    
    const { res: dashboardRes, data: dashboardData } = await makeRequest(dashboardOptions);
    
    if (dashboardRes.statusCode === 200) {
      console.log('✅ Dashboard access successful');
      
      // Check if dashboard contains required elements
      if (dashboardData.includes('difficulty-section')) {
        console.log('✅ Dashboard contains difficulty sections');
      } else {
        console.log('❌ Dashboard is missing difficulty sections');
      }
      
      if (dashboardData.includes('saved-games-list')) {
        console.log('✅ Dashboard contains saved games list');
      } else {
        console.log('❌ Dashboard is missing saved games list');
      }
      
      return { success: true };
    } else {
      console.error(`❌ Dashboard access failed with status code: ${dashboardRes.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during dashboard test:', error);
    return { success: false };
  }
}

/**
 * Test puzzle loading
 */
async function testPuzzleLoading(cookie) {
  console.log('\nTEST 3: Puzzle Loading');
  console.log('----------------------');
  
  try {
    // Get puzzle ID 1
    const puzzleId = 1;
    
    const gameOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/game?puzzleId=${puzzleId}`,
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };
    
    const { res: gameRes, data: gameData } = await makeRequest(gameOptions);
    
    if (gameRes.statusCode === 200) {
      console.log('✅ Game page access successful');
      
      // Check if the puzzle ID is displayed
      if (gameData.includes(`id="current-puzzle-id">${puzzleId}</span>`)) {
        console.log('✅ Game page displays the correct puzzle ID');
      } else {
        console.log('❌ Game page does not display the puzzle ID correctly');
      }
      
      return { success: true };
    } else {
      console.error(`❌ Game page access failed with status code: ${gameRes.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during puzzle loading test:', error);
    return { success: false };
  }
}

/**
 * Test saved games functionality
 */
async function testSavedGames(cookie) {
  console.log('\nTEST 4: Saved Games');
  console.log('-------------------');
  
  try {
    // Get the user ID from the cookie (This would be a complex parse in reality)
    // For testing purposes, we'll use a fixed user ID
    const userId = 1; 
    
    const progressOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/game/progress/${userId}`,
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };
    
    const { res: progressRes, data: progressData } = await makeRequest(progressOptions);
    
    if (progressRes.statusCode === 200) {
      console.log('✅ Saved games API access successful');
      
      // Parse the response
      try {
        const progressJson = JSON.parse(progressData);
        console.log(`✅ Found ${Object.keys(progressJson.progress || {}).length} saved games`);
        return { success: true };
      } catch (e) {
        console.error('❌ Failed to parse saved games response:', e);
        return { success: false };
      }
    } else {
      console.error(`❌ Saved games API access failed with status code: ${progressRes.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during saved games test:', error);
    return { success: false };
  }
}

/**
 * Test error handling
 */
async function testErrorHandling(cookie) {
  console.log('\nTEST 5: Error Handling');
  console.log('----------------------');
  
  try {
    // Test accessing a non-existent puzzle
    const nonExistentPuzzleId = 9999;
    
    const badOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/game/puzzles/details/${nonExistentPuzzleId}`,
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };
    
    const { res: badRes, data: badData } = await makeRequest(badOptions);
    
    // We expect a 404 for a non-existent puzzle
    if (badRes.statusCode === 404) {
      console.log('✅ Error handling working correctly for non-existent puzzle');
      return { success: true };
    } else {
      console.log(`❌ Expected 404 for non-existent puzzle, but got ${badRes.statusCode}`);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during error handling test:', error);
    return { success: false };
  }
}

// Run all tests
runTests();
