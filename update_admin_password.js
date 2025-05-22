// Script to update admin user password
const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

async function updateAdminPassword() {
  try {
    // Find admin user
    const admin = await User.findOne({
      where: {
        email: 'admin@example.com'
      }
    });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash('t123', 10);
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('Admin password updated to "t123" successfully');
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

updateAdminPassword();
