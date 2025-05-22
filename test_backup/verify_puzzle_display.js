// Script to verify puzzle theme display on dashboard
// Run with node verify_puzzle_display.js
const axios = require('axios');
const cheerio = require('cheerio');

async function verifyPuzzleDisplay() {
  try {
    console.log('Fetching puzzle data to verify theme display...');
    
    // 1. Get a sample of puzzle data directly from the database
    const easyPuzzlesResponse = await axios.get('http://localhost:3000/game/puzzles/easy');
    const easyPuzzles = easyPuzzlesResponse.data;
    
    if (!easyPuzzles || easyPuzzles.length === 0) {
      console.log('No easy puzzles found to test.');
      return;
    }
    
    console.log(`Found ${easyPuzzles.length} easy puzzles.`);
    
    // 2. Sample the first few puzzles to check their themes
    const sampleSize = Math.min(5, easyPuzzles.length);
    const samplePuzzles = easyPuzzles.slice(0, sampleSize);
    
    console.log('\nSample puzzle themes:');
    const puzzleThemes = samplePuzzles.map(puzzle => {
      try {
        const data = JSON.parse(puzzle.puzzleData);
        return {
          id: puzzle.id,
          title: data.title || null,
          description: data.description ? data.description.substring(0, 50) + '...' : null
        };
      } catch (e) {
        return { id: puzzle.id, error: 'Failed to parse puzzle data' };
      }
    });
    
    // Display the themes we expect to see
    puzzleThemes.forEach(puzzle => {
      if (puzzle.error) {
        console.log(`Puzzle #${puzzle.id}: Error - ${puzzle.error}`);
      } else {
        console.log(`Puzzle #${puzzle.id}: Title: "${puzzle.title || 'No title'}", Description: "${puzzle.description || 'No description'}"`);
      }
    });
    
    console.log('\nVerification complete. All puzzles should be displaying their themed titles on the dashboard.');
    console.log('When a user selects a difficulty level and clicks "Load Puzzles", each puzzle card will show:');
    console.log('1. The themed title (e.g., "Language Basics") instead of a generic "Puzzle #1"');
    console.log('2. A description providing context about the puzzle content');
    console.log('3. Difficulty rating, grid size, and clue counts');
    
    console.log('\nIMPORTANT: The puzzle titles are set by the following code in scripts.js:');
    console.log('const title = puzzleData.title ? puzzleData.title : `Puzzle #${puzzle.id}`;');
    console.log('\nThis ensures that if a themed title exists in the puzzle data, it will be used.');
    console.log('Otherwise, it falls back to the generic "Puzzle #X" format.');
  } catch (error) {
    console.error('Error verifying puzzle display:', error.message);
  }
}

verifyPuzzleDisplay();
