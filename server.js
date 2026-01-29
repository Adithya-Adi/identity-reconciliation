import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

// Database connection
import { connectToDatabase } from './config/dbConfig.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';

// Routes imports
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();

// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(helmet());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to codemancers');
});
app.use('/identify', contactRoutes);


// Error handling middleware
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  try {
    await connectToDatabase();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
});
