const { Puzzle } = require('./models');

// Themed titles and descriptions for the existing puzzles
const puzzleThemes = [
  {
    id: 1,
    title: "Everyday Language",
    description: "A simple puzzle featuring common words and basic vocabulary. Perfect for beginners!"
  },
  {
    id: 2,
    title: "Animals and Nature",
    description: "Explore the natural world with this beginner-friendly crossword about animals and nature."
  },
  {
    id: 3,
    title: "Food and Drinks",
    description: "A tasty crossword featuring culinary vocabulary that will make you hungry for more puzzles!"
  },
  {
    id: 4,
    title: "Around the House",
    description: "Discover common household items and domestic vocabulary in this easy crossword puzzle."
  },
  {
    id: 5,
    title: "Simple Pleasures",
    description: "A laid-back crossword with simple, everyday terms that are perfect for casual solvers."
  },
  {
    id: 6,
    title: "Word Games",
    description: "A moderately challenging puzzle about games, puzzles, and recreational activities."
  },
  {
    id: 7,
    title: "Travel and Places",
    description: "Take a journey through geographical terms and travel vocabulary in this intermediate puzzle."
  },
  {
    id: 8,
    title: "Science and Technology",
    description: "Explore scientific concepts and technological terms in this brain-teasing intermediate crossword."
  },
  {
    id: 9,
    title: "Literary Terms",
    description: "An advanced puzzle featuring vocabulary from the world of literature and language arts."
  },
  {
    id: 10,
    title: "World Cultures",
    description: "Challenge yourself with this advanced crossword about global cultures, history, and international terms."
  }
];

async function addTitlesToPuzzles() {
  try {
    console.log('Adding titles and descriptions to existing puzzles...');
    
    for (const theme of puzzleThemes) {
      console.log(`Processing puzzle #${theme.id}...`);
      
      try {
        const puzzle = await Puzzle.findByPk(theme.id);
        
        if (!puzzle) {
          console.log(`Puzzle #${theme.id} not found, skipping`);
          continue;
        }
        
        console.log(`Found Puzzle #${theme.id}, level: ${puzzle.level}`);
        
        // Parse the existing puzzle data
        let puzzleData = JSON.parse(puzzle.puzzleData);
        console.log(`Successfully parsed puzzle data`);
        
        // Add title and description
        puzzleData.title = theme.title;
        puzzleData.description = theme.description;
        
        // Update the puzzle
        await puzzle.update({
          puzzleData: JSON.stringify(puzzleData)
        });
        
        console.log(`Updated Puzzle #${theme.id} with title: "${theme.title}"`);
      } catch (innerError) {
        console.error(`Error processing Puzzle #${theme.id}:`, innerError);
      }
    }
    
    console.log('Finished adding titles and descriptions to puzzles');
  } catch (error) {
    console.error('Error adding titles to puzzles:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addTitlesToPuzzles();
