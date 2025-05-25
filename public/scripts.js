// Function to determine the base URL for API requests
// This handles both local development and cPanel hosting environments
function getBaseUrl() {
    // Get the current hostname and path
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // Check if we're in a development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ''; // Empty string for local development (relative paths)
    } else {
        // For cPanel hosting, check URL structure
        // Common cPanel pattern: example.com/~username/sitename/
        
        // First check for v1 in the URL to handle versioned API paths
        if (pathname.includes('/v1/')) {
            const pathSegments = pathname.split('/v1/');
            // Return everything before '/v1/'
            return pathSegments[0];
        }
        
        // For other pages (like dashboard)
        const pathParts = pathname.split('/');
        // Remove the last part (current page)
        pathParts.pop();
        // Join remaining parts to form the base path
        return pathParts.join('/');
    }
}

// Get singleton for baseUrl to avoid redundant calculations
let _cachedBaseUrl = null;
function getCachedBaseUrl() {
    if (_cachedBaseUrl === null) {
        _cachedBaseUrl = getBaseUrl();
    }
    return _cachedBaseUrl;
}

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const levelSelect = document.getElementById('level-select');
    const loadPuzzlesBtn = document.getElementById('load-puzzles-btn');
    const puzzlesContainer = document.getElementById('puzzles-container');
    const selectedLevelInput = document.getElementById('selected-level');
    const selectedPuzzleIdInput = document.getElementById('selected-puzzle-id');
    const startGameBtn = document.getElementById('start-game-btn');
    const saveButton = document.getElementById('save-button');
    const savedGamesList = document.getElementById('saved-games-list');
    const crosswordContainer = document.getElementById('crossword-container');
    
    // Current state
    let currentPuzzle = null;
    let currentGrid = [];
    let selectedPuzzleCard = null;
    
    // Add event listeners
    if (levelSelect) {
        levelSelect.addEventListener('change', function() {
            selectedLevelInput.value = levelSelect.value;
            // Automatically load puzzles when level changes
            if (loadPuzzlesBtn) {
                loadPuzzlesBtn.click();
            }
        });
    }
    
    if (loadPuzzlesBtn) {
        loadPuzzlesBtn.addEventListener('click', loadPuzzlesForLevel);
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', saveGame);
    }
    
    // Initialize saved games list if we're on the dashboard
    if (window.location.pathname.includes('/dashboard')) {
        loadSavedGames();
    }
    
    // Functions
    async function loadPuzzlesForLevel() {
        const level = levelSelect.value;
        console.log('Loading puzzles for level:', level);
        
        // Update the hidden input 
        selectedLevelInput.value = level;
        
        // Clear previous selection
        selectedPuzzleIdInput.value = '';
        startGameBtn.disabled = true;
        
        try {
            puzzlesContainer.innerHTML = '<p>Loading puzzles...</p>';
            
            // Get base URL to handle both development and production paths
            const baseUrl = getCachedBaseUrl();
            console.log('Using base URL:', baseUrl);
            
            // Use the base URL for the fetch request with v1 prefix for API versioning
            const response = await fetch(`${baseUrl}/v1/game/puzzles/${level}`);
            if (!response.ok) {
                throw new Error('Failed to fetch puzzles: ' + response.status);
            }
            
            const puzzles = await response.json();
            console.log('Puzzles loaded:', puzzles);
            
            // Clear current puzzles
            puzzlesContainer.innerHTML = '';
            
            if (puzzles.length === 0) {
                puzzlesContainer.innerHTML = '<p class="no-puzzles-message">No puzzles available for this level</p>';
            } else {
                // Create a card for each puzzle
                puzzles.forEach(puzzle => {
                    const puzzleCard = document.createElement('div');
                    puzzleCard.className = 'puzzle-card';
                    puzzleCard.dataset.puzzleId = puzzle.id;
                    
                    // Parse the puzzle data to get dimensions for preview
                    const puzzleData = JSON.parse(puzzle.puzzleData);
                    const gridSize = Math.sqrt(puzzleData.grid.length);
                    
                    // Get clue counts, handling both array and object formats
                    let acrossCount = 0;
                    let downCount = 0;
                    
                    if (puzzleData.clues) {
                        if (Array.isArray(puzzleData.clues.across)) {
                            acrossCount = puzzleData.clues.across.length;
                        } else if (typeof puzzleData.clues.across === 'object') {
                            acrossCount = Object.keys(puzzleData.clues.across).length;
                        }
                        
                        if (Array.isArray(puzzleData.clues.down)) {
                            downCount = puzzleData.clues.down.length;
                        } else if (typeof puzzleData.clues.down === 'object') {
                            downCount = Object.keys(puzzleData.clues.down).length;
                        }
                    }
                    
                    // Add puzzle title if available
                    const puzzleTitle = puzzleData.title ? puzzleData.title : 'Puzzle #' + puzzle.id;
                    
                    puzzleCard.innerHTML = 
                        '<h4>' + puzzleTitle + '</h4>' + 
                        '<div class="puzzle-preview">' +
                            '<div class="grid-size">' + gridSize + 'x' + gridSize + '</div>' +
                            '<div class="preview-info">' +
                                '<p>' + acrossCount + ' Across</p>' +
                                '<p>' + downCount + ' Down</p>' +
                            '</div>' +
                        '</div>';
                    
                    puzzleCard.addEventListener('click', function() {
                        // Remove selection from previously selected card
                        if (selectedPuzzleCard) {
                            selectedPuzzleCard.classList.remove('selected');
                        }
                        
                        // Add selection to this card
                        puzzleCard.classList.add('selected');
                        selectedPuzzleCard = puzzleCard;
                        
                        // Update hidden input with selected puzzle ID
                        selectedPuzzleIdInput.value = puzzle.id;
                        
                        // Enable the start game button
                        startGameBtn.disabled = false;
                    });
                    
                    puzzlesContainer.appendChild(puzzleCard);
                });
            }
        } catch (error) {
            console.error('Error loading puzzles:', error);
            puzzlesContainer.innerHTML = '<p class="error-message">Error loading puzzles: ' + error.message + '</p>';
        }
    }
    
    async function loadSelectedPuzzle(puzzleId) {
        if (!puzzleId) {
            alert('Please select a valid puzzle');
            return;
        }
        
        console.log('Loading puzzle ID:', puzzleId);
        
        try {
            const baseUrl = getCachedBaseUrl();
            console.log('Using base URL for puzzle details:', baseUrl);
            const response = await fetch(`${baseUrl}/v1/game/puzzles/details/${puzzleId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch puzzle details: ' + response.status);
            }
            
            const puzzle = await response.json();
            console.log('Puzzle details:', puzzle);
            
            // Store current puzzle
            currentPuzzle = puzzle;
            
            // Parse puzzle data
            const puzzleData = JSON.parse(puzzle.puzzleData);
            
            // Render the crossword grid
            renderCrosswordGrid(puzzleData);
        } catch (error) {
            console.error('Error loading puzzle details:', error);
            alert('Failed to load puzzle. Please try again.');
        }
    }
    
    async function loadSavedGames() {
        if (!savedGamesList) return;
        
        try {
            // Assuming a route that returns the user's saved games
            const userId = document.querySelector('meta[name="user-id"]')?.content;
            if (!userId) {
                console.error('User ID not found');
                return;
            }
            
            const baseUrl = getCachedBaseUrl();
            const response = await fetch(`${baseUrl}/v1/game/progress/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch saved games: ' + response.status);
            }
            
            const data = await response.json();
            const progress = data.progress || {};
            
            // Clear the list
            savedGamesList.innerHTML = '';
            
            if (Object.keys(progress).length === 0) {
                savedGamesList.innerHTML = '<li class="no-saved-games">No saved games found</li>';
                return;
            }
            
            // Fetch puzzle details for each saved game
            for (const puzzleId in progress) {
                try {
                    const puzzleBaseUrl = getCachedBaseUrl();
                    const puzzleResponse = await fetch(`${puzzleBaseUrl}/v1/game/puzzles/details/${puzzleId}`);
                    if (!puzzleResponse.ok) continue;
                    
                    const puzzle = await puzzleResponse.json();
                    const puzzleData = JSON.parse(puzzle.puzzleData);
                    const gridSize = Math.sqrt(puzzleData.grid.length);
                    
                    const savedGameItem = document.createElement('li');
                    savedGameItem.className = 'saved-game-item';
                    savedGameItem.innerHTML = 
                        '<div class="saved-game-info">' +
                            '<h4>Puzzle #' + puzzle.id + ' (' + puzzle.level + ')</h4>' +
                            '<p>' + gridSize + 'x' + gridSize + ' grid</p>' +
                        '</div>' +
                        '<button class="load-saved-game-btn" data-puzzle-id="' + puzzle.id + '">' +
                            'Continue' +
                        '</button>';
                    
                    // Add event listener to the button
                    const loadButton = savedGameItem.querySelector('.load-saved-game-btn');
                    loadButton.addEventListener('click', function() {
                        const linkBaseUrl = getCachedBaseUrl();
                        window.location.href = `${linkBaseUrl}/v1/game?puzzleId=${puzzle.id}`;
                    });
                    
                    savedGamesList.appendChild(savedGameItem);
                } catch (error) {
                    console.error('Error loading saved game for puzzle ' + puzzleId + ':', error);
                }
            }
        } catch (error) {
            console.error('Error loading saved games:', error);
            savedGamesList.innerHTML = '<li class="error-message">Error loading saved games</li>';
        }
    }
    
    function renderCrosswordGrid(puzzleData) {
        if (!puzzleData || !puzzleData.grid || !crosswordContainer) {
            console.error('Invalid puzzle data or crossword container not found');
            return;
        }
        
        // Clear the container
        crosswordContainer.innerHTML = '';
        
        const grid = puzzleData.grid;
        currentGrid = grid;
        
        // Set the grid template
        const gridSize = Math.sqrt(grid.length);
        crosswordContainer.style.gridTemplateColumns = 'repeat(' + gridSize + ', 40px)';
        
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
                const nextInput = document.querySelector('.crossword-input[data-index="' + index + '"]');
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    }
    
    function displayClues(clues) {
        // To be implemented if clue display is needed
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
            const baseUrl = getCachedBaseUrl();
            const response = await fetch(`${baseUrl}/v1/game/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    puzzleId: currentPuzzle.id,
                    progress: JSON.stringify(gridState)
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save game: ' + response.status);
            }
            
            alert('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game. Please try again.');
        }
    }
    
    // Initialize the game if we're on the game page with a puzzleId
    if (window.location.pathname.includes('/v1/game')) {
        const urlParams = new URLSearchParams(window.location.search);
        const puzzleId = urlParams.get('puzzleId');
        if (puzzleId) {
            loadSelectedPuzzle(puzzleId);
        }
    }
});
