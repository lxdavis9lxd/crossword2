const { User, Puzzle } = require('./models');
const bcrypt = require('bcrypt');

async function testPuzzleCreation() {
  try {
    console.log('Starting puzzle creation flow test...');
    
    // 1. Create an admin user for testing if needed
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('t123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }
    
    // 2. Create a test puzzle with array format clues
    console.log('Creating test puzzle with array format clues...');
    
    // Generate grid data (5x5 simple grid)
    const gridArray = [
      'C', 'A', 'T', '.', '.',
      'A', 'R', 'T', '.', '.',
      'R', 'A', 'T', 'S', '.',
      '.', '.', '.', 'U', 'N',
      '.', '.', 'F', 'N', '.'
    ];
    
    // Generate clues as arrays
    const acrossCluesArray = [
      { number: 1, clue: 'Feline pet' },
      { number: 4, clue: 'Creative work' },
      { number: 6, clue: 'Rodents' },
      { number: 8, clue: 'Prefix meaning "not"' },
      { number: 9, clue: 'Fun (slang)' }
    ];
    
    const downCluesArray = [
      { number: 1, clue: 'Vehicle' },
      { number: 2, clue: 'Consume food' },
      { number: 3, clue: 'Common article' },
      { number: 5, clue: 'Over there' },
      { number: 7, clue: 'Negative word' }
    ];
    
    const puzzleData = {
      grid: gridArray,
      clues: {
        across: acrossCluesArray,
        down: downCluesArray
      }
    };
    
    // Create the puzzle with array-format clues
    const arrayFormatPuzzle = await Puzzle.create({
      title: 'Test Array Format Puzzle',
      description: 'A test puzzle with array format clues',
      level: 'easy',
      difficultyRating: 2,
      puzzleData: JSON.stringify(puzzleData)
    });
    
    console.log(`Created array format puzzle with ID: ${arrayFormatPuzzle.id}`);
    
    // 3. Create a test puzzle with object format clues (the old format)
    console.log('Creating test puzzle with object format clues...');
    
    // Object format clues
    const acrossCluesObject = {
      "1": "Feline pet",
      "4": "Creative work",
      "6": "Rodents",
      "8": "Prefix meaning \"not\"",
      "9": "Fun (slang)"
    };
    
    const downCluesObject = {
      "1": "Vehicle",
      "2": "Consume food",
      "3": "Common article",
      "5": "Over there",
      "7": "Negative word"
    };
    
    const oldFormatPuzzleData = {
      grid: gridArray,
      clues: {
        across: acrossCluesObject,
        down: downCluesObject
      }
    };
    
    // Create the puzzle with object-format clues
    const objectFormatPuzzle = await Puzzle.create({
      title: 'Test Object Format Puzzle',
      description: 'A test puzzle with object format clues',
      level: 'easy',
      difficultyRating: 2,
      puzzleData: JSON.stringify(oldFormatPuzzleData)
    });
    
    console.log(`Created object format puzzle with ID: ${objectFormatPuzzle.id}`);
    
    console.log(`
=== TEST COMPLETED SUCCESSFULLY ===
Created two test puzzles:
1. Array format puzzle (ID: ${arrayFormatPuzzle.id}) - represents the fixed format
2. Object format puzzle (ID: ${objectFormatPuzzle.id}) - represents the old format

You can now test both puzzles in the game view to verify that both formats
are properly handled by your updated code.

Testing steps:
1. Log in as admin (username: admin, password: t123)
2. Go to Admin -> Puzzles to see your test puzzles
3. View both puzzles to verify clues display correctly
4. Play both puzzles from the game dashboard to verify gameplay works

If both formats work correctly, your fixes have been successful!
    `);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    process.exit(0);
  }
}

testPuzzleCreation();
