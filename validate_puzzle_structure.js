const { Puzzle } = require('./models');

async function validatePuzzleStructure() {
  try {
    console.log('Fetching all puzzles from database...');
    const puzzles = await Puzzle.findAll();
    console.log(`Found ${puzzles.length} puzzles.`);
    
    if (puzzles.length === 0) {
      console.log('No puzzles found in database.');
      return;
    }
    
    for (let i = 0; i < puzzles.length; i++) {
      const puzzle = puzzles[i];
      console.log(`\n=== Analyzing Puzzle #${i + 1} (ID: ${puzzle.id}) ===`);
      console.log(`Title: ${puzzle.title}`);
      console.log(`Level: ${puzzle.level}`);
      
      try {
        const puzzleData = JSON.parse(puzzle.puzzleData);
        console.log('Grid exists:', !!puzzleData.grid);
        
        if (puzzleData.grid) {
          if (Array.isArray(puzzleData.grid)) {
            console.log('Grid is an array of length:', puzzleData.grid.length);
            console.log('Sample grid cells:', puzzleData.grid.slice(0, 5));
          } else {
            console.log('WARNING: Grid is not an array!');
          }
        }
        
        console.log('Clues exist:', !!puzzleData.clues);
        
        if (puzzleData.clues) {
          console.log('Across clues exist:', !!puzzleData.clues.across);
          console.log('Down clues exist:', !!puzzleData.clues.down);
          
          if (puzzleData.clues.across) {
            if (Array.isArray(puzzleData.clues.across)) {
              console.log('Across clues is an array of length:', puzzleData.clues.across.length);
              if (puzzleData.clues.across.length > 0) {
                console.log('First across clue format:', JSON.stringify(puzzleData.clues.across[0]));
              }
            } else {
              console.log('WARNING: Across clues is NOT an array!');
              console.log('Across clues format:', typeof puzzleData.clues.across);
              console.log('Across clues sample:', JSON.stringify(puzzleData.clues.across));
            }
          }
          
          if (puzzleData.clues.down) {
            if (Array.isArray(puzzleData.clues.down)) {
              console.log('Down clues is an array of length:', puzzleData.clues.down.length);
              if (puzzleData.clues.down.length > 0) {
                console.log('First down clue format:', JSON.stringify(puzzleData.clues.down[0]));
              }
            } else {
              console.log('WARNING: Down clues is NOT an array!');
              console.log('Down clues format:', typeof puzzleData.clues.down);
              console.log('Down clues sample:', JSON.stringify(puzzleData.clues.down));
            }
          }
        }
      } catch (err) {
        console.error(`Error parsing puzzle data for puzzle ${puzzle.id}:`, err);
      }
    }
    
    console.log('\n=== Validation Complete ===');
    
  } catch (error) {
    console.error('Error during puzzle validation:', error);
  } finally {
    process.exit(0);
  }
}

validatePuzzleStructure();
