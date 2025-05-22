// filepath: /workspaces/crossword2/routes/admin.js
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
    // Log all file information for debugging
    console.log('\n--- FILE UPLOAD DEBUG INFO ---');
    console.log('Filename:', file.originalname);
    console.log('Reported MIME type:', file.mimetype);
    console.log('Field name:', file.fieldname);
    console.log('Extension:', path.extname(file.originalname).toLowerCase());
    
    // Accept Excel files with broader criteria
    // 1. Check file extension
    const filetypes = /^\.xlsx$|^\.xls$/i;
    const extname = path.extname(file.originalname).toLowerCase();
    const isValidExt = filetypes.test(extname);
    console.log('Valid extension?', isValidExt);
    
    // 2. Define all possible Excel MIME types
    const validMimeTypes = [
      'application/vnd.ms-excel',                                     // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/msexcel',                                         // alternative
      'application/x-msexcel',                                       // alternative
      'application/x-ms-excel',                                      // alternative
      'application/x-excel',                                         // alternative
      'application/x-dos_ms_excel',                                  // alternative
      'application/xls',                                             // alternative
      'application/x-xls',                                           // alternative
      'application/vnd.ms-excel.sheet.macroEnabled.12',              // .xlsm
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12',       // .xlsb
      'application/vnd.oasis.opendocument.spreadsheet',              // .ods
      'application/octet-stream'                                     // generic binary
    ];
    
    // 3. Check MIME type
    const isValidMime = validMimeTypes.includes(file.mimetype) || 
                       file.mimetype.includes('excel') || 
                       file.mimetype.includes('spreadsheet');
    console.log('Valid MIME type?', isValidMime);
    
    // 4. Accept the file if either condition is met (more permissive)
    // For security, we primarily rely on the file extension
    if (isValidExt) {
      console.log('✅ File accepted based on valid extension');
      return cb(null, true);
    } else {
      console.log('❌ File rejected: invalid extension');
      cb(new Error('Only Excel files (.xlsx or .xls) are allowed'));
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
    const mediumCount = await Puzzle.count({ where: { level: 'medium' } });
    const hardCount = await Puzzle.count({ where: { level: 'hard' } });
    const expertCount = await Puzzle.count({ where: { level: 'expert' } });
    
    res.render('admin/dashboard', {
      userCount,
      puzzleCount,
      adminCount,
      puzzleStats: {
        easy: easyCount,
        intermediate: mediumCount,
        advanced: hardCount,
        expert: expertCount
      },
      pageTitle: 'Admin Dashboard'
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
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

// Create user form
router.get('/create-user', (req, res) => {
  res.render('admin/new-user', {
    pageTitle: 'Create New User'
  });
});

// Create user action
router.post('/create-user', async (req, res) => {
  try {
    const { username, email, password, role, isActive } = req.body;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      isActive: isActive === 'on' ? true : false
    });
    
    res.redirect('/v1/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('admin/new-user', {
        pageTitle: 'Create New User',
        error: error.errors.map(e => e.message).join(', '),
        formData: req.body
      });
    }
    
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to create user' 
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
    
    // Update user data
    user.username = username;
    user.email = email;
    user.role = role;
    user.isActive = isActive === 'on' ? true : false;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    res.redirect('/v1/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('admin/edit-user', {
        pageTitle: 'Edit User',
        error: error.errors.map(e => e.message).join(', '),
        user: { ...req.body, id: req.params.id }
      });
    }
    
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to update user' 
    });
  }
});

// Import Puzzles page
router.get('/import-puzzles', (req, res) => {
  res.render('admin/import-puzzles', {
    pageTitle: 'Import Puzzles from Excel'
  });
});

