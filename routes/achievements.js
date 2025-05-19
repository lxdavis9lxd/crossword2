// filepath: /workspaces/crossword2/routes/achievements.js
const express = require('express');
const router = express.Router();
const { Achievement, User, UserAchievement, Puzzle } = require('../models');
const { isAuthenticated, isAuthenticatedApi } = require('../middleware/auth');

// Apply authentication middleware to all achievement routes
router.use(isAuthenticated);

// Render the achievements page
router.get('/view', (req, res) => {
  res.render('achievements');
});

// Get achievements for the current user
router.get('/', async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get all achievements from the system
    const allAchievements = await Achievement.findAll();
    
    // Get user's earned achievements
    const userAchievements = await UserAchievement.findAll({
      where: { userId: user.id }
    });

    const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);

    // Mark which achievements are earned
    const achievements = allAchievements.map(achievement => {
      const isEarned = earnedAchievementIds.includes(achievement.id);
      const userAchievement = isEarned 
        ? userAchievements.find(ua => ua.achievementId === achievement.id)
        : null;
        
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        earned: isEarned,
        dateAwarded: userAchievement ? userAchievement.dateAwarded : null
      };
    });

    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check for new achievements after completing a puzzle
router.post('/check', async (req, res) => {
  try {
    const { puzzleId, completionTime, mistakesMade } = req.body;
    const userId = req.session.userId;

    // Get user data
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get the puzzle that was completed
    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ success: false, message: 'Puzzle not found' });
    }

    // Update completed puzzles for the user
    let completedPuzzles = user.completedPuzzles || [];
    if (!completedPuzzles.includes(parseInt(puzzleId))) {
      completedPuzzles.push(parseInt(puzzleId));
      user.completedPuzzles = completedPuzzles;
      await user.save();
    }

    // Get all achievements
    const allAchievements = await Achievement.findAll();
    
    // Get user's current achievements
    const userAchievements = await UserAchievement.findAll({
      where: { userId: user.id }
    });
    
    const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);
    
    // Check for new achievements
    const newlyEarnedAchievements = [];
    
    for (const achievement of allAchievements) {
      // Skip if already earned
      if (earnedAchievementIds.includes(achievement.id)) {
        continue;
      }
      
      const criteria = JSON.parse(achievement.criteria);
      let isEarned = false;
      
      // Check different types of criteria
      if (criteria.type === 'completedPuzzles') {
        // Simple completion count check
        if (criteria.level) {
          // Count puzzles completed at specific level
          const puzzlesAtLevel = await Puzzle.findAll({
            where: { 
              id: completedPuzzles,
              level: criteria.level 
            }
          });
          isEarned = puzzlesAtLevel.length >= criteria.count;
        } else {
          // Count all puzzles completed
          isEarned = completedPuzzles.length >= criteria.count;
        }
      } else if (criteria.type === 'timeChallenge' && completionTime) {
        // Time-based achievement for this puzzle
        isEarned = puzzle.level === criteria.level && completionTime <= criteria.maxTime;
      } else if (criteria.type === 'noMistakes' && mistakesMade !== undefined) {
        // No mistakes achievement
        isEarned = mistakesMade === 0;
      }
      
      // Award the achievement if earned
      if (isEarned) {
        await UserAchievement.create({
          userId: user.id,
          achievementId: achievement.id,
          dateAwarded: new Date()
        });
        
        newlyEarnedAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon
        });
      }
    }
    
    res.json({
      success: true,
      newAchievements: newlyEarnedAchievements
    });
    
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;