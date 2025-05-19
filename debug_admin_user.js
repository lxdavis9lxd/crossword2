const { User, sequelize } = require('./models');
const bcrypt = require('bcrypt');

async function debugAdminUser() {
  try {
    console.log('Starting admin user debugging...');
    
    // Check if the admin user exists
    const adminUser = await User.findOne({ 
      where: { username: 'admin' },
      attributes: ['id', 'username', 'email', 'role', 'isActive'] 
    });
    
    if (adminUser) {
      console.log('Admin user exists:', adminUser.toJSON());
    } else {
      console.log('Admin user does not exist!');
      
      // Create a new admin user
      console.log('Creating a new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('New admin user created:', newAdmin.toJSON());
    }
    
    // Check the structure of the Users table
    console.log('\nChecking Users table structure:');
    const tableInfo = await sequelize.query(
      "PRAGMA table_info(Users)",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(tableInfo);
    
    // Check if there are any users with admin role
    console.log('\nChecking all users with admin role:');
    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'username', 'email', 'role', 'isActive']
    });
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(user.toJSON());
    });
    
    // Done
    console.log('\nDebugging completed successfully!');
    
  } catch (error) {
    console.error('Error during admin user debugging:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the debugging function
debugAdminUser();
