const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: console.log
});

const db = {
  sequelize,
  Sequelize
};

// Import model definitions from individual files
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Puzzle = require('./puzzle')(sequelize, Sequelize.DataTypes);
const Achievement = require('./achievement')(sequelize, Sequelize.DataTypes);
const UserAchievement = require('./userAchievement')(sequelize, Sequelize.DataTypes);

// Add models to the db object
db.User = User;
db.Puzzle = Puzzle;
db.Achievement = Achievement;
db.UserAchievement = UserAchievement;

// Setup associations
User.associate(db);
Achievement.associate(db);

// Sync models with database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = db;
