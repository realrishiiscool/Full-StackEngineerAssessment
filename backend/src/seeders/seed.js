const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const sequelize = require('../database');
const ensureDatabase = require('../databaseSetup');
require('../models');
const seedDemoData = require('./seedDemoData');

async function seed() {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    const counts = await seedDemoData();
    console.log(
      `Demo data ensured (${counts.assets} assets, ${counts.technicians} technicians, ${counts.workOrders} work orders). Existing rows were preserved.`,
    );
  } catch (err) {
    console.error('Demo-data setup failed:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
