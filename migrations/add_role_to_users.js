const { User, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { QueryTypes } = require('sequelize');

// Function to add 'role' and 'isActive' fields to User model and create an admin user
async function migrateUserModel() {
  try {
    console.log('Starting user model migration...');
    
    // Check if role column exists
    const tableInfo = await sequelize.query(
      "PRAGMA table_info(Users)",
      { type: QueryTypes.SELECT }
    );
    
    const roleColumnExists = tableInfo.some(column => column.name === 'role');
    const isActiveColumnExists = tableInfo.some(column => column.name === 'isActive');
    
    // Add role column if it doesn't exist
    if (!roleColumnExists) {
      console.log('Adding role column to Users table...');
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'user'"
      );
      console.log('Role column added successfully!');
    } else {
      console.log('Role column already exists.');
    }
    
    // Add isActive column if it doesn't exist
    if (!isActiveColumnExists) {
      console.log('Adding isActive column to Users table...');
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN isActive BOOLEAN DEFAULT 1"
      );
      console.log('isActive column added successfully!');
    } else {
      console.log('isActive column already exists.');
    }
    
    // Check if we already have an admin user
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation.');
    } else {
      // Create an admin user
      console.log('Creating admin user...');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Should be set in environment variables for production
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: ' + adminPassword);
      console.log('Please change the password after first login.');
    }
    
    // Update existing users to have the 'user' role if they don't have a role
    const usersToUpdate = await User.findAll({
      where: {
        role: null
      }
    });
    
    if (usersToUpdate.length > 0) {
      console.log(`Updating ${usersToUpdate.length} existing users to have 'user' role...`);
      
      for (const user of usersToUpdate) {
        user.role = 'user';
        user.isActive = true;
        await user.save();
      }
      
      console.log('User roles updated successfully!');
    } else {
      console.log('No users need role updates.');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateUserModel().then(() => {
  process.exit(0);
});
