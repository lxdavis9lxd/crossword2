const db = require('./models');
const { User, Puzzle, Achievement, UserAchievement } = db;

async function checkSync() {
  try {
    console.log('Checking database synchronization status...');
    
    // Check Puzzle model (including difficultyRating)
    const puzzles = await Puzzle.findAll({ 
      attributes: ['id', 'level', 'difficultyRating'],
      limit: 5 
    });
    console.log('\nPuzzles (with difficultyRating):');
    puzzles.forEach(p => {
      console.log(`  ID: ${p.id}, Level: ${p.level}, Difficulty: ${p.difficultyRating}`);
    });
    
    // Check Achievement model
    const achievements = await Achievement.findAll({ 
      attributes: ['id', 'name'],
      limit: 10 
    });
    console.log('\nAchievements:');
    achievements.forEach(a => {
      console.log(`  ID: ${a.id}, Name: ${a.name}`);
    });
    
    // Check UserAchievement model exists
    try {
      const result = await db.sequelize.query("PRAGMA table_info(UserAchievements)");
      console.log('\nUserAchievements table exists with columns:');
      result[0].forEach(col => {
        console.log(`  ${col.name} (${col.type})`);
      });
    } catch (error) {
      console.error('Error checking UserAchievements table:', error);
    }
    
    // Check User model for completedPuzzles
    try {
      const result = await db.sequelize.query("PRAGMA table_info(Users)");
      const userColumns = result[0].map(col => col.name);
      console.log('\nUser model columns:', userColumns.join(', '));
      
      if (userColumns.includes('completedPuzzles')) {
        console.log('  ✓ completedPuzzles field exists in User model');
      } else {
        console.log('  ✗ completedPuzzles field is missing from User model');
      }
    } catch (error) {
      console.error('Error checking User model:', error);
    }
    
    console.log('\nDatabase synchronization check complete!');
    
  } catch (error) {
    console.error('Error checking database sync:', error);
  } finally {
    process.exit();
  }
}

checkSync();
