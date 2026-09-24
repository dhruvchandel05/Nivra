const { Pool } = require('pg');
const env = require('./env');

const isNeon = typeof env.databaseUrl === 'string' && env.databaseUrl.includes('neon.tech');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
