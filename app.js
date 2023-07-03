const express = require('express');
const identifyRouter = require('./routes/identify');
const db = require('./utils/connector');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/identify', identifyRouter);

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, async () => {
  try {
    await db.connect();
    console.log('Connected to the database');
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Error occurred in the database connection:', error);
  }
});
