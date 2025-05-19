// Script to count puzzles in the database
const db = require('./models');

async function countPuzzles() {
  try {
    // Wait for database connection to be established
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Count all puzzles
    const totalCount = await db.Puzzle.count();
    console.log(`Total puzzles in database: ${totalCount}`);
    
    // Count by level
    const easyCount = await db.Puzzle.count({ where: { level: 'easy' } });
    const intermediateCount = await db.Puzzle.count({ where: { level: 'intermediate' } });
    const advancedCount = await db.Puzzle.count({ where: { level: 'advanced' } });
    
    console.log(`Easy puzzles: ${easyCount}`);
    console.log(`Intermediate puzzles: ${intermediateCount}`);
    console.log(`Advanced puzzles: ${advancedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error counting puzzles:', error);
    process.exit(1);
  }
}

countPuzzles();
