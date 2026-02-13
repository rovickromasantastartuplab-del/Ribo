import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { supabase } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registration.js';
// Master Router for Protected Routes
import apiRouter from './routes/api.js';

// Route Mounting

// 1. Public Routes (Login, Register, Forgot Password)
app.use('/api/auth', authRoutes);

// 2. Registration (Partially Protected or Unique Flow)
// Registration might create the user context, so we keep it separate from the main API router
// which assumes user context is already established.
app.use('/api/registration', registrationRoutes);

// 3. Protected API Routes (Dashboard, CRM, etc.)
// These routes benefit from the consolidated Auth + Context middleware stack
app.use('/api', apiRouter);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Ribo CRM Server is active', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
