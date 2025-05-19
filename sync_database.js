const db = require('./models');

async function syncDatabase() {
  try {
    console.log('Synchronizing database...');
    
    // First create a backup of the database
    const fs = require('fs');
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    if (fs.existsSync('database.sqlite')) {
      fs.copyFileSync('database.sqlite', `database.sqlite.backup.${currentDate}`);
      console.log(`Created backup: database.sqlite.backup.${currentDate}`);
    }
    
    // Then sync with alter:true to add new tables and columns
    await db.sequelize.sync({ alter: true });
    
    console.log('Database synchronized successfully!');
    console.log('Added new models: Achievement, UserAchievement');
    console.log('Updated Puzzle model with new columns: title, description, difficultyRating');
    console.log('Updated User model with new column: completedPuzzles');
    
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    process.exit();
  }
}

syncDatabase();
