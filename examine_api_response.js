// Test script to examine the raw API response
const axios = require('axios');

async function examineAPIResponse() {
  console.log('Examining API response format...');
  
  const BASE_URL = 'http://localhost:3000';
  const level = 'easy'; // Just test one level for simplicity
  
  try {
    // Fetch puzzles
    const response = await axios.get(`${BASE_URL}/game/puzzles/${level}`);
    const puzzles = response.data;
    
    if (!puzzles || puzzles.length === 0) {
      console.log('No puzzles found.');
      return;
    }
    
    console.log(`Found ${puzzles.length} puzzles.`);
    
    // Examine the first puzzle to understand the data structure
    const firstPuzzle = puzzles[0];
    console.log('\nFirst puzzle structure:');
    console.log(JSON.stringify(firstPuzzle, null, 2));
    
    // Check if puzzleData is already parsed or needs to be parsed
    try {
      const parsedData = JSON.parse(firstPuzzle.puzzleData);
      console.log('\nPuzzleData parsed successfully:');
      console.log('Title:', parsedData.title);
      console.log('Description:', parsedData.description ? parsedData.description.substring(0, 50) + '...' : 'None');
    } catch (error) {
      console.log('\nError parsing puzzleData, it might already be an object:');
      console.log('Raw puzzleData type:', typeof firstPuzzle.puzzleData);
      
      if (typeof firstPuzzle.puzzleData === 'object') {
        console.log('Title:', firstPuzzle.puzzleData.title);
        console.log('Description:', firstPuzzle.puzzleData.description ? 
          firstPuzzle.puzzleData.description.substring(0, 50) + '...' : 'None');
      }
    }
    
  } catch (error) {
    console.error('Error examining API response:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

examineAPIResponse();
