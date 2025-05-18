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
    
    // Initialize - check the page
    if (window.location.pathname.includes('/game')) {
        // We're on the game page
        loadPuzzlesForLevel(); // Load puzzles for default level
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
            
            // Render the crossword grid
            renderCrosswordGrid(puzzleData);
        } catch (error) {
            console.error('Error loading puzzle details:', error);
            alert('Failed to load puzzle. Please try again.');
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
            const response = await fetch('/game/save', {
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
                throw new Error(`Failed to save game: ${response.status}`);
            }
            
            alert('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game. Please try again.');
        }
    }
});