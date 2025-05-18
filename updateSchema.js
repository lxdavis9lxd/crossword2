// Update User table schema
const { Sequelize, DataTypes } = require('sequelize');

// Setup database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: console.log
});

async function updateUserSchema() {
  try {
    console.log('Starting schema update...');
    
    // Add missing fields to Users table
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN progress TEXT DEFAULT '{}';
    `).catch(err => {
      if (err.message.includes('duplicate column name')) {
        console.log('progress column already exists, skipping...');
      } else {
        throw err;
      }
    });
    
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN gamesPlayed INTEGER DEFAULT 0;
    `).catch(err => {
      if (err.message.includes('duplicate column name')) {
        console.log('gamesPlayed column already exists, skipping...');
      } else {
        throw err;
      }
    });
    
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN puzzlesSolved INTEGER DEFAULT 0;
    `).catch(err => {
      if (err.message.includes('duplicate column name')) {
        console.log('puzzlesSolved column already exists, skipping...');
      } else {
        throw err;
      }
    });
    
    await sequelize.query(`
      ALTER TABLE Users 
      ADD COLUMN streak INTEGER DEFAULT 0;
    `).catch(err => {
      if (err.message.includes('duplicate column name')) {
        console.log('streak column already exists, skipping...');
      } else {
        throw err;
      }
    });
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
updateUserSchema();
