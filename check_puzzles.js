const { Puzzle } = require('./models');

async function checkPuzzles() {
  try {
    // Count puzzles by level
    const easyCount = await Puzzle.count({ where: { level: 'easy' } });
    const intermediateCount = await Puzzle.count({ where: { level: 'intermediate' } });
    const advancedCount = await Puzzle.count({ where: { level: 'advanced' } });
    
    console.log('Puzzle counts:');
    console.log('- Easy:', easyCount);
    console.log('- Intermediate:', intermediateCount);
    console.log('- Advanced:', advancedCount);
    console.log('- Total:', easyCount + intermediateCount + advancedCount);
    
    // Fetch one puzzle of each level as a sample
    if (easyCount > 0) {
      const easyPuzzle = await Puzzle.findOne({ where: { level: 'easy' } });
      console.log('\nSample Easy Puzzle (ID', easyPuzzle.id, '):');
      console.log('- Created at:', easyPuzzle.createdAt);
      
      // Parse the puzzle data to show some basic info
      try {
        const puzzleData = JSON.parse(easyPuzzle.puzzleData);
        console.log('- Grid size:', Math.sqrt(puzzleData.grid.length), 'x', Math.sqrt(puzzleData.grid.length));
        console.log('- Across clues:', puzzleData.clues.across.length);
        console.log('- Down clues:', puzzleData.clues.down.length);
      } catch (e) {
        console.error('Error parsing puzzle data:', e);
      }
    }
    
  } catch (error) {
    console.error('Error checking puzzles:', error);
  } finally {
    // Exit the script
    process.exit();
  }
}

// Run the function
checkPuzzles();
