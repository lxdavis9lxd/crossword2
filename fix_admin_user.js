const db = require('./models');
const { User, sequelize } = db;
const bcrypt = require('bcrypt');

async function fixAdminUser() {
  try {
    console.log('Starting admin user fix...');
    
    // Directly create a new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // First try to find an existing admin to update
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (adminUser) {
      console.log('Found existing admin user, updating password...');
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('No admin user found, creating a new one...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('New admin user created.');
    }
    
    // Log all admin users
    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'username', 'email', 'role', 'isActive']
    });
    
    console.log(`Total admin users found: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(JSON.stringify(user.toJSON(), null, 2));
    });
    
    console.log('Admin user fix completed.');
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the fix function
fixAdminUser()
  .then(() => console.log('Process completed.'))
  .catch(err => console.error('Unhandled error:', err));
