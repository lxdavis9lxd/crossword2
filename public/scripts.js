// Function to determine the base URL for API requests
// This handles both local development and cPanel hosting environments

// Custom logger for cPanel Passenger environment
function logToServer(message, level = 'info', data = null) {
    // Only send logs to server in production environment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        try {
            const logData = {
                message: message,
                level: level,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                data: data
            };
            
            // Send log to server asynchronously
            fetch('/v1/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
                // Use keepalive to ensure the request completes even if page is unloading
                keepalive: true
            }).catch(err => console.error('Failed to send log to server:', err));
        } catch (e) {
            // Fallback to regular console if logging fails
            console.error('Server logging failed:', e);
        }
    }
    
    // Also log to console for local debugging
    switch (level) {
        case 'error':
            console.error(message, data || '');
            break;
        case 'warn':
            console.warn(message, data || '');
            break;
        case 'debug':
            console.debug(message, data || '');
            break;
        case 'info':
        default:
            console.log(message, data || '');
    }
}

function getBaseUrl() {
    // Get the current hostname and path
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const protocol = window.location.protocol;
    const origin = window.location.origin;
    
    logToServer('getBaseUrl - Current hostname: ' + hostname, 'debug');
    logToServer('getBaseUrl - Current pathname: ' + pathname, 'debug');
    logToServer('getBaseUrl - Current protocol: ' + protocol, 'debug');
    logToServer('getBaseUrl - Current origin: ' + origin, 'debug');
    
    // Check if we're in a development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        logToServer('getBaseUrl - Development environment detected, returning empty base URL', 'debug');
        return ''; // Empty string for local development (relative paths)
    } else {
        logToServer('getBaseUrl - Production environment detected (cPanel)', 'debug');
        
        // For cPanel hosting, we need a more robust approach
        // Try several methods and pick the best one
        
        // Method 1: Find the base path from the v1 prefix in the URL
        if (pathname.includes('/v1/')) {
            logToServer('getBaseUrl - Method 1: /v1/ found in pathname', 'debug');
            const pathSegments = pathname.split('/v1/');
            // Return everything before '/v1/'
            const result1 = pathSegments[0];
            logToServer('getBaseUrl - Method 1 result: ' + result1, 'debug');
            
            // Special case: if the result is empty, we might be at the root
            if (result1 === '') {
                logToServer('getBaseUrl - Method 1 empty result, using origin', 'debug');
                return origin;
            }
            
            return result1;
        }
        
        // Method 2: Special handling for dashboard and other non-versioned paths
        logToServer('getBaseUrl - Method 2: Handling standard page URLs', 'debug');
        
        // Special case for cPanel: check for specific patterns in the URL
        if (pathname.includes('/dashboard') || 
            pathname.includes('/login') || 
            pathname.includes('/register') || 
            pathname.includes('/admin')) {
            
            const pathSegments = pathname.split('/');
            // Remove the last part (current page name)
            pathSegments.pop();
            
            // Join remaining parts to form the base path
            const result2 = pathSegments.join('/');
            logToServer('getBaseUrl - Method 2 result: ' + result2, 'debug');
            
            // If the result is empty, we're at the root
            if (result2 === '') {
                return origin;
            }
            
            return result2;
        }
        
        // Method 3: Fallback - check if we're at the document root
        if (pathname === '/' || pathname === '') {
            logToServer('getBaseUrl - Method 3: At site root', 'debug');
            return origin;
        }
        
        // Method 4: Ultimate fallback - try to use the origin + pathname minus last segment
        logToServer('getBaseUrl - Method 4: Ultimate fallback', 'debug');
        const pathParts = pathname.split('/');
        // Remove the last part (current page)
        pathParts.pop();
        // Join remaining parts to form the base path
        const result4 = pathParts.join('/');
        logToServer('getBaseUrl - Method 4 result: ' + result4, 'debug');
        
        // If result is empty, return just the origin
        if (result4 === '') {
            return origin;
        }
        
        return result4;
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
        logToServer('Load puzzles button found, adding click event listener', 'info');
        loadPuzzlesBtn.addEventListener('click', function(event) {
            logToServer('Load puzzles button clicked!', 'info');
            logToServer('Event details: ' + event.type, 'debug');
            loadPuzzlesForLevel();
        });
    } else {
        logToServer('Load puzzles button not found in the DOM', 'warn');
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
        logToServer('Loading puzzles for level: ' + level, 'info');
        logToServer('Button clicked - loadPuzzlesForLevel function executing', 'info');
        
        // Update the hidden input 
        selectedLevelInput.value = level;
        logToServer('Selected level input updated to: ' + level, 'info');
        
        // Clear previous selection
        selectedPuzzleIdInput.value = '';
        startGameBtn.disabled = true;
        
        try {
            puzzlesContainer.innerHTML = '<p>Loading puzzles...</p>';
            logToServer('Loading message displayed', 'info');
            
            // Get base URL to handle both development and production paths
            const baseUrl = getCachedBaseUrl();
            logToServer('Using base URL: ' + baseUrl, 'info');
            
            // Build the full URL for debugging
            const fullUrl = `${baseUrl}/v1/game/puzzles/${level}`;
            logToServer('Full fetch URL: ' + fullUrl, 'info');
            logToServer('Fetch parameters', 'info', { level, baseUrl });
            
            // Use the base URL for the fetch request with v1 prefix for API versioning
            logToServer('Attempting fetch request...', 'info');
            
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'same-origin'
            };
            logToServer('Fetch options: ' + JSON.stringify(fetchOptions), 'debug');
            
            const response = await fetch(fullUrl, fetchOptions);
            logToServer('Fetch response status: ' + response.status, 'info');
            logToServer('Fetch response headers: ' + JSON.stringify([...response.headers].map(h => `${h[0]}: ${h[1]}`)), 'debug');
        
            if (!response.ok) {
                logToServer('Fetch error - status: ' + response.status + ' ' + response.statusText, 'error');
                throw new Error('Failed to fetch puzzles: ' + response.status);
            }
            
            const puzzles = await response.json();
            logToServer('Puzzles loaded successfully: ' + puzzles.length + ' puzzles found', 'info', { count: puzzles.length });
            
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
            logToServer('Error loading puzzles: ' + error.message, 'error', {
                errorName: error.name,
                errorStack: error.stack,
                hostname: window.location.hostname,
                pathname: window.location.pathname,
                protocol: window.location.protocol,
                origin: window.location.origin,
                baseUrl: getCachedBaseUrl(),
                fullUrl: getCachedBaseUrl() + '/v1/game/puzzles/' + level
            });
            
            // Display diagnostic information in the UI for debugging
            puzzlesContainer.innerHTML = `
                <p class="error-message">Error loading puzzles: ${error.message}</p>
                <div class="debug-info">
                    <p><strong>Debug Info:</strong></p>
                    <p>Hostname: ${window.location.hostname}</p>
                    <p>Pathname: ${window.location.pathname}</p>
                    <p>Protocol: ${window.location.protocol}</p>
                    <p>Origin: ${window.location.origin}</p>
                    <p>Base URL: ${getCachedBaseUrl()}</p>
                    <p>Full URL attempted: ${getCachedBaseUrl()}/v1/game/puzzles/${level}</p>
                    <p>Error type: ${error.name}</p>
                    <p>Error details: ${error.message}</p>
                </div>
                <div class="debug-actions">
                    <button onclick="window.location.reload()">Reload Page</button>
                    <button onclick="document.getElementById('debug-info').style.display='block'">Show Full Debug</button>
                </div>
                <div id="debug-info" style="display:none;white-space:pre-wrap;font-family:monospace;font-size:12px;margin-top:20px;padding:10px;background:#f5f5f5;border:1px solid #ddd;overflow:auto;max-height:300px;">
                    Error stack trace:
                    ${error.stack}
                </div>
            `;
        }
    }
    
    async function loadSelectedPuzzle(puzzleId) {
        if (!puzzleId) {
            alert('Please select a valid puzzle');
            return;
        }
        
        logToServer('Loading puzzle ID: ' + puzzleId, 'info');
        
        try {
            const baseUrl = getCachedBaseUrl();
            logToServer('Using base URL for puzzle details: ' + baseUrl, 'info');
            const fullUrl = `${baseUrl}/v1/game/puzzles/details/${puzzleId}`;
            logToServer('Full fetch URL for puzzle details: ' + fullUrl, 'info');
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'same-origin'
            });
            
            logToServer('Puzzle details response status: ' + response.status, 'info');
            
            if (!response.ok) {
                throw new Error('Failed to fetch puzzle details: ' + response.status);
            }
            
            const puzzle = await response.json();
            logToServer('Puzzle details loaded successfully', 'info', { puzzleId: puzzle.id, title: puzzle.title || 'Untitled' });
            
            // Store current puzzle
            currentPuzzle = puzzle;
            
            // Parse puzzle data
            const puzzleData = JSON.parse(puzzle.puzzleData);
            
            // Render the crossword grid
            renderCrosswordGrid(puzzleData);
        } catch (error) {
            logToServer('Error loading puzzle details: ' + error.message, 'error', {
                errorName: error.name,
                errorStack: error.stack,
                puzzleId: puzzleId,
                baseUrl: getCachedBaseUrl(),
                fullUrl: `${getCachedBaseUrl()}/v1/game/puzzles/details/${puzzleId}`
            });
            alert('Failed to load puzzle. Please try again.');
        }
    }
    
    async function loadSavedGames() {
        if (!savedGamesList) return;
        
        try {
            // Assuming a route that returns the user's saved games
            const userId = document.querySelector('meta[name="user-id"]')?.content;
            if (!userId) {
                logToServer('User ID not found for loading saved games', 'error');
                return;
            }
            
            const baseUrl = getCachedBaseUrl();
            logToServer('Loading saved games with base URL: ' + baseUrl, 'info');
            const fullUrl = `${baseUrl}/v1/game/progress/${userId}`;
            logToServer('Full URL for progress: ' + fullUrl, 'debug');
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'same-origin'
            });
            
            logToServer('Progress response status: ' + response.status, 'info');
            
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
                    logToServer('Error loading saved game for puzzle ' + puzzleId, 'error', {
                        errorMessage: error.message,
                        errorName: error.name
                    });
                }
            }
        } catch (error) {
            logToServer('Error loading saved games', 'error', {
                errorMessage: error.message,
                errorName: error.name,
                errorStack: error.stack
            });
            savedGamesList.innerHTML = '<li class="error-message">Error loading saved games</li>';
        }
    }
    
    function renderCrosswordGrid(puzzleData) {
        if (!puzzleData || !puzzleData.grid || !crosswordContainer) {
            logToServer('Invalid puzzle data or crossword container not found', 'error', {
                puzzleDataExists: !!puzzleData,
                gridExists: puzzleData && !!puzzleData.grid,
                containerExists: !!crosswordContainer
            });
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
            console.log('Saving game with base URL:', baseUrl);
            const fullUrl = `${baseUrl}/v1/game/save`;
            console.log('Full save URL:', fullUrl);
            
            const saveData = {
                puzzleId: currentPuzzle.id,
                progress: JSON.stringify(gridState)
            };
            console.log('Save data:', saveData);
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(saveData)
            });
            
            console.log('Save response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to save game: ' + response.status);
            }
            
            alert('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            console.error('Error details:', error.message);
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
