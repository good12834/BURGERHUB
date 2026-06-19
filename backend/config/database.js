const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '/tmp/database.sqlite',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
  });
}

sequelize.authenticate()
  .then(() => console.log(`Database connected successfully (${sequelize.getDialect()})`))
  .catch(err => console.error('Unable to connect to database:', err.message));

module.exports = sequelize;
