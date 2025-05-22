/**
 * Script to update puzzle difficulty levels to match frontend options
 */
const { Puzzle } = require('./models');

async function updatePuzzleDifficulties() {
  try {
    console.log('Connecting to database...');
    
    // Get all puzzles
    const puzzles = await Puzzle.findAll();
    console.log(`Found ${puzzles.length} puzzles in total.`);
    
    // Count puzzles by current difficulty
    const difficultyCount = {};
    puzzles.forEach(puzzle => {
      difficultyCount[puzzle.level] = (difficultyCount[puzzle.level] || 0) + 1;
    });
    
    console.log('Current puzzle difficulties:');
    console.log(difficultyCount);
    
    // No changes needed if the levels already match our options
    if (Object.keys(difficultyCount).every(level => ['easy', 'medium', 'hard', 'expert'].includes(level))) {
      console.log('All puzzle difficulty levels are already correctly named. No changes needed.');
      return;
    }
    
    // Map old difficulty names to new ones
    const difficultyMap = {
      'easy': 'easy',
      'medium': 'medium',
      'intermediate': 'medium',
      'hard': 'hard',
      'advanced': 'hard',
      'expert': 'expert'
    };
    
    // Track updates
    let updatedCount = 0;
    
    // Update each puzzle if needed
    for (const puzzle of puzzles) {
      const oldLevel = puzzle.level;
      const newLevel = difficultyMap[oldLevel];
      
      if (newLevel && oldLevel !== newLevel) {
        puzzle.level = newLevel;
        await puzzle.save();
        console.log(`Updated puzzle ${puzzle.id} from "${oldLevel}" to "${newLevel}"`);
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} puzzles.`);
    
    // Verify new counts
    const updatedPuzzles = await Puzzle.findAll();
    const newDifficultyCount = {};
    updatedPuzzles.forEach(puzzle => {
      newDifficultyCount[puzzle.level] = (newDifficultyCount[puzzle.level] || 0) + 1;
    });
    
    console.log('Updated puzzle difficulties:');
    console.log(newDifficultyCount);
    
  } catch (error) {
    console.error('Error updating puzzle difficulties:', error);
  }
}

// Run the function
updatePuzzleDifficulties();
