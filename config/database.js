// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || process.env.DB_DATABASE; // support both names
const dbDialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    dialect: dbDialect,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;