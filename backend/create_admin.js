const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
 try {
  await sequelize.authenticate();
  console.log('Connected to database');

  // Check if admin already exists
  const existingAdmin = await User.findOne({ where: { email: 'admin@burgerdelivery.com' } });

  if (existingAdmin) {
   console.log('Admin user already exists');
   console.log('Email: admin@burgerdelivery.com');
   console.log('Password: admin123');
   return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await User.create({
   name: 'Admin User',
   email: 'admin@burgerdelivery.com',
   password: hashedPassword,
   phone: '1234567890',
   address: 'Admin Office',
   role: 'admin'
  });

  console.log('Admin user created successfully!');
  console.log('Email: admin@burgerdelivery.com');
  console.log('Password: admin123');
  console.log('Role: admin');

 } catch (error) {
  console.error('Error creating admin:', error);
 } finally {
  await sequelize.close();
 }
}

createAdmin();
