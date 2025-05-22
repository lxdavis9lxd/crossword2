// Test script to verify excel upload fixes
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mime = require('mime-types');

// Create sample Excel files and log details that will help debugging
async function createAndTestExcelFiles() {
  console.log('\n========== EXCEL FILE UPLOAD TEST UTILITY ==========\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Sample data for Excel files
  const samplePuzzle = [
    {
      title: 'Test Puzzle',
      description: 'A test puzzle for upload verification',
      level: 'easy',
      difficulty_rating: 2,
      grid: JSON.stringify(["A","B","C","D",".","E","F","G","H","I",".","J","K","L","M","N"]),
      clues_across: JSON.stringify({"1": "First across clue", "5": "Second across clue"}),
      clues_down: JSON.stringify({"1": "First down clue", "2": "Second down clue"})
    }
  ];
  
  // Create workbook and worksheet
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(samplePuzzle);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Puzzles');
  
  // Create both .xlsx and .xls files
  const xlsxPath = path.join(outputDir, 'test_puzzle.xlsx');
  const xlsPath = path.join(outputDir, 'test_puzzle.xls');
  
  // Write files
  console.log('Creating test Excel files...');
  xlsx.writeFile(workbook, xlsxPath);
  xlsx.writeFile(workbook, xlsPath);
  
  // Verify files exist
  const xlsxExists = fs.existsSync(xlsxPath);
  const xlsExists = fs.existsSync(xlsPath);
  
  console.log('\nFile creation results:');
  console.log(`- XLSX file created: ${xlsxExists ? 'SUCCESS' : 'FAILED'}`);
  console.log(`- XLS file created: ${xlsExists ? 'SUCCESS' : 'FAILED'}`);
  
  // Check MIME types
  console.log('\nMIME type detection:');
  if (xlsxExists) {
    const xlsxMime = mime.lookup(xlsxPath) || 'unknown';
    console.log(`- XLSX file MIME type: ${xlsxMime}`);
  }
  
  if (xlsExists) {
    const xlsMime = mime.lookup(xlsPath) || 'unknown';
    console.log(`- XLS file MIME type: ${xlsMime}`);
  }
  
  // Try reading the files with xlsx
  console.log('\nReading files with xlsx library:');
  try {
    const xlsxWorkbook = xlsx.readFile(xlsxPath);
    console.log(`- XLSX file can be read: YES (${xlsxWorkbook.SheetNames.length} sheets)`);
  } catch (error) {
    console.error(`- XLSX file reading error: ${error.message}`);
  }
  
  try {
    const xlsWorkbook = xlsx.readFile(xlsPath);
    console.log(`- XLS file can be read: YES (${xlsWorkbook.SheetNames.length} sheets)`);
  } catch (error) {
    console.error(`- XLS file reading error: ${error.message}`);
  }
  
  // Print file paths for user
  console.log('\nTest files are available at:');
  console.log(`- XLSX: ${xlsxPath}`);
  console.log(`- XLS: ${xlsPath}`);
  
  console.log('\nInstructions:');
  console.log('1. Use these files to test your Excel upload functionality');
  console.log('2. Try uploading each file to see if both formats are accepted');
  console.log('3. If you encounter any issues, check the server logs for MIME type information');
  
  return { xlsxPath, xlsPath };
}

// Run the test
createAndTestExcelFiles().catch(console.error);
