// Test script to verify puzzle themes on dashboard
// This script adds a test route that returns information about displayed puzzle cards

const express = require('express');
const path = require('path');
const { Puzzle } = require('./models');

// Create a simple express app for testing
const app = express();
const PORT = 3030;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Special test route to get puzzle data
app.get('/api/test/puzzles/:level', async (req, res) => {
  const { level } = req.params;
  
  try {
    const puzzles = await Puzzle.findAll({ 
      where: { level },
      limit: 10 // Just get a few for testing
    });
    
    if (!puzzles || puzzles.length === 0) {
      return res.json({ 
        success: false, 
        message: `No puzzles found for level: ${level}` 
      });
    }
    
    // Process each puzzle to extract title and description
    const processedPuzzles = puzzles.map(puzzle => {
      try {
        const puzzleData = JSON.parse(puzzle.puzzleData);
        
        // Check if using themed title or fallback
        const hasThemedTitle = puzzleData.title && !puzzleData.title.match(/^Puzzle #\d+$/);
        const displayedTitle = puzzleData.title || `Puzzle #${puzzle.id}`;
        
        return {
          id: puzzle.id,
          level: puzzle.level,
          displayedTitle,
          hasThemedTitle,
          description: puzzleData.description || null,
          hasDescription: !!puzzleData.description
        };
      } catch (error) {
        return {
          id: puzzle.id,
          level: puzzle.level,
          error: 'Failed to parse puzzle data'
        };
      }
    });
    
    res.json({
      success: true,
      level,
      count: puzzles.length,
      puzzles: processedPuzzles
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create a simple test HTML page
app.get('/test-dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Puzzle Theme Test</title>
      <link rel="stylesheet" href="/styles.css">
      <style>
        .results {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          white-space: pre-wrap;
          font-family: monospace;
        }
        .pass { color: green; }
        .fail { color: red; }
        .level-btn {
          margin-right: 10px;
          padding: 8px 16px;
        }
        .summary {
          font-weight: bold;
          margin-top: 10px;
          padding: 5px;
          border-radius: 4px;
        }
        .summary.pass { background-color: #d4edda; }
        .summary.fail { background-color: #f8d7da; }
      </style>
    </head>
    <body>
      <header>
        <h1>Puzzle Theme Test</h1>
      </header>
      <main>
        <section>
          <h2>Test Dashboard Puzzle Themes</h2>
          <div>
            <button id="test-easy" class="level-btn">Test Easy Puzzles</button>
            <button id="test-intermediate" class="level-btn">Test Intermediate Puzzles</button>
            <button id="test-advanced" class="level-btn">Test Advanced Puzzles</button>
          </div>
          <div id="results" class="results">Select a level to test...</div>
        </section>
      </main>
      
      <script>
        document.querySelectorAll('.level-btn').forEach(button => {
          button.addEventListener('click', async function() {
            const level = this.id.replace('test-', '');
            const resultsContainer = document.getElementById('results');
            
            resultsContainer.textContent = 'Testing ' + level + ' puzzles...';
            
            try {
              const response = await fetch('/api/test/puzzles/' + level);
              const data = await response.json();
              
              if (!data.success) {
                resultsContainer.textContent = 'Error: ' + data.message;
                return;
              }
              
              let output = '=== ' + level.toUpperCase() + ' PUZZLES ===\\n';
              output += 'Found ' + data.count + ' puzzles\\n\\n';
              
              let genericTitleCount = 0;
              let missingDescriptionCount = 0;
              
              data.puzzles.forEach(puzzle => {
                const titleStatus = puzzle.hasThemedTitle ? '[PASS]' : '[FAIL]';
                const descStatus = puzzle.hasDescription ? '[PASS]' : '[FAIL]';
                
                if (!puzzle.hasThemedTitle) genericTitleCount++;
                if (!puzzle.hasDescription) missingDescriptionCount++;
                
                output += 'Puzzle #' + puzzle.id + '\\n';
                output += '  Title: "' + puzzle.displayedTitle + '" ' + titleStatus + '\\n';
                output += '  Has Description: ' + (puzzle.hasDescription ? 'Yes' : 'No') + ' ' + descStatus + '\\n\\n';
              });
              
              // Add summary
              const allPass = genericTitleCount === 0 && missingDescriptionCount === 0;
              output += '=== SUMMARY ===\\n';
              output += 'Generic Titles: ' + genericTitleCount + '/' + data.count + '\\n';
              output += 'Missing Descriptions: ' + missingDescriptionCount + '/' + data.count + '\\n';
              output += '\\nVerdict: ' + (allPass ? 'PASS - All puzzles have themed titles and descriptions' : 'FAIL - Some puzzles are missing themes');
              
              // Add HTML formatting
              let formattedOutput = '';
              output.split('\\n').forEach(line => {
                if (line.includes('[PASS]')) {
                  line = line.replace('[PASS]', '<span class="pass">[PASS]</span>');
                }
                if (line.includes('[FAIL]')) {
                  line = line.replace('[FAIL]', '<span class="fail">[FAIL]</span>');
                }
                formattedOutput += line + '\\n';
              });
              
              resultsContainer.innerHTML = formattedOutput;
              
              // Add colored summary
              const summaryDiv = document.createElement('div');
              summaryDiv.className = 'summary ' + (allPass ? 'pass' : 'fail');
              summaryDiv.textContent = allPass ? 
                'SUCCESS: All puzzles have themed titles and descriptions!' : 
                'FAIL: Some puzzles are missing themed titles or descriptions';
              resultsContainer.appendChild(summaryDiv);
            } catch (error) {
              resultsContainer.textContent = 'Error: ' + error.message;
            }
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/test-dashboard`);
});
