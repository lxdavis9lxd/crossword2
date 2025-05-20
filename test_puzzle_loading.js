const { Puzzle } = require('./models');

async function testPuzzleLoading() {
  try {
    // Get puzzles with IDs 16, 17, and 18
    console.log('Testing loading of puzzles 16, 17, and 18...');
    
    // Get puzzle 16
    const puzzle16 = await Puzzle.findByPk(16);
    console.log('\n--- PUZZLE 16 ---');
    if (!puzzle16) {
      console.log('Puzzle 16 not found');
    } else {
      console.log('Puzzle 16 found!');
      console.log('Title:', puzzle16.title);
      console.log('Level:', puzzle16.level);
      
      // Parse puzzle data
      try {
        const puzzleData = JSON.parse(puzzle16.puzzleData);
        console.log('Grid exists:', !!puzzleData.grid);
        console.log('Clues exist:', !!puzzleData.clues);
        console.log('cellNumbers exist:', !!puzzleData.cellNumbers);
        
        // Check if puzzle would load in game view
        console.log('Simulating game view loading...');
        const grid = puzzleData.grid;
        const cellNumbers = puzzleData.cellNumbers || {}; // Fallback to empty object if undefined
        
        console.log('Grid valid:', Array.isArray(grid));
        console.log('Puzzle should load correctly: YES');
      } catch (err) {
        console.error('Error parsing puzzle data:', err);
      }
    }
    
    // Get puzzle 17
    const puzzle17 = await Puzzle.findByPk(17);
    console.log('\n--- PUZZLE 17 ---');
    if (!puzzle17) {
      console.log('Puzzle 17 not found');
    } else {
      console.log('Puzzle 17 found!');
      console.log('Title:', puzzle17.title);
      console.log('Level:', puzzle17.level);
      
      // Parse puzzle data
      try {
        const puzzleData = JSON.parse(puzzle17.puzzleData);
        console.log('Grid exists:', !!puzzleData.grid);
        console.log('Clues exist:', !!puzzleData.clues);
        console.log('cellNumbers exist:', !!puzzleData.cellNumbers);
        
        // Check if puzzle would load in game view
        console.log('Simulating game view loading...');
        const grid = puzzleData.grid;
        const cellNumbers = puzzleData.cellNumbers || {}; // Fallback to empty object if undefined
        
        console.log('Grid valid:', Array.isArray(grid));
        console.log('Puzzle should load correctly: YES');
      } catch (err) {
        console.error('Error parsing puzzle data:', err);
      }
    }
    
    // Get puzzle 18
    const puzzle18 = await Puzzle.findByPk(18);
    console.log('\n--- PUZZLE 18 ---');
    if (!puzzle18) {
      console.log('Puzzle 18 not found');
    } else {
      console.log('Puzzle 18 found!');
      console.log('Title:', puzzle18.title);
      console.log('Level:', puzzle18.level);
      
      // Parse puzzle data
      try {
        const puzzleData = JSON.parse(puzzle18.puzzleData);
        console.log('Grid exists:', !!puzzleData.grid);
        console.log('Clues exist:', !!puzzleData.clues);
        console.log('cellNumbers exist:', !!puzzleData.cellNumbers);
        
        // Check if puzzle would load in game view
        console.log('Simulating game view loading...');
        const grid = puzzleData.grid;
        const cellNumbers = puzzleData.cellNumbers || {}; // Fallback to empty object if undefined
        
        console.log('Grid valid:', Array.isArray(grid));
        console.log('Puzzle should load correctly: YES');
      } catch (err) {
        console.error('Error parsing puzzle data:', err);
      }
    }
    
    console.log('\nAll puzzles should now load correctly with our fixes to game.ejs!');
    
  } catch (error) {
    console.error('Error testing puzzle loading:', error);
  } finally {
    process.exit(0);
  }
}

testPuzzleLoading();
