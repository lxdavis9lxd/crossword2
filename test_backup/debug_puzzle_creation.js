// Detailed debugging script for puzzle creation
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const qs = require('querystring');

const BASE_URL = 'http://localhost:3000';
let sessionCookies = '';

// Helper function to save HTML for inspection
function saveHtml(filename, html) {
  fs.writeFileSync(filename, html);
  console.log(`Saved HTML to ${filename}`);
}

async function debugPuzzleCreation() {
  try {
    console.log('\n==== PUZZLE CREATION DEBUGGING ====\n');
    
    // Step 1: Login
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, 
      qs.stringify({
        emailOrUsername: 'admin@example.com',
        password: 'Admin123!'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      }
    );
    
    // Save cookies for future requests
    if (loginResponse.headers['set-cookie']) {
      sessionCookies = loginResponse.headers['set-cookie'].join('; ');
      console.log('✅ Login successful, cookies obtained');
    } else {
      console.log('❌ No cookies received from login');
      return;
    }
    
    // Step 2: Try to get admin puzzles list
    console.log('\n2. Fetching admin puzzles list...');
    try {
      const puzzlesResponse = await axios.get(`${BASE_URL}/admin/puzzles`, {
        headers: { Cookie: sessionCookies },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
      
      console.log(`Status code: ${puzzlesResponse.status}`);
      if (puzzlesResponse.status === 200) {
        console.log('✅ Successfully fetched puzzles list');
        // Save the puzzles list HTML for inspection
        saveHtml('puzzles_list.html', puzzlesResponse.data);
        
        // Check for the Create New Puzzle button
        const $ = cheerio.load(puzzlesResponse.data);
        const createButton = $('a:contains("Create New Puzzle")');
        if (createButton.length > 0) {
          console.log('✅ Create New Puzzle button found');
          console.log(`Button URL: ${createButton.attr('href')}`);
        } else {
          console.log('❌ Create New Puzzle button not found');
        }
      } else {
        console.log(`❌ Failed to fetch puzzles list: ${puzzlesResponse.status}`);
        console.log(puzzlesResponse.data);
      }
    } catch (error) {
      console.log('❌ Error fetching puzzles list:');
      console.log(error.message);
    }
    
    // Step 3: Try to get the create puzzle form
    console.log('\n3. Fetching create puzzle form...');
    try {
      const createFormResponse = await axios.get(`${BASE_URL}/admin/puzzles/create`, {
        headers: { Cookie: sessionCookies },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
      
      console.log(`Status code: ${createFormResponse.status}`);
      if (createFormResponse.status === 200) {
        console.log('✅ Successfully fetched create puzzle form');
        // Save the form HTML for inspection
        saveHtml('create_puzzle_form.html', createFormResponse.data);
        
        // Check form action
        const $ = cheerio.load(createFormResponse.data);
        const form = $('form#createPuzzleForm');
        if (form.length > 0) {
          console.log(`Form action: ${form.attr('action')}`);
          console.log(`Form method: ${form.attr('method')}`);
          
          // List required fields
          const requiredFields = $('form#createPuzzleForm [required]');
          console.log(`Required fields (${requiredFields.length}):`);
          requiredFields.each((i, el) => {
            console.log(`- ${$(el).attr('name')}`);
          });
        } else {
          console.log('❌ Create puzzle form not found');
        }
      } else {
        console.log(`❌ Failed to fetch create form: ${createFormResponse.status}`);
        console.log(createFormResponse.data);
      }
    } catch (error) {
      console.log('❌ Error fetching create form:');
      console.log(error.message);
    }
    
    // Step 4: Try to submit a puzzle creation request
    console.log('\n4. Submitting puzzle creation request...');
    try {
      // Create test puzzle data
      const puzzleData = {
        title: `Debug Test Puzzle ${Date.now()}`,
        description: 'A test puzzle for debugging',
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
      
      // Log what we're about to send
      console.log('Sending puzzle data:');
      console.log('- Title:', puzzleData.title);
      console.log('- Level:', puzzleData.level);
      console.log('- Grid size:', puzzleData.gridSize);
      console.log('- Grid data sample:', JSON.parse(puzzleData.gridData)[0].join(''));
      
      const createResponse = await axios.post(
        `${BASE_URL}/admin/puzzles/create`,
        qs.stringify(puzzleData),
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: sessionCookies
          },
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        }
      );
      
      console.log(`Status code: ${createResponse.status}`);
      
      if (createResponse.status === 302) {
        console.log('✅ Puzzle created successfully');
        console.log(`Redirected to: ${createResponse.headers.location}`);
      } else if (createResponse.status === 200) {
        console.log('⚠️ Got 200 response but expected redirect');
        saveHtml('create_response.html', createResponse.data);
        
        // Check for errors
        const $ = cheerio.load(createResponse.data);
        const errors = $('.message.error');
        if (errors.length > 0) {
          console.log('❌ Error messages found:');
          errors.each((i, el) => {
            console.log(`- ${$(el).text().trim()}`);
          });
        }
      } else {
        console.log(`❌ Failed to create puzzle: ${createResponse.status}`);
        if (typeof createResponse.data === 'string') {
          saveHtml('create_error.html', createResponse.data);
        } else {
          console.log(createResponse.data);
        }
      }
    } catch (error) {
      console.log('❌ Error creating puzzle:');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Headers:', error.response.headers);
        if (typeof error.response.data === 'string') {
          saveHtml('create_error.html', error.response.data);
        } else {
          console.log('Data:', error.response.data);
        }
      } else {
        console.log(error.message);
      }
    }
    
  } catch (error) {
    console.error('Debugging script error:', error);
  }
}

debugPuzzleCreation();
