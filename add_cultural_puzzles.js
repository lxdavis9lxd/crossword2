/**
 * Script to add two new culturally themed puzzles related to Black Milwaukee
 */
const { Puzzle } = require('./models');

async function addCulturalPuzzles() {
  try {
    console.log('Connecting to database...');
    
    const puzzles = [];
    
    // Puzzle 1: Black Milwaukee History (Medium Difficulty)
    puzzles.push({
      level: 'medium',
      title: 'Black Milwaukee Heritage',
      description: 'Celebrate the rich cultural history of Black Milwaukee with this themed crossword.',
      puzzleData: JSON.stringify({
        title: 'Black Milwaukee Heritage',
        description: 'Celebrate the rich cultural history of Black Milwaukee with this themed crossword.',
        grid: [
          'B', 'R', 'O', 'N', 'Z', 'E', 'V', 'I', 'L', 'L', 'E',
          'R', '#', 'P', '#', '#', '#', 'E', '#', '#', '#', 'J',
          'O', '#', 'N', 'O', 'R', 'T', 'H', '#', 'M', '#', 'U',
          'N', '#', 'R', '#', 'A', '#', 'L', '#', 'I', '#', 'N',
          'Z', 'E', 'A', '#', 'L', '#', 'U', '#', 'D', 'A', 'E',
          'E', '#', 'H', '#', 'P', '#', 'E', '#', 'P', '#', 'T',
          'M', 'I', 'L', 'W', 'H', '#', 'G', 'A', 'O', 'I', 'N',
          'A', '#', 'E', '#', '#', '#', 'A', '#', 'I', '#', 'T',
          'N', '#', 'Y', '#', 'J', 'A', 'Z', 'Z', 'N', '#', 'H',
          '#', '#', '#', '#', 'O', '#', 'Z', '#', 'T', '#', '#',
          'W', 'A', 'L', 'N', 'U', 'T', 'S', 'T', 'R', 'E', 'E', 'T'
        ],
        cellNumbers: {
          0: '1', 6: '2', 12: '3', 16: '4', 18: '5', 20: '6',
          24: '7', 26: '8', 28: '9', 29: '10', 
          36: '11', 47: '12', 49: '13',
          60: '14', 65: '15', 67: '16',
          80: '17', 82: '18',
          96: '19' 
        },
        clues: {
          across: {
            1: 'Historic Black Milwaukee neighborhood known as ____ville',
            3: 'Milwaukee\'s ___ side, historically home to many Black communities',
            7: 'Last name of Milwaukee\'s first Black mayor',
            9: 'Influential Black newspaper in Milwaukee, The Milwaukee ____',
            11: 'City where this puzzle is focused',
            14: 'Popular music genre in Milwaukee\'s Black community',
            19: '_____ Street, key thoroughfare in Black Milwaukee'
          },
          down: {
            1: 'Bronzeville\'s annual cultural celebration',
            2: 'Last name of civil rights leader who led 200 consecutive daily marches for fair housing',
            4: 'America\'s Black Holocaust Museum founder, Dr. James ____',
            5: 'MLK _____ Drive, renamed street honoring civil rights leader',
            6: 'Milwaukee\'s annual Black arts festival, "___ Juneteenth"',
            8: 'Community leader Vel R. _____, first Black woman elected to WI legislature',
            10: 'Historic _____ Theater in Bronzeville',
            12: 'Annual cultural celebration marking the end of slavery',
            13: 'Wisconsin\'s only HBCU (abbr.)',
            15: 'Black-owned radio station WNOV\'s street nickname',
            16: 'Civil rights activist Father James _____',
            17: 'Historic Walnut Street _____ District',
            18: 'Milwaukee Urban _____, community organization'
          }
        }
      })
    });
    
    // Puzzle 2: Milwaukee Soul Food & Culture (Easy Difficulty)
    puzzles.push({
      level: 'easy',
      title: 'Milwaukee Soul & Culture',
      description: 'Have fun with this easy crossword celebrating Black food, music, and culture in Milwaukee!',
      puzzleData: JSON.stringify({
        title: 'Milwaukee Soul & Culture',
        description: 'Have fun with this easy crossword celebrating Black food, music, and culture in Milwaukee!',
        grid: [
          'M', 'O', 'T', 'O', 'W', 'N', '#', 'S', 'O', 'U', 'L',
          'A', '#', '#', '#', '#', 'E', '#', 'U', '#', '#', '#',
          'C', 'O', 'L', 'L', 'A', 'R', 'D', 'M', 'M', 'E', 'R',
          'A', '#', '#', '#', '#', 'A', '#', 'M', '#', '#', '#',
          'N', 'O', 'R', 'T', 'H', 'S', 'I', 'E', 'R', '#', 'B',
          'D', '#', '#', '#', '#', '#', '#', 'R', '#', 'K', 'B',
          'D', 'A', 'N', 'C', 'E', '#', 'G', 'F', 'E', 'S', 'Q',
          '#', '#', '#', '#', '#', '#', 'R', 'E', '#', '#', '#',
          'J', 'U', 'N', 'E', 'T', 'E', 'E', 'N', 'T', 'H', '#'
        ],
        cellNumbers: {
          0: '1', 6: '2', 7: '3', 12: '4', 17: '5', 
          24: '6', 27: '7', 32: '8', 
          44: '9', 48: '10',
          55: '11', 56: '12', 57: '13',
          67: '14',
          77: '15'
        },
        clues: {
          across: {
            1: 'Music style with roots in Detroit but popular in Milwaukee',
            3: 'Genre of music with deep roots in Black culture',
            4: '_____ greens, soul food staple',
            6: 'Milwaukee\'s ____ side where many Black businesses thrived',
            9: 'Movement to music',
            12: 'Milwaukee\'s "Black Grat Day", Summer___',
            15: 'Freedom celebration in Black communities'
          },
          down: {
            1: 'Milwaukee\'s annual summer music festival (abbr.)',
            2: 'Important spoken word art form in Black culture',
            5: 'Sweet potato _____, classic soul food dessert',
            7: 'Typical restaurant side: Mac and _____',
            8: 'Franklin _____, historic Black neighborhood square',
            10: '____ joint, casual soul food restaurant',
            11: 'Style of slow-cooked meat popular in soul food',
            13: '_____ music, improvisational genre popular in Milwaukee',
            14: 'Common greeting in the community'
          }
        }
      })
    });
    
    // Add puzzles to database
    for (const puzzleData of puzzles) {
      await Puzzle.create(puzzleData);
      console.log(`Added puzzle: ${JSON.parse(puzzleData.puzzleData).title}`);
    }
    
    console.log('Successfully added 2 new cultural puzzles to the database!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
addCulturalPuzzles();
