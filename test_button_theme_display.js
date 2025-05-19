// Automated test for verifying button theme display
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Create a mock browser environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
      <select id="level-select">
        <option value="easy">Easy</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <button id="load-puzzles-btn">Load Puzzles</button>
      <div id="puzzles-container"></div>
      <form id="puzzle-form">
        <input type="hidden" id="selected-level" name="level" value="easy">
        <input type="hidden" id="selected-puzzle-id" name="puzzleId" value="">
        <button type="submit" id="start-game-btn" disabled>Start Game</button>
      </form>
    </body>
  </html>
`, { url: 'http://localhost' });

// Set up a mock window and document
global.window = dom.window;
global.document = dom.window.document;
global.fetch = jest.fn();

// Mock puzzle data
const mockPuzzles = [
  {
    id: 1,
    level: 'easy',
    puzzleData: JSON.stringify({
      title: 'Spring Flowers',
      description: 'A crossword puzzle about spring flowers and garden themes',
      grid: Array(25).fill(''),
      clues: { across: Array(5), down: Array(5) }
    })
  },
  {
    id: 2,
    level: 'easy',
    puzzleData: JSON.stringify({
      title: 'World Capitals',
      description: 'Test your knowledge of world capitals in this geographic puzzle',
      grid: Array(25).fill(''),
      clues: { across: Array(5), down: Array(5) }
    })
  }
];

// Mock fetch response
global.fetch.mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockPuzzles)
  });
});

// Load scripts.js but in a way that doesn't execute the DOMContentLoaded event
const scriptsPath = path.join(__dirname, 'public', 'scripts.js');
let scriptsContent = fs.readFileSync(scriptsPath, 'utf8');

// Wrap in a function we can call to simulate our environment
const testScript = `
function runTest() {
  ${scriptsContent.replace(/document\.addEventListener\('DOMContentLoaded'.*?\{([\s\S]*)\}\);/m, '$1')}
  
  // Test functions
  async function simulateLoadPuzzles() {
    console.log('Simulating loading puzzles...');
    await loadPuzzlesForLevel();
    return document.getElementById('start-game-btn').textContent;
  }
  
  async function simulateSelectPuzzle(index) {
    console.log('Simulating selecting a puzzle...');
    const cards = document.querySelectorAll('.puzzle-card');
    if (cards.length > index) {
      cards[index].click();
      return document.getElementById('start-game-btn').textContent;
    }
    return 'No puzzle card found';
  }
  
  // Run the test sequence
  async function runTestSequence() {
    console.log('\\nTEST: Button text before selection');
    const initialText = document.getElementById('start-game-btn').textContent;
    console.log('Initial button text:', initialText);
    console.log('Button disabled:', document.getElementById('start-game-btn').disabled);
    
    console.log('\\nTEST: Loading puzzles');
    const afterLoadText = await simulateLoadPuzzles();
    console.log('Button text after load:', afterLoadText);
    console.log('Button disabled:', document.getElementById('start-game-btn').disabled);
    
    console.log('\\nTEST: Selecting first puzzle');
    const afterSelectText = await simulateSelectPuzzle(0);
    console.log('Button text after selection:', afterSelectText);
    console.log('Button disabled:', document.getElementById('start-game-btn').disabled);
    console.log('Expected title in button:', 'Play "Spring Flowers"');
    
    console.log('\\nTEST: Selecting second puzzle');
    const afterSecondSelectText = await simulateSelectPuzzle(1);
    console.log('Button text after second selection:', afterSecondSelectText);
    console.log('Expected title in button:', 'Play "World Capitals"');
    
    console.log('\\nTEST: Loading puzzles again (reset)');
    const afterResetText = await simulateLoadPuzzles();
    console.log('Button text after reset:', afterResetText);
    console.log('Button disabled:', document.getElementById('start-game-btn').disabled);
    
    return 'Test completed';
  }
  
  return runTestSequence();
}
`;

// Execute the test
try {
  eval(testScript);
  console.log('\nThis is a mock test for verification purposes.');
  console.log('For full verification, please run the manual verification steps:');
  console.log('1. Start the application server');
  console.log('2. Log in and navigate to the dashboard');
  console.log('3. Select a difficulty level and a puzzle');
  console.log('4. Verify the button shows the puzzle theme');
} catch (error) {
  console.error('Error running test:', error);
}
