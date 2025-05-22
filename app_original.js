const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only set secure in production
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to the SQLite3 database using Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Import models
const db = require('./models');

// Set up routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const achievementRoutes = require('./routes/achievements');
const adminRoutes = require('./routes/admin');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);
  
  // Handle different types of errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => e.message)
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Unique constraint error',
      details: err.errors.map(e => e.message)
    });
  }
  
  // If this is an API request, return JSON error
  if (req.path.startsWith('/api/') || req.accepts('json')) {
    return res.status(err.status || 500).json({
      error: 'Server error',
      message: err.message || 'Something went wrong'
    });
  }
  
  // For regular requests, show an error page or redirect
  res.status(err.status || 500).send('Server error: ' + (err.message || 'Something went wrong'));
});

// Set up routes with versioning (/v1 prefix)
app.use('/v1/auth', authRoutes);
app.use('/v1/game', gameRoutes);
app.use('/v1/achievements', achievementRoutes);
app.use('/v1/admin', adminRoutes);

// Debug route for session with versioning
app.get('/v1/debug-session', (req, res) => {
  res.json({
    session: req.session,
    user: req.session.user || null
  });
});

// Home route - redirect to versioned route
app.get('/', (req, res) => {
  res.render('index');
});

// Achievements page route with versioning
app.get('/v1/achievements', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/v1/auth/login');
  }
  res.render('achievements');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
