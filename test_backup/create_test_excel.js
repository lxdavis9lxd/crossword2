// Script to create a simple test Excel file for import
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a workbook
const wb = xlsx.utils.book_new();

// Sample puzzle data
const puzzleData = [
  {
    title: 'Test Puzzle 1',
    description: 'A sample puzzle for testing import',
    level: 'easy',
    difficulty_rating: 2,
    grid: JSON.stringify(['A', 'B', 'C', '.', 'D', 'E', 'F', '.', 'G', 'H', 'I']),
    clues_across: JSON.stringify([
      { number: 1, clue: 'First three letters' },
      { number: 4, clue: 'Next three letters' },
      { number: 7, clue: 'Last three letters' }
    ]),
    clues_down: JSON.stringify([
      { number: 1, clue: 'First letter of each row' },
      { number: 2, clue: 'Second letter of each row' },
      { number: 3, clue: 'Third letter of each row' }
    ])
  }
];

// Create a worksheet
const ws = xlsx.utils.json_to_sheet(puzzleData);

// Add worksheet to workbook
xlsx.utils.book_append_sheet(wb, ws, 'Puzzles');

// Write to a file
const filePath = path.join(tempDir, 'test-import-puzzle.xlsx');
xlsx.writeFile(wb, filePath);

console.log(`Test Excel file created at: ${filePath}`);
console.log('You can use this file to test the import functionality.');
