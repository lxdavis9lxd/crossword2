const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // Ensure the UserAchievements junction table exists with the right schema
  db.run(`
    CREATE TABLE IF NOT EXISTS UserAchievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      achievementId INTEGER NOT NULL,
      dateAwarded TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(userId, achievementId),
      FOREIGN KEY (userId) REFERENCES Users(id),
      FOREIGN KEY (achievementId) REFERENCES Achievements(id)
    )
  `);
  
  console.log('Achievement tables set up successfully!');
  
  // Check table structure
  db.all("PRAGMA table_info(UserAchievements)", (err, columns) => {
    if (err) {
      console.error("Error checking UserAchievements table:", err);
    } else {
      console.log("UserAchievements table columns:");
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
    }
    
    // Check achievements table
    db.all("SELECT name FROM Achievements", (err, achievements) => {
      if (err) {
        console.error("Error checking Achievements:", err);
      } else {
        console.log("\nAchievements in database:");
        achievements.forEach(achievement => {
          console.log(`- ${achievement.name}`);
        });
      }
      
      db.close();
    });
  });
});
