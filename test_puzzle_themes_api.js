// Test script to verify puzzle themes directly from the API
const axios = require('axios');

async function testPuzzleThemesViaAPI() {
  console.log('Testing puzzle themes via API...');
  
  const BASE_URL = 'http://localhost:3000';
  const difficulties = ['easy', 'intermediate', 'advanced'];
  
  try {
    for (const level of difficulties) {
      console.log(`\nFetching ${level} puzzles...`);
      
      try {
        // Fetch puzzles for the current level
        const response = await axios.get(`${BASE_URL}/game/puzzles/${level}`);
        const puzzles = response.data;
        
        if (!puzzles || puzzles.length === 0) {
          console.log(`No puzzles found for ${level} level.`);
          continue;
        }
        
        console.log(`Found ${puzzles.length} puzzles for ${level} level.`);
        
        // Check each puzzle for themed titles and descriptions
        let genericTitleCount = 0;
        let missingDescriptionCount = 0;
        
        for (const puzzle of puzzles) {
          const puzzleData = JSON.parse(puzzle.puzzleData);
          
          // Check for themed title
          const title = puzzleData.title || null;
          
          if (!title) {
            console.error(`ERROR: Puzzle #${puzzle.id} is missing a title`);
            genericTitleCount++;
          } else if (title.match(/^Puzzle #\d+$/)) {
            console.error(`ERROR: Puzzle #${puzzle.id} has a generic title: "${title}"`);
            genericTitleCount++;
          } else {
            console.log(`Puzzle #${puzzle.id} - Title: "${title}" ✓`);
          }
          
          // Check for description
          const description = puzzleData.description || null;
          
          if (!description) {
            console.error(`ERROR: Puzzle #${puzzle.id} is missing a description`);
            missingDescriptionCount++;
          } else {
            // Show truncated description
            const truncatedDesc = description.length > 50 ? 
              description.substring(0, 50) + '...' : description;
            console.log(`  Description: "${truncatedDesc}" ✓`);
          }
        }
        
        // Summary for this level
        console.log(`\nSummary for ${level} level:`);
        console.log(`- Total puzzles: ${puzzles.length}`);
        console.log(`- Puzzles with generic/missing titles: ${genericTitleCount}`);
        console.log(`- Puzzles with missing descriptions: ${missingDescriptionCount}`);
        
        if (genericTitleCount === 0 && missingDescriptionCount === 0) {
          console.log(`✅ All ${level} puzzles have proper themed titles and descriptions.`);
        } else {
          console.log(`❌ Some ${level} puzzles are missing proper themes.`);
        }
      } catch (error) {
        console.error(`Error fetching ${level} puzzles:`, error.message);
      }
    }
    
    console.log('\nPuzzle theme test via API completed!');
  } catch (error) {
    console.error('Error during API test:', error.message);
  }
}

testPuzzleThemesViaAPI();
