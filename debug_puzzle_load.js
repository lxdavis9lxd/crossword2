const { Puzzle } = require('./models');

async function debugPuzzleLoad() {
  try {
    // Get puzzles 16, 17, 18
    const puzzleIds = [16, 17, 18];
    
    for (const id of puzzleIds) {
      console.log(`\n=== Debugging Puzzle #${id} ===`);
      
      const puzzle = await Puzzle.findByPk(id);
      if (!puzzle) {
        console.log(`Puzzle #${id} not found!`);
        continue;
      }
      
      console.log('Title:', puzzle.title);
      console.log('Level:', puzzle.level);
      
      try {
        const puzzleData = JSON.parse(puzzle.puzzleData);
        console.log('Successfully parsed puzzleData');
        
        // Check grid
        console.log('Grid exists:', !!puzzleData.grid);
        if (puzzleData.grid) {
          console.log('Grid type:', typeof puzzleData.grid);
          console.log('Grid is array?', Array.isArray(puzzleData.grid));
          console.log('Grid length:', puzzleData.grid.length);
        }
        
        // Check cell numbers
        console.log('Cell numbers exist?', !!puzzleData.cellNumbers);
        
        // Check clues
        console.log('Clues exist?', !!puzzleData.clues);
        if (puzzleData.clues) {
          console.log('Across clues exist?', !!puzzleData.clues.across);
          console.log('Down clues exist?', !!puzzleData.clues.down);
        }
      } catch (error) {
        console.error('Error parsing puzzleData:', error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

debugPuzzleLoad();
