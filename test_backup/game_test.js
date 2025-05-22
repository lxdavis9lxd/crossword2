// Test script for game play functionality
const http = require('http');
const assert = require('assert');
const querystring = require('querystring');
const { Sequelize } = require('sequelize');

console.log('Starting game play tests for crossword application...');

// Global variables to store test data
let testUserEmail = `test_${Date.now()}@example.com`;
let testUsername = `testuser_${Date.now()}`;
let testPassword = 'TestPassword123';
let sessionCookie = null;
let testPuzzleIds = [];

// Connect to the database directly
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

// Define the models
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Puzzle = sequelize.define('Puzzle', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: Sequelize.STRING,
    allowNull: false
  },
  puzzleData: {
    type: Sequelize.TEXT,
    allowNull: false
  }
});

// Sample puzzle data for testing
const samplePuzzles = [
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'C', 'A', 'T', '#',
        'O', '#', 'O', '#',
        'W', 'O', 'R', 'D',
        '#', '#', 'Y', '#'
      ],
      cellNumbers: [1, 2, 3, null, 4, null, 5, null, 6, null, null, null, null, null, 7, null],
      clues: {
        across: [
          { number: 1, clue: "Feline pet" },
          { number: 4, clue: "Vowel sound" },
          { number: 6, clue: "A unit of language" },
          { number: 7, clue: "Question word" }
        ],
        down: [
          { number: 1, clue: "Female bovine" },
          { number: 2, clue: "Article" },
          { number: 3, clue: "Past tense of eat" },
          { number: 5, clue: "Organ of hearing" }
        ]
      }
    })
  },
  {
    level: 'intermediate',
    puzzleData: JSON.stringify({
      grid: [
        'P', 'U', 'Z', 'Z', 'L', 'E',
        'A', '#', 'E', '#', 'I', '#',
        'R', 'E', 'B', 'U', 'S', '#',
        'K', '#', 'R', '#', 'T', '#',
        '#', 'G', 'A', 'M', 'E', '#',
        '#', '#', '#', '#', 'N', '#'
      ],
      cellNumbers: [1, 2, 3, 4, 5, 6, 7, null, 8, null, 9, null, 10, 11, 12, 13, 14, null, 15, null, 16, null, 17, null, null, 18, 19, 20, 21, null, null, null, null, null, 22, null],
      clues: {
        across: [
          { number: 1, clue: "A problem to solve" },
          { number: 7, clue: "Atmosphere" },
          { number: 8, clue: "Letter after D" },
          { number: 9, clue: "Personal pronoun" },
          { number: 10, clue: "Picture puzzle" },
          { number: 15, clue: "Parking area" },
          { number: 16, clue: "Color" },
          { number: 17, clue: "Beverage" },
          { number: 18, clue: "Activity for fun" },
          { number: 22, clue: "Negative response" }
        ],
        down: [
          { number: 1, clue: "Writing tool" },
          { number: 2, clue: "Indefinite article" },
          { number: 3, clue: "Sleep state" },
          { number: 4, clue: "To consume food" },
          { number: 5, clue: "Look at" },
          { number: 6, clue: "Past tense of eat" },
          { number: 11, clue: "Start of a counting rhyme" },
          { number: 12, clue: "Upon" },
          { number: 13, clue: "Number of sides in a square" },
          { number: 14, clue: "Make a mistake" },
          { number: 19, clue: "Indefinite article" },
          { number: 20, clue: "Mouse sound" },
          { number: 21, clue: "Afternoon drink" }
        ]
      }
    })
  }
];

