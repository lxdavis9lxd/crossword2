const db = require('./models');
const { Achievement } = db;

const achievements = [
  {
    name: 'Crossword Novice',
    description: 'Complete your first puzzle',
    icon: 'trophy-bronze',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      count: 1
    })
  },
  {
    name: 'Puzzle Enthusiast',
    description: 'Complete 5 puzzles of any difficulty',
    icon: 'trophy-silver',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      count: 5
    })
  },
  {
    name: 'Crossword Master',
    description: 'Complete 10 puzzles of any difficulty',
    icon: 'trophy-gold',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      count: 10
    })
  },
  {
    name: 'Word Wizard',
    description: 'Complete 5 advanced difficulty puzzles',
    icon: 'star-gold',
    criteria: JSON.stringify({
      type: 'completedPuzzles',
      level: 'advanced',
      count: 5
    })
  },
  {
    name: 'Speed Solver',
    description: 'Complete an easy puzzle in under 3 minutes',
    icon: 'clock',
    criteria: JSON.stringify({
      type: 'timeChallenge',
      level: 'easy',
      maxTime: 180 // in seconds
    })
  },
  {
    name: 'Perfectionist',
    description: 'Complete a puzzle without any mistakes',
    icon: 'checkmark',
    criteria: JSON.stringify({
      type: 'noMistakes'
    })
  }
];

async function addAchievements() {
  try {
    for (const achievement of achievements) {
      await Achievement.findOrCreate({
        where: { name: achievement.name },
        defaults: achievement
      });
    }
    console.log('Achievements added successfully!');
  } catch (error) {
    console.error('Error adding achievements:', error);
  } finally {
    process.exit();
  }
}

// Run the function
addAchievements();
