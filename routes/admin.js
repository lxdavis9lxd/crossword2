const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Puzzle } = require('../models');
const { isAdmin, isAdminApi } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../temp');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only Excel files
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Apply admin middleware to all routes
router.use(isAdmin);

// Admin dashboard
router.get('/', async (req, res) => {
  try {
    // Get counts for dashboard
    const userCount = await User.count();
    const puzzleCount = await Puzzle.count();
    const adminCount = await User.count({ where: { role: 'admin' } });
    
    // Get puzzle counts by level
    const easyCount = await Puzzle.count({ where: { level: 'easy' } });
    const intermediateCount = await Puzzle.count({ where: { level: 'intermediate' } });
    const advancedCount = await Puzzle.count({ where: { level: 'advanced' } });
    
    res.render('admin/dashboard', {
      userCount,
      puzzleCount,
      adminCount,
      puzzleStats: {
        easy: easyCount,
        intermediate: intermediateCount,
        advanced: advancedCount
      },
      pageTitle: 'Admin Dashboard'
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to load admin dashboard' 
    });
  }
});

// ===============================
// User Management Routes
// ===============================

// List all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt']
    });
    
    res.render('admin/users', {
      users,
      pageTitle: 'User Management'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to fetch users' 
    });
  }
});

// View user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt', 'completedPuzzles']
    });
    
    if (!user) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'User not found' 
      });
    }
    
    res.render('admin/user-details', {
      user,
      pageTitle: `User: ${user.username}`
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to fetch user details' 
    });
  }
});

// Edit user form
router.get('/users/:id/edit', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'isActive']
    });
    
    if (!user) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'User not found' 
      });
    }
    
    res.render('admin/edit-user', {
      user,
      pageTitle: `Edit User: ${user.username}`
    });
  } catch (error) {
    console.error('Error preparing user edit form:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to prepare edit form' 
    });
  }
});

// Update user
router.post('/users/:id', async (req, res) => {
  try {
    const { username, email, role, isActive, password } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'User not found' 
      });
    }
    
    // Prevent self-demotion for safety
    if (req.session.user.id === user.id && role !== 'admin') {
      return res.status(400).render('error', { 
        message: 'Invalid Operation', 
        details: 'You cannot remove your own admin privileges' 
      });
    }
    
    // Update user fields
    user.username = username;
    user.email = email;
    user.role = role;
    user.isActive = isActive === 'true';
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to update user' 
    });
  }
});

// Delete user (soft delete by setting isActive to false)
router.post('/users/:id/delete', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'User not found' 
      });
    }
    
    // Prevent self-deletion
    if (req.session.user.id === user.id) {
      return res.status(400).render('error', { 
        message: 'Invalid Operation', 
        details: 'You cannot delete your own account' 
      });
    }
    
    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to delete user' 
    });
  }
});

// Create new user form
router.get('/users/new', (req, res) => {
  res.render('admin/new-user', {
    pageTitle: 'Create New User'
  });
});

// Create new user
router.post('/users', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  // Validate form data
  if (!username || !email || !password) {
    return res.status(400).render('error', { 
      message: 'Invalid Input', 
      details: 'All fields are required' 
    });
  }
  
  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).render('admin/new-user', {
        pageTitle: 'Create New User',
        error: 'Email already in use',
        formData: { username, email, role }
      });
    }
    
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).render('admin/new-user', {
        pageTitle: 'Create New User',
        error: 'Username already in use',
        formData: { username, email, role }
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      isActive: true
    });
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to create user' 
    });
  }
});

// ===============================
// Puzzle Management Routes
// ===============================

// List all puzzles
router.get('/puzzles', async (req, res) => {
  try {
    const puzzles = await Puzzle.findAll({
      attributes: ['id', 'title', 'level', 'difficultyRating', 'createdAt']
    });
    
    res.render('admin/puzzles', {
      puzzles,
      pageTitle: 'Puzzle Management'
    });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to fetch puzzles' 
    });
  }
});

