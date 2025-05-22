/**
 * Script to delete all existing puzzles and add 10 new ones
 */
const { Puzzle } = require('./models');
const fs = require('fs');
const path = require('path');

// Define sample puzzle data
const createSamplePuzzles = () => {
  // Array to hold puzzle definitions
  const puzzles = [];

  // Puzzle 1: Easy - 5x5 simple grid
  puzzles.push({
    level: 'easy',
    title: 'Easy Starter',
    description: 'A simple 5x5 crossword to get started',
    puzzleData: JSON.stringify({
      title: 'Easy Starter',
      description: 'A simple 5x5 crossword to get started',
      grid: ['C', 'A', 'T', '#', 'D',
             'O', '#', 'O', '#', 'O', 
             'W', 'O', 'R', 'D', 'G',
             '#', '#', 'E', '#', '#',
             'F', 'U', 'N', '#', 'S'],
      cellNumbers: {
        0: '1', 2: '2', 4: '3',
        8: '4', 10: '5', 17: '6',
        20: '7'
      },
      clues: {
        across: {
          1: 'A feline pet',
          4: 'A pet that barks',
          5: 'A unit of language',
          6: 'Enjoyable',
          7: 'Multiple of this'
        },
        down: {
          1: 'A bovine animal',
          2: 'Having to do with an apple',
          3: 'To go to sleep'
        }
      }
    })
  });

  // Puzzle 2: Easy - 6x6 food themed
  puzzles.push({
    level: 'easy',
    title: 'Food Fun',
    description: 'A tasty 6x6 food themed crossword',
    puzzleData: JSON.stringify({
      title: 'Food Fun',
      description: 'A tasty 6x6 food themed crossword',
      grid: ['P', 'I', 'Z', 'Z', 'A', '#',
             'A', '#', '#', '#', 'P', '#',
             'S', 'U', 'S', 'H', 'I', '#',
             'T', '#', 'O', '#', 'E', '#',
             'A', 'P', 'U', 'P', '#', 'C',
             '#', '#', 'P', '#', '#', 'A'],
      cellNumbers: {
        0: '1', 4: '2',
        12: '3', 14: '4',
        20: '5', 21: '6', 25: '7',
        28: '8'
      },
      clues: {
        across: {
          1: 'Italian dish with toppings',
          2: 'A fruit',
          3: 'Japanese raw fish dish',
          4: 'Ingredient in salad',
          5: 'Baby dog',
          7: 'Dessert with frosting',
          8: 'Hot drink'
        },
        down: {
          1: 'Type of noodle dish',
          2: 'Meat from a pig',
          4: 'Breakfast food',
          6: 'Hot beverage'
        }
      }
    })
  });

  // Puzzle 3: Medium - 7x7 animal themed
  puzzles.push({
    level: 'medium',
    title: 'Animal Kingdom',
    description: 'Test your animal knowledge with this 7x7 puzzle',
    puzzleData: JSON.stringify({
      title: 'Animal Kingdom',
      description: 'Test your animal knowledge with this 7x7 puzzle',
      grid: ['T', 'I', 'G', 'E', 'R', '#', '#',
             'O', '#', 'I', '#', 'A', '#', '#',
             'A', '#', 'R', 'H', 'B', 'I', 'N',
             'D', 'O', 'A', '#', 'B', '#', 'O',
             '#', 'X', 'F', 'O', 'I', 'T', 'W',
             '#', '#', 'F', '#', 'T', '#', 'L',
             '#', '#', 'E', 'A', 'G', 'L', 'E'],
      cellNumbers: {
        0: '1', 2: '2', 4: '3',
        10: '4', 13: '5', 15: '6',
        17: '7', 24: '8', 26: '9',
        28: '10', 42: '11'
      },
      clues: {
        across: {
          1: 'Large striped cat',
          4: 'Dangerous water animal',
          5: 'Small hopping animal',
          7: 'Makes honey',
          8: 'Slow moving animal with shell',
          11: 'Bird of prey'
        },
        down: {
          1: 'Horned farm animal',
          2: 'Long-necked animal',
          3: 'Dog-like predator',
          6: 'Black and white bamboo eater',
          9: 'A bird that hoots',
          10: 'King of the jungle'
        }
      }
    })
  });
  
  // Puzzle 4: Medium - 8x8 travel themed
  puzzles.push({
    level: 'medium',
    title: 'Around the World',
    description: 'Travel-themed puzzle for globetrotters',
    puzzleData: JSON.stringify({
      title: 'Around the World',
      description: 'Travel-themed puzzle for globetrotters',
      grid: ['P', 'A', 'R', 'I', 'S', '#', 'R', '#',
             'A', '#', 'O', '#', 'P', '#', 'O', '#',
             'S', 'A', 'M', 'O', 'A', '#', 'M', 'E',
             'S', '#', 'E', '#', 'I', '#', 'E', '#',
             'P', 'L', 'A', 'N', 'N', '#', '#', 'J',
             'O', '#', '#', '#', '#', 'M', '#', 'A',
             'R', 'A', 'I', 'L', '#', 'A', 'I', 'P',
             'T', '#', '#', '#', '#', 'P', '#', 'A'],
      cellNumbers: {
        0: '1', 1: '2', 2: '3', 4: '5', 6: '6',
        14: '7', 16: '8', 17: '9', 24: '10',
        32: '11', 39: '12', 40: '13', 42: '14', 45: '15'
      },
      clues: {
        across: {
          1: 'City of Lights in France',
          3: 'Pacific island nation',
          6: 'Travel organization',
          11: 'Travel by train',
          15: 'Asian country'
        },
        down: {
          1: 'Travel document',
          2: 'Travel by air',
          3: 'Travel by water',
          5: 'Sunshine state',
          6: 'City in Italy',
          7: 'Capital of England',
          8: 'Travel place to stay',
          12: 'Airline code',
          14: 'Travel on foot'
        }
      }
    })
  });

  // Puzzle 5: Medium - sports themed
  puzzles.push({
    level: 'medium',
    title: 'Sports Arena',
    description: 'A challenge for sports enthusiasts',
    puzzleData: JSON.stringify({
      title: 'Sports Arena',
      description: 'A challenge for sports enthusiasts',
      grid: ['S', 'O', 'C', 'C', 'E', 'R', '#', '#',
             'W', '#', '#', '#', '#', 'A', '#', '#',
             'I', 'C', 'E', '#', '#', 'C', '#', '#',
             'M', '#', 'N', 'E', 'T', 'E', '#', 'B',
             '#', 'G', 'N', '#', '#', '#', '#', 'A',
             'T', 'O', 'I', 'S', '#', 'G', 'O', 'L',
             'E', 'L', 'S', '#', 'F', 'A', 'U', 'L',
             'A', 'F', '#', '#', 'O', 'M', 'L', 'S'],
      cellNumbers: {
        0: '1', 6: '2', 13: '3', 16: '4', 
        21: '5', 23: '6', 32: '7', 33: '8',
        37: '9', 38: '10', 41: '11', 42: '12',
        56: '13'
      },
      clues: {
        across: {
          1: 'A game played with a round ball',
          3: 'Frozen surface for hockey',
          5: 'What volleyball players hit over',
          7: 'Gymnasts flip on this',
          9: 'A type of racing',
          10: 'Hole in one sport',
          12: 'Breaking the rules in basketball',
          13: 'Football league'
        },
        down: {
          1: 'Aquatic sport',
          2: 'Running sport',
          4: 'Tennis hit',
          6: 'A baseball hit',
          8: 'They wear pads',
          11: 'A cricket term'
        }
      }
    })
  });
  
  // Puzzle 6: Hard - science themed
  puzzles.push({
    level: 'hard',
    title: 'Science Lab',
    description: 'For science enthusiasts - a challenging puzzle',
    puzzleData: JSON.stringify({
      title: 'Science Lab',
      description: 'For science enthusiasts - a challenging puzzle',
      grid: ['A', 'T', 'O', 'M', '#', 'P', 'H', '#', 'S',
             'C', '#', '#', 'A', '#', 'H', '#', '#', 'O',
             'I', 'N', 'E', 'G', 'N', 'Y', 'S', 'I', 'C',
             'D', '#', '#', 'N', '#', 'S', '#', '#', 'S',
             '#', 'B', 'I', 'E', '#', 'I', 'O', 'N', '#',
             'R', '#', '#', 'T', '#', 'C', '#', '#', 'C',
             'A', 'S', 'T', 'I', 'C', 'S', '#', 'C', 'E',
             'Y', '#', '#', 'C', '#', '#', '#', '#', 'L',
             'S', 'O', 'L', 'S', '#', 'L', 'A', 'B', 'L'],
      cellNumbers: {
        0: '1', 1: '2', 5: '3', 8: '4', 
        16: '5', 24: '6', 27: '7', 32: '8',
        36: '9', 40: '10', 43: '11', 52: '12',
        56: '13', 59: '14'
      },
      clues: {
        across: {
          1: 'Smallest unit of matter',
          3: 'Measure of acidity',
          4: 'Study of matter',
          5: 'Study of energy',
          7: 'Charged particle',
          9: 'Study of life',
          11: 'Study of cells',
          13: 'Plural of sol',
          14: 'Place for experiments'
        },
        down: {
          1: 'Chemical bond type',
          2: 'Element or compound',
          3: 'Study of light',
          4: 'Study of space',
          6: 'Study of plants',
          8: 'Type of reaction',
          10: 'Cell part',
          12: 'Liquid solution'
        }
      }
    })
  });
  
  // Puzzle 7: Hard - technology themed
  puzzles.push({
    level: 'hard',
    title: 'Tech Talk',
    description: 'A challenging puzzle for technology lovers',
    puzzleData: JSON.stringify({
      title: 'Tech Talk',
      description: 'A challenging puzzle for technology lovers',
      grid: ['P', 'R', 'O', 'G', 'R', 'A', 'M', '#', 'A',
             'A', '#', '#', '#', '#', '#', 'O', '#', 'P',
             'S', 'O', 'F', 'T', 'W', 'A', 'D', 'E', 'P',
             'S', '#', 'I', '#', 'E', '#', 'E', '#', '#',
             'W', 'E', 'R', 'E', 'B', '#', 'M', '#', 'C',
             'O', '#', 'E', '#', '#', '#', '#', '#', 'O',
             'R', 'A', 'W', '#', 'C', 'P', 'U', '#', 'D',
             'D', '#', 'A', '#', 'O', '#', 'S', '#', 'E',
             '#', 'R', 'L', 'I', 'D', 'E', '#', '#', '#'],
      cellNumbers: {
        0: '1', 2: '2', 6: '3', 8: '4', 
        16: '5', 18: '6', 24: '7', 28: '8',
        32: '9', 36: '10', 42: '11', 44: '12',
        46: '13', 50: '14'
      },
      clues: {
        across: {
          1: 'Software code',
          3: 'Computer memory',
          4: 'App',
          5: 'World Wide Web',
          8: 'Internet',
          10: 'Computer brain (abbr)',
          11: 'Website movement',
          12: 'Computer code',
          14: 'Mouse action'
        },
        down: {
          1: 'Password',
          2: 'File copy',
          3: 'Computer memory unit',
          4: 'Program instruction',
          6: 'Software download',
          7: 'Web address part',
          9: 'Computer part',
          13: 'Delete key'
        }
      }
    })
  });
  
  // Puzzle 8: Hard - literature themed
  puzzles.push({
    level: 'hard',
    title: 'Literary Classics',
    description: 'A sophisticated puzzle for literature lovers',
    puzzleData: JSON.stringify({
      title: 'Literary Classics',
      description: 'A sophisticated puzzle for literature lovers',
      grid: ['N', 'O', 'V', 'E', 'L', '#', 'P', 'O', 'E',
             'O', '#', '#', '#', '#', '#', 'L', '#', 'S',
             'T', 'R', 'A', 'G', 'E', 'D', 'O', 'T', 'S',
             'E', '#', 'U', '#', '#', '#', 'T', '#', 'A',
             'S', 'O', 'T', 'H', 'O', 'R', '#', 'B', 'Y',
             '#', '#', 'H', '#', '#', 'H', '#', 'O', '#',
             'W', 'H', 'O', 'Y', '#', 'Y', 'A', 'O', 'K',
             'R', '#', 'R', '#', '#', 'M', '#', 'K', '#',
             'I', 'A', 'M', 'B', 'I', 'E', '#', '#', '#'],
      cellNumbers: {
        0: '1', 6: '2', 8: '3', 
        16: '4', 22: '5', 24: '6',
        32: '7', 36: '8', 44: '9', 46: '10',
        50: '11', 52: '12', 53: '13'
      },
      clues: {
        across: {
          1: 'Book format',
          2: 'Writer of verse',
          3: 'Shakespeare specialty',
          4: 'Literary magazine',
          6: 'Author (abbr)',
          7: 'Classic book question',
          9: 'Young adult (abbr)',
          10: 'Poetry foot',
          13: 'Type of meter'
        },
        down: {
          1: 'Short tale',
          2: 'Story\'s main character',
          3: 'Literary criticism',
          4: 'Fiction\'s opposite',
          5: 'Story setting',
          8: 'Writer',
          11: 'Mystery writer',
          12: 'Book part'
        }
      }
    })
  });
  
  // Puzzle 9: Hard - music themed
  puzzles.push({
    level: 'hard',
    title: 'Music Maestro',
    description: 'A harmonious puzzle for music lovers',
    puzzleData: JSON.stringify({
      title: 'Music Maestro',
      description: 'A harmonious puzzle for music lovers',
      grid: ['B', 'A', 'S', 'S', '#', 'T', 'E', 'M', 'P',
             'E', '#', '#', 'C', '#', 'U', '#', '#', 'I',
             'A', 'L', 'T', 'A', 'L', 'N', 'E', '#', 'A',
             'T', '#', '#', 'L', '#', 'E', '#', '#', 'N',
             '#', 'R', 'H', 'E', '#', '#', 'D', 'R', 'O',
             'D', '#', '#', '#', '#', 'B', '#', 'U', '#',
             'R', 'E', 'S', 'T', '#', 'E', 'A', 'M', '#',
             'U', '#', '#', '#', '#', 'A', '#', '#', 'K',
             'M', 'E', 'L', 'O', 'D', 'T', '#', '#', 'Y'],
      cellNumbers: {
        0: '1', 5: '2', 8: '3', 
        16: '4', 20: '5', 32: '6',
        37: '7', 39: '8', 44: '9',
        46: '10', 52: '11', 56: '12'
      },
      clues: {
        across: {
          1: 'Low pitched instrument',
          2: 'Speed of music',
          4: 'High male voice',
          5: 'Clarinet part',
          6: 'Percussion instruments',
          9: 'Music note pause',
          10: 'Percussion group',
          12: 'Musical tune'
        },
        down: {
          1: 'Percussion instrument',
          2: 'Large brass instrument',
          3: 'Piano part',
          4: 'Music staff symbol',
          5: 'Wind instrument',
          7: 'Music staff line',
          8: 'Music piece',
          11: 'Music key'
        }
      }
    })
  });
  
  // Puzzle 10: Expert - mixed theme
  puzzles.push({
    level: 'expert',
    title: 'Ultimate Challenge',
    description: 'Our most difficult puzzle with mixed themes',
    puzzleData: JSON.stringify({
      title: 'Ultimate Challenge',
      description: 'Our most difficult puzzle with mixed themes',
      grid: ['Q', 'U', 'A', 'N', 'T', 'U', 'M', '#', 'Z',
             'U', '#', '#', '#', '#', '#', 'A', '#', 'E',
             'I', 'N', 'F', 'I', 'N', 'I', 'T', 'Y', 'N',
             'L', '#', 'L', '#', '#', '#', 'H', '#', 'I',
             'L', 'E', 'O', 'P', 'A', 'R', 'E', 'M', 'T',
             '#', '#', 'R', '#', '#', 'E', '#', 'A', '#',
             'G', 'A', 'A', 'X', '#', 'L', 'O', 'T', 'H',
             'A', '#', '#', '#', '#', 'A', '#', 'I', '#',
             'P', 'A', 'R', 'A', 'D', 'T', 'X', 'C', 'S'],
      cellNumbers: {
        0: '1', 6: '2', 8: '3', 
        16: '4', 22: '5', 24: '6',
        32: '7', 36: '8', 44: '9', 46: '10',
        50: '11', 52: '12', 54: '13'
      },
      clues: {
        across: {
          1: 'Physics theory',
          2: 'Chemical element',
          4: 'Without end',
          7: 'Big cat',
          9: 'Celestial body',
          10: 'Slow animal',
          13: 'Unexpected situation'
        },
        down: {
          1: 'Feathered pet',
          2: 'Writing tool',
          3: 'Not old',
          5: 'Heavy metal',
          6: 'Chess piece',
          8: 'Cooking oil',
          11: 'Tropical fruit',
          12: 'Science fiction writer'
        }
      }
    })
  });

  return puzzles;
};

async function resetAndAddPuzzles() {
  try {
    console.log('Connecting to database...');
    
    // Delete all existing puzzles
    console.log('Deleting all existing puzzles...');
    await Puzzle.destroy({ where: {}, truncate: true });
    console.log('All puzzles deleted successfully.');
    
    // Create sample puzzles
    console.log('Creating new sample puzzles...');
    const puzzlesToAdd = createSamplePuzzles();
    
    // Add puzzles to database
    for (const puzzleData of puzzlesToAdd) {
      await Puzzle.create(puzzleData);
      console.log(`Added puzzle: ${JSON.parse(puzzleData.puzzleData).title}`);
    }
    
    console.log('Successfully added 10 new puzzles to the database!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
resetAndAddPuzzles();
