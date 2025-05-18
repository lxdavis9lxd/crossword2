const express = require('express');
const router = express.Router();
const { Puzzle, User } = require('../models');

// Dashboard route
router.get('/dashboard', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  
  try {
    // Get the latest user data
    const user = await User.findByPk(req.session.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Parse the user's progress
    let savedGames = [];
    if (user.progress) {
      try {
        const progressData = typeof user.progress === 'string' 
          ? JSON.parse(user.progress) 
          : user.progress;
        
        // Format saved games data for the view
        for (const [puzzleId, gameData] of Object.entries(progressData)) {
          savedGames.push({
            puzzleId,
            level: gameData.level || 'unknown',
            lastUpdated: new Date(gameData.lastUpdated).toLocaleString() || 'unknown',
            progress: gameData.progress
          });
        }
        
        // Sort by most recently updated
        savedGames.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    }
    
    // Update the session with the latest user data
    req.session.user = user;
    
    // Render the dashboard with the user data
    res.render('dashboard', { 
      user,
      savedGames,
      hasSavedGames: savedGames.length > 0
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Server error');
  }
});

// Start game route
router.post('/start', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { level } = req.body;
  
  try {
    // Get a random puzzle of the selected level
    const puzzles = await Puzzle.findAll({ where: { level } });
    
    if (puzzles.length === 0) {
      return res.status(404).send('No puzzles found for this level');
    }
    
    // Select a random puzzle
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    const selectedPuzzle = puzzles[randomIndex];
    
    // Store the selected puzzle in the session
    req.session.currentPuzzle = selectedPuzzle;
    
    // Increment the user's games played count
    await User.increment('gamesPlayed', { 
      where: { id: req.session.user.id }
    });
    
    // Render the game view with the puzzle data
    res.render('game', { 
      puzzle: selectedPuzzle,
      user: req.session.user,
      level: level,
      savedProgress: null
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).send('Server error');
  }
});

// Resume game route
router.post('/resume', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { puzzleId, progress } = req.body;
  
  try {
    // Get the puzzle by ID
    const puzzle = await Puzzle.findByPk(puzzleId);
    
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }
    
    // Render the game view with the puzzle data and saved progress
    res.render('game', { 
      puzzle: puzzle,
      user: req.session.user,
      level: puzzle.level,
      savedProgress: progress
    });
  } catch (error) {
    console.error('Error resuming game:', error);
    res.status(500).send('Server error');
  }
});

// Fetch puzzles based on difficulty level
router.get('/puzzles/:level', async (req, res) => {
  const { level } = req.params;

  try {
    const puzzles = await Puzzle.findAll({ where: { level } });
    res.json(puzzles);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Save game progress
router.post('/save', async (req, res) => {
  const { userId, puzzleId, progress } = req.body;

  try {
    // Ensure the user is logged in and matches the userId
    if (!req.session.user || req.session.user.id != userId) {
      return res.status(401).send('Unauthorized');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }

    // Create or update a record of the user's progress
    // This is just a simplified implementation
    // In a real app, you'd have a UserProgress model to store this data
    if (!user.progress) {
      user.progress = {};
    } else if (typeof user.progress === 'string') {
      // If it's stored as a string, parse it
      user.progress = JSON.parse(user.progress);
    }

    // Store progress by puzzle ID
    user.progress[puzzleId] = {
      progress: progress,
      lastUpdated: new Date().toISOString(),
      level: puzzle.level
    };

    // Save the updated progress
    await user.update({
      progress: JSON.stringify(user.progress)
    });

    res.status(200).send('Game progress saved');
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).send('Server error');
  }
});

// Retrieve saved game progress
router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Retrieve game progress (this is a placeholder, implement actual retrieval logic)
    const progress = user.progress;

    res.json({ progress });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
