const express = require('express');
const router = express.Router();
const { Puzzle, User } = require('../models');

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

// Fetch a specific puzzle by ID
router.get('/puzzles/details/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const puzzle = await Puzzle.findByPk(id);
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }
    res.json(puzzle);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Dashboard route
router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Start game route - redirects to the game page
router.post('/start', (req, res) => {
  const { level } = req.body;
  // Redirect to game page with the selected level as a query parameter
  res.redirect(`/game?level=${level}`);
});

// Save game progress
router.post('/save', async (req, res) => {
  const { userId, puzzleId, progress } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }

    // Save game progress (this is a placeholder, implement actual saving logic)
    user.progress = progress;
    await user.save();

    res.send('Game progress saved');
  } catch (error) {
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

// List saved games for a user
router.get('/saved-games/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // For this example, we'll use a simplified approach
    // In a real app, you would have a SavedGame model with relationships
    // to both User and Puzzle models
    
    // Get all puzzles to display their info
    const puzzles = await Puzzle.findAll();
    
    // Create a list of saved games with puzzle info
    // In a real app, this would come from a SavedGame model query
    const savedGames = [];
    
    // If user has saved progress, add it to the list
    if (user.progress) {
      // For this simplified version, we'll assume user has one saved game
      // with the first puzzle
      if (puzzles.length > 0) {
        const savedAt = new Date().toLocaleString();
        const puzzleData = JSON.parse(puzzles[0].puzzleData);
        
        savedGames.push({
          id: 1,
          userId: user.id,
          puzzleId: puzzles[0].id,
          progress: user.progress,
          savedAt: savedAt,
          puzzleTitle: puzzleData.title || 'Untitled Puzzle',
          puzzleLevel: puzzles[0].level,
          completionPercentage: '25%' // In a real app, calculate this
        });
      }
    }
    
    res.json(savedGames);
  } catch (error) {
    console.error('Error retrieving saved games:', error);
    res.status(500).send('Server error');
  }
});

// Load a specific saved game
router.get('/saved-games/:userId/:puzzleId', async (req, res) => {
  const { userId, puzzleId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }
    
    // Get the user's progress
    const progress = user.progress;
    
    // Return both the puzzle data and the user's progress
    res.json({
      puzzle: puzzle,
      progress: progress
    });
  } catch (error) {
    console.error('Error loading saved game:', error);
    res.status(500).send('Server error');
  }
});

// Game page route
router.get('/', (req, res) => {
  res.render('game');
});

module.exports = router;
