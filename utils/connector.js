const { Pool } = require('pg');
const dbUser = process.env.DB_USER;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

require('dotenv').config();

//Connect to PostgreSQL
const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: 5432,
});

// Test the database connection
pool.connect((err) => {
    if (err) {
      console.error('Failed to connect to the database:', err);
    } else {
      console.log('Database connection successful');
    }
  });

module.exports = pool;
