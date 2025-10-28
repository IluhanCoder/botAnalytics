import express, { NextFunction, Request, Response } from 'express';

import { config } from "dotenv";
import cors from "cors";
import mongoose from 'mongoose';
import router from './router';
import { loadCustomStopwords } from './utils/text-processing';

config();

const app = express();

app.use(express.json());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://botanalytics-client.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Additional CORS headers for preflight
app.options('*', cors());

const PORT = process.env.PORT ?? 5001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req: Request, res: Response, next: NextFunction) => { next()} );

app.use(router);

app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});

// MongoDB connection
const mongoURI = process.env.DB_URI || 'mongodb://localhost:27017/3dProject';

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Load custom stopwords on startup
    await loadCustomStopwords();
    console.log('✅ Custom stopwords loaded');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.stopword);
  });
