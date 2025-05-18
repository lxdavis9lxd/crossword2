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
        
        // Set active states based on current page
        if (homeBtn) homeBtn.classList.toggle('active', isHomePage);
        if (dashboardBtn) dashboardBtn.classList.toggle('active', isDashboardPage);
        
        // Configure button visibility and state based on current page
        if (loadPuzzleBtn) {
            loadPuzzleBtn.style.display = isGamePage ? 'block' : 'none';
            loadPuzzleBtn.disabled = !isGamePage;
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
        }
        
        if (resumeGameBtn) {
            resumeGameBtn.style.display = (isGamePage || isDashboardPage) ? 'block' : 'none';
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
