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

module.exports = router;
