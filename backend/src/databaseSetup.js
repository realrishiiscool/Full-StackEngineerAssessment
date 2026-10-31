const mysql = require('mysql2/promise');

async function ensureDatabase() {
  const databaseName = process.env.DB_NAME || 'maintenance_db';
  const safeDatabaseName = String(databaseName).replace(/`/g, '``');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDatabaseName}\`;`);
  } finally {
    await connection.end();
  }
}

module.exports = ensureDatabase;