// View puzzle details
router.get('/puzzles/:id', async (req, res) => {
  try {
    const puzzle = await Puzzle.findByPk(req.params.id);
    
    if (!puzzle) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'Puzzle not found' 
      });
    }
    
    // Parse puzzle data for display
    const puzzleData = JSON.parse(puzzle.puzzleData);
    
    res.render('admin/puzzle-details', {
      puzzle,
      puzzleData,
      pageTitle: `Puzzle: ${puzzle.title || 'Untitled'}`
    });
  } catch (error) {
    console.error('Error fetching puzzle details:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to fetch puzzle details' 
    });
  }
});

// Edit puzzle form
router.get('/puzzles/:id/edit', async (req, res) => {
  try {
    const puzzle = await Puzzle.findByPk(req.params.id);
    
    if (!puzzle) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'Puzzle not found' 
      });
    }
    
    res.render('admin/edit-puzzle', {
      puzzle,
      pageTitle: `Edit Puzzle: ${puzzle.title || 'Untitled'}`
    });
  } catch (error) {
    console.error('Error preparing puzzle edit form:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to prepare edit form' 
    });
  }
});

// Update puzzle
router.post('/puzzles/:id', async (req, res) => {
  try {
    const { title, description, level, difficultyRating } = req.body;
    const puzzle = await Puzzle.findByPk(req.params.id);
    
    if (!puzzle) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'Puzzle not found' 
      });
    }
    
    // Update fields
    puzzle.title = title;
    puzzle.description = description;
    puzzle.level = level;
    puzzle.difficultyRating = difficultyRating;
    
    await puzzle.save();
    
    res.redirect('/admin/puzzles');
  } catch (error) {
    console.error('Error updating puzzle:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to update puzzle' 
    });
  }
});

// Delete puzzle
router.post('/puzzles/:id/delete', async (req, res) => {
  try {
    const puzzle = await Puzzle.findByPk(req.params.id);
    
    if (!puzzle) {
      return res.status(404).render('error', { 
        message: 'Not Found', 
        details: 'Puzzle not found' 
      });
    }
    
    await puzzle.destroy();
    
    res.redirect('/admin/puzzles');
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to delete puzzle' 
    });
  }
});

// Excel Import Routes

// Import puzzles form
router.get('/import-puzzles', (req, res) => {
  res.render('admin/import-puzzles', {
    pageTitle: 'Import Puzzles from Excel'
  });
});

// Process Excel import
router.post('/import-puzzles', upload.single('puzzleFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'Please upload an Excel file'
      });
    }
    
    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'The Excel file contains no data'
      });
    }
    
    // Process each row and create puzzles
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const row of data) {
      try {
        // Validate required fields
        if (!row.level || !row.grid || !row.clues_across || !row.clues_down) {
          results.failed++;
          results.errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Validate level
        if (!['easy', 'intermediate', 'advanced'].includes(row.level)) {
          results.failed++;
          results.errors.push(`Invalid level "${row.level}" in row: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Parse grid and clues
        let grid;
        let cluesAcross;
        let cluesDown;
        
        try {
          grid = typeof row.grid === 'string' ? JSON.parse(row.grid) : row.grid;
          cluesAcross = typeof row.clues_across === 'string' ? JSON.parse(row.clues_across) : row.clues_across;
          cluesDown = typeof row.clues_down === 'string' ? JSON.parse(row.clues_down) : row.clues_down;
        } catch (parseError) {
          results.failed++;
          results.errors.push(`Error parsing JSON data in row: ${parseError.message}`);
          continue;
        }
        
        // Create puzzle data
        const puzzleData = {
          grid: grid,
          clues: {
            across: cluesAcross,
            down: cluesDown
          },
          title: row.title || `Puzzle #${Date.now()}`,
          description: row.description || `A ${row.level} level crossword puzzle`
        };
        
        // Create the puzzle
        await Puzzle.create({
          level: row.level,
          title: row.title || `Puzzle #${Date.now()}`,
          description: row.description || `A ${row.level} level crossword puzzle`,
          difficultyRating: row.difficulty_rating || 3,
          puzzleData: JSON.stringify(puzzleData)
        });
        
        results.success++;
      } catch (rowError) {
        results.failed++;
        results.errors.push(`Error processing row: ${rowError.message}`);
      }
    }
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    // Render results
    res.render('admin/import-results', {
      pageTitle: 'Import Results',
      results
    });
    
  } catch (error) {
    console.error('Error importing puzzles:', error);
    // Clean up the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to import puzzles from Excel' 
    });
  }
});

