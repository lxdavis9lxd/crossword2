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
  saveUninitialized: true
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
const User = require('./models/user');
const Puzzle = require('./models/puzzle');

// Sync models
sequelize.sync();

// Set up routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

app.use('/auth', authRoutes);
app.use('/game', gameRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
