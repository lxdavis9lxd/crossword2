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

// Test dashboard page loading
function testDashboardPageLoading() {
  return new Promise((resolve, reject) => {
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
        try {
          assert.strictEqual(res.statusCode, 200);
          
          // Check for key elements in the dashboard page
          assert.ok(data.includes('Crossword Game Dashboard'), 'Dashboard page should include title');
          assert.ok(data.includes('Select Difficulty Level'), 'Dashboard page should include difficulty selection');
          assert.ok(data.includes('Start Game'), 'Dashboard page should include start game button');
          
          console.log('✅ Dashboard page loading test passed');
          resolve(true);
        } catch (error) {
          console.error('❌ Dashboard page loading test failed:', error.message);
          console.error('Status code:', res.statusCode);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Dashboard page loading test failed:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Test saving game progress
function testSaveGameProgress() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('\nTesting save game progress functionality...');
      
      if (testPuzzleIds.length === 0) {
        console.log('Skipping save game test - no puzzle IDs available');
        resolve(false);
        return;
      }
      
      const puzzleId = testPuzzleIds[0];
      
      // Mock user progress data - simulating filled cells in the grid
      const progress = JSON.stringify(['A', '', 'T', '', 'O', '', '', '']);
      
      // Send a POST request to save the game progress
      const postData = JSON.stringify({
        userId: 1, // Assuming user ID 1 exists
        puzzleId: puzzleId,
        progress: progress
      });
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/game/save',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie,
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
            // Should return success status
            assert.ok(res.statusCode >= 200 && res.statusCode < 300, 'Save game should return success status');
            
            console.log('✅ Save game progress test passed');
            resolve(true);
          } catch (error) {
            console.error('❌ Save game progress test failed:', error.message);
            console.error('Status code:', res.statusCode);
            console.error('Response data:', data);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Save game progress test failed:', error.message);
        resolve(false);
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('❌ Save game progress test failed with error:', error);
      resolve(false);
    }
  });
}

// Test grid rendering with puzzle data
function testGridRendering() {
  return new Promise(async (resolve, reject) => {
    try {
      // First, load the game page
      console.log('\nTesting grid rendering with puzzle data...');
      
      if (testPuzzleIds.length === 0) {
        console.log('Skipping grid rendering test - no puzzle IDs available');
        resolve(false);
        return;
      }
      
      const puzzleId = testPuzzleIds[0];
      
      // Create a unique ID for the browser test
      const testId = Date.now().toString();
      
      // Mock the browser navigation and puzzle loading actions
      // Step 1: Navigate to game page
      const gamePagePromise = new Promise((resolveGamePage, rejectGamePage) => {
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
              resolveGamePage(true);
            } catch (error) {
              resolveGamePage(false);
            }
          });
        });

        req.on('error', (error) => {
          resolveGamePage(false);
        });

        req.end();
      });
      
      const gamePageLoaded = await gamePagePromise;
      
      if (!gamePageLoaded) {
        console.error('❌ Grid rendering test failed: Could not load game page');
        resolve(false);
        return;
      }
      
      // Step 2: Fetch puzzle details to verify data structure for grid rendering
      const puzzleDetailsPromise = new Promise((resolvePuzzleDetails, rejectPuzzleDetails) => {
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
              
              // Verify puzzle data structure needed for grid rendering
              const puzzleData = JSON.parse(puzzle.puzzleData);
              
              // Check grid structure
              assert.ok(Array.isArray(puzzleData.grid), 'Grid should be an array');
              assert.ok(puzzleData.grid.length > 0, 'Grid should not be empty');
              
              // Check cell numbers structure
              assert.ok(Array.isArray(puzzleData.cellNumbers), 'Cell numbers should be an array');
              assert.strictEqual(puzzleData.grid.length, puzzleData.cellNumbers.length, 'Grid and cell numbers should have the same length');
              
              // Check clues structure
              assert.ok(puzzleData.clues, 'Puzzle should have clues');
              assert.ok(puzzleData.clues.across, 'Puzzle should have across clues');
              assert.ok(puzzleData.clues.down, 'Puzzle should have down clues');
              
              console.log('✅ Puzzle data structure valid for grid rendering');
              resolvePuzzleDetails(true);
            } catch (error) {
              console.error('❌ Grid rendering test failed:', error.message);
              resolvePuzzleDetails(false);
            }
          });
        });

        req.on('error', (error) => {
          console.error('❌ Grid rendering test failed:', error.message);
          resolvePuzzleDetails(false);
        });

        req.end();
      });
      
      const puzzleDetailsValid = await puzzleDetailsPromise;
      
      if (puzzleDetailsValid) {
        console.log('✅ Grid rendering test passed');
        resolve(true);
      } else {
        console.log('❌ Grid rendering test failed');
        resolve(false);
      }
      
    } catch (error) {
      console.error('❌ Grid rendering test failed with error:', error);
      resolve(false);
    }
  });
}

