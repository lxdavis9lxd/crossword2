const http = require('http');

// Function to make HTTP requests with promises
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

// Test puzzle selection functionality
async function testPuzzleSelection() {
  console.log('======= PUZZLE SELECTION TESTING =======\n');
  
  try {
    // Step 1: Login to get a session cookie
    console.log('Step 1: Logging in to get session cookie');
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
    
    if (loginRes.statusCode !== 302) {
      console.error(`Login failed with status code: ${loginRes.statusCode}`);
      return;
    }
    
    // Get the session cookie
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies || cookies.length === 0) {
      console.error('No session cookie received!');
      return;
    }
    
    console.log('Session cookie received:', cookies[0].split(';')[0]);
    
    // Step 2: Access the dashboard to see available puzzles
    console.log('\nStep 2: Accessing dashboard to view available puzzles');
    
    const dashboardOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/game/dashboard',
      method: 'GET',
      headers: {
        'Cookie': cookies[0]
      }
    };
    
    const { res: dashboardRes, data: dashboardData } = await makeRequest(dashboardOptions);
    
    if (dashboardRes.statusCode !== 200) {
      console.error(`Failed to access dashboard. Status code: ${dashboardRes.statusCode}`);
      return;
    }
    
    console.log('Successfully accessed dashboard');
    
    // Check if the dashboard contains puzzle difficulty sections
    if (dashboardData.includes('difficulty-section')) {
      console.log('✅ Dashboard contains difficulty sections as expected');
    } else {
      console.log('❌ Dashboard does not contain difficulty sections');
    }
    
    // Step 3: Try to access a game with a specific puzzle ID
    console.log('\nStep 3: Testing game access with a specific puzzle ID');
    
    // Assuming puzzle ID 1 exists, try to access it
    const puzzleId = 1; // You may need to change this based on your database
    
    const gameOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/game?puzzleId=${puzzleId}`,
      method: 'GET',
      headers: {
        'Cookie': cookies[0]
      }
    };
    
    const { res: gameRes, data: gameData } = await makeRequest(gameOptions);
    
    console.log(`Game page access status: ${gameRes.statusCode}`);
    
    if (gameRes.statusCode === 200) {
      console.log('✅ Successfully accessed game page with puzzle ID');
      
      // Check if the puzzle ID is actually used in the game
      if (gameData.includes(`data-puzzle-id="${puzzleId}"`) || 
          gameData.includes(`puzzleId: ${puzzleId}`) ||
          gameData.includes(`"puzzleId": ${puzzleId}`) ||
          gameData.includes(`id="current-puzzle-id">${puzzleId}</span>`) ||
          gameData.includes(`Puzzle ID: <span id="current-puzzle-id">${puzzleId}</span>`)) {
        console.log('✅ Game page contains the specified puzzle ID');
      } else {
        console.log('❌ Game page does not contain the specified puzzle ID');
        console.log('This might mean the puzzle selection is not properly implemented in the front-end');
      }
    } else {
      console.log('❌ Failed to access game page with puzzle ID');
    }
    
    console.log('\n======= PUZZLE SELECTION TEST COMPLETED =======');
  } catch (error) {
    console.error('Error during puzzle selection test:', error);
  }
}

// Run the test
testPuzzleSelection();
