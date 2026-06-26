import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db';
import { seedDatabase } from './services/seedData';
import { User } from './models/index';

import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import squadRouter from './routes/squad';
import playersRouter from './routes/players';
import scoutingRouter from './routes/scouting';
import transfersRouter from './routes/transfers';
import analyticsRouter from './routes/analytics';
import syncRouter from './routes/sync';

dotenv.config();

const app = express();
// Default to port 8080 to match the Vite frontend proxy settings
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/squad', squadRouter);
app.use('/api/players', playersRouter);
app.use('/api/scouting', scoutingRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/sync', syncRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Database and Server Startup
const startServer = async () => {
  try {
    // 1. Connect to MySQL Database
    await connectDB();

    // 2. Sync Models and Autoseed
    const forceSeed = process.env.FORCE_SEED === 'true' || true; // Force seed to ensure all structures are loaded in DB
    await seedDatabase(forceSeed);

    // Seed a default administrator user for the frontend to login with
    await User.findOrCreate({
      where: { email: 'director@fcbayern.de' },
      defaults: {
        email: 'director@fcbayern.de',
        passwordHash: 'miasanmia', // Plain text for convenience in this local developer deployment
        fullName: 'Max Eberl',
        role: 'SPORTING_DIRECTOR'
      }
    });
    console.log('Seeded default user: director@fcbayern.de / miasanmia');

    // 3. Start Express Listener
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` ClubIQ Bayern Express Server Active on Port ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Access API: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Critical failure starting API server:', error);
    process.exit(1);
  }
};

startServer();
