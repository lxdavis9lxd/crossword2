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

// Create sample easy puzzle
async function createSamplePuzzle() {
  try {
    await Puzzle.sync();
    
    // Create a sample easy puzzle
    const easyPuzzle = await Puzzle.create({
      level: 'easy',
      puzzleData: JSON.stringify({
        words: [
          {
            word: 'NODE',
            clue: 'JavaScript runtime environment',
            startX: 0,
            startY: 0,
            direction: 'across'
          },
          {
            word: 'NPM',
            clue: 'Node package manager',
            startX: 0,
            startY: 1,
            direction: 'across'
          },
          {
            word: 'WEB',
            clue: 'World Wide Web',
            startX: 0,
            startY: 2,
            direction: 'across'
          },
          {
            word: 'API',
            clue: 'Application Programming Interface',
            startX: 3,
            startY: 0,
            direction: 'down'
          }
        ]
      })
    });
    
    console.log('Sample easy puzzle created successfully!');
    console.log('Puzzle ID:', easyPuzzle.id);
  } catch (error) {
    console.error('Error creating sample puzzle:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
createSamplePuzzle();
