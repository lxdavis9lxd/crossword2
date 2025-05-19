const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../models');
const { Sequelize } = require('sequelize');
const sequelize = require('../models').sequelize;

// GET route for registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// GET route for login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate form data
  if (!username || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).send('Username already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Redirect to login page after successful registration
    res.redirect('/auth/login');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  // Validate form data
  if (!emailOrUsername || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    // Find the user by email or username
    const user = await User.findOne({ 
      where: {
        [sequelize.Op.or]: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      } 
    });

    if (!user) {
      return res.status(400).send('Invalid email/username or password');
    }

    // Check if the user account is active
    if (!user.isActive) {
      return res.status(400).send('This account has been deactivated. Please contact an administrator.');
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email/username or password');
    }

    // Set user session with only necessary information
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Redirect to game dashboard
    res.redirect('/game/dashboard');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    
    // Redirect to home page
    res.redirect('/');
  });
});

module.exports = router;