// Handle Excel file upload and import
router.post('/import-puzzles', upload.single('puzzleFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'No file uploaded. Please select an Excel file to import.'
      });
    }

    console.log('File uploaded successfully:', req.file.path);
    
    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert worksheet to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'The Excel file is empty. Please add puzzle data and try again.'
      });
    }
    
    console.log(`Found ${data.length} puzzles in Excel file`);
    
    // Track import results
    let imported = 0;
    const errors = [];
    
    // Process each puzzle
    for (const [index, puzzle] of data.entries()) {
      try {
        // Validate required fields
        if (!puzzle.level) {
          errors.push(`Row ${index + 1}: Missing required field 'level'`);
          continue;
        }
        
        if (!['easy', 'intermediate', 'advanced'].includes(puzzle.level)) {
          errors.push(`Row ${index + 1}: Invalid level '${puzzle.level}'. Must be 'easy', 'intermediate', or 'advanced'`);
          continue;
        }
        
        // Parse the grid
        let grid;
        try {
          grid = JSON.parse(puzzle.grid || '[]');
          if (!Array.isArray(grid)) {
            errors.push(`Row ${index + 1}: Invalid grid format. Must be a JSON array`);
            continue;
          }
        } catch (e) {
          errors.push(`Row ${index + 1}: Invalid grid JSON: ${e.message}`);
          continue;
        }
        
        // Parse the clues
        let acrossClues;
        try {
          acrossClues = JSON.parse(puzzle.clues_across || '[]');
        } catch (e) {
          errors.push(`Row ${index + 1}: Invalid across clues JSON: ${e.message}`);
          continue;
        }
        
        let downClues;
        try {
          downClues = JSON.parse(puzzle.clues_down || '[]');
        } catch (e) {
          errors.push(`Row ${index + 1}: Invalid down clues JSON: ${e.message}`);
          continue;
        }
        
        // Construct puzzle data
        const puzzleData = {
          grid: grid,
          clues: {
            across: acrossClues,
            down: downClues
          }
        };
        
        // Create the puzzle in the database
        await Puzzle.create({
          title: puzzle.title || `Imported Puzzle ${Date.now()}`,
          description: puzzle.description || `A ${puzzle.level} level imported puzzle`,
          level: puzzle.level,
          difficultyRating: puzzle.difficulty_rating || 3,
          puzzleData: JSON.stringify(puzzleData)
        });
        
        imported++;
      } catch (e) {
        errors.push(`Row ${index + 1}: Import failed: ${e.message}`);
      }
    }
    
    // Clean up the uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Return results
    res.render('admin/import-puzzles', {
      pageTitle: 'Import Puzzles from Excel',
      success: `Successfully imported ${imported} puzzles.`,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error importing puzzles:', error);
    
    // Clean up the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Check for xlsx.readFile errors which might indicate format issues
    const errorMessage = error.message || 'Failed to import puzzles from Excel';
    const isFormatError = errorMessage.includes('format') || 
                         errorMessage.includes('CFB') || 
                         errorMessage.includes('read');
    
    if (isFormatError) {
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'The file format is not supported. Please use a valid Excel file (.xlsx or .xls)'
      });
    }
    
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to import puzzles from Excel: ' + errorMessage
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

// Create new puzzle form
router.get('/puzzles/create', (req, res) => {
  res.render('admin/create-puzzle', {
    pageTitle: 'Create New Puzzle'
  });
});

// Save new puzzle
router.post('/puzzles/create', async (req, res) => {
  try {
    const { title, description, level, difficultyRating, gridSize, gridData, acrossClues, downClues } = req.body;
    
    // Validate input
    if (!level || !gridData || !acrossClues || !downClues) {
      return res.status(400).render('admin/create-puzzle', {
        pageTitle: 'Create New Puzzle',
        error: 'All required fields must be filled out',
        formData: req.body
      });
    }
    
    // Parse grid data from the form
    const gridArray = JSON.parse(gridData);
    
    // Parse clues
    const acrossCluesArray = JSON.parse(acrossClues);
    const downCluesArray = JSON.parse(downClues);
    
    // Construct puzzle data
    const puzzleData = {
      grid: gridArray,
      clues: {
        across: acrossCluesArray,
        down: downCluesArray
      }
    };
    
    // Create the puzzle in the database
    await Puzzle.create({
      title: title || `Puzzle #${Date.now()}`,
      description: description || `A ${level} level crossword puzzle`,
      level,
      difficultyRating: difficultyRating || 3,
      puzzleData: JSON.stringify(puzzleData)
    });
    
    res.redirect('/v1/admin/puzzles');
  } catch (error) {
    console.error('Error creating puzzle:', error);
    res.status(500).render('admin/create-puzzle', {
      pageTitle: 'Create New Puzzle',
      error: 'Failed to create puzzle: ' + error.message,
      formData: req.body
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
    
    res.redirect('/v1/admin/puzzles');
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
    
    res.redirect('/v1/admin/puzzles');
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to delete puzzle' 
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
    console.error('Error editing puzzle:', error);
    res.status(500).render('error', { 
      message: 'Server Error', 
      details: 'Failed to load puzzle for editing' 
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

module.exports = router;
