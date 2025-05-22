// Simple script to check puzzle themes in the database
const axios = require('axios');

async function checkPuzzleThemes() {
  try {
    console.log('Checking puzzle themes...');
    
    // Get puzzles from each difficulty level
    const levels = ['easy', 'intermediate', 'advanced'];
    
    for (const level of levels) {
      console.log(`\nChecking ${level} puzzles:`);
      
      try {
        const response = await axios.get(`http://localhost:3000/game/puzzles/${level}`);
        
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          console.log(`No ${level} puzzles found.`);
          continue;
        }
        
        // Check just the first 3 puzzles to keep output manageable
        const puzzlesToCheck = response.data.slice(0, 3);
        
        for (const puzzle of puzzlesToCheck) {
          try {
            const puzzleData = JSON.parse(puzzle.puzzleData);
            const title = puzzleData.title || `Puzzle #${puzzle.id}`;
            const description = puzzleData.description || 'No description';
            
            const usingThemedTitle = title !== `Puzzle #${puzzle.id}`;
            
            console.log(`Puzzle #${puzzle.id}:`);
            console.log(`  Title: "${title}" ${usingThemedTitle ? '✓' : '✗'}`);
            console.log(`  Description: "${description.substring(0, 50)}..."`);
            console.log(`  Using themed title: ${usingThemedTitle ? 'YES' : 'NO'}`);
          } catch (parseError) {
            console.log(`Puzzle #${puzzle.id}: Error parsing puzzle data`);
          }
        }
        
        console.log(`\nTotal ${level} puzzles: ${response.data.length}`);
      } catch (levelError) {
        console.error(`Error fetching ${level} puzzles:`, levelError.message);
      }
    }
    
    console.log('\nVerification complete.');
    console.log('Based on this data, when puzzles are loaded in the dashboard:');
    console.log('1. Each puzzle card will display its themed title as shown above');
    console.log('2. The following code in scripts.js ensures themed titles are used:');
    console.log('   const title = puzzleData.title ? puzzleData.title : `Puzzle #${puzzle.id}`;');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPuzzleThemes();
