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

module.exports = router;
