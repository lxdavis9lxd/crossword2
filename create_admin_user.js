// Script to create an admin user for testing
const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@example.com'
      }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update password and ensure role is admin
      existingAdmin.password = await bcrypt.hash('Admin123!', 10);
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user credentials updated');
      return;
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

createAdminUser();
