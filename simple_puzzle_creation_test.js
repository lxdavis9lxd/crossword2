// Simple test script for puzzle creation
const axios = require('axios');
const qs = require('querystring');

async function testPuzzleCreation() {
  try {
    // Step 1: Login
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', 
      qs.stringify({
        email: 'admin@example.com',
        password: 'Admin123!'
      }), 
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      }
    );
    
    // Extract cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No cookies received from login - authentication failed');
      return;
    }
    console.log('✅ Login successful');
    
    // Step 2: Create a simple puzzle
    console.log('\n2. Creating a test puzzle...');
    
    // Prepare simple puzzle data
    const puzzleData = {
      title: `Test Puzzle ${Date.now()}`,
      description: 'A simple test puzzle',
      level: 'easy',
      difficultyRating: 3,
      gridSize: 5,
      gridData: JSON.stringify([
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'M', 'N', 'O'],
        ['P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y']
      ]),
      acrossClues: JSON.stringify({
        "1": "First row clue",
        "6": "Second row clue",
        "11": "Third row clue",
        "16": "Fourth row clue",
        "21": "Fifth row clue"
      }),
      downClues: JSON.stringify({
        "1": "First column clue",
        "2": "Second column clue",
        "3": "Third column clue",
        "4": "Fourth column clue", 
        "5": "Fifth column clue"
      })
    };
    
    // Create the puzzle
    try {
      const createResponse = await axios.post(
        'http://localhost:3000/admin/puzzles/create',
        qs.stringify(puzzleData),
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: cookies.join('; ')
          },
          maxRedirects: 0,
          validateStatus: status => status >= 200 && status < 400
        }
      );
      
      console.log(`✅ Create puzzle request status: ${createResponse.status}`);
      
      if (createResponse.status === 302) {
        console.log(`✅ Redirected to: ${createResponse.headers.location}`);
      }
    } catch (createError) {
      console.log('❌ Error creating puzzle:');
      if (createError.response) {
        console.log(`Status: ${createError.response.status}`);
        console.log('Headers:', createError.response.headers);
        console.log('Data:', createError.response.data);
      } else {
        console.log(createError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Headers:', error.response.headers);
      console.log(`Data: ${typeof error.response.data === 'string' ? error.response.data.substring(0, 500) : JSON.stringify(error.response.data)}`);
    } else {
      console.log(error.message);
    }
  }
}

testPuzzleCreation();
