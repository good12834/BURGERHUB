// backend/create_user.js
const sequelize = require('./config/database');
require('./models');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected');

    const hashedPassword = await bcrypt.hash('nono123', 10);

    const user = await User.create({
      name: 'Nono',
      email: 'nono@gmail.com',
      password: hashedPassword,
      role: 'customer'
    });

    console.log('User created:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createUser();