// Function to process the uploaded Excel file
async function processExcelFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'Please upload an Excel file (.xlsx or .xls)'
      });
    }
    
    console.log('File uploaded successfully, attempting to process:', req.file.path);
    
    // Read the Excel file
    let workbook;
    try {
      workbook = xlsx.readFile(req.file.path);
    } catch (xlsxError) {
      console.error('Error reading Excel file:', xlsxError);
      fs.unlinkSync(req.file.path); // Clean up the file
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'Unable to read the Excel file. Please ensure it is a valid .xlsx or .xls file.'
      });
    }
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      fs.unlinkSync(req.file.path); // Clean up the file
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'The Excel file does not contain any worksheets.'
      });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    let data;
    try {
      data = xlsx.utils.sheet_to_json(worksheet);
    } catch (jsonError) {
      console.error('Error converting worksheet to JSON:', jsonError);
      fs.unlinkSync(req.file.path); // Clean up the file
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: 'Failed to process the Excel data. Please ensure your Excel file follows the required format.'
      });
    }
    
    if (data.length === 0) {
      fs.unlinkSync(req.file.path); // Clean up the file
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
}