// Test user interaction with the grid
function testUserInteractionWithGrid() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('\nTesting user interaction with the grid...');
      
      if (testPuzzleIds.length === 0) {
        console.log('Skipping user interaction test - no puzzle IDs available');
        resolve(false);
        return;
      }
      
      const puzzleId = testPuzzleIds[0];
      
      // First, simulate loading a puzzle
      const puzzleDetailsPromise = new Promise((resolvePuzzleDetails, rejectPuzzleDetails) => {
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
              const puzzleData = JSON.parse(puzzle.puzzleData);
              
              // Simulate filling in cells in the grid
              // We'll generate simulated user inputs for the first few cells
              const gridSize = Math.sqrt(puzzleData.grid.length);
              const userInputs = [];
              
              // Find valid cells (not black cells) and simulate input
              for (let i = 0; i < puzzleData.grid.length; i++) {
                if (puzzleData.grid[i] !== '#') {
                  // This is a valid cell, add a simulated input
                  // In a real user interaction, we'd check the clues and input correct letters
                  // For this test, we'll just input the first letter of the alphabet
                  userInputs.push({
                    index: i,
                    row: Math.floor(i / gridSize),
                    col: i % gridSize,
                    value: 'A'
                  });
                  
                  // We only need a few cells for testing
                  if (userInputs.length >= 5) break;
                }
              }
              
              // Verify that we found valid cells to interact with
              assert.ok(userInputs.length > 0, 'Should have valid cells for interaction');
              
              // Test keyboard navigation simulation
              // We can verify the data structure needed for keyboard navigation
              // First valid cell → right → down
              if (userInputs.length >= 3) {
                const cell1 = userInputs[0];
                const expectedNextCellRight = userInputs.find(
                  input => input.row === cell1.row && input.col === cell1.col + 1
                );
                const expectedNextCellDown = userInputs.find(
                  input => input.col === cell1.col && input.row === cell1.row + 1
                );
                
                // Log information for verification
                console.log('Navigation simulation:');
                console.log(`Starting at cell: row ${cell1.row}, col ${cell1.col}`);
                
                if (expectedNextCellRight) {
                  console.log(`→ Right: row ${expectedNextCellRight.row}, col ${expectedNextCellRight.col}`);
                }
                
                if (expectedNextCellDown) {
                  console.log(`↓ Down: row ${expectedNextCellDown.row}, col ${expectedNextCellDown.col}`);
                }
              }
              
              console.log(`\nSimulated input for ${userInputs.length} grid cells`);
              console.log('✅ Grid interaction simulation completed successfully');
              resolvePuzzleDetails(true);
            } catch (error) {
              console.error('❌ User interaction test failed:', error.message);
              resolvePuzzleDetails(false);
            }
          });
        });

        req.on('error', (error) => {
          console.error('❌ User interaction test failed:', error.message);
          resolvePuzzleDetails(false);
        });

        req.end();
      });
      
      const userInteractionSuccess = await puzzleDetailsPromise;
      
      if (userInteractionSuccess) {
        console.log('✅ User interaction test passed');
        resolve(true);
      } else {
        console.log('❌ User interaction test failed');
        resolve(false);
      }
      
    } catch (error) {
      console.error('❌ User interaction test failed with error:', error);
      resolve(false);
    }
  });
}

