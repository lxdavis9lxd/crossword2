// Script to check puzzles with titles and descriptions
const { Puzzle } = require('./models');

async function checkPuzzles() {
  try {
    console.log('Checking puzzles in the database...');
    
    const puzzles = await Puzzle.findAll();
    
    if (puzzles.length === 0) {
      console.log('No puzzles found in the database');
      return;
    }
    
    console.log(`Found ${puzzles.length} puzzles:`);
    
    for (const puzzle of puzzles) {
      try {
        const data = JSON.parse(puzzle.puzzleData);
        console.log(`- Puzzle #${puzzle.id}, Level: ${puzzle.level}`);
        console.log(`  Title: ${data.title || 'No title'}`);
        console.log(`  Description: ${data.description ? data.description.substring(0, 50) + (data.description.length > 50 ? '...' : '') : 'No description'}`);
        console.log('');
      } catch (e) {
        console.log(`- Puzzle #${puzzle.id}, Level: ${puzzle.level} (Error parsing data)`);
        console.error(e);
      }
    }
  } catch (error) {
    console.error('Error checking puzzles:', error);
  } finally {
    // Allow logs to flush before exiting
    setTimeout(() => process.exit(), 1000);
  }
}

// Run the function
checkPuzzles();
