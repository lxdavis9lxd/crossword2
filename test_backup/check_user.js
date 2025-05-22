// Script to verify a user exists in the database
const { User } = require('./models');

async function checkUser(username) {
  try {
    console.log(`Checking if user '${username}' exists in the database...`);
    
    // Find the user
    const user = await User.findOne({ where: { username } });
    
    if (user) {
      console.log(`✓ User '${username}' found!`);
      console.log('User details:');
      console.log('  ID:', user.id);
      console.log('  Username:', user.username);
      console.log('  Email:', user.email);
      console.log('  Created at:', user.createdAt);
    } else {
      console.log(`✗ User '${username}' not found in the database.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
}

// Check the user we just created
checkUser('testuser123');
