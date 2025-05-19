const express = require('express');
const router = express.Router();
const { Puzzle, User } = require('../models');
const { isAuthenticated, isAuthenticatedApi } = require('../middleware/auth');

// API route for testing session protection (used by automated tests)
// This route needs to be defined BEFORE the global middleware
router.get('/api/session-test', isAuthenticatedApi, (req, res) => {
  res.status(200).json({ success: true, message: 'Authentication successful' });
});

// Apply authentication middleware to all other game routes
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
  res.render('dashboard', { user: req.session.user });
});

// Save game progress
router.post('/save', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  const { puzzleId, progress } = req.body;
  const userId = req.session.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }

    // For simplicity, we're saving progress in the user model
    // In a real app, you'd likely have a separate GameProgress model
    if (!user.progress) {
      user.progress = {};
    } else if (typeof user.progress === 'string') {
      user.progress = JSON.parse(user.progress);
    }
    
    user.progress[puzzleId] = progress;
    await user.save({
      fields: ['progress']
    });

    res.status(200).send('Game progress saved');
  } catch (error) {
    console.error('Error saving game progress:', error);
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

// Game page route
router.get('/', async (req, res) => {
  const { puzzleId } = req.query;
  
  // If no puzzleId is provided, just render the game page
  if (!puzzleId) {
    return res.render('game');
  }

  try {
    // Verify the puzzle exists
    const puzzle = await Puzzle.findByPk(puzzleId);
    if (!puzzle) {
      return res.status(404).send('Puzzle not found');
    }
    
    // Store the current puzzle in the session
    req.session.currentPuzzle = puzzle.id;
    
    // Pass the puzzle ID to the game page
    res.render('game', { puzzleId: puzzle.id, level: puzzle.level });
  } catch (error) {
    console.error('Error loading game:', error);
    res.status(500).send('Server error');
  }
});

// Start a new game
router.post('/start', async (req, res) => {
  const { level, puzzleId } = req.body;
  
  if (!level) {
    return res.status(400).send('Difficulty level is required');
  }
  
  try {
    let puzzle;
    
    if (puzzleId) {
      // If a specific puzzle ID is provided, load that puzzle
      puzzle = await Puzzle.findByPk(puzzleId);
      if (!puzzle) {
        return res.status(404).send('Puzzle not found');
      }
      
      // Verify the puzzle has the correct level
      if (puzzle.level !== level) {
        return res.status(400).send('Puzzle does not match the selected difficulty level');
      }
    } else {
      // Otherwise, get a random puzzle of the selected difficulty level
      const puzzles = await Puzzle.findAll({ where: { level } });
      
      if (!puzzles || puzzles.length === 0) {
        return res.status(404).send('No puzzles found for the selected difficulty level');
      }
      
      // Choose a random puzzle
      puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    
    // Store the selected puzzle in the session
    req.session.currentPuzzle = puzzle.id;
    
    // Redirect to the game page
    res.redirect(`/game?puzzleId=${puzzle.id}`);
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
