/**
 * Script to verify puzzle titles and descriptions
 */
const { Puzzle } = require('./models');

async function verifyPuzzles() {
  try {
    console.log('Connecting to database...');
    
    // Get all puzzles
    const puzzles = await Puzzle.findAll();
    console.log(`Found ${puzzles.length} puzzles in total.`);
    
    // Display puzzle information
    puzzles.forEach(puzzle => {
      const puzzleData = JSON.parse(puzzle.puzzleData);
      console.log(`\nPuzzle ID: ${puzzle.id}`);
      console.log(`Title: ${puzzle.title}`);
      console.log(`Level: ${puzzle.level}`);
      console.log(`Database title: ${puzzle.title}`);
      console.log(`JSON title: ${puzzleData.title}`);
      
      // Check grid size
      const gridSize = Math.sqrt(puzzleData.grid.length);
      console.log(`Grid size: ${gridSize}x${gridSize}`);
      
      // Check clue counts
      let acrossCount = 0;
      let downCount = 0;
      
      if (puzzleData.clues) {
        if (Array.isArray(puzzleData.clues.across)) {
          acrossCount = puzzleData.clues.across.length;
        } else if (typeof puzzleData.clues.across === 'object') {
          acrossCount = Object.keys(puzzleData.clues.across).length;
        }
        
        if (Array.isArray(puzzleData.clues.down)) {
          downCount = puzzleData.clues.down.length;
        } else if (typeof puzzleData.clues.down === 'object') {
          downCount = Object.keys(puzzleData.clues.down).length;
        }
      }
      
      console.log(`Clue counts: ${acrossCount} across, ${downCount} down`);
      
      // Check cell numbers
      const cellNumbersCount = puzzleData.cellNumbers ? Object.keys(puzzleData.cellNumbers).length : 0;
      console.log(`Cell numbers count: ${cellNumbersCount}`);
    });
    
  } catch (error) {
    console.error('Error verifying puzzles:', error);
  }
}

// Run the function
verifyPuzzles();
