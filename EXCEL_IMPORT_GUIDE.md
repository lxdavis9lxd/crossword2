# Excel Puzzle Import Guide

## Overview
The admin dashboard allows you to import crossword puzzles from Excel files (.xlsx or .xls formats). This guide provides instructions on how to successfully upload puzzles and troubleshoot common issues.

## Supported Formats
- Microsoft Excel (.xlsx) - Excel 2007 and newer
- Microsoft Excel (.xls) - Excel 97-2003
- Both formats are fully supported

## How to Import Puzzles

### 1. Prepare Your Excel File
Your Excel file should contain the following columns:
- `title`: The name of the puzzle (required)
- `description`: A brief description of the puzzle (optional)
- `level`: Difficulty level - must be one of: 'easy', 'intermediate', or 'advanced' (required)
- `difficulty_rating`: A number from 1-5 indicating difficulty (optional)
- `grid`: A JSON array representing the puzzle grid (required)
- `clues_across`: JSON object of across clues (required)
- `clues_down`: JSON object of down clues (required)

### 2. Access the Import Page
1. Log in with your admin account
2. Go to the Admin Dashboard
3. Navigate to "Import Puzzles"

### 3. Upload Your Excel File
1. Click "Select Excel File" or drag and drop your file
2. Click "Upload and Import"
3. Review the import results

## Troubleshooting

### If Your Upload Is Rejected
- **Verify the file extension**: Make sure your file ends with .xlsx or .xls
- **Try a different Excel format**: If .xlsx doesn't work, try saving as .xls or vice versa
- **Check for Excel format corruption**: Re-save your file in Excel before uploading
- **Use the template**: Download and use the template from the import page

### Error Messages
- **"Only Excel files (.xlsx or .xls) are allowed"**: The file extension is not .xlsx or .xls
- **"Unable to read the Excel file"**: The file may be corrupted or not a valid Excel format
- **"The Excel file contains no data"**: The file is empty or the sheet structure is incorrect
- **"Row missing required fields"**: One or more required columns are missing

## Using the Template
For best results, download the template from the import page and fill it with your puzzle data. This ensures the correct format and structure for successful imports.

## Testing Your Upload
We've created test Excel files in both formats that you can use to verify the import functionality:
- `/workspaces/crossword2/temp/test_puzzle.xlsx`
- `/workspaces/crossword2/temp/test_puzzle.xls`

These files contain valid sample data that should import correctly.
