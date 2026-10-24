const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const { loadEnvConfig } = require('@next/env');

async function main() {
  loadEnvConfig(path.join(__dirname, '..'), process.env.NODE_ENV !== 'production');
  for (const name of ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD']) {
    if (!process.env[name]) throw new Error('Missing environment variable: ' + name);
  }
  const pool = await new sql.ConnectionPool({
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false,
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
    },
    connectionTimeout: 15000,
    requestTimeout: 30000,
  }).connect();
  try {
    const migration = fs.readFileSync(path.join(__dirname, '../src/lib/migrations/003_add_medical_catalog.sql'), 'utf8');
    await pool.request().batch(migration);
    const result = await pool.request().query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME IN ('MedicalConditions', 'ConditionMedications')"
    );
    console.log('Medical catalog tables ready:', result.recordset.map(row => row.TABLE_NAME).join(', '));
  } finally {
    await pool.close();
  }
}

main().catch(error => {
  console.error('Medical catalog migration failed:', error.message);
  process.exitCode = 1;
});
