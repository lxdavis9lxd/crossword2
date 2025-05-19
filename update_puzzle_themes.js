const { Puzzle } = require('./models');

/**
 * Update all puzzles to add themed titles and descriptions
 * This script will add titles and descriptions to all puzzles that don't have them
 */

// Array of themed titles and descriptions for puzzles
const puzzleThemes = [
  // Easy level puzzle themes
  {
    id: 1,
    title: "Language Basics",
    description: "A simple crossword featuring everyday vocabulary. Perfect for beginners!"
  },
  {
    id: 2,
    title: "Simple Words",
    description: "Practice your vocabulary with these basic everyday terms. Great for new crossword solvers!"
  },
  {
    id: 3,
    title: "Sun and Sky",
    description: "A beginner crossword featuring celestial objects and weather-related terms."
  },
  {
    id: 4,
    title: "Home Sweet Home",
    description: "Common household items and simple vocabulary for beginning crossword enthusiasts."
  },
  {
    id: 5,
    title: "Everyday Objects",
    description: "Familiar items and words that surround us daily. An easy puzzle for casual solvers."
  },
  
  // Intermediate level puzzle themes
  {
    id: 6,
    title: "Word Games",
    description: "A moderately challenging puzzle about games, puzzles, and recreational activities."
  },
  {
    id: 7,
    title: "Musical Journey",
    description: "Explore musical terms and concepts in this intermediate-level crossword challenge."
  },
  {
    id: 8,
    title: "Science Explorer",
    description: "Scientific vocabulary and concepts await in this brain-teasing intermediate puzzle."
  },
  
  // Advanced level puzzle themes
  {
    id: 9,
    title: "Academic Challenge",
    description: "An advanced crossword featuring scientific and academic terminology. Test your knowledge!"
  },
  {
    id: 10,
    title: "Expert's Delight",
    description: "Challenge yourself with this advanced crossword filled with specialized vocabulary and complex terms."
  }
];

async function updatePuzzleThemes() {
  try {
    console.log('Starting puzzle theme update process...');
    
    // Get all puzzles
    const puzzles = await Puzzle.findAll();
    
    console.log(`Found ${puzzles.length} puzzles in the database`);
    
    for (const puzzle of puzzles) {
      try {
        // Parse the puzzle data
        const puzzleData = JSON.parse(puzzle.puzzleData);
        
        // Skip puzzles that already have titles and descriptions
        if (puzzleData.title && puzzleData.description) {
          console.log(`Puzzle #${puzzle.id} already has title "${puzzleData.title}" - skipping`);
          continue;
        }
        
        // Find a theme for this puzzle
        const theme = puzzleThemes.find(t => t.id === puzzle.id);
        
        if (!theme) {
          console.log(`No theme found for Puzzle #${puzzle.id} - using generic theme`);
          // Use a generic theme based on the difficulty level
          if (puzzle.level === 'easy') {
            puzzleData.title = `Easy Crossword #${puzzle.id}`;
            puzzleData.description = "A simple crossword puzzle perfect for beginners and casual solvers.";
          } else if (puzzle.level === 'intermediate') {
            puzzleData.title = `Intermediate Crossword #${puzzle.id}`;
            puzzleData.description = "A moderately challenging crossword for experienced puzzlers.";
          } else {
            puzzleData.title = `Advanced Crossword #${puzzle.id}`;
            puzzleData.description = "A difficult crossword challenge for expert solvers.";
          }
        } else {
          // Use the specified theme
          puzzleData.title = theme.title;
          puzzleData.description = theme.description;
        }
        
        // Update the puzzle in the database
        await puzzle.update({
          puzzleData: JSON.stringify(puzzleData)
        });
        
        console.log(`Updated Puzzle #${puzzle.id} with title "${puzzleData.title}"`);
      } catch (error) {
        console.error(`Error updating Puzzle #${puzzle.id}:`, error);
      }
    }
    
    console.log('Puzzle theme update completed successfully!');
  } catch (error) {
    console.error('Error updating puzzle themes:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
updatePuzzleThemes();
