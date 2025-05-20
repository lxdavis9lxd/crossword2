const db = require('./models');
const { User } = db;
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function testLogin() {
  try {
    const emailOrUsername = 'admin';
    const password = 'admin123';
    
    console.log(`Testing login with ${emailOrUsername} and password ${password}`);
    
    // Find the user by email or username
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      } 
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('Found user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Invalid password');
      return;
    }

    // Set user session (simulated)
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    console.log('Session user would be:', sessionUser);
    
  } catch (error) {
    console.error('Error during login test:', error);
  } finally {
    await db.sequelize.close();
    console.log('Database connection closed.');
  }
}

testLogin()
  .then(() => console.log('Login test completed.'))
  .catch(err => console.error('Unhandled error:', err));
