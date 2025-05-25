# crossword2

## Project Overview

This project is a crossword game with three difficulty levels: easy, intermediate, and advanced. The game allows players to register, log in, and keep track of their completed games. Users can also save their game progress. The project is built using NodeJS, Express, and EJS, and uses a SQLite3 database with Sequelize REST APIs.

## API Versioning

This application uses API versioning with a `/v1` prefix on all routes. All API endpoints must be accessed through this version prefix, for example:
- `/v1/auth/login` instead of `/auth/login`
- `/v1/game/dashboard` instead of `/game/dashboard`
- `/v1/admin/puzzles` instead of `/admin/puzzles`
- `/v1/game/puzzles/:level` instead of `/game/puzzles/:level`

> **Important**: The frontend JavaScript code in scripts.js has been updated to use these versioned API endpoints. All fetch requests now include the `/v1/` prefix.

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/lxdavis9lxd/crossword2.git
   cd crossword2
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the SQLite3 database:
   ```
   npx sequelize-cli db:migrate
   ```

## Deployment

### cPanel Deployment

The application has been optimized for cPanel hosting environments:

1. The frontend JavaScript (scripts.js) includes path detection logic to work correctly in cPanel's directory structure
2. All API endpoints use the `/v1/` prefix for versioning
3. Debug logging has been added to help troubleshoot any path or URL issues

When deploying to cPanel:
1. Upload all files to your cPanel hosting
2. Make sure Node.js is available on your hosting plan
3. Run `npm install` to install dependencies
4. Set up the database with `npx sequelize-cli db:migrate`
5. Configure a custom Node.js application in cPanel (typically under "Setup Node.js App")
6. Set the application's entry point to `app.js`

### Troubleshooting

If you encounter issues with the "Load Puzzles" button in cPanel:
1. Check the browser console for debug messages
2. Verify that API requests are using the correct path with `/v1/` prefix
3. Check that the SQLite database has puzzle data for the selected level

## Project Updates

### May 2025 Update
- Removed Azure deployment files and configurations
- Fixed load-puzzles functionality for cPanel environments
- Added detailed debug logging to help troubleshoot deployment issues
- Enhanced URL handling in frontend JavaScript for better compatibility
- Reorganized codebase for simpler maintenance

## Codebase Maintenance

### Test Files Cleanup

On May 22, 2025, the codebase was cleaned to remove test files that were not part of the core application. This was done to make the repository leaner and more production-focused. 

If you need test files for development purposes, a backup was created in the `/test_backup` directory. Additional test-related logs and temporary files were also moved to `/logs_backup` and `/temp_backup` respectively.

For more information about this cleanup, please refer to the `TEST_FILES_CLEANUP.md` document.

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000` to access the application.

## Usage

### User Registration

1. Navigate to the registration page.
2. Fill in the required information (username, email, and password).
3. Submit the registration form.
4. After successful registration, you will be redirected to the login page.

### User Login

1. Navigate to the login page.
2. Enter your email and password.
3. Submit the login form.
4. After successful login, you will be redirected to the game dashboard.

### Game Dashboard

1. Select the difficulty level (easy, intermediate, or advanced).
2. Start a new game or continue a saved game.
3. The game interface will display the crossword puzzle based on the selected difficulty level.

### Saving Game Progress

1. While playing a game, you can save your progress by clicking the "Save" button.
2. Your game state, including the selected difficulty level, will be saved to the database.

### API Endpoints

- `POST /api/register`: Register a new user.
- `POST /api/login`: Log in an existing user.
- `GET /api/puzzles/:level`: Fetch puzzles based on difficulty level.
- `POST /api/save`: Save game progress.
- `GET /api/progress`: Retrieve saved game progress.

## Technologies Used

- NodeJS
- Express
- EJS
- SQLite3
- Sequelize
- bcrypt (for password hashing)
