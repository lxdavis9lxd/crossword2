const express = require('express');
const router = express.Router();
const { Puzzle, User } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all game routes
router.use(isAuthenticated);

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

// Save game progress
router.post('/save', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { puzzleId, progress } = req.body;
  const userId = req.session.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    // Check if user has a progress field
    let userProgress = {};
    if (user.progress) {
      // If progress is stored as a string, parse it
      if (typeof user.progress === 'string') {
        try {
          userProgress = JSON.parse(user.progress);
        } catch (e) {
          userProgress = {};
        }
      } else {
        userProgress = user.progress;
      }
    }
    
    // Update the progress for this specific puzzle
    userProgress[puzzleId] = progress;
    
    // Save the updated progress
    user.progress = JSON.stringify(userProgress);
    await user.save();

    res.status(200).json({ message: 'Game progress saved successfully' });
  } catch (error) {
    console.error('Error saving game progress:', error);
    res.status(500).json({ error: 'Server error' });
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

// Game page route
router.get('/', (req, res) => {
  res.render('game');
});

// Start a new game
router.post('/start', async (req, res) => {
  const { level } = req.body;
  
  if (!level) {
    return res.status(400).send('Difficulty level is required');
  }
  
  try {
    // Get random puzzle of the selected difficulty level
    const puzzles = await Puzzle.findAll({ where: { level } });
    
    if (!puzzles || puzzles.length === 0) {
      return res.status(404).send('No puzzles found for the selected difficulty level');
    }
    
    // Choose a random puzzle
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    
    // Redirect to the game page with the puzzle ID
    res.redirect(`/game?puzzleId=${randomPuzzle.id}`);
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
