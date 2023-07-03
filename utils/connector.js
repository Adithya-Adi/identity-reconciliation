const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const connect = async () => {
  try {
    await pool.connect();
  } catch (error) {
    console.error('Error occurred in the database connection:', error);
    throw error;
  }
};

module.exports = {
  pool,
  connect,
};
