import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import needsRoutes from './routes/needs.routes';
import tasksRoutes from './routes/tasks.routes';
import volunteerRoutes from './routes/volunteers.routes';
import surveyRoutes from './routes/surveys.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config({ path: '../.env' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'JanSetu API is running 🌉',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/needs', needsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(config.port, () => {
      console.log(`\n🌉 JanSetu API Server running on http://localhost:${config.port}`);
      console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
      console.log(`🔑 Environment: ${config.nodeEnv}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
