// Most basic possible SQLite test
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    return console.error('Error opening database:', err.message);
  }
  console.log('Connected to SQLite database.');
  
  // Create a simple table
  db.run('CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
    if (err) {
      return console.error('Error creating table:', err.message);
    }
    console.log('Table created successfully');
    
    // Insert a test row
    db.run('INSERT INTO test_table (name) VALUES (?)', ['Test Row'], function(err) {
      if (err) {
        return console.error('Error inserting row:', err.message);
      }
      console.log(`Row inserted with ID: ${this.lastID}`);
      
      // Close the database
      db.close((err) => {
        if (err) {
          return console.error('Error closing database:', err.message);
        }
        console.log('Database closed.');
      });
    });
  });
});
