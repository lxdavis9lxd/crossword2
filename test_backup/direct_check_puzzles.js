// Direct database query to check puzzle data
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all("SELECT id, level, puzzleData FROM Puzzles", [], (err, rows) => {
  if (err) {
    console.error('Query error:', err);
    return;
  }
  
  console.log(`Found ${rows.length} puzzles:`);
  rows.forEach(row => {
    try {
      const data = JSON.parse(row.puzzleData);
      console.log(`- Puzzle #${row.id}, Level: ${row.level}`);
      console.log(`  Title: ${data.title || 'No title'}`);
      console.log(`  Description: ${data.description ? data.description.substring(0, 50) + (data.description.length > 50 ? '...' : '') : 'No description'}`);
      console.log('');
    } catch (e) {
      console.log(`- Puzzle #${row.id}, Level: ${row.level} (Error parsing data)`);
      console.error(e);
    }
  });
  
  db.close();
});
