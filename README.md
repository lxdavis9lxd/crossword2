# crossword2

## Project Overview

This project is a crossword game with three difficulty levels: easy, intermediate, and advanced. The game allows players to register, log in, and keep track of their completed games. Users can also save their game progress. The project is built using NodeJS, Express, and EJS, and uses a SQLite3 database with Sequelize REST APIs.

## API Versioning

This application uses API versioning with a `/v1` prefix on all routes. All API endpoints must be accessed through this version prefix, for example:
- `/v1/auth/login` instead of `/auth/login`
- `/v1/game/dashboard` instead of `/game/dashboard`
- `/v1/admin/puzzles` instead of `/admin/puzzles`

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
