const db = require('./models');
const { Puzzle } = db;

async function updatePuzzleDifficulty() {
  try {
    // Get all puzzles
    const puzzles = await Puzzle.findAll();
    
    console.log(`Found ${puzzles.length} puzzles to update.`);
    
    // Assign difficulty ratings based on level and grid size
    for (const puzzle of puzzles) {
      const puzzleData = JSON.parse(puzzle.puzzleData);
      const gridSize = Math.sqrt(puzzleData.grid.length);
      
      // Calculate difficulty rating based on level and grid size
      let difficultyRating = 1; // Default
      
      // Base difficulty by level
      if (puzzle.level === 'easy') {
        difficultyRating = 1;
      } else if (puzzle.level === 'intermediate') {
        difficultyRating = 3;
      } else if (puzzle.level === 'advanced') {
        difficultyRating = 4;
      }
      
      // Adjust for grid size
      if (gridSize >= 15) {
        difficultyRating += 1;
      }
      
      // Cap at 5
      difficultyRating = Math.min(difficultyRating, 5);
      
      // Update the puzzle
      puzzle.difficultyRating = difficultyRating;
      await puzzle.save();
      
      console.log(`Updated puzzle #${puzzle.id}: ${puzzle.level} level with ${gridSize}x${gridSize} grid - Set difficulty rating to ${difficultyRating}`);
    }
    
    console.log('All puzzles updated successfully!');
  } catch (error) {
    console.error('Error updating puzzle difficulty ratings:', error);
  } finally {
    process.exit();
  }
}

// Run the function
updatePuzzleDifficulty();
