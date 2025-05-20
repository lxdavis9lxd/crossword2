// filepath: /workspaces/crossword2/check_grid_format.js
const { Puzzle } = require('./models');

async function checkGridFormat() {
  try {
    // Get puzzles 16, 17, 18
    const puzzleIds = [16, 17, 18];
    for (const id of puzzleIds) {
      console.log(`\n=== Checking Puzzle #${id} ===`);
      
      const puzzle = await Puzzle.findByPk(id);
      if (!puzzle) {
        console.log(`Puzzle #${id} not found!`);
        continue;
      }
      
      const puzzleData = JSON.parse(puzzle.puzzleData);
      
      // Check grid format
      console.log('Grid type:', typeof puzzleData.grid);
      console.log('Is array?', Array.isArray(puzzleData.grid));
      console.log('Grid length:', puzzleData.grid ? puzzleData.grid.length : 'undefined');
      console.log('First few grid cells:', puzzleData.grid ? puzzleData.grid.slice(0, 5) : 'undefined');
      
      // Check cell numbers
      console.log('Cell numbers exists:', !!puzzleData.cellNumbers);
      if (puzzleData.cellNumbers) {
        console.log('Cell numbers type:', typeof puzzleData.cellNumbers);
        console.log('Cell numbers sample:', 
          typeof puzzleData.cellNumbers === 'object' ? 
            JSON.stringify(puzzleData.cellNumbers).substring(0, 100) + '...' : 
            'Not an object');
      } else {
        console.log('No cellNumbers property found!');
      }
      
      // Check clues structure one more time
      if (puzzleData.clues) {
        console.log('\nAcross clues type:', typeof puzzleData.clues.across);
        console.log('Is array?', Array.isArray(puzzleData.clues.across));
        
        console.log('\nDown clues type:', typeof puzzleData.clues.down);
        console.log('Is array?', Array.isArray(puzzleData.clues.down));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkGridFormat();
