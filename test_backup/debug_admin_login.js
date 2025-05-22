// Debug admin user login
const bcrypt = require('bcrypt');
const { User } = require('./models');

async function debugAdminLogin() {
  try {
    console.log('ADMIN USER LOGIN DEBUGGER');
    console.log('========================\n');
    
    // 1. Check if admin user exists
    console.log('1. Checking if admin user exists...');
    const adminUser = await User.findOne({
      where: {
        email: 'admin@example.com'
      }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      console.log('Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const newAdminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully:');
      console.log(`- ID: ${newAdminUser.id}`);
      console.log(`- Username: ${newAdminUser.username}`);
      console.log(`- Email: ${newAdminUser.email}`);
      console.log(`- Role: ${newAdminUser.role}`);
      
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Username: ${adminUser.username}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    
    // 2. Check password
    console.log('\n2. Verifying admin password...');
    
    // Update admin password
    const newPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Admin password updated to:', newPassword);
    
    // 3. Verify by comparing passwords
    console.log('\n3. Verifying password works...');
    const testPassword = 'Admin123!';
    const passwordMatch = await bcrypt.compare(testPassword, adminUser.password);
    
    if (passwordMatch) {
      console.log(`✅ Password verification successful`);
    } else {
      console.log(`❌ Password verification failed`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAdminLogin();
