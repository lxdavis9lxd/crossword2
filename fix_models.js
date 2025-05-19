const db = require('./models');
const { User, Puzzle, Achievement, UserAchievement } = db;

async function fixModels() {
  try {
    console.log('Fixing models...');
    
    // Create a backup first
    const fs = require('fs');
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (fs.existsSync('database.sqlite')) {
      const backupFile = `database.sqlite.backup.${currentDate}.fix`;
      fs.copyFileSync('database.sqlite', backupFile);
      console.log(`Created backup: ${backupFile}`);
    }
    
    // Make sure all models are in sync
    console.log('Syncing database models...');
    await db.sequelize.sync({ alter: true });
    
    // Ensure User model has the completedPuzzles column
    const [results] = await db.sequelize.query("PRAGMA table_info(Users)");
    const hasCompletedPuzzles = results.some(col => col.name === 'completedPuzzles');
    
    if (!hasCompletedPuzzles) {
      console.log('Adding completedPuzzles column to Users table...');
      await db.sequelize.query("ALTER TABLE Users ADD COLUMN completedPuzzles TEXT DEFAULT '[]'");
    }
    
    console.log('Models fixed successfully!');
  } catch (error) {
    console.error('Error fixing models:', error);
  } finally {
    process.exit();
  }
}

fixModels();
