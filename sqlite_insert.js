// Direct SQLite insertion script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Sample puzzle data for testing
const samplePuzzles = [
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      grid: [
        'C', 'A', 'T', '#',
        'O', '#', 'O', '#',
        'W', 'O', 'R', 'D',
        '#', '#', 'Y', '#'
      ],
      cellNumbers: [1, 2, 3, null, 4, null, 5, null, 6, null, null, null, null, null, 7, null],
      clues: {
        across: [
          { number: 1, clue: "Feline pet" },
          { number: 4, clue: "Vowel sound" },
          { number: 6, clue: "A unit of language" },
          { number: 7, clue: "Question word" }
        ],
        down: [
          { number: 1, clue: "Female bovine" },
          { number: 2, clue: "Article" },
          { number: 3, clue: "Past tense of eat" },
          { number: 5, clue: "Organ of hearing" }
        ]
      }
    })
  },
  {
    level: 'intermediate',
    puzzleData: JSON.stringify({
      grid: [
        'P', 'U', 'Z', 'Z', 'L', 'E',
        'A', '#', 'E', '#', 'I', '#',
        'R', 'E', 'B', 'U', 'S', '#',
        'K', '#', 'R', '#', 'T', '#',
        '#', 'G', 'A', 'M', 'E', '#',
        '#', '#', '#', '#', 'N', '#'
      ],
      cellNumbers: [1, 2, 3, 4, 5, 6, 7, null, 8, null, 9, null, 10, 11, 12, 13, 14, null, 15, null, 16, null, 17, null, null, 18, 19, 20, 21, null, null, null, null, null, 22, null],
      clues: {
        across: [
          { number: 1, clue: "A problem to solve" },
          { number: 7, clue: "Atmosphere" },
          { number: 8, clue: "Letter after D" },
          { number: 9, clue: "Personal pronoun" },
          { number: 10, clue: "Picture puzzle" },
          { number: 15, clue: "Parking area" },
          { number: 16, clue: "Color" },
          { number: 17, clue: "Beverage" },
          { number: 18, clue: "Activity for fun" },
          { number: 22, clue: "Negative response" }
        ],
        down: [
          { number: 1, clue: "Writing tool" },
          { number: 2, clue: "Indefinite article" },
          { number: 3, clue: "Sleep state" },
          { number: 4, clue: "To consume food" },
          { number: 5, clue: "Look at" },
          { number: 6, clue: "Past tense of eat" },
          { number: 11, clue: "Start of a counting rhyme" },
          { number: 12, clue: "Upon" },
          { number: 13, clue: "Number of sides in a square" },
          { number: 14, clue: "Make a mistake" },
          { number: 19, clue: "Indefinite article" },
          { number: 20, clue: "Mouse sound" },
          { number: 21, clue: "Afternoon drink" }
        ]
      }
    })
  }
];

// Path to the SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Create the Puzzles table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS Puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  puzzleData TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log('Puzzles table created or already exists.');
  
  // Insert sample puzzles
  const stmt = db.prepare('INSERT INTO Puzzles (level, puzzleData, createdAt, updatedAt) VALUES (?, ?, datetime("now"), datetime("now"))');
  
  samplePuzzles.forEach((puzzle) => {
    stmt.run(puzzle.level, puzzle.puzzleData, (err) => {
      if (err) {
        console.error('Error inserting puzzle:', err.message);
      } else {
        console.log(`Inserted ${puzzle.level} puzzle.`);
      }
    });
  });
  
  stmt.finalize();
  
  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
      console.log('Sample puzzles inserted successfully!');
    }
  });
});
