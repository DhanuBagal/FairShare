import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/authRoutes.js';
import personalExpenseRoutes from './routes/personalExpenseRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import seedData from './seed.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// NoSQL Injection Prevention
// express-mongo-sanitize sanitizes user-supplied data to prevent MongoDB Operator Injection
app.use(mongoSanitize({
  replaceWith: '_'
}));

// Ensure DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', personalExpenseRoutes);
app.use('/api/groups', groupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', app: 'FairShare API', timestamp: new Date() });
});

// Seed demo data route
app.post('/api/seed', async (req, res) => {
  try {
    const result = await seedData();
    res.status(200).json({ success: true, message: 'Database seeded successfully', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static client assets in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

if (!process.env.VERCEL) {
  connectDB().then(async () => {
    try {
      await seedData();
    } catch (err) {
      console.log('Seed note:', err.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 FairShare Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

export default app;
