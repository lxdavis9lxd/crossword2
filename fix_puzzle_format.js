const { Puzzle } = require('./models');

async function fixPuzzleFormat() {
  try {
    console.log('Fixing puzzle formats...');
    
    // Get all puzzles
    const puzzles = await Puzzle.findAll();
    console.log(`Found ${puzzles.length} puzzles total.`);
    
    let fixedCount = 0;
    
    for (const puzzle of puzzles) {
      try {
        const puzzleData = JSON.parse(puzzle.puzzleData);
        let needsFix = false;
        
        // Check if puzzle is missing cellNumbers
        if (!puzzleData.cellNumbers) {
          console.log(`Puzzle #${puzzle.id} is missing cellNumbers`);
          puzzleData.cellNumbers = {};
          needsFix = true;
        }
        
        // If grid uses '.' for blocked cells instead of '#', standardize it
        if (puzzleData.grid && Array.isArray(puzzleData.grid)) {
          for (let i = 0; i < puzzleData.grid.length; i++) {
            if (puzzleData.grid[i] === '.') {
              puzzleData.grid[i] = '#';
              needsFix = true;
            }
          }
        }
        
        // If this puzzle needs fixing, save the updated data
        if (needsFix) {
          console.log(`Fixing puzzle #${puzzle.id}...`);
          puzzle.puzzleData = JSON.stringify(puzzleData);
          await puzzle.save();
          fixedCount++;
          console.log(`  Puzzle #${puzzle.id} fixed successfully`);
        }
      } catch (error) {
        console.error(`Error fixing puzzle #${puzzle.id}:`, error);
      }
    }
    
    console.log(`\nCompleted! Fixed ${fixedCount} puzzles.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixPuzzleFormat();
