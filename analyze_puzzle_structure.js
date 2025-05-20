// Analyze puzzle structure in database
const { Puzzle } = require('./models');

async function analyzePuzzleStructure() {
  try {
    console.log('Analyzing puzzle structure in database...');
    
    // Get a recent puzzle
    const puzzle = await Puzzle.findOne({
      order: [['createdAt', 'DESC']]
    });
    
    if (!puzzle) {
      console.log('No puzzles found in database.');
      return;
    }
    
    console.log('Found puzzle:', {
      id: puzzle.id,
      title: puzzle.title,
      level: puzzle.level,
      createdAt: puzzle.createdAt
    });
    
    // Parse puzzle data
    try {
      const puzzleData = JSON.parse(puzzle.puzzleData);
      console.log('\nPuzzle Data Structure:');
      console.log(JSON.stringify(puzzleData, null, 2));
      
      // Check clues structure specifically
      console.log('\nClues Structure:');
      if (puzzleData.clues) {
        console.log('Clues object exists.');
        console.log('Across clues:', puzzleData.clues.across ? 'exists' : 'missing');
        console.log('Down clues:', puzzleData.clues.down ? 'exists' : 'missing');
        
        if (puzzleData.clues.across) {
          console.log('\nAcross clues type:', typeof puzzleData.clues.across);
          if (Array.isArray(puzzleData.clues.across)) {
            console.log('Across clues is an array with length:', puzzleData.clues.across.length);
            console.log('First across clue:', puzzleData.clues.across[0]);
          } else {
            console.log('Across clues object keys:', Object.keys(puzzleData.clues.across));
            console.log('Across clues sample:', JSON.stringify(puzzleData.clues.across));
          }
        }
        
        if (puzzleData.clues.down) {
          console.log('\nDown clues type:', typeof puzzleData.clues.down);
          if (Array.isArray(puzzleData.clues.down)) {
            console.log('Down clues is an array with length:', puzzleData.clues.down.length);
            console.log('First down clue:', puzzleData.clues.down[0]);
          } else {
            console.log('Down clues object keys:', Object.keys(puzzleData.clues.down));
            console.log('Down clues sample:', JSON.stringify(puzzleData.clues.down));
          }
        }
      } else {
        console.log('Clues object is missing!');
      }
      
      // Check grid structure
      console.log('\nGrid Structure:');
      if (puzzleData.grid) {
        console.log('Grid type:', typeof puzzleData.grid);
        if (Array.isArray(puzzleData.grid)) {
          console.log('Grid is an array with length:', puzzleData.grid.length);
          if (Array.isArray(puzzleData.grid[0])) {
            console.log('Grid appears to be 2D array:', puzzleData.grid.length + 'x' + puzzleData.grid[0].length);
          } else {
            console.log('Grid appears to be 1D array:', puzzleData.grid.length);
            console.log('Sample grid data:', JSON.stringify(puzzleData.grid.slice(0, 10)));
          }
        } else {
          console.log('Grid is not an array:', typeof puzzleData.grid);
        }
      } else {
        console.log('Grid is missing!');
      }
      
    } catch (parseError) {
      console.error('Error parsing puzzle data:', parseError);
      console.log('Raw puzzle data:', puzzle.puzzleData);
    }
    
  } catch (error) {
    console.error('Error analyzing puzzle structure:', error);
  }
}

analyzePuzzleStructure();
