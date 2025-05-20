// Reset admin password script
const bcrypt = require('bcrypt');
const { sequelize, User } = require('./models');

async function resetAdminPassword() {
  try {
    console.log('Searching for admin user...');
    const adminUser = await User.findOne({
      where: {
        email: 'admin@example.com',
        role: 'admin'
      }
    });

    if (!adminUser) {
      console.error('Admin user not found!');
      return;
    }

    console.log(`Found admin user: ${adminUser.username} (${adminUser.email})`);
    
    // Hash the new password
    const newPassword = 't123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log(`✅ Admin password has been reset to: ${newPassword}`);
    console.log('You can now login with:');
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Password: ${newPassword}`);
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

resetAdminPassword();
