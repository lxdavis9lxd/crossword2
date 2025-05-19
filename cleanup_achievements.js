const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // First, remove duplicates
  db.run(`
    DELETE FROM Achievements
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM Achievements
      GROUP BY name
    )
  `);
  
  // Verify achievements after cleanup
  db.all("SELECT id, name FROM Achievements", (err, rows) => {
    if (err) {
      console.error("Error verifying achievements:", err);
    } else {
      console.log("Achievements cleaned up successfully!");
      console.log("Remaining achievements in database:", rows.length);
      rows.forEach(row => {
        console.log(`- ${row.id}: ${row.name}`);
      });
    }
    
    db.close();
  });
});