// Export puzzles to Excel
router.get('/export-puzzles', async (req, res) => {
  try {
    const puzzles = await Puzzle.findAll();
    
    // Create workbook and sheet
    const workbook = xlsx.utils.book_new();
    
    // Prepare data for export
    const data = puzzles.map(puzzle => {
      const puzzleData = JSON.parse(puzzle.puzzleData);
      return {
        id: puzzle.id,
        title: puzzle.title,
        description: puzzle.description,
        level: puzzle.level,
        difficulty_rating: puzzle.difficultyRating,
        grid: JSON.stringify(puzzleData.grid),
        clues_across: JSON.stringify(puzzleData.clues.across),
        clues_down: JSON.stringify(puzzleData.clues.down),
        created_at: puzzle.createdAt
      };
    });
    
    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Puzzles');
    
    // Create temp file
    const exportPath = path.join(__dirname, '../temp', `puzzles-export-${Date.now()}.xlsx`);
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }
    
    // Write to file
    xlsx.writeFile(workbook, exportPath);
    
    // Set headers for file download
    res.download(exportPath, 'puzzles-export.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      
      // Delete the temp file after download
      if (fs.existsSync(exportPath)) {
        fs.unlinkSync(exportPath);
      }
    });
    
  } catch (error) {
    console.error('Error exporting puzzles:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to export puzzles to Excel' 
    });
  }
});

// Sample Excel template download
router.get('/puzzle-template', (req, res) => {
  // Create a sample template
  const workbook = xlsx.utils.book_new();
  
  // Sample data
  const sampleData = [
    {
      title: 'Sample Puzzle',
      description: 'This is a sample puzzle template',
      level: 'easy',
      difficulty_rating: 2,
      grid: JSON.stringify(Array(16).fill('')),
      clues_across: JSON.stringify([
        { number: 1, clue: 'Sample across clue 1' },
        { number: 4, clue: 'Sample across clue 2' }
      ]),
      clues_down: JSON.stringify([
        { number: 1, clue: 'Sample down clue 1' },
        { number: 2, clue: 'Sample down clue 2' }
      ])
    }
  ];
  
  // Create worksheet with sample data
  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  
  // Add column headers with explanations
  xlsx.utils.sheet_add_aoa(worksheet, [
    [
      'title (required)',
      'description (optional)',
      'level (required: easy, intermediate, or advanced)',
      'difficulty_rating (optional: 1-5)',
      'grid (required: JSON array)',
      'clues_across (required: JSON array of objects with number and clue)',
      'clues_down (required: JSON array of objects with number and clue)'
    ]
  ], { origin: 'A1' });
  
  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  // Create temp file path
  const templatePath = path.join(__dirname, '../temp', 'puzzle-template.xlsx');
  
  // Ensure temp directory exists
  if (!fs.existsSync(path.join(__dirname, '../temp'))) {
    fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
  }
  
  // Write to file
  xlsx.writeFile(workbook, templatePath);
  
  // Download the file
  res.download(templatePath, 'puzzle-template.xlsx', (err) => {
    if (err) {
      console.error('Error downloading template:', err);
    }
    
    // Delete the temp file after download
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
    }
  });
});

module.exports = router;
