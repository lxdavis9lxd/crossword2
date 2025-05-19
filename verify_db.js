const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

console.log('Checking database tables and data...');

db.serialize(() => {
  // Check tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error("Error listing tables:", err);
      return;
    }
    
    console.log("\nDatabase Tables:");
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Check puzzles
    db.all("SELECT id, level, difficultyRating FROM Puzzles LIMIT 5", (err, puzzles) => {
      if (err) {
        console.error("Error querying puzzles:", err);
      } else {
        console.log("\nPuzzles with Difficulty Ratings:");
        puzzles.forEach(puzzle => {
          console.log(`- ID: ${puzzle.id}, Level: ${puzzle.level}, Rating: ${puzzle.difficultyRating}`);
        });
      }
      
      // Check achievements
      db.all("SELECT id, name FROM Achievements", (err, achievements) => {
        if (err) {
          console.error("Error querying achievements:", err);
        } else {
          console.log("\nAchievements:");
          achievements.forEach(achievement => {
            console.log(`- ID: ${achievement.id}, Name: ${achievement.name}`);
          });
        }
        
        // Check users columns
        db.all("PRAGMA table_info(Users)", (err, columns) => {
          if (err) {
            console.error("Error querying user columns:", err);
          } else {
            console.log("\nUser Table Columns:");
            columns.forEach(col => {
              console.log(`- ${col.name} (${col.type})`);
            });
          }
          
          db.close();
        });
      });
    });
  });
});
