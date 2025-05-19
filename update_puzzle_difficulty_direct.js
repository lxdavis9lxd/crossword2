const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // Get all puzzles
  db.all("SELECT id, level, puzzleData FROM Puzzles", (err, puzzles) => {
    if (err) {
      console.error("Error fetching puzzles:", err);
      db.close();
      return;
    }
    
    console.log(`Found ${puzzles.length} puzzles to update.`);
    
    // Prepare the update statement
    const updateStmt = db.prepare(`
      UPDATE Puzzles SET difficultyRating = ? WHERE id = ?
    `);
    
    // Process each puzzle
    puzzles.forEach(puzzle => {
      try {
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
        updateStmt.run(difficultyRating, puzzle.id);
        
        console.log(`Updated puzzle #${puzzle.id}: ${puzzle.level} level with ${gridSize}x${gridSize} grid - Set difficulty rating to ${difficultyRating}`);
      } catch (error) {
        console.error(`Error processing puzzle #${puzzle.id}:`, error);
      }
    });
    
    // Finalize the statement
    updateStmt.finalize();
    
    // Verify the updates
    db.all("SELECT id, level, difficultyRating FROM Puzzles", (err, results) => {
      if (err) {
        console.error("Error verifying difficulty ratings:", err);
      } else {
        console.log("\nDifficulty ratings updated successfully!");
        console.log("\nRating Summary:");
        
        // Group by difficulty rating
        const ratingCounts = {};
        results.forEach(result => {
          const rating = result.difficultyRating || 'unset';
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });
        
        // Display summary
        Object.keys(ratingCounts).sort().forEach(rating => {
          console.log(`Rating ${rating}: ${ratingCounts[rating]} puzzle(s)`);
        });
      }
      
      db.close();
    });
  });
});
