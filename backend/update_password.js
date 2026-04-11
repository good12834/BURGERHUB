// backend/update_password.js
const sequelize = require('./config/database');
require('./models');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    await sequelize.authenticate();
    console.log('Connected');

    const user = await User.findOne({ where: { email: 'nono@gmail.com' } });
    if (!user) {
      console.log('User not found');
      return;
    }

    const hashedPassword = await bcrypt.hash('nono123', 10);
    await user.update({ password: hashedPassword });

    console.log('Password updated for:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePassword();