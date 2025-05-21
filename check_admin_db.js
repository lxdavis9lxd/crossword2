// Script to verify admin user in the database

const { User } = require('./models');

async function checkAdminUser() {
  try {
    console.log('Checking for admin user in the database...');
    
    // Find admin user by email
    const adminUser = await User.findOne({
      where: {
        email: 'admin@example.com'
      }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found in the database!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser.id);
    console.log('- Username:', adminUser.username);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Is Active:', adminUser.isActive);
    
    if (adminUser.role !== 'admin') {
      console.log('❌ WARNING: User found but does not have admin role!');
      
      // Fix the role
      console.log('\nUpdating user to have admin role...');
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ User updated. Role is now:', adminUser.role);
    } else {
      console.log('✅ User has the correct admin role.');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

checkAdminUser();
