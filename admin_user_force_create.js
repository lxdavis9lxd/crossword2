const db = require('./models');
const { User, sequelize } = db;
const bcrypt = require('bcrypt');

(async () => {
  try {
    console.log('Database connected.');
    
    // Generate hashed password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Password hashed.');
    
    // Check for existing admin
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('Existing admin found:', existingAdmin.username);
      console.log('Updating password...');
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('Admin password updated.');
    } else {
      console.log('No admin found. Creating new admin user...');
      
      // Create admin user
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('Admin user created:', newAdmin.username);
    }
    
    console.log('Admin user setup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Closing database connection...');
    await sequelize.close();
    console.log('Done!');
    process.exit(0);
  }
})();
