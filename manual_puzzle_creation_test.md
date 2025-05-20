# Manual Testing Steps for Puzzle Creation

## Prerequisites
- Admin user exists with email: admin@example.com and password: Admin123!
- Server is running

## Steps

1. **Login as Admin**
   - Navigate to http://localhost:3000/auth/login
   - Enter admin@example.com for email
   - Enter Admin123! for password
   - Click Login
   - Expected: Successfully logged in and redirected to game dashboard

2. **Access Admin Panel**
   - Click on the Admin button in the navigation
   - Expected: Redirected to admin dashboard at http://localhost:3000/admin

3. **Navigate to Puzzles Management**
   - Click on "Puzzles" in the admin navigation
   - Expected: Redirected to puzzles list at http://localhost:3000/admin/puzzles

4. **Create New Puzzle**
   - Click on "Create New Puzzle" button
   - Expected: Redirected to puzzle creation form at http://localhost:3000/admin/puzzles/create

5. **Fill out Puzzle Form**
   - Enter a title: "Manual Test Puzzle"
   - Enter a description: "This is a test puzzle created manually"
   - Select "easy" for Difficulty Level
   - Select "5" for Grid Size
   - In the grid editor:
     - Add letters to create a simple crossword
     - Right-click some cells to make them black
     - Click "Auto-Number Grid" button
   - Add clues for across and down entries
   - Click "Save Puzzle" button
   - Expected: Puzzle is saved and redirected to puzzles list

6. **Verify Puzzle Creation**
   - Check if the newly created puzzle appears in the puzzles list
   - Click on the puzzle title to view details
   - Expected: Puzzle details are displayed correctly

## Notes
- If any issues occur, document the error message and the step where it happens
- Take screenshots of any errors for troubleshooting