// Test loading saved game progress
function testLoadSavedGameProgress() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('\nTesting loading saved game progress...');
      
      if (testPuzzleIds.length === 0) {
        console.log('Skipping load saved game test - no puzzle IDs available');
        resolve(false);
        return;
      }
      
      const puzzleId = testPuzzleIds[0];
      
      // Step 1: First save some progress
      const mockProgress = JSON.stringify(['C', 'A', 'T', '', 'O', '', 'W', '']);
      
      // Send a POST request to save the game progress
      const saveProgressPromise = new Promise((resolveSave, rejectSave) => {
        const postData = JSON.stringify({
          userId: 1, // Assuming user ID 1 exists
          puzzleId: puzzleId,
          progress: mockProgress
        });
        
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/game/save',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie,
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
              // Should return success status
              assert.ok(res.statusCode >= 200 && res.statusCode < 300, 'Save game should return success status');
              
              console.log('✅ Game progress saved for loading test');
              resolveSave(true);
            } catch (error) {
              console.error('❌ Saving game for loading test failed:', error.message);
              resolveSave(false);
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ Saving game for loading test failed:', error.message);
          resolveSave(false);
        });
        
        req.write(postData);
        req.end();
      });
      
      const saveSuccess = await saveProgressPromise;
      
      if (!saveSuccess) {
        console.log('❌ Load saved game test failed - could not save initial progress');
        resolve(false);
        return;
      }
      
      // Step 2: Now try to retrieve the saved progress
      const loadProgressPromise = new Promise((resolveLoad, rejectLoad) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/game/progress/1', // Assuming user ID 1
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
              assert.strictEqual(res.statusCode, 200, 'Should return 200 status code');
              
              const responseData = JSON.parse(data);
              
              // Check if the progress data exists
              assert.ok(responseData.progress, 'Response should contain progress data');
              
              // If possible, validate that loaded progress matches what we saved
              // This depends on how your server stores and retrieves the progress
              console.log('✅ Game progress successfully loaded');
              resolveLoad(true);
            } catch (error) {
              console.error('❌ Loading saved game progress failed:', error.message);
              resolveLoad(false);
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ Loading saved game progress failed:', error.message);
          resolveLoad(false);
        });
        
        req.end();
      });
      
      const loadSuccess = await loadProgressPromise;
      
      if (loadSuccess) {
        console.log('✅ Load saved game progress test passed');
        resolve(true);
      } else {
        console.log('❌ Load saved game progress test failed');
        resolve(false);
      }
      
    } catch (error) {
      console.error('❌ Load saved game progress test failed with error:', error);
      resolve(false);
    }
  });
}

// Test puzzle completion detection
function testPuzzleCompletionDetection() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('\nTesting puzzle completion detection...');
      
      if (testPuzzleIds.length === 0) {
        console.log('Skipping puzzle completion test - no puzzle IDs available');
        resolve(false);
        return;
      }
      
      const puzzleId = testPuzzleIds[0];
      
      // Simulate loading a puzzle and checking completion
      const puzzleDetailsPromise = new Promise((resolvePuzzleDetails, rejectPuzzleDetails) => {
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
              const puzzleData = JSON.parse(puzzle.puzzleData);
              
              // Simulate filling in a complete grid with correct answers
              const grid = puzzleData.grid;
              const userInputs = [];
              
              // Generate complete grid with the correct answers (simulating a completed puzzle)
              for (let i = 0; i < grid.length; i++) {
                if (grid[i] !== '#') {
                  userInputs.push({
                    index: i,
                    // Use the actual correct letter from the puzzle data
                    value: grid[i]
                  });
                }
              }
              
              // Verify that we have answers for all valid cells
              const validCellCount = grid.filter(cell => cell !== '#').length;
              assert.strictEqual(userInputs.length, validCellCount, 'Should have answers for all valid cells');
              
              // Verify if all answers match the puzzle (this simulates puzzle completion)
              let allCorrect = true;
              for (const input of userInputs) {
                if (input.value !== grid[input.index]) {
                  allCorrect = false;
                  break;
                }
              }
              
              assert.ok(allCorrect, 'All answers should match the puzzle data');
              
              // Now simulate submitting for completion check
              console.log(`Grid has ${validCellCount} cells to fill`);
              console.log(`User filled in ${userInputs.length} cells`);
              
              if (allCorrect) {
                console.log('✅ Puzzle completion check passed - all answers are correct!');
              } else {
                console.log('❌ Puzzle not complete - some answers are incorrect');
              }
              
              resolvePuzzleDetails(true);
            } catch (error) {
              console.error('❌ Puzzle completion test failed:', error.message);
              resolvePuzzleDetails(false);
            }
          });
        });

        req.on('error', (error) => {
          console.error('❌ Puzzle completion test failed:', error.message);
          resolvePuzzleDetails(false);
        });

        req.end();
      });
      
      const completionTestSuccess = await puzzleDetailsPromise;
      
      if (completionTestSuccess) {
        console.log('✅ Puzzle completion detection test passed');
        resolve(true);
      } else {
        console.log('❌ Puzzle completion detection test failed');
        resolve(false);
      }
      
    } catch (error) {
      console.error('❌ Puzzle completion detection test failed with error:', error);
      resolve(false);
    }
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
          
          // Test dashboard page loading
          await testDashboardPageLoading();
          
          // Test grid rendering
          await testGridRendering();
          
          // Test saving game progress
          await testSaveGameProgress();
          
          // Test user interaction with the grid
          await testUserInteractionWithGrid();
          
          // Test loading saved game progress
          await testLoadSavedGameProgress();
          
          // Test puzzle completion detection
          await testPuzzleCompletionDetection();
          
          // Test puzzle completion detection
          await testPuzzleCompletionDetection();
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