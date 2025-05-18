const { Sequelize, DataTypes } = require('sequelize');

// Setup database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

// Define Puzzle model directly for this script
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

// Create additional puzzles
async function createAdditionalPuzzles() {
  try {
    await Puzzle.sync();
    
    // Create an intermediate level puzzle
    const intermediatePuzzle = await Puzzle.create({
      level: 'intermediate',
      puzzleData: JSON.stringify({
        words: [
          {
            word: 'JAVASCRIPT',
            clue: 'Popular programming language for web development',
            startX: 0,
            startY: 0,
            direction: 'across'
          },
          {
            word: 'SEQUELIZE',
            clue: 'ORM for Node.js',
            startX: 9,
            startY: 0,
            direction: 'down'
          },
          {
            word: 'EXPRESS',
            clue: 'Web framework for Node.js',
            startX: 2,
            startY: 2,
            direction: 'across'
          },
          {
            word: 'DATABASE',
            clue: 'Where data is stored',
            startX: 0,
            startY: 4,
            direction: 'across'
          },
          {
            word: 'ASYNC',
            clue: 'Not synchronous',
            startX: 5,
            startY: 0,
            direction: 'down'
          }
        ]
      })
    });
    
    // Create an advanced level puzzle
    const advancedPuzzle = await Puzzle.create({
      level: 'advanced',
      puzzleData: JSON.stringify({
        words: [
          {
            word: 'MIDDLEWARE',
            clue: 'Software that acts as a bridge between systems',
            startX: 0,
            startY: 0,
            direction: 'across'
          },
          {
            word: 'AUTHENTICATION',
            clue: 'Process of verifying identity',
            startX: 5,
            startY: 0,
            direction: 'down'
          },
          {
            word: 'WEBSOCKET',
            clue: 'Protocol for two-way communication',
            startX: 0,
            startY: 3,
            direction: 'across'
          },
          {
            word: 'MICROSERVICE',
            clue: 'Architectural style that structures an application as a collection of small services',
            startX: 2,
            startY: 5,
            direction: 'across'
          },
          {
            word: 'TYPESCRIPT',
            clue: 'JavaScript with static type definitions',
            startX: 0,
            startY: 7,
            direction: 'across'
          },
          {
            word: 'REST',
            clue: 'Architectural style for API design',
            startX: 9,
            startY: 3,
            direction: 'down'
          }
        ]
      })
    });
    
    console.log('Additional puzzles created successfully!');
    console.log('Intermediate Puzzle ID:', intermediatePuzzle.id);
    console.log('Advanced Puzzle ID:', advancedPuzzle.id);
  } catch (error) {
    console.error('Error creating additional puzzles:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
createAdditionalPuzzles();
