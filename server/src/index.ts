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
import organizationRoutes from './routes/organizations.routes';
import campaignRoutes from './routes/campaigns.routes';
import donationRoutes from './routes/donations.routes';
import resourceRoutes from './routes/resources.routes';
import messageRoutes from './routes/messages.routes';
import gamificationRoutes from './routes/gamification.routes';
import networkRoutes from './routes/network.routes';
import aiBridgeRoutes from './routes/ai-bridge.routes';
import emergencyRoutes from './routes/emergency.routes';
import auditRoutes from './routes/audit.routes';
import fraudRoutes from './routes/fraud.routes';
import notificationRoutes from './routes/notifications.routes';

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
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes — Core
app.use('/api/auth', authRoutes);
app.use('/api/needs', needsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API Routes — Ecosystem
app.use('/api/organizations', organizationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/ai-bridge', aiBridgeRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
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
