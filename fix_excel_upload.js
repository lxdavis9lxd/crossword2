// Script to fix Excel upload issues
const fs = require('fs');
const path = require('path');

// Path to admin.js
const adminJsPath = path.join(__dirname, 'routes', 'admin.js');

// Check if file exists
if (!fs.existsSync(adminJsPath)) {
  console.error(`Error: File not found at ${adminJsPath}`);
  process.exit(1);
}

// Read file content
const originalContent = fs.readFileSync(adminJsPath, 'utf8');

// Function to find and replace the multer configuration
function updateMulterConfig(content) {
  // Regular expression to find the multer configuration
  const multerRegex = /const upload = multer\(\s*{[\s\S]*?fileFilter[\s\S]*?}\s*\)\s*;/;
  
  // New multer configuration
  const newMulterConfig = `const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Log all file information for debugging
    console.log('\\n--- FILE UPLOAD DEBUG INFO ---');
    console.log('Filename:', file.originalname);
    console.log('Reported MIME type:', file.mimetype);
    console.log('Field name:', file.fieldname);
    console.log('Extension:', path.extname(file.originalname).toLowerCase());
    
    // Accept Excel files with broader criteria
    // 1. Check file extension
    const filetypes = /xlsx|xls/;
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
});`;

  // Replace the multer configuration
  return content.replace(multerRegex, newMulterConfig);
}

// Function to update the import route
function updateImportRoute(content) {
  // Find the import route
  const importRouteRegex = /\/\/ Process Excel import\s*router\.post\('\/import-puzzles'[\s\S]*?}\)\s*;/;
  
  // New import route implementation
  const newImportRoute = `// Process Excel import
router.post('/import-puzzles', (req, res) => {
  // Handle multer errors outside of the middleware
  upload.single('puzzleFile')(req, res, function(err) {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).render('admin/import-puzzles', {
        pageTitle: 'Import Puzzles from Excel',
        error: err.message || 'File upload failed. Please ensure you are uploading a valid Excel file (.xlsx or .xls).'
      });
    }
    
    // Continue with file processing if no multer errors
    processExcelFile(req, res);
  });
});

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
    }`;

  // Replace the import route
  return content.replace(importRouteRegex, newImportRoute);
}

// Function to find and update the error handling in the import route
function updateErrorHandling(content) {
  // Find the error handling code
  const errorHandlingRegex = /}\s*catch\s*\(error\)\s*{[\s\S]*?Failed to import puzzles from Excel[\s\S]*?}\s*}\s*\)\s*;/;
  
  // New error handling code
  const newErrorHandling = `  } catch (error) {
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
});`;

  // Replace the error handling code
  return content.replace(errorHandlingRegex, newErrorHandling);
}

// Apply all updates
let updatedContent = updateMulterConfig(originalContent);
updatedContent = updateImportRoute(updatedContent);
updatedContent = updateErrorHandling(updatedContent);

// Make a backup of the original file
const backupPath = adminJsPath + '.backup';
fs.writeFileSync(backupPath, originalContent);

// Write the updated content
fs.writeFileSync(adminJsPath, updatedContent);

console.log(`Successfully fixed Excel upload issues in ${adminJsPath}`);
console.log(`Backup of original file saved to ${backupPath}`);
