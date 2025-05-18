document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const levelSelect = document.getElementById('level-select');
    const puzzleSelect = document.getElementById('puzzle-select');
    const loadPuzzleBtn = document.getElementById('load-puzzle-btn');
    const crosswordContainer = document.getElementById('crossword-container');
    const saveButton = document.getElementById('save-button');
    
    // Current state
    let currentPuzzle = null;
    let currentGrid = [];
    
    // Add event listeners
    if (levelSelect) {
        levelSelect.addEventListener('change', loadPuzzlesForLevel);
    }
    
    if (loadPuzzleBtn) {
        loadPuzzleBtn.addEventListener('click', loadSelectedPuzzle);
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', saveGame);
    }
    
    // Add event listener for Show Answers button
    const showAnswersButton = document.getElementById('show-answers-button');
    if (showAnswersButton) {
        showAnswersButton.addEventListener('click', showAnswers);
    }
    
    // Add event listener for Resume Game button
    const resumeGameBtn = document.getElementById('resume-game-btn');
    if (resumeGameBtn) {
        resumeGameBtn.addEventListener('click', openSavedGamesModal);
    }
    
    // Add event listener for modal close button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeSavedGamesModal);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('saved-games-modal');
        if (event.target === modal) {
            closeSavedGamesModal();
        }
    });
    
    // Initialize - check the page
    if (window.location.pathname.includes('/game')) {
        // We're on the game page
        
        // Check if level is specified in the URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const levelParam = urlParams.get('level');

        if (levelParam && levelSelect) {
            // Set the level select value based on URL parameter
            levelSelect.value = levelParam;
        }
        
        loadPuzzlesForLevel(); // Load puzzles for the selected level
    }
    
    // Functions
    async function loadPuzzlesForLevel() {
        const level = levelSelect.value;
        console.log('Loading puzzles for level:', level);
        
        try {
            const response = await fetch(`/game/puzzles/${level}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch puzzles: ${response.status}`);
            }
            
            const puzzles = await response.json();
            console.log('Puzzles loaded:', puzzles);
            
            // Clear current options
            puzzleSelect.innerHTML = '';
            
            if (puzzles.length === 0) {
                puzzleSelect.innerHTML = '<option>No puzzles available</option>';
            } else {
                // Add puzzle options
                puzzles.forEach(puzzle => {
                    const option = document.createElement('option');
                    option.value = puzzle.id;
                    option.textContent = `Puzzle #${puzzle.id}`;
                    puzzleSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading puzzles:', error);
            puzzleSelect.innerHTML = '<option>Error loading puzzles</option>';
        }
    }
    
    async function loadSelectedPuzzle() {
        const puzzleId = puzzleSelect.value;
        if (!puzzleId || puzzleId === 'No puzzles available' || puzzleId === 'Error loading puzzles') {
            alert('Please select a valid puzzle');
            return;
        }
        
        console.log('Loading puzzle ID:', puzzleId);
        
        try {
            const response = await fetch(`/game/puzzles/details/${puzzleId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch puzzle details: ${response.status}`);
            }
            
            const puzzle = await response.json();
            console.log('Puzzle details:', puzzle);
            
            // Store current puzzle
            currentPuzzle = puzzle;
            
            // Parse puzzle data
            const puzzleData = JSON.parse(puzzle.puzzleData);
            
            // Display puzzle info (title and theme)
            displayPuzzleInfo(puzzleData);
            
            // Render the crossword grid
            renderCrosswordGrid(puzzleData);
            
            // Display clues
            displayClues(puzzleData.clues);
            
            // Reset the show answers button
            const showAnswersButton = document.getElementById('show-answers-button');
            if (showAnswersButton) {
                showAnswersButton.disabled = false;
                showAnswersButton.textContent = 'Show Answers';
            }
        } catch (error) {
            console.error('Error loading puzzle details:', error);
            alert('Failed to load puzzle. Please try again.');
        }
    }
    
    function displayPuzzleInfo(puzzleData) {
        const puzzleInfoContainer = document.getElementById('puzzle-info');
        const puzzleTitleElement = document.getElementById('puzzle-title');
        const puzzleThemeElement = document.getElementById('puzzle-theme');
        
        // Check if puzzle has title and theme
        if (puzzleData.title && puzzleData.theme) {
            puzzleTitleElement.textContent = puzzleData.title;
            puzzleThemeElement.textContent = puzzleData.theme;
            puzzleInfoContainer.style.display = 'block';
        } else {
            puzzleInfoContainer.style.display = 'none';
        }
    }
    
    function renderCrosswordGrid(puzzleData) {
        if (!puzzleData || !puzzleData.grid) {
            console.error('Invalid puzzle data');
            return;
        }
        
        // Clear the container
        crosswordContainer.innerHTML = '';
        
        const grid = puzzleData.grid;
        currentGrid = grid;
        
        // Set the grid template
        const gridSize = Math.sqrt(grid.length);
        crosswordContainer.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
        
        // Create cells
        for (let i = 0; i < grid.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'crossword-cell';
            
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            if (grid[i] === '#') {
                // Black cell
                cell.classList.add('black-cell');
            } else {
                // Regular cell
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.className = 'crossword-input';
                input.dataset.row = row;
                input.dataset.col = col;
                input.dataset.index = i;
                
                // Add number if needed
                if (puzzleData.cellNumbers && puzzleData.cellNumbers[i]) {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'cell-number';
                    numberSpan.textContent = puzzleData.cellNumbers[i];
                    cell.appendChild(numberSpan);
                }
                
                // Add input to cell
                cell.appendChild(input);
                
                // Add event listeners for input
                input.addEventListener('keydown', handleInputKeydown);
                input.addEventListener('focus', handleInputFocus);
            }
            
            crosswordContainer.appendChild(cell);
        }
        
        // Display clues if available
        if (puzzleData.clues) {
            displayClues(puzzleData.clues);
        }
    }
    
    function handleInputKeydown(event) {
        const input = event.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const gridSize = Math.sqrt(currentGrid.length);
        
        switch(event.key) {
            case 'ArrowRight':
                moveFocus(row, col + 1, gridSize);
                event.preventDefault();
                break;
            case 'ArrowLeft':
                moveFocus(row, col - 1, gridSize);
                event.preventDefault();
                break;
            case 'ArrowUp':
                moveFocus(row - 1, col, gridSize);
                event.preventDefault();
                break;
            case 'ArrowDown':
                moveFocus(row + 1, col, gridSize);
                event.preventDefault();
                break;
            case 'Backspace':
                if (input.value === '') {
                    // Move to previous cell if current is empty
                    moveFocus(row, col - 1, gridSize);
                    event.preventDefault();
                }
                break;
            default:
                if (/^[a-zA-Z]$/.test(event.key)) {
                    // Auto-advance to next cell after letter input
                    setTimeout(() => {
                        moveFocus(row, col + 1, gridSize);
                    }, 10);
                }
                break;
        }
    }
    
    function handleInputFocus(event) {
        // Highlight current word/clue
        // To be implemented
    }
    
    function moveFocus(row, col, gridSize) {
        // Calculate the index in the flat grid
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            const index = row * gridSize + col;
            
            // Check if the cell is valid (not a black cell)
            if (currentGrid[index] !== '#') {
                const nextInput = document.querySelector(`.crossword-input[data-index="${index}"]`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    }
    
    function displayClues(clues) {
        // Get clue container elements
        const cluesContainer = document.getElementById('clues-container');
        const acrossCluesList = document.getElementById('across-clues');
        const downCluesList = document.getElementById('down-clues');
        
        // Clear existing clues
        acrossCluesList.innerHTML = '';
        downCluesList.innerHTML = '';
        
        // Check if we have clues to display
        if (!clues || (!clues.across && !clues.down)) {
            cluesContainer.style.display = 'none';
            return;
        }
        
        // Display across clues
        if (clues.across && clues.across.length > 0) {
            clues.across.forEach(clue => {
                const listItem = document.createElement('li');
                listItem.className = 'clue-item';
                listItem.innerHTML = `<strong>${clue.number}.</strong> ${clue.clue}`;
                listItem.dataset.number = clue.number;
                listItem.dataset.direction = 'across';
                acrossCluesList.appendChild(listItem);
            });
        }
        
        // Display down clues
        if (clues.down && clues.down.length > 0) {
            clues.down.forEach(clue => {
                const listItem = document.createElement('li');
                listItem.className = 'clue-item';
                listItem.innerHTML = `<strong>${clue.number}.</strong> ${clue.clue}`;
                listItem.dataset.number = clue.number;
                listItem.dataset.direction = 'down';
                downCluesList.appendChild(listItem);
            });
        }
        
        // Show the clues container
        cluesContainer.style.display = 'flex';
        
        // Add event listeners to clues for highlighting
        const allClueItems = document.querySelectorAll('.clue-item');
        allClueItems.forEach(item => {
            item.addEventListener('click', handleClueClick);
        });
    }
    
    function handleClueClick(event) {
        // To be implemented: Highlight the corresponding cells when a clue is clicked
        const clueNumber = event.currentTarget.dataset.number;
        const direction = event.currentTarget.dataset.direction;
        console.log(`Clue clicked: ${clueNumber} ${direction}`);
        
        // Highlight the cells corresponding to this clue
        // This would require mapping from clue numbers to grid positions
    }
    
    async function saveGame() {
        if (!currentPuzzle) {
            alert('No puzzle loaded to save');
            return;
        }
        
        // Collect current grid state
        const inputs = document.querySelectorAll('.crossword-input');
        const gridState = [];
        
        inputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            gridState[index] = input.value || '';
        });
        
        try {
            // For simplicity, we're using a hardcoded user ID (1)
            // In a real app, this would come from the session/authentication system
            const userId = 1;
            
            const response = await fetch('/game/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    puzzleId: currentPuzzle.id,
                    progress: JSON.stringify(gridState)
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save game: ${response.status}`);
            }
            
            alert('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game. Please try again.');
        }
    }
    
    // Function to show the correct answers in the grid
    function showAnswers() {
        if (!currentPuzzle) {
            alert('Please load a puzzle first');
            return;
        }
        
        try {
            // Get the puzzle data
            const puzzleData = JSON.parse(currentPuzzle.puzzleData);
            const grid = puzzleData.grid;
            
            // Get all input cells
            const inputs = document.querySelectorAll('.crossword-input');
            
            // Confirm before showing answers
            const confirmed = confirm('Are you sure you want to reveal all answers? This cannot be undone.');
            if (!confirmed) {
                return;
            }
            
            // Populate each cell with the correct answer
            inputs.forEach(input => {
                const index = parseInt(input.dataset.index);
                
                // Skip black cells (should already be filtered by input selector)
                if (grid[index] === '#') {
                    return;
                }
                
                // Store the user's current input
                const userInput = input.value;
                
                // Set the cell value to the correct answer
                input.value = grid[index];
                
                // Apply visual feedback - different styling based on whether they had it right
                if (userInput && userInput.toUpperCase() === grid[index].toUpperCase()) {
                    input.classList.add('correct-answer');
                } else {
                    input.classList.add('revealed-answer');
                }
                
                // Disable the input to prevent further changes
                input.disabled = true;
            });
            
            // Disable the show answers button after use
            const showAnswersButton = document.getElementById('show-answers-button');
            if (showAnswersButton) {
                showAnswersButton.disabled = true;
                showAnswersButton.textContent = 'Answers Revealed';
            }
            
        } catch (error) {
            console.error('Error showing answers:', error);
            alert('Failed to show answers. Please try again.');
        }
    }
    
    // Function to open the saved games modal
    function openSavedGamesModal() {
        const modal = document.getElementById('saved-games-modal');
        if (!modal) return;
        
        // Show the modal
        modal.style.display = 'block';
        
        // Load saved games
        loadSavedGames();
    }
    
    // Function to close the saved games modal
    function closeSavedGamesModal() {
        const modal = document.getElementById('saved-games-modal');
        if (!modal) return;
        
        // Hide the modal
        modal.style.display = 'none';
    }
    
    // Function to load saved games from the server
    async function loadSavedGames() {
        const savedGamesList = document.getElementById('saved-games-list');
        if (!savedGamesList) return;
        
        // Show loading message
        savedGamesList.innerHTML = '<p class="loading-message">Loading saved games...</p>';
        
        try {
            // For simplicity, we're using a hard-coded user ID
            // In a real app, you would get this from the session
            const userId = 1;
            
            const response = await fetch(`/game/saved-games/${userId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch saved games: ${response.status}`);
            }
            
            const savedGames = await response.json();
            
            // Clear loading message
            savedGamesList.innerHTML = '';
            
            if (savedGames.length === 0) {
                savedGamesList.innerHTML = '<p class="no-saved-games">No saved games found.</p>';
                return;
            }
            
            // Create elements for each saved game
            savedGames.forEach(game => {
                const gameElement = document.createElement('div');
                gameElement.className = 'saved-game-item';
                gameElement.dataset.puzzleId = game.puzzleId;
                gameElement.dataset.userId = game.userId;
                
                gameElement.innerHTML = `
                    <div class="puzzle-title">${game.puzzleTitle || 'Untitled Puzzle'}</div>
                    <div class="saved-date">Saved on: ${game.savedAt}</div>
                    <div class="progress-info">
                        <span class="level-badge ${game.puzzleLevel}">${game.puzzleLevel.charAt(0).toUpperCase() + game.puzzleLevel.slice(1)}</span>
                        <span class="completion-percentage">Completion: ${game.completionPercentage}</span>
                    </div>
                `;
                
                // Add click event to load this saved game
                gameElement.addEventListener('click', () => {
                    loadSavedGame(game.userId, game.puzzleId);
                    closeSavedGamesModal();
                });
                
                savedGamesList.appendChild(gameElement);
            });
            
        } catch (error) {
            console.error('Error loading saved games:', error);
            savedGamesList.innerHTML = '<p class="no-saved-games">Error loading saved games. Please try again.</p>';
        }
    }
    
    // Function to load a specific saved game
    async function loadSavedGame(userId, puzzleId) {
        try {
            const response = await fetch(`/game/saved-games/${userId}/${puzzleId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch saved game: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store the puzzle
            currentPuzzle = data.puzzle;
            
            // Parse puzzle data
            const puzzleData = JSON.parse(data.puzzle.puzzleData);
            
            // Display puzzle info
            displayPuzzleInfo(puzzleData);
            
            // Render the grid
            renderCrosswordGrid(puzzleData);
            
            // Display clues
            displayClues(puzzleData.clues);
            
            // Reset the show answers button
            const showAnswersButton = document.getElementById('show-answers-button');
            if (showAnswersButton) {
                showAnswersButton.disabled = false;
                showAnswersButton.textContent = 'Show Answers';
            }
            
            // Fill in the user's progress if available
            if (data.progress) {
                try {
                    const userProgress = JSON.parse(data.progress);
                    
                    // Fill in grid with saved progress
                    const inputs = document.querySelectorAll('.crossword-input');
                    inputs.forEach(input => {
                        const index = parseInt(input.dataset.index);
                        if (userProgress[index]) {
                            input.value = userProgress[index];
                        }
                    });
                    
                    console.log('Saved game progress loaded successfully');
                } catch (e) {
                    console.error('Error parsing saved game progress:', e);
                }
            }
            
        } catch (error) {
            console.error('Error loading saved game:', error);
            alert('Failed to load saved game. Please try again.');
        }
    }
});