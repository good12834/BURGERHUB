const sequelize = require('./config/database');

async function checkTables() {
  try {
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('Tables:', results.map(row => Object.values(row)[0]));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();