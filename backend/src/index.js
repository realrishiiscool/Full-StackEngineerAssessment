const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sequelize = require('./database');
const ensureDatabase = require('./databaseSetup');
const seedDemoData = require('./seeders/seedDemoData');
// Import models (triggers association setup)
require('./models');

const assetRoutes = require('./routes/assets');
const technicianRoutes = require('./routes/technicians');
const workOrderRoutes = require('./routes/workOrders');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/assets', assetRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/work-orders', workOrderRoutes);

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date().toISOString() } });
});

// ── 404 handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found`, details: null },
  });
});

// ── Global error handler ─────────────────────────────────────────────
app.use(errorHandler);

const seedSetting = process.env.SEED_DEMO_DATA;
const shouldSeedDemoData = seedSetting
  ? seedSetting.toLowerCase() === 'true'
  : process.env.NODE_ENV !== 'production';

// ── Start server ─────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await ensureDatabase();
    console.log('✅ MySQL database ensured.');

    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    if (shouldSeedDemoData) {
      const counts = await seedDemoData();
      console.log(
        `✅ Demo data ensured (${counts.assets} assets, ${counts.technicians} technicians, ${counts.workOrders} work orders; existing rows retained).`,
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
