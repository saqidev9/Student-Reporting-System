require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const programRoutes = require('./routes/program');
const reportRoutes = require('./routes/reports');
const attendanceRoutes = require('./routes/attendance');
const tagRoutes = require('./routes/tags');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', system: 'TensaiDevs API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/program', programRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nTensaiDevs API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health\n`);
  console.log('Seed credentials:');
  console.log('  Admin   -> hassansattar147@gmail.com / admin123');
  console.log('  Student -> ahmad.gul@tensaidevs.com / student123');
  console.log('  Student -> muhib@tensaidevs.com    / student123\n');
});
