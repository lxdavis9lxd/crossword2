// Manual test script for puzzle creation feature
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const qs = require('querystring');

// Create an instance of axios with cookies enabled
const instance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

let cookies = '';

async function runTest() {
  try {
    console.log('MANUAL PUZZLE CREATION TEST');
    console.log('===========================');
    
    // Step 1: Login to admin account
    console.log('\n1. Logging into admin account...');
    const loginResp = await instance.post('/auth/login', qs.stringify({
      email: 'admin@example.com',
      password: 'Admin123!'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (loginResp.headers['set-cookie']) {
      cookies = loginResp.headers['set-cookie'];
      console.log('✓ Login successful, cookies obtained');
    } else {
      console.log('✗ Login failed, no cookies received');
      return;
    }
    
    // Step 2: Navigate to admin puzzle list page
    console.log('\n2. Navigating to admin puzzles page...');
    const puzzlesResp = await instance.get('/admin/puzzles', {
      headers: {
        Cookie: cookies
      }
    });
    
    if (puzzlesResp.status !== 200) {
      console.log(`✗ Failed to load puzzles page. Status: ${puzzlesResp.status}`);
      return;
    }
    
    console.log('✓ Puzzles page loaded successfully');
    
    // Check if Create New Puzzle button exists
    const $ = cheerio.load(puzzlesResp.data);
    const createButton = $('a.admin-button.primary:contains("Create New Puzzle")');
    
    if (createButton.length === 0) {
      console.log('✗ Create New Puzzle button not found on page');
      console.log(puzzlesResp.data); // Log the HTML for debugging
      return;
    }
    
    console.log('✓ Create New Puzzle button found on page');
    const createUrl = createButton.attr('href');
    
    // Step 3: Navigate to create puzzle page
    console.log('\n3. Navigating to create puzzle form...');
    const createPageResp = await instance.get(createUrl, {
      headers: {
        Cookie: cookies
      }
    });
    
    if (createPageResp.status !== 200) {
      console.log(`✗ Failed to load create puzzle page. Status: ${createPageResp.status}`);
      return;
    }
    
    console.log('✓ Create puzzle page loaded successfully');
    
    // Step 4: Create a simple test puzzle
    console.log('\n4. Creating a new puzzle...');
    
    // Sample 3x3 grid
    const gridData = JSON.stringify([
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I']
    ]);
    
    // Sample clues
    const acrossClues = JSON.stringify({
      "1": "First row",
      "4": "Second row",
      "7": "Third row"
    });
    
    const downClues = JSON.stringify({
      "1": "First column",
      "2": "Second column",
      "3": "Third column"
    });
    
    const puzzleData = {
      title: "Test Puzzle " + Date.now(),
      description: "A test puzzle created via the manual puzzle creator",
      level: "easy",
      difficultyRating: "2",
      gridSize: "3",
      gridData: gridData,
      acrossClues: acrossClues,
      downClues: downClues
    };
    
    const createResp = await instance.post('/admin/puzzles/create', qs.stringify(puzzleData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookies
      }
    });
    
    if (createResp.status === 302 || createResp.status === 200) {
      console.log('✓ Puzzle created successfully');
      
      // Check if we were redirected back to the puzzles list
      const redirectLocation = createResp.headers.location;
      if (redirectLocation && redirectLocation.includes('/admin/puzzles')) {
        console.log('✓ Redirected back to puzzles list as expected');
      } else {
        console.log('✗ Not redirected to puzzles list after creation');
      }
    } else {
      console.log(`✗ Failed to create puzzle. Status: ${createResp.status}`);
      console.log(createResp.data);
    }
    
    // Step 5: Verify the puzzle was added to the list
    console.log('\n5. Verifying puzzle was added to the list...');
    const verifyResp = await instance.get('/admin/puzzles', {
      headers: {
        Cookie: cookies
      }
    });
    
    if (verifyResp.status !== 200) {
      console.log(`✗ Failed to load puzzles page for verification. Status: ${verifyResp.status}`);
      return;
    }
    
    const $verify = cheerio.load(verifyResp.data);
    const puzzleTitle = puzzleData.title;
    const puzzleElement = $verify(`td:contains("${puzzleTitle}")`);
    
    if (puzzleElement.length > 0) {
      console.log(`✓ New puzzle "${puzzleTitle}" found in the list`);
    } else {
      console.log(`✗ New puzzle "${puzzleTitle}" NOT found in the list`);
    }
    
    console.log('\nTEST COMPLETE!');
    
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

runTest();
