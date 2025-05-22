// Script to manually test the loadPuzzlesForLevel function
// This simulates what happens when a user clicks "Load Puzzles" on the dashboard

// Mock the fetch API to return predefined puzzle data
global.fetch = async (url) => {
  console.log(`Mocking fetch request to: ${url}`);
  
  if (url.includes('/game/puzzles/')) {
    // Return mock puzzles
    const mockPuzzles = [
      {
        id: 1,
        level: 'easy',
        difficultyRating: 2,
        puzzleData: JSON.stringify({
          title: "Language Basics",
          description: "A simple crossword featuring everyday vocabulary. Perfect for beginners!",
          grid: Array(81).fill(''),  // 9x9 grid
          clues: {
            across: Array(10).fill({ clue: "Test clue", answer: "TEST" }),
            down: Array(8).fill({ clue: "Test clue", answer: "TEST" })
          }
        })
      },
      {
        id: 2,
        level: 'easy',
        difficultyRating: 1,
        puzzleData: JSON.stringify({
          // No title or description to test fallback
          grid: Array(64).fill(''),  // 8x8 grid
          clues: {
            across: Array(8).fill({ clue: "Test clue", answer: "TEST" }),
            down: Array(6).fill({ clue: "Test clue", answer: "TEST" })
          }
        })
      }
    ];
    
    return {
      ok: true,
      json: async () => mockPuzzles
    };
  }
  
  return {
    ok: false,
    status: 404
  };
};

// Create a mock DOM environment
const mockDocument = {
  createElement: (tagName) => {
    const element = {
      tagName,
      className: '',
      dataset: {},
      innerHTML: '',
      children: [],
      addEventListener: (event, handler) => {
        element[`on${event}`] = handler;
      }
    };
    return element;
  },
  querySelector: (selector) => {
    if (selector === '#puzzles-container') {
      return {
        innerHTML: '',
        appendChild: (child) => {
          console.log(`Appending child to puzzles-container:`, child);
        }
      };
    }
    return null;
  }
};

global.document = mockDocument;
console.log = (...args) => {
  process.stdout.write(args.join(' ') + '\n');
};

// Define the necessary variables and function from scripts.js
const puzzlesContainer = document.querySelector('#puzzles-container');
let selectedPuzzleCard = null;

async function loadPuzzlesForLevel() {
  const level = 'easy'; // Mocking the level selection
  console.log('Loading puzzles for level:', level);
  
  try {
    puzzlesContainer.innerHTML = '<p>Loading puzzles...</p>';
    
    const response = await fetch(`/game/puzzles/${level}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzles: ${response.status}`);
    }
    
    const puzzles = await response.json();
    console.log('Puzzles loaded:', puzzles);
    
    // Clear current puzzles
    puzzlesContainer.innerHTML = '';
    
    if (puzzles.length === 0) {
      puzzlesContainer.innerHTML = '<p class="no-puzzles-message">No puzzles available for this level</p>';
    } else {
      // Create a card for each puzzle
      puzzles.forEach(puzzle => {
        const puzzleCard = document.createElement('div');
        puzzleCard.className = 'puzzle-card';
        puzzleCard.dataset.puzzleId = puzzle.id;
        
        // Parse the puzzle data to get dimensions for preview
        const puzzleData = JSON.parse(puzzle.puzzleData);
        const gridSize = Math.sqrt(puzzleData.grid.length);
        
        // Get title and description if available
        const title = puzzleData.title ? puzzleData.title : `Puzzle #${puzzle.id}`;
        
        // Always include a description - use a generic one if not available
        let description = puzzleData.description ? 
          puzzleData.description : `A ${level} level crossword puzzle with ${puzzleData.clues.across.length} across and ${puzzleData.clues.down.length} down clues.`;
        
        // Get difficulty rating if available
        const difficultyRating = puzzle.difficultyRating || 0;
        const difficultyStars = Array(5).fill().map((_, i) => 
          i < difficultyRating ? '★' : '☆').join('');
        
        puzzleCard.innerHTML = `
          <h4>${title}</h4>
          <p class="puzzle-description">${description}</p>
          <div class="difficulty-rating">${difficultyStars}</div>
          <div class="puzzle-preview">
            <div class="grid-size">${gridSize}x${gridSize}</div>
            <div class="preview-info">
              <p>${puzzleData.clues.across.length} Across</p>
              <p>${puzzleData.clues.down.length} Down</p>
            </div>
          </div>
        `;
        
        // For testing purposes, print the title and description
        console.log(`\n[Puzzle Card #${puzzle.id}]`);
        console.log(`Title: "${title}"`);
        console.log(`Description: "${description.substring(0, 50)}${description.length > 50 ? '...' : ''}"`);
        console.log(`Using themed title: ${title !== `Puzzle #${puzzle.id}`}`);
        
        puzzlesContainer.appendChild(puzzleCard);
      });
    }
  } catch (error) {
    console.error('Error loading puzzles:', error);
    puzzlesContainer.innerHTML = `<p class="error-message">Error loading puzzles: ${error.message}</p>`;
  }
}

// Run the test
loadPuzzlesForLevel();
