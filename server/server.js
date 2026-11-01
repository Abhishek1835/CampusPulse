import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { Club } from './models/Club.js';
import { seedDatabase } from './seed/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import signatoryRoutes from './routes/signatoryRoutes.js';
import collegeSettingsRoutes from './routes/collegeSettingsRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import { verifyCertificatePublic } from './controllers/certificateController.js';
import { initCertificateScheduler } from './services/certificateScheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect Database & Auto-seed if empty
connectDB()
  .then(async () => {
    const clubCount = await Club.countDocuments();
    if (clubCount === 0) {
      console.log('📦 Database is empty. Auto-seeding initial demo data...');
      await seedDatabase();
      console.log('✅ Auto-seeding completed.');
    }
    // Initialize Certificate Automation Cron Scheduler
    initCertificateScheduler();
  })
  .catch((err) => {
    console.error('Fatal DB connection error:', err);
  });

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: [CLIENT_URL, 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusEventHub API is running smooth',
    timestamp: new Date()
  });
});

// Public verification rate limiter
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this IP. Please try again later.'
  }
});
app.get('/api/verify/:certificateId', verifyLimiter, verifyCertificatePublic);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/organizer/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/signatories', signatoryRoutes);
app.use('/api/settings', collegeSettingsRoutes);
app.use('/api/certificates', certificateRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 CampusPulse Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});

export default app;
