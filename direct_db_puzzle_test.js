// Direct puzzle creation test by manipulating the database
const { Puzzle } = require('./models');

async function createTestPuzzle() {
  try {
    console.log('Creating a test puzzle directly in the database...');
    
    // Sample puzzle data
    const gridArray = [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'J'],
      ['K', 'L', 'M', 'N', 'O'],
      ['P', 'Q', 'R', 'S', 'T'],
      ['U', 'V', 'W', 'X', 'Y']
    ];
    
    const acrossClues = {
      "1": "First row clue",
      "6": "Second row clue",
      "11": "Third row clue",
      "16": "Fourth row clue",
      "21": "Fifth row clue"
    };
    
    const downClues = {
      "1": "First column clue",
      "2": "Second column clue", 
      "3": "Third column clue",
      "4": "Fourth column clue",
      "5": "Fifth column clue"
    };
    
    const puzzleData = {
      grid: gridArray,
      clues: {
        across: acrossClues,
        down: downClues
      }
    };
    
    // Create the puzzle in the database
    const puzzle = await Puzzle.create({
      title: `Direct DB Test Puzzle ${Date.now()}`,
      description: 'Created directly through the database',
      level: 'easy',
      difficultyRating: 3,
      puzzleData: JSON.stringify(puzzleData)
    });
    
    console.log('Puzzle created successfully!');
    console.log('Puzzle ID:', puzzle.id);
    console.log('Title:', puzzle.title);
    
    // List all puzzles in the database
    console.log('\nAll puzzles in database:');
    const allPuzzles = await Puzzle.findAll({
      attributes: ['id', 'title', 'level', 'createdAt']
    });
    
    allPuzzles.forEach(p => {
      console.log(`- ID: ${p.id}, Title: ${p.title}, Level: ${p.level}, Created: ${p.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error creating puzzle:', error);
  }
}

createTestPuzzle();
