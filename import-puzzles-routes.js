// Import Puzzles page
router.get('/import-puzzles', (req, res) => {
  res.render('admin/import-puzzles', {
    pageTitle: 'Import Puzzles from Excel'
  });
});

// Handle Excel file upload and import
router.post('/import-puzzles', upload.single('excelFile'), async (req, res) => {
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
