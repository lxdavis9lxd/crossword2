// Test script to verify puzzle themes are displayed on the dashboard
const puppeteer = require('puppeteer');

async function testPuzzleThemes() {
  console.log('Starting dashboard theme test...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to dashboard
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    
    // Wait for the page to load
    await page.waitForSelector('#level-select');
    
    // Select difficulty level and click load puzzles
    console.log('Loading puzzles for each difficulty level...');
    
    // Test each difficulty level
    for (const level of ['easy', 'intermediate', 'advanced']) {
      console.log(`Testing ${level} level puzzles...`);
      
      // Select the level
      await page.select('#level-select', level);
      
      // Click the load puzzles button
      await page.click('#load-puzzles-btn');
      
      // Wait for puzzles to load
      await page.waitForSelector('.puzzle-card', { timeout: 5000 }).catch(() => {
        console.log(`No puzzles found for ${level} level`);
        return;
      });
      
      // Check if any puzzle titles use the format "Puzzle #X"
      const puzzleTitles = await page.evaluate(() => {
        const titles = [];
        document.querySelectorAll('.puzzle-card h4').forEach(el => {
          titles.push(el.textContent);
        });
        return titles;
      });
      
      if (puzzleTitles.length === 0) {
        console.log(`No puzzles found for ${level} level`);
        continue;
      }
      
      console.log(`Found ${puzzleTitles.length} puzzles for ${level} level:`);
      puzzleTitles.forEach(title => {
        console.log(`- "${title}"`);
        
        // Check if title follows the pattern "Puzzle #X"
        if (title.match(/^Puzzle #\d+$/)) {
          console.error(`ERROR: Found generic title format: "${title}"`);
        }
      });
      
      // Check for descriptions
      const descriptions = await page.evaluate(() => {
        const descTexts = [];
        document.querySelectorAll('.puzzle-description').forEach(el => {
          descTexts.push(el.textContent);
        });
        return descTexts;
      });
      
      console.log(`Found ${descriptions.length} descriptions for ${level} level`);
      if (descriptions.length !== puzzleTitles.length) {
        console.error(`ERROR: Number of descriptions (${descriptions.length}) doesn't match puzzle titles (${puzzleTitles.length})`);
      }
    }
    
    console.log('Dashboard theme test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testPuzzleThemes();
