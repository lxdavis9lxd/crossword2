const Sequelize = require('sequelize');
const path = require('path');

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: console.log
});

// Define models directly here to avoid circular dependencies
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  progress: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '{}'
  },
  gamesPlayed: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  puzzlesSolved: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  streak: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true
});

const Puzzle = sequelize.define('Puzzle', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: Sequelize.STRING,
    allowNull: false
  },
  puzzleData: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

// Setup associations if needed
// Example: User.hasMany(Puzzle);

const db = {
  sequelize,
  Sequelize,
  User,
  Puzzle
};

// Sync models with database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = db;