// Test server connection
function testServerConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, 200);
          console.log('✅ Server connection test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Server connection test failed:', error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Server connection test failed:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Insert sample puzzles into the database
async function insertSamplePuzzles() {
  try {
    console.log('Inserting sample puzzles into database...');
    
    for (const puzzleData of samplePuzzles) {
      const puzzle = await Puzzle.create(puzzleData);
      testPuzzleIds.push(puzzle.id);
      console.log(`Created puzzle with ID: ${puzzle.id}, level: ${puzzle.level}`);
    }
    
    console.log('✅ Sample puzzles inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to insert sample puzzles:', error.message);
    return false;
  }
}

// Test user registration for game testing
function testRegistration() {
  return new Promise((resolve, reject) => {
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
        try {
          // Should redirect to login page after successful registration
          assert.strictEqual(res.statusCode, 302);
          assert.strictEqual(res.headers.location, '/auth/login');
          console.log('✅ Registration for game test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Registration for game test failed:', error.message);
          console.error('Status code:', res.statusCode);
          console.error('Response data:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Registration for game test failed:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test user login for game testing
function testLogin() {
  return new Promise((resolve, reject) => {
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
        try {
          // Should redirect to dashboard after successful login
          assert.strictEqual(res.statusCode, 302);
          assert.strictEqual(res.headers.location, '/game/dashboard');
          assert.ok(sessionCookie, 'Session cookie should be set');
          console.log('✅ Login for game test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Login for game test failed:', error.message);
          console.error('Status code:', res.statusCode);
          console.error('Response data:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Login for game test failed:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test puzzle API endpoints
function testPuzzleApis() {
  return new Promise(async (resolve, reject) => {
    try {
      // Test getting puzzles by level
      console.log('\nTesting puzzle level API...');
      
      const levelResults = await Promise.all(
        ['easy', 'intermediate', 'advanced'].map(level => 
          new Promise((resolveLevel, rejectLevel) => {
            const options = {
              hostname: 'localhost',
              port: 3000,
              path: `/game/puzzles/${level}`,
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
                try {
                  assert.strictEqual(res.statusCode, 200);
                  const puzzles = JSON.parse(data);
                  console.log(`Found ${puzzles.length} ${level} puzzles`);
                  
                  if (level === 'easy' || level === 'intermediate') {
                    assert.ok(puzzles.length > 0, `Should have at least one ${level} puzzle`);
                  }
                  
                  resolveLevel(true);
                } catch (error) {
                  console.error(`❌ Puzzle level API test failed for ${level}:`, error.message);
                  resolveLevel(false);
                }
              });
            });

            req.on('error', (error) => {
              console.error(`❌ Puzzle level API test failed for ${level}:`, error.message);
              resolveLevel(false);
            });

            req.end();
          })
        )
      );
      
      // Test getting puzzle details
      console.log('\nTesting puzzle details API...');
      
      if (testPuzzleIds.length > 0) {
        const puzzleId = testPuzzleIds[0];
        
        const detailsPromise = new Promise((resolveDetails, rejectDetails) => {
          const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/game/puzzles/details/${puzzleId}`,
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
              try {
                assert.strictEqual(res.statusCode, 200);
                const puzzle = JSON.parse(data);
                
                console.log(`Successfully retrieved puzzle ID: ${puzzle.id}`);
                
                // Verify puzzle data structure
                const puzzleData = JSON.parse(puzzle.puzzleData);
                assert.ok(puzzleData.grid, 'Puzzle should have a grid');
                assert.ok(puzzleData.cellNumbers, 'Puzzle should have cell numbers');
                assert.ok(puzzleData.clues, 'Puzzle should have clues');
                
                console.log('✅ Puzzle details API test passed');
                resolveDetails(true);
              } catch (error) {
                console.error('❌ Puzzle details API test failed:', error.message);
                resolveDetails(false);
              }
            });
          });

          req.on('error', (error) => {
            console.error('❌ Puzzle details API test failed:', error.message);
            resolveDetails(false);
          });

          req.end();
        });
        
        await detailsPromise;
      } else {
        console.log('Skipping puzzle details test - no puzzle IDs available');
      }
      
      // Determine overall API test result
      const apiTestSuccess = levelResults.every(result => result);
      if (apiTestSuccess) {
        console.log('✅ Puzzle API tests passed');
      } else {
        console.log('❌ Some puzzle API tests failed');
      }
      
      resolve(apiTestSuccess);
      
    } catch (error) {
      console.error('❌ Puzzle API tests failed with error:', error);
      resolve(false);
    }
  });
}

// Test game page loading
function testGamePageLoading() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/game',
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
        try {
          assert.strictEqual(res.statusCode, 200);
          
          // Check for key elements in the game page
          assert.ok(data.includes('crossword-container'), 'Game page should include crossword-container');
          assert.ok(data.includes('level-select'), 'Game page should include level selector');
          assert.ok(data.includes('puzzle-select'), 'Game page should include puzzle selector');
          assert.ok(data.includes('load-puzzle-btn'), 'Game page should include load puzzle button');
          
          console.log('✅ Game page loading test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Game page loading test failed:', error.message);
          console.error('Status code:', res.statusCode);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Game page loading test failed:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Starting game play tests...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    // First ensure we have test data in the database
    const puzzlesInserted = await insertSamplePuzzles();
    
    if (puzzlesInserted) {
      // Register and login test user
      const registrationSuccess = await testRegistration();
      
      if (registrationSuccess) {
        const loginSuccess = await testLogin();
        
        if (loginSuccess) {
          // Test puzzle APIs
          await testPuzzleApis();
          
          // Test game page loading
          await testGamePageLoading();
        }
      }
    }
  } else {
    console.error('Cannot run game tests because server is not running');
  }
  
  console.log('\nGame play test execution completed');
}

// Start running the tests
runTests();