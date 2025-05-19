const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const achievements = [
  {
    name: 'Crossword Novice',
    description: 'Complete your first puzzle',
    icon: 'trophy-bronze',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      count: 1
    })
  },
  {
    name: 'Puzzle Enthusiast',
    description: 'Complete 5 puzzles of any difficulty',
    icon: 'trophy-silver',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      count: 5
    })
  },
  {
    name: 'Crossword Master',
    description: 'Complete 10 puzzles of any difficulty',
    icon: 'trophy-gold',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      count: 10
    })
  },
  {
    name: 'Word Wizard',
    description: 'Complete 5 advanced difficulty puzzles',
    icon: 'star-gold',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      level: 'advanced',
      count: 5
    })
  },
  {
    name: 'Speed Solver',
    description: 'Complete an easy puzzle in under 3 minutes',
    icon: 'clock',
    criteria: JSON.stringify({
      type: 'timeChallenge',
      level: 'easy',
      maxTime: 180 // in seconds
    })
  },
  {
    name: 'Perfectionist',
    description: 'Complete a puzzle without any mistakes',
    icon: 'checkmark',
    criteria: JSON.stringify({
      type: 'noMistakes'
    })
  }
];

db.serialize(() => {
  // Create table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS Achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    criteria TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`);

  // Insert achievements
  const stmt = db.prepare(`INSERT OR IGNORE INTO Achievements 
    (name, description, icon, criteria, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?)`);

  const now = new Date().toISOString();
  
  achievements.forEach(achievement => {
    stmt.run(
      achievement.name,
      achievement.description,
      achievement.icon,
      achievement.criteria,
      now,
      now
    );
  });

  stmt.finalize();
  
  // Verify achievements have been added
  db.all("SELECT id, name FROM Achievements", (err, rows) => {
    if (err) {
      console.error("Error verifying achievements:", err);
    } else {
      console.log("Achievements added successfully!");
      console.log("Total achievements in database:", rows.length);
      rows.forEach(row => {
        console.log(`- ${row.id}: ${row.name}`);
      });
    }
    
    db.close();
  });
});
