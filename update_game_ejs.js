const fs = require('fs');
const path = require('path');

// Read the game.ejs file
const gamePath = path.join(__dirname, 'views', 'game.ejs');
const content = fs.readFileSync(gamePath, 'utf8');

// Add puzzle start time tracking
const scriptStartStr = 'document.addEventListener(\'DOMContentLoaded\', async () => {';
const scriptStartWithTime = `document.addEventListener('DOMContentLoaded', async () => {
            // Track puzzle start time
            const puzzleStartTime = new Date();
            // Track mistakes
            let puzzleMistakes = 0;`;

// Update document.addEventListener to add tracking variables
let updated = content.replace(scriptStartStr, scriptStartWithTime);

// Add check achievements function
const scriptEndStr = '    </script>\n</body>\n</html>';
const scriptWithAchievements = `        // Check for achievements when a puzzle is completed
        async function checkAchievements(puzzleId, completionTime, mistakesMade) {
            try {
                const response = await fetch('/achievements/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        puzzleId,
                        completionTime,
                        mistakesMade
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to check achievements');
                }
                
                const data = await response.json();
                
                if (data.newAchievements && data.newAchievements.length > 0) {
                    // Show achievement notification
                    const achievementNames = data.newAchievements.map(a => a.name).join(', ');
                    showMessage('🏆 New achievement(s) unlocked: ' + achievementNames, 'success');
                    
                    // Create modal to display achievements more prominently
                    const modal = document.createElement('div');
                    modal.style.position = 'fixed';
                    modal.style.top = '0';
                    modal.style.left = '0';
                    modal.style.width = '100%';
                    modal.style.height = '100%';
                    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    modal.style.display = 'flex';
                    modal.style.justifyContent = 'center';
                    modal.style.alignItems = 'center';
                    modal.style.zIndex = '1000';
                    
                    const modalContent = document.createElement('div');
                    modalContent.style.backgroundColor = '#fff';
                    modalContent.style.padding = '20px';
                    modalContent.style.borderRadius = '10px';
                    modalContent.style.maxWidth = '500px';
                    modalContent.style.textAlign = 'center';
                    
                    let achievementsHtml = '<h2>🏆 Achievement Unlocked!</h2>';
                    
                    data.newAchievements.forEach(achievement => {
                        achievementsHtml += \`
                            <div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
                                <h3 style="color: #ffa500;">\${achievement.name}</h3>
                                <p>\${achievement.description}</p>
                            </div>
                        \`;
                    });
                    
                    achievementsHtml += '<p>Check your achievements page to see all your badges!</p>';
                    achievementsHtml += '<button id="close-achievement-modal" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 15px;">Continue</button>';
                    
                    modalContent.innerHTML = achievementsHtml;
                    modal.appendChild(modalContent);
                    
                    document.body.appendChild(modal);
                    
                    document.getElementById('close-achievement-modal').addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                    
                    // Add link to achievements page
                    const viewAchievementsLink = document.createElement('p');
                    viewAchievementsLink.innerHTML = '<a href="/achievements" style="display: block; margin-top: 20px; text-align: center;">View All Achievements</a>';
                    document.querySelector('.controls').appendChild(viewAchievementsLink);
                }
            } catch (error) {
                console.error('Error checking achievements:', error);
            }
        }
    </script>
</body>
</html>`;

// Update the end of the script
updated = updated.replace(scriptEndStr, scriptWithAchievements);

// Update the checkAnswers function to check for puzzle completion
const checkAnswersFunc = `        function checkAnswers(grid) {
            const inputs = document.querySelectorAll('.crossword-cell input');
            
            // Store incorrect cells to calculate errors
            const incorrectCells = [];
            
            inputs.forEach(input => {
                const index = parseInt(input.dataset.index);
                const correctAnswer = grid[index].toUpperCase();
                
                if (input.value.toUpperCase() === correctAnswer) {
                    input.style.color = '#27ae60'; // Green color for correct answers
                } else {
                    input.style.color = '#e74c3c'; // Red color for incorrect answers
                    incorrectCells.push(index);
                }
            });
            
            if (incorrectCells.length === 0) {
                // All answers are correct - puzzle is completed!
                showMessage('Congratulations! You\\'ve completed the puzzle!', 'success');
            } else {
                showMessage(\`Found \${incorrectCells.length} incorrect \${incorrectCells.length === 1 ? 'answer' : 'answers'}\`, 'error');
            }
        }`;

const updatedCheckAnswersFunc = `        function checkAnswers(grid) {
            const inputs = document.querySelectorAll('.crossword-cell input');
            
            // Store incorrect cells to calculate errors
            const incorrectCells = [];
            
            inputs.forEach(input => {
                const index = parseInt(input.dataset.index);
                const correctAnswer = grid[index].toUpperCase();
                
                if (input.value.toUpperCase() === correctAnswer) {
                    input.style.color = '#27ae60'; // Green color for correct answers
                } else {
                    input.style.color = '#e74c3c'; // Red color for incorrect answers
                    incorrectCells.push(index);
                }
            });
            
            if (incorrectCells.length === 0) {
                // All answers are correct - puzzle is completed!
                showMessage('Congratulations! You\\'ve completed the puzzle!', 'success');
                
                // Disable input fields
                inputs.forEach(input => {
                    input.readOnly = true;
                });
                
                // Disable buttons
                document.getElementById('check-button').disabled = true;
                document.getElementById('hint-button').disabled = true;
                document.getElementById('show-answers-button').disabled = true;
                
                // Get the puzzle ID
                const urlParams = new URLSearchParams(window.location.search);
                const puzzleId = urlParams.get('puzzleId');
                
                // Calculate time taken (if we have a start time)
                const endTime = new Date();
                let completionTime = null;
                if (puzzleStartTime) {
                    completionTime = Math.floor((endTime - puzzleStartTime) / 1000); // in seconds
                }
                
                // Check for achievements
                checkAchievements(puzzleId, completionTime, puzzleMistakes);
                
            } else {
                showMessage(\`Found \${incorrectCells.length} incorrect \${incorrectCells.length === 1 ? 'answer' : 'answers'}\`, 'error');
                // Increment the mistake counter
                puzzleMistakes += incorrectCells.length;
            }
        }`;

// Update the checkAnswers function
updated = updated.replace(checkAnswersFunc, updatedCheckAnswersFunc);

// Write the updated content back to the file
fs.writeFileSync(gamePath, updated, 'utf8');

console.log('Updated game.ejs with achievement tracking and notifications');
process.exit(0);
