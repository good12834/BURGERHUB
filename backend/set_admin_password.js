const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const adminUser = await User.findOne({ where: { email: 'admin@burger.com' } });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('Admin password set to admin123');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

setAdminPassword();