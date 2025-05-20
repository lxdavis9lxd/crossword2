# Manual Testing Guide for Puzzle Creation Feature

## Overview
This guide provides step-by-step instructions for manually testing the puzzle creation feature in the crossword application. By following these steps, you can confirm that administrators can create puzzles directly through the web interface.

## Prerequisites
- The server is running (`node app.js`)
- An admin user exists (email: admin@example.com, password: Admin123!)

## Test Procedure

### 1. Login as Admin
1. Navigate to http://localhost:3000/auth/login
2. Enter the following credentials:
   - Email/Username: admin@example.com
   - Password: Admin123!
3. Click the "Login" button
4. You should be redirected to the game dashboard

### 2. Access Admin Panel
1. Look for an "Admin" link or button in the navigation bar
2. Click on it to access the admin dashboard
3. Verify you see admin statistics and controls

### 3. Navigate to Puzzles Management
1. Click on "Puzzles" in the admin navigation menu
2. You should see a list of existing puzzles
3. Confirm the "Create New Puzzle" button is visible

### 4. Create a New Puzzle
1. Click the "Create New Puzzle" button
2. You should be taken to the puzzle creation page with a form
3. Fill out the form with the following details:
   - Title: "Test Manual Puzzle"
   - Description: "A manually created test puzzle"
   - Difficulty Level: "Easy"
   - Difficulty Rating: 2
   - Grid Size: 5×5
4. In the grid editor:
   - Fill in some cells with letters (click on cells and type)
   - Create some black cells (right-click on cells)
   - Click "Auto-Number Grid" to number the grid
5. Add clues for across entries:
   - For each numbered cell with a horizontal entry, add a clue
   - Example: "1. First word in the puzzle"
6. Add clues for down entries:
   - For each numbered cell with a vertical entry, add a clue
   - Example: "1. First column entry"
7. Click "Save Puzzle" to create the puzzle

### 5. Verify Puzzle Creation
1. After saving, you should be redirected to the puzzles list
2. Your new puzzle "Test Manual Puzzle" should appear in the list
3. Click on the puzzle title to view its details
4. Verify all information was saved correctly

### 6. Test the Puzzle in the Game
1. Navigate to the game dashboard
2. Select the "Easy" level puzzles
3. Find your "Test Manual Puzzle" in the list
4. Start the puzzle and verify it loads correctly with the grid and clues you created

## Troubleshooting
- If login fails, verify the admin user exists and has the correct password
- If you can't access the admin panel, check that your user has the 'admin' role
- If puzzle creation fails, check the server logs for detailed error messages

## Notes
- The puzzle editor allows you to create a complete crossword puzzle with clues
- The auto-numbering feature automatically numbers cells based on crossword rules
- Black cells cannot contain letters and are not part of any word
- Each puzzle must have at least one across and one down clue
- Grid sizes can range from 4×4 to 15×15
