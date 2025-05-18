// Simple script to create a fresh database and insert puzzles
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Delete existing database if it exists
const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) {
  console.log('Removing existing database file...');
  fs.unlinkSync(dbPath);
  console.log('Existing database file removed.');
}

// Create a new connection
console.log('Creating new database...');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Define the Puzzle model
const Puzzle = sequelize.define('Puzzle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  puzzleData: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

// Sample puzzle data for testing
const samplePuzzles = [
  {
    level: 'easy',
    puzzleData: JSON.stringify({
      title: "Pets and Animals",
      theme: "A simple crossword about common pets and animal terms",
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
      title: "Word Games",
      theme: "Crossword puzzle with terms related to puzzles and word games",
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

// Create database and insert puzzles
async function setupDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync the model with the database (force:true to create a fresh table)
    await Puzzle.sync({ force: true });
    console.log('Puzzle table created.');
    
    // Insert the puzzles
    for (const puzzleData of samplePuzzles) {
      const puzzle = await Puzzle.create(puzzleData);
      console.log(`Created puzzle with ID: ${puzzle.id}, level: ${puzzle.level}`);
    }
    
    console.log('Sample puzzles inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
