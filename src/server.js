import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/connectDB.js';

import logger from './middlewares/logger.js';
import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';

import {
  errorHandler,
  notFoundHandler,
} from './middlewares/errorHandlers.js';
import { errors } from 'celebrate';

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(logger);
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(notesRouter);

app.use(errors());
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
