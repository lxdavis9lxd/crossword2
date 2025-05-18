document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Function to initialize and configure the navigation bar
    function initializeNavigation() {
        // Get current page path
        const currentPath = window.location.pathname;
        const isGamePage = currentPath.includes('/game') && !currentPath.includes('/dashboard');
        const isDashboardPage = currentPath.includes('/dashboard');
        const isHomePage = currentPath === '/';
        const isAuthPage = currentPath.includes('/auth/login') || currentPath.includes('/auth/register');
        
        // Get navigation buttons
        const homeBtn = document.getElementById('home-btn');
        const dashboardBtn = document.getElementById('dashboard-btn');
        const loadPuzzleBtn = document.getElementById('load-puzzle-btn');
        const saveGameBtn = document.getElementById('save-button');
        const showAnswersBtn = document.getElementById('show-answers-button');
        const resumeGameBtn = document.getElementById('resume-game-btn');
        const startGameBtn = document.getElementById('start-game-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        // Check if user is authenticated (based on presence of logout button)
        const isAuthenticated = logoutBtn !== null;
        
        // Set active states based on current page
        if (homeBtn) homeBtn.classList.toggle('active', isHomePage);
        if (dashboardBtn) dashboardBtn.classList.toggle('active', isDashboardPage);
        
        // Only show dashboard and game-related links if authenticated
        if (dashboardBtn) dashboardBtn.style.display = isAuthenticated ? 'block' : 'none';
        
        // Configure button visibility and state based on current page
        if (loadPuzzleBtn) {
            loadPuzzleBtn.style.display = isGamePage ? 'block' : 'none';
            loadPuzzleBtn.disabled = !isGamePage;
            
            // Add click handler for load puzzle button
            if (isGamePage) {
                loadPuzzleBtn.addEventListener('click', function() {
                    const puzzleSelectElem = document.getElementById('puzzle-select');
                    if (puzzleSelectElem && puzzleSelectElem.value && 
                        puzzleSelectElem.value !== 'No puzzles available' && 
                        puzzleSelectElem.value !== 'Error loading puzzles' &&
                        puzzleSelectElem.value !== 'Select a difficulty first') {
                        // If an actual puzzle is selected, trigger load
                        if (window.loadSelectedPuzzle) {
                            window.loadSelectedPuzzle();
                        }
                    } else {
                        // Otherwise scroll to the puzzle selection area
                        const puzzleControls = document.querySelector('.puzzle-controls');
                        if (puzzleControls) {
                            puzzleControls.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                });
            }
        }
        
        if (saveGameBtn) {
            saveGameBtn.style.display = isGamePage ? 'block' : 'none';
            saveGameBtn.disabled = !isGamePage || !isPuzzleLoaded();
        }
        
        if (showAnswersBtn) {
            showAnswersBtn.style.display = isGamePage ? 'block' : 'none';
            showAnswersBtn.disabled = !isGamePage || !isPuzzleLoaded();
        }
        
        if (startGameBtn) {
            startGameBtn.style.display = isDashboardPage ? 'block' : 'none';
            // Start game button is enabled when a level is selected in the dashboard
        }
        
        if (resumeGameBtn) {
            resumeGameBtn.style.display = (isGamePage || isDashboardPage) && isAuthenticated ? 'block' : 'none';
        }
        
        // Logout button only visible if authenticated
        if (logoutBtn) {
            logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
        }
        
        // Adjust home button based on authentication state
        if (homeBtn && isAuthenticated) {
            // If authenticated, home button goes to dashboard
            homeBtn.href = '/game/dashboard';
        }
    }
    
    // Function to check if a puzzle is currently loaded
    function isPuzzleLoaded() {
        // Check if the crossword container has children
        const crosswordContainer = document.getElementById('crossword-container');
        return crosswordContainer && crosswordContainer.children.length > 0;
    }
    
    // Function to update button states when a puzzle is loaded
    function updateButtonsAfterPuzzleLoad() {
        const saveGameBtn = document.getElementById('save-button');
        const showAnswersBtn = document.getElementById('show-answers-button');
        
        if (saveGameBtn) saveGameBtn.disabled = false;
        if (showAnswersBtn) showAnswersBtn.disabled = false;
    }
    
    // Expose the updateButtonsAfterPuzzleLoad function globally
    window.updateButtonsAfterPuzzleLoad = updateButtonsAfterPuzzleLoad;
});
