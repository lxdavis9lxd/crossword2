const readline = require('readline');
const { User, Puzzle, sequelize } = require('./models');
const bcrypt = require('bcrypt');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // Find the admin user
    const admin = await User.findOne({ where: { username: 'admin' } });
    
    if (!admin) {
      console.log('Admin user not found. Creating a new admin user...');
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      // Reset password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('Admin password reset successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
}

async function listUsers() {
  try {
    console.log('\nListing all users:');
    console.log('-----------------');
    
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt']
    });
    
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Status: ${user.isActive ? 'Active' : 'Inactive'}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('-----------------');
      });
    }
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

async function listPuzzles() {
  try {
    console.log('\nListing all puzzles:');
    console.log('-----------------');
    
    const puzzles = await Puzzle.findAll({
      attributes: ['id', 'title', 'level', 'difficultyRating', 'createdAt']
    });
    
    if (puzzles.length === 0) {
      console.log('No puzzles found.');
    } else {
      puzzles.forEach(puzzle => {
        console.log(`- ID: ${puzzle.id}`);
        console.log(`  Title: ${puzzle.title || 'Untitled'}`);
        console.log(`  Level: ${puzzle.level}`);
        console.log(`  Difficulty: ${puzzle.difficultyRating}`);
        console.log(`  Created: ${puzzle.createdAt}`);
        console.log('-----------------');
      });
    }
  } catch (error) {
    console.error('Error listing puzzles:', error);
  }
}

async function createUser() {
  try {
    console.log('\nCreating a new user:');
    console.log('-----------------');
    
    const username = await prompt('Enter username: ');
    const email = await prompt('Enter email: ');
    const password = await prompt('Enter password: ');
    const role = await prompt('Enter role (user or admin): ');
    
    // Validate input
    if (!username || !email || !password) {
      console.log('Error: All fields are required');
      return;
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      where: {
        [sequelize.Op.or]: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      console.log('Error: Username or email already exists');
      return;
    }
    
    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      isActive: true
    });
    
    console.log('User created successfully!');
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function main() {
  try {
    console.log('===========================================');
    console.log('  ADMIN FEATURES MANUAL TEST');
    console.log('===========================================');
    
    let exit = false;
    
    while (!exit) {
      console.log('\nSelect an option:');
      console.log('1. Reset admin password');
      console.log('2. List all users');
      console.log('3. List all puzzles');
      console.log('4. Create a new user');
      console.log('5. Exit');
      
      const choice = await prompt('\nEnter your choice (1-5): ');
      
      switch (choice) {
        case '1':
          await resetAdminPassword();
          break;
        case '2':
          await listUsers();
          break;
        case '3':
          await listPuzzles();
          break;
        case '4':
          await createUser();
          break;
        case '5':
          exit = true;
          break;
        default:
          console.log('Invalid choice. Please try again.');
      }
    }
    
    console.log('\nThank you for testing the admin features!');
    rl.close();
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  }
}

// Run the main function
main();
