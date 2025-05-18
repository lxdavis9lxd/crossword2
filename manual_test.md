# Manual Testing Guidelines for Crossword Puzzle App

## Testing Game Play and Grid Interaction

### 1. User Registration and Login
1. Navigate to the registration page at `/auth/register`
2. Register a new user with a username, email, and password
3. Log in with the newly created credentials
4. Verify that you are redirected to the dashboard page

### 2. Starting a New Game
1. On the dashboard page, select a difficulty level (easy, intermediate, or advanced)
2. Click the "Start Game" button
3. Verify that you are redirected to the game page with the selected level pre-loaded

### 3. Loading a Puzzle
1. On the game page, verify that the dropdown has available puzzles for the selected level
2. Choose a puzzle from the dropdown
3. Click the "Load Puzzle" button
4. Verify that the crossword grid is rendered with numbered cells and black squares

### 4. Grid Interaction
1. Click on any white cell in the grid
2. Type a letter and verify it appears in the cell
3. Verify that focus automatically moves to the next cell in the current direction
4. Test keyboard navigation using arrow keys:
   - Right arrow should move one cell to the right
   - Left arrow should move one cell to the left
   - Up arrow should move one cell up
   - Down arrow should move one cell down
5. Verify that navigation skips black cells
6. Test backspace functionality:
   - Backspace in a cell with content should clear the cell
   - Backspace in an empty cell should move to the previous cell

### 5. Saving Game Progress
1. Fill in several cells of the puzzle
2. Click the "Save Game" button
3. Verify that a success message appears

### 6. Loading Saved Game Progress
1. After saving a game, refresh the page
2. Load the same puzzle again
3. Verify that your previous answers are populated in the grid

### 7. Testing Puzzle Completion
1. Fill in all cells of a puzzle with the correct answers
2. Verify that the app detects completion and shows a success message
3. Try filling in incorrect answers and verify that the app does not falsely detect completion

### 8. Cross-browser Testing
Test the application in different browsers to ensure compatibility:
- Chrome
- Firefox
- Safari (if available)
- Edge (if available)

### 9. Mobile/Responsive Testing
1. Test the application on different screen sizes
2. Verify that the grid and controls are usable on smaller screens
3. Test touch interaction on touchscreen devices

### 10. Testing Navigation Bar

1. **Home Page Navigation**
   - Visit the home page (`/`)
   - Verify that you see the "Home", "Login", and "Register" buttons
   - Other game-specific buttons should be hidden

2. **After Login Navigation**
   - After logging in, verify that the navigation bar shows:
     - Home button (active)
     - Dashboard button
     - Logout button
   - Game-specific buttons should be hidden

3. **Dashboard Navigation**
   - Navigate to the dashboard
   - Verify that the "Dashboard" button is highlighted as active
   - "Start Game" button should be initially disabled
   - After selecting a difficulty level, the "Start Game" button should become enabled
   - "Resume Game" button should be visible if you have saved games

4. **Game Page Navigation**
   - Start a new game and navigate to the game page
   - Verify that all navigation buttons are present
   - Before loading a puzzle:
     - "Save Game" button should be disabled
     - "Show Answers" button should be disabled
     - "Load Puzzle" button should be enabled
   - After loading a puzzle:
     - "Save Game" button should become enabled
     - "Show Answers" button should become enabled

5. **Button Functionality**
   - Test the "Load Puzzle" button - it should load the selected puzzle
   - Test the "Save Game" button - it should save your progress
   - Test the "Show Answers" button - it should reveal all answers
   - Test the "Resume Game" button - it should open a modal with saved games

6. **Mobile Responsiveness**
   - Resize the browser window to a mobile size or test on a mobile device
   - Verify that the navigation bar adjusts appropriately
   - All buttons should be accessible and functional in mobile view

## Reporting Issues
When reporting issues found during manual testing, please include:
1. The specific test that failed
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Browser and device information