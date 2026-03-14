const sequelize = require('./config/database');

async function addMissingColumns() {
 try {
  await sequelize.authenticate();
  console.log('Connected to database');

  // Check and add is_active
  const [isActiveResults] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'is_active'");
  if (isActiveResults.length === 0) {
   await sequelize.query("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true");
   console.log('is_active column added');
  } else {
   console.log('is_active column already exists');
  }

  // Check and add last_login
  const [lastLoginResults] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'last_login'");
  if (lastLoginResults.length === 0) {
   await sequelize.query("ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL");
   console.log('last_login column added');
  } else {
   console.log('last_login column already exists');
  }
 } catch (error) {
  console.error('Error:', error);
 } finally {
  await sequelize.close();
 }
}

addMissingColumns();