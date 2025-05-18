// Check puzzles in the database
const { Sequelize } = require('sequelize');

// Setup database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

async function checkPuzzles() {
  try {
    console.log('Checking puzzles in the database...');
    
    // Query all puzzles
    const [puzzles] = await sequelize.query('SELECT id, level FROM Puzzles');
    
    console.log(`Found ${puzzles.length} puzzles:`);
    puzzles.forEach(puzzle => {
      console.log(`ID: ${puzzle.id}, Level: ${puzzle.level}`);
    });
    
    // Get one puzzle to check data structure
    if (puzzles.length > 0) {
      const [fullPuzzle] = await sequelize.query(`SELECT * FROM Puzzles WHERE id = ${puzzles[0].id}`);
      console.log('\nSample puzzle data structure:');
      console.log(JSON.stringify(fullPuzzle[0], null, 2).substring(0, 300) + '...');
    }
  } catch (error) {
    console.error('Error checking puzzles:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
checkPuzzles();
