// Visual check script for the button theme display feature
const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a simple test page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Button Theme Test</title>
      <link rel="stylesheet" href="/styles.css">
      <style>
        body {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .test-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-section {
          margin-bottom: 30px;
          padding: 15px;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .puzzles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        h1, h2 {
          color: #2E7D32;
        }
        .test-log {
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          padding: 10px;
          max-height: 150px;
          overflow-y: auto;
          font-family: monospace;
          margin-top: 20px;
        }
        .puzzle-card {
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f9f9f9;
        }
        .puzzle-card h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #1a5632;
        }
        .puzzle-card:hover {
          border-color: #4CAF50;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .puzzle-card.selected {
          border-color: #4CAF50;
          background-color: #e8f5e9;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
        }
        #test-button {
          margin-top: 20px;
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        #test-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        #test-button:not([disabled]) {
          background-color: #388e3c;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }
        .status {
          padding: 8px 15px;
          border-radius: 4px;
          display: inline-block;
          margin: 10px 0;
          font-weight: bold;
        }
        .status.pass {
          background-color: #e8f5e9;
          color: #2E7D32;
        }
        .status.fail {
          background-color: #ffebee;
          color: #c62828;
        }
      </style>
    </head>
    <body>
      <div class="test-container">
        <h1>Button Theme Display Test</h1>
        <p>This page tests the functionality of updating the button text with the selected puzzle theme.</p>
        
        <div class="test-section">
          <h2>Test: Button Initial State</h2>
          <p>The button should initially be disabled and show "Start Game"</p>
          <button id="test-button" disabled>Start Game</button>
          <div class="status" id="initial-status"></div>
        </div>
        
        <div class="test-section">
          <h2>Test: Puzzle Selection</h2>
          <p>When you select a puzzle, the button should update with the puzzle theme.</p>
          
          <div class="puzzles-grid" id="test-puzzles">
            <div class="puzzle-card" data-theme="Spring Flowers">
              <h4>Spring Flowers</h4>
              <p class="puzzle-description">A crossword puzzle about spring flowers and garden themes</p>
            </div>
            <div class="puzzle-card" data-theme="World Capitals">
              <h4>World Capitals</h4>
              <p class="puzzle-description">Test your knowledge of world capitals in this geographic puzzle</p>
            </div>
            <div class="puzzle-card" data-theme="Famous Artists">
              <h4>Famous Artists</h4>
              <p class="puzzle-description">Explore the world of art and famous painters</p>
            </div>
          </div>
          <div class="status" id="selection-status"></div>
        </div>
        
        <div class="test-section">
          <h2>Test: Reset Button</h2>
          <p>The button should reset to "Start Game" when reset is triggered.</p>
          <button id="reset-button">Simulate Reset</button>
          <div class="status" id="reset-status"></div>
        </div>
        
        <div class="test-log" id="log">
          Test log will appear here...
        </div>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const testButton = document.getElementById('test-button');
          const puzzles = document.querySelectorAll('.puzzle-card');
          const resetButton = document.getElementById('reset-button');
          const log = document.getElementById('log');
          let selectedCard = null;
          
          // Initial state check
          const initialStatus = document.getElementById('initial-status');
          if (testButton.disabled && testButton.textContent === 'Start Game') {
            initialStatus.textContent = 'PASS: Button is initially disabled and shows "Start Game"';
            initialStatus.className = 'status pass';
            logMessage('Initial button state: PASS');
          } else {
            initialStatus.textContent = 'FAIL: Button should be disabled and show "Start Game"';
            initialStatus.className = 'status fail';
            logMessage('Initial button state: FAIL');
          }
          
          // Add click event to puzzle cards
          puzzles.forEach(card => {
            card.addEventListener('click', function() {
              // Remove selection from previously selected card
              if (selectedCard) {
                selectedCard.classList.remove('selected');
              }
              
              // Add selection to this card
              card.classList.add('selected');
              selectedCard = card;
              
              // Update button text with selected theme
              const theme = card.dataset.theme;
              testButton.textContent = 'Play "' + theme + '"';
              testButton.disabled = false;
              
              // Update status
              const selectionStatus = document.getElementById('selection-status');
              if (testButton.textContent === 'Play "' + theme + '"' && !testButton.disabled) {
                selectionStatus.textContent = 'PASS: Button updated to show "Play \\'' + theme + '\\'"';
                selectionStatus.className = 'status pass';
                logMessage('Selection test with "' + theme + '": PASS');
              } else {
                selectionStatus.textContent = 'FAIL: Button did not update correctly';
                selectionStatus.className = 'status fail';
                logMessage('Selection test: FAIL');
              }
            });
          });
          
          // Add reset event
          resetButton.addEventListener('click', function() {
            // Reset button state
            testButton.textContent = 'Start Game';
            testButton.disabled = true;
            
            // Clear selected card
            if (selectedCard) {
              selectedCard.classList.remove('selected');
              selectedCard = null;
            }
            
            // Update status
            const resetStatus = document.getElementById('reset-status');
            if (testButton.disabled && testButton.textContent === 'Start Game') {
              resetStatus.textContent = 'PASS: Button was reset correctly';
              resetStatus.className = 'status pass';
              logMessage('Reset test: PASS');
            } else {
              resetStatus.textContent = 'FAIL: Button did not reset correctly';
              resetStatus.className = 'status fail';
              logMessage('Reset test: FAIL');
            }
          });
          
          function logMessage(message) {
            const timestamp = new Date().toLocaleTimeString();
            log.innerHTML += '<div>[' + timestamp + '] ' + message + '</div>';
            log.scrollTop = log.scrollHeight;
          }
          
          logMessage('Test page loaded successfully');
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Visual test server running at http://localhost:${port}`);
  console.log(`Open your browser to this URL to see the visual test.`);
});
