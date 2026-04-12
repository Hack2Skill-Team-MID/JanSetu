import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'JanSetu API is running 🌉',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Add routes
// app.use('/api/auth', authRoutes);
// app.use('/api/needs', needsRoutes);
// app.use('/api/tasks', tasksRoutes);
// app.use('/api/volunteers', volunteerRoutes);
// app.use('/api/surveys', surveyRoutes);
// app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`\n🌉 JanSetu API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
