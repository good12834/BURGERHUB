const { Sequelize } = require('sequelize');
require('dotenv').config();
// Using MySQL database
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
});
// Test the connection
sequelize.authenticate()
    .then(() => console.log(`Database connected successfully (${sequelize.getDialect()} - ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT})`))
    .catch(err => console.error('Unable to connect to database:', err.message));
module.exports = sequelize;
