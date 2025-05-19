// Test script for game progress functionality
const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'progresstest',
  email: 'progresstest@example.com',
  password: 'testpassword123'
};

// Test functions
async function runTests() {
  console.log('Starting game progress tests...');
  
  const browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for better visibility
    await page.setViewport({ width: 1280, height: 800 });
    
    // 1. Register a test user if not already registered
    await registerTestUser(page);
    
    // 2. Login with the test user
    await loginTestUser(page);
    
    // 3. Select and start a puzzle
    const puzzleId = await selectAndStartPuzzle(page);
    
    // 4. Fill in some answers in the crossword
    await fillCrosswordAnswers(page);
    
    // 5. Save game progress
    await saveGameProgress(page);
    
    // 6. Go back to dashboard
    await goToDashboard(page);
    
    // 7. Verify saved game appears in the list
    await verifySavedGameExists(page, puzzleId);
    
    // 8. Resume the saved game
    await resumeSavedGame(page, puzzleId);
    
    // 9. Verify the progress is loaded correctly
    await verifyProgressLoaded(page);
    
    console.log('✅ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

async function registerTestUser(page) {
  console.log('Registering test user (if needed)...');
  
  try {
    // Go to register page
    await page.goto(`${BASE_URL}/auth/register`);
    
    // Check if the user already exists by trying to log in first
    await page.goto(`${BASE_URL}/auth/login`);
    await page.type('#username', TEST_USER.username);
    await page.type('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ timeout: 3000 }).catch(() => {});
    
    // If we're redirected to the dashboard, the user exists
    const url = page.url();
    if (url.includes('/dashboard')) {
      console.log('User already exists, skipping registration');
      return;
    }
    
    // Otherwise, register a new user
    await page.goto(`${BASE_URL}/auth/register`);
    await page.type('#username', TEST_USER.username);
    await page.type('#email', TEST_USER.email);
    await page.type('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for registration to complete
    await page.waitForNavigation();
    console.log('User registered successfully');
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

async function loginTestUser(page) {
  console.log('Logging in test user...');
  
  try {
    // Go to login page
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Fill in login form
    await page.type('#username', TEST_USER.username);
    await page.type('#password', TEST_USER.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation();
    
    // Verify we're on the dashboard
    const url = page.url();
    if (!url.includes('/dashboard')) {
      throw new Error(`Login failed. Current URL: ${url}`);
    }
    
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function selectAndStartPuzzle(page) {
  console.log('Selecting and starting a puzzle...');
  
  try {
    // Make sure we're on the dashboard
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE_URL}/game/dashboard`);
    }
    
    // Select difficulty level (Easy)
    await page.select('#level-select', 'easy');
    
    // Wait for puzzles to load
    await page.waitForSelector('.puzzle-card', { timeout: 5000 });
    
    // Get the first puzzle ID
    const puzzleId = await page.evaluate(() => {
      const firstPuzzleCard = document.querySelector('.puzzle-card');
      return firstPuzzleCard ? firstPuzzleCard.dataset.puzzleId : null;
    });
    
    if (!puzzleId) {
      throw new Error('No puzzles available');
    }
    
    // Click on the first puzzle
    await page.click('.puzzle-card');
    
    // Click start game button
    await page.click('#start-game-btn');
    
    // Wait for game page to load
    await page.waitForNavigation();
    
    console.log(`Started puzzle #${puzzleId}`);
    return puzzleId;
  } catch (error) {
    console.error('Failed to select and start puzzle:', error);
    throw error;
  }
}

async function fillCrosswordAnswers(page) {
  console.log('Filling in some crossword answers...');
  
  try {
    // Wait for the crossword grid to load
    await page.waitForSelector('.crossword-cell input');
    
    // Get all input cells
    const inputs = await page.$$('.crossword-cell input');
    
    // Fill in a few cells with letters
    const lettersToFill = ['A', 'B', 'C', 'D', 'E'];
    
    // Fill the first 5 available cells (or fewer if there are less than 5)
    for (let i = 0; i < Math.min(5, inputs.length); i++) {
      await inputs[i].type(lettersToFill[i]);
    }
    
    console.log('Filled in some answers');
  } catch (error) {
    console.error('Failed to fill crossword answers:', error);
    throw error;
  }
}

async function saveGameProgress(page) {
  console.log('Saving game progress...');
  
  try {
    // Click the save button
    await page.click('#save-button');
    
    // Wait for the save operation to complete
    await page.waitForFunction(() => {
      // Look for success alert/message
      const alerts = Array.from(document.querySelectorAll('.message-container'));
      return alerts.some(alert => alert.textContent.includes('Game saved'));
    }, { timeout: 5000 }).catch(() => {
      // If we can't find a message, let's continue anyway but log it
      console.warn('No save confirmation message detected, but continuing...');
    });
    
    console.log('Game progress saved');
  } catch (error) {
    console.error('Failed to save game progress:', error);
    throw error;
  }
}

async function goToDashboard(page) {
  console.log('Navigating back to dashboard...');
  
  try {
    // Go back to dashboard
    await page.goto(`${BASE_URL}/game/dashboard`);
    
    // Wait for the dashboard to load
    await page.waitForSelector('#saved-games-list');
    
    console.log('Navigated to dashboard');
  } catch (error) {
    console.error('Failed to navigate to dashboard:', error);
    throw error;
  }
}

async function verifySavedGameExists(page, puzzleId) {
  console.log('Verifying saved game appears in the list...');
  
  try {
    // Wait for saved games to load
    await page.waitForFunction(() => {
      const savedGamesList = document.querySelector('#saved-games-list');
      return savedGamesList && 
        !savedGamesList.textContent.includes('Loading') && 
        !savedGamesList.textContent.includes('No saved games');
    }, { timeout: 8000 });
    
    // Check if our puzzle is in the list
    const foundPuzzle = await page.evaluate((pid) => {
      const buttons = Array.from(document.querySelectorAll('.load-saved-game-btn'));
      return buttons.some(btn => btn.dataset.puzzleId === pid);
    }, puzzleId);
    
    if (!foundPuzzle) {
      throw new Error(`Saved game for puzzle #${puzzleId} not found in the list`);
    }
    
    console.log('Saved game verified in list');
  } catch (error) {
    console.error('Failed to verify saved game exists:', error);
    throw error;
  }
}

async function resumeSavedGame(page, puzzleId) {
  console.log('Resuming saved game...');
  
  try {
    // Find and click the resume button for our puzzle
    const resumeButtonSelector = `.load-saved-game-btn[data-puzzle-id="${puzzleId}"]`;
    await page.waitForSelector(resumeButtonSelector);
    await page.click(resumeButtonSelector);
    
    // Wait for game page to load
    await page.waitForNavigation();
    
    // Verify we're on the game page
    if (!page.url().includes('/game?puzzleId=')) {
      throw new Error('Failed to navigate to game page');
    }
    
    console.log('Resumed saved game');
  } catch (error) {
    console.error('Failed to resume saved game:', error);
    throw error;
  }
}

async function verifyProgressLoaded(page) {
  console.log('Verifying saved progress is loaded...');
  
  try {
    // Wait for the crossword grid to load
    await page.waitForSelector('.crossword-cell input');
    
    // Check if any inputs have values (our progress)
    const hasProgress = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('.crossword-cell input'));
      return inputs.some(input => input.value.trim() !== '');
    });
    
    if (!hasProgress) {
      throw new Error('No saved progress was loaded');
    }
    
    console.log('Verified saved progress was loaded successfully');
  } catch (error) {
    console.error('Failed to verify progress loaded:', error);
    throw error;
  }
}

// Run the tests
runTests().catch(console.error);
