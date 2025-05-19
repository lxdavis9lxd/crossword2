const { User } = require('./models');
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const sequelize = require('./models').sequelize;

async function testLogin() {
  try {
    const emailOrUsername = 'admin';
    const password = 'admin123';
    
    console.log(`Testing login with ${emailOrUsername} and password ${password}`);
    
    // Find the user by email or username
    const user = await User.findOne({ 
      where: {
        [Sequelize.Op.or]: [
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
    process.exit();
  }
}

testLogin();
