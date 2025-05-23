require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcrypt');

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Connect to the database
    await db.testConnection();
    
    // Create tables (force: true will drop tables if they exist)
    // Only use force: true in development/testing environments
    const force = process.env.NODE_ENV !== 'production';
    console.log(`Sync with force=${force}`);
    
    if (force) {
      await db.sequelize.sync({ force });
      console.log('Database schema created.');
    } else {
      // In production, we should use proper migrations
      // This is just creating the tables if they don't exist
      await db.sequelize.sync({ alter: true });
      console.log('Database schema updated.');
    }
    
    // Check if we need to create an admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    const existingAdmin = await db.User.findOne({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      
      await db.User.create({
        email: adminEmail,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        verified: true
      });
      
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
    
    // Check if we need to create sample puzzles
    const puzzleCount = await db.Puzzle.count();
    console.log(`Found ${puzzleCount} existing puzzles.`);
    
    if (puzzleCount === 0 && process.env.NODE_ENV !== 'production') {
      console.log('No puzzles found. Creating sample puzzles...');
      
      // Simple sample puzzle for testing
      const samplePuzzle = {
        level: 'easy',
        theme: 'Demo',
        puzzleData: JSON.stringify({
          title: 'Sample Puzzle',
          grid: [
            'C', 'A', 'T', '#',
            'A', 'P', 'E', '#',
            'R', 'E', 'D', '#',
            '#', '#', '#', '#'
          ],
          cellNumbers: {
            '0': '1',
            '4': '2',
            '8': '3'
          },
          clues: {
            across: {
              '1': 'Feline pet',
              '2': 'Primate',
              '3': 'Color of a stop sign'
            },
            down: {
              '1': 'Vehicle',
              '2': 'Fishing pole',
              '3': 'Taxi'
            }
          },
          description: 'A sample 3x3 crossword puzzle.'
        })
      };
      
      await db.Puzzle.create(samplePuzzle);
      console.log('Sample puzzle created.');
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.sequelize.close();
  }
}

// Run the migration
runMigration();
