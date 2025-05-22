// Test script to verify Excel file import functionality
console.log('Testing Excel file import functionality...');

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Create a sample Excel workbook
const createSampleExcel = () => {
  console.log('Creating sample Excel file...');
  
  // Create a new workbook
  const wb = xlsx.utils.book_new();
  
  // Create sample data
  const puzzleData = [
    {
      level: 'easy',
      title: 'Test Puzzle',
      description: 'A test puzzle created by the test script',
      difficulty_rating: 2,
      grid: JSON.stringify(["A","B","C","D",".","E","F","G","H","I",".","J","K","L","M","N"]),
      clues_across: JSON.stringify({"1": "First across clue", "5": "Second across clue"}),
      clues_down: JSON.stringify({"1": "First down clue", "2": "Second down clue"})
    }
  ];
  
  // Create worksheet
  const ws = xlsx.utils.json_to_sheet(puzzleData);
  
  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(wb, ws, 'Puzzles');
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to both .xlsx and .xls formats
  const xlsxPath = path.join(outputDir, 'test_puzzles.xlsx');
  const xlsPath = path.join(outputDir, 'test_puzzles.xls');
  
  xlsx.writeFile(wb, xlsxPath);
  xlsx.writeFile(wb, xlsPath);
  
  console.log(`Sample Excel files created at:\n- ${xlsxPath}\n- ${xlsPath}`);
  console.log('\nThese files can be used to test the import functionality.');
  console.log('To test, go to the admin dashboard and use the import puzzles feature.');
  
  return { xlsxPath, xlsPath };
};

// Run the test
const { xlsxPath, xlsPath } = createSampleExcel();

// Validate the files exist
console.log('\nValidating created files:');
console.log(`- XLSX file exists: ${fs.existsSync(xlsxPath)}`);
console.log(`- XLS file exists: ${fs.existsSync(xlsPath)}`);

console.log('\nTesting file reading:');
try {
  // Try to read the files using xlsx library
  const xlsxWorkbook = xlsx.readFile(xlsxPath);
  console.log(`- XLSX file can be read: YES (${xlsxWorkbook.SheetNames.length} sheets)`);
  
  const xlsWorkbook = xlsx.readFile(xlsPath);
  console.log(`- XLS file can be read: YES (${xlsWorkbook.SheetNames.length} sheets)`);
  
  console.log('\nTest completed successfully! Both file formats should work with the upload feature.');
} catch (error) {
  console.error('\nError testing Excel files:', error);
}
