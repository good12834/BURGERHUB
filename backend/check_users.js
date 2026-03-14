const sequelize = require('./config/database');
const User = require('./models/User');

async function checkUsers() {
 try {
  await sequelize.authenticate();
  console.log('Connected to database');

  const users = await User.findAll();
  console.log('Users in database:');
  users.forEach(user => {
   console.log(`- ${user.email}: ${user.name}`);
  });

  if (users.length === 0) {
   console.log('No users found. Creating a test user...');
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash('vov12345', 10);
   await User.create({
    name: 'Test User',
    email: 'vov@gmail.com',
    password: hashedPassword,
    phone: '1234567890',
    address: 'Test Address'
   });
   console.log('Test user created');
  }
 } catch (error) {
  console.error('Error:', error);
 } finally {
  await sequelize.close();
 }
}

checkUsers();