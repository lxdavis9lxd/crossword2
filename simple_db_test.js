const { Puzzle } = require('./models');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Try to count the puzzles
    const count = await Puzzle.count();
    console.log(`Successfully connected to database. Found ${count} puzzles.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

testDatabase();
