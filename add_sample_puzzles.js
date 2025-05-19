const { Puzzle } = require('./models');

const samplePuzzleData = {
  easy: [
    {
      title: "Animal Kingdom",
      description: "A simple crossword about animals and basic words. Perfect for beginners!",
      grid: [
        "C", "A", "T", " ",
        "A", "P", "E", " ",
        "R", "E", "D", " ",
        " ", " ", " ", " "
      ],
      clues: {
        across: [
          { number: 1, clue: "Feline pet", answer: "CAT" },
          { number: 4, clue: "Primate", answer: "APE" },
          { number: 7, clue: "Color of a stop sign", answer: "RED" }
        ],
        down: [
          { number: 1, clue: "Automobile", answer: "CAR" },
          { number: 2, clue: "Above", answer: "ATE" },
          { number: 3, clue: "Canine pet", answer: "DOG" }
        ]
      }
    },
    {
      title: "Daily Words",
      description: "Everyday vocabulary for casual crossword solvers. Simple and fun!",
      grid: [
        "D", "O", "G", " ",
        "A", "R", "E", " ",
        "Y", "E", "S", " ",
        " ", " ", " ", " "
      ],
      clues: {
        across: [
          { number: 1, clue: "Canine pet", answer: "DOG" },
          { number: 4, clue: "To exist", answer: "ARE" },
          { number: 7, clue: "Affirmative", answer: "YES" }
        ],
        down: [
          { number: 1, clue: "Day of the week", answer: "DAY" },
          { number: 2, clue: "Row a boat", answer: "OAR" },
          { number: 3, clue: "Green vegetable", answer: "PEA" }
        ]
      }
    }
  ],
  intermediate: [
    {
      title: "Office Items",
      description: "A moderately challenging puzzle featuring common items found in an office environment. Test your vocabulary!",
      grid: [
        "C", "A", "T", "S", " ",
        "O", "P", "E", "N", " ",
        "D", "E", "S", "K", " ",
        "E", "A", "S", "Y", " ",
        " ", " ", " ", " ", " "
      ],
      clues: {
        across: [
          { number: 1, clue: "Feline pets", answer: "CATS" },
          { number: 5, clue: "Not closed", answer: "OPEN" },
          { number: 9, clue: "Work surface", answer: "DESK" },
          { number: 13, clue: "Not difficult", answer: "EASY" }
        ],
        down: [
          { number: 1, clue: "Symbol of peace", answer: "DOVE" },
          { number: 2, clue: "Acting part", answer: "ROLE" },
          { number: 3, clue: "Tool for eating", answer: "FORK" },
          { number: 4, clue: "Gentle push", answer: "NUDGE" }
        ]
      }
    }
  ],
  advanced: [
    {
      title: "Vocabulary Challenge",
      description: "An advanced crossword puzzle for word enthusiasts. Features longer words and more challenging clues to test your lexical prowess!",
      grid: [
        "C", "A", "S", "T", "L", "E", " ",
        "O", "R", "A", "T", "O", "R", " ",
        "M", "A", "R", "I", "N", "E", " ",
        "P", "U", "Z", "Z", "L", "E", " ",
        "A", "N", "I", "M", "A", "L", " ",
        "S", "E", "N", "A", "T", "E", " ",
        " ", " ", " ", " ", " ", " ", " "
      ],
      clues: {
        across: [
          { number: 1, clue: "Medieval fortress", answer: "CASTLE" },
          { number: 7, clue: "Public speaker", answer: "ORATOR" },
          { number: 13, clue: "Related to the ocean", answer: "MARINE" },
          { number: 19, clue: "Brain teaser", answer: "PUZZLE" },
          { number: 25, clue: "Living creature", answer: "ANIMAL" },
          { number: 31, clue: "Legislative body", answer: "SENATE" }
        ],
        down: [
          { number: 1, clue: "Building material", answer: "COMPAS" },
          { number: 2, clue: "Musical performance", answer: "ARUZIA" },
          { number: 3, clue: "Writing implement", answer: "STRENE" },
          { number: 4, clue: "Bird's home", answer: "TEMPLE" },
          { number: 5, clue: "Type of light", answer: "LOAZEL" },
          { number: 6, clue: "Cooking direction", answer: "EER" }
        ]
      }
    }
  ]
};

async function addSamplePuzzles() {
  try {
    console.log('Adding sample puzzles to the database...');
    
    // Add easy puzzles
    for (const puzzle of samplePuzzleData.easy) {
      await Puzzle.create({
        level: 'easy',
        puzzleData: JSON.stringify(puzzle)
      });
    }
    
    // Add intermediate puzzles
    for (const puzzle of samplePuzzleData.intermediate) {
      await Puzzle.create({
        level: 'intermediate',
        puzzleData: JSON.stringify(puzzle)
      });
    }
    
    // Add advanced puzzles
    for (const puzzle of samplePuzzleData.advanced) {
      await Puzzle.create({
        level: 'advanced',
        puzzleData: JSON.stringify(puzzle)
      });
    }
    
    console.log('Sample puzzles added successfully!');
  } catch (error) {
    console.error('Error adding sample puzzles:', error);
  } finally {
    process.exit();
  }
}

// Run the function
addSamplePuzzles();
