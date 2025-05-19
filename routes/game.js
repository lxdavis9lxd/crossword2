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
  // The user is already available in res.locals.user thanks to the middleware
  // but we'll pass it explicitly for clarity as well
  res.render('dashboard', { 
    user: req.session.user,
    pageTitle: 'Crossword Game Dashboard'
  });
});

// Save game progress
router.post('/save', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { puzzleId, progress } = req.body;
  
  // Validate input
  if (!puzzleId || !progress) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
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

    // For simplicity, we're saving progress in the user model
    // In a real app, you'd likely have a separate GameProgress model
    let userProgress = {};
    
    // Initialize progress if it doesn't exist or parse it if it's a string
    if (!user.progress) {
      userProgress = {};
    } else if (typeof user.progress === 'string') {
      try {
        userProgress = JSON.parse(user.progress);
      } catch (e) {
        userProgress = {};
      }
    } else {
      userProgress = user.progress;
    }
    
    console.log('Initial user progress:', userProgress);
    
    // Parse the progress if it's a JSON string to avoid double serialization
    let progressData;
    if (typeof progress === 'string') {
      try {
        // Parse once to get the actual progress data
        progressData = JSON.parse(progress);
        console.log('Progress parsed from string:', progressData);
      } catch (e) {
        // If it's not valid JSON, store as is
        progressData = progress;
        console.log('Progress used as-is (parsing failed):', progress);
      }
    } else {
      progressData = progress;
      console.log('Progress used as-is (not a string):', progress);
    }
    
    // Store the progress data for this puzzle
    userProgress[puzzleId] = progressData;
    
    // Update the user's progress
    user.progress = userProgress;
    
    // Log the user's progress object before saving
    console.log('User progress before save:', user.progress);
    
    // Save the update
    await user.save({
      fields: ['progress']
    });
    
    // Verify the save worked by reading it back
    const verifyUser = await User.findByPk(userId);
    console.log('User progress after save:', verifyUser.progress);

    res.status(200).json({ success: true, message: 'Game progress saved' });
  } catch (error) {
    console.error('Error saving game progress:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Retrieve saved game progress
router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // Validate user authorization - users can only access their own progress
  if (!req.session.user || req.session.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Forbidden: You can only access your own progress' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve game progress
    const progress = user.progress;
    console.log('Raw progress from user model:', progress);
    console.log('User ID:', userId);
    console.log('Progress type:', typeof progress);
    
    // Format the response data with additional metadata
    const formattedProgress = {};
    
    // If there's no progress, return an empty object
    if (!progress || Object.keys(progress).length === 0) {
      return res.json({ progress: {} });
    }
    
    // For each saved game, ensure proper format
    for (const puzzleId in progress) {
      // Check if progress data is a string and needs parsing
      if (typeof progress[puzzleId] === 'string') {
        try {
          // Try to parse it if it's still a string (it shouldn't be at this point, but just in case)
          formattedProgress[puzzleId] = JSON.parse(progress[puzzleId]);
        } catch (e) {
          // If not a valid JSON string, use as is
          formattedProgress[puzzleId] = progress[puzzleId];
        }
      } else {
        // Already an object, use as is
        formattedProgress[puzzleId] = progress[puzzleId];
      }
    }

    res.json({ progress: formattedProgress });
  } catch (error) {
    console.error('Error retrieving game progress:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
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
    
    // Pass the puzzle ID and user to the game page
    res.render('game', { 
      puzzleId: puzzle.id, 
      level: puzzle.level,
      user: req.session.user 
    });
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
