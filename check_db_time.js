const sql = require('mssql');
require('dotenv').config({path: '.env.local'});

const config = {
  server: process.env.DB_SERVER || '112.78.2.70',
  database: process.env.DB_DATABASE || 'zen50558_ManagementStore',
  user: process.env.DB_USER || 'zen50558_ManagementStore',
  password: process.env.DB_PASSWORD || 'Passwordla@123',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function run() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT TOP 5 id, title, reminderTime, nextTriggerDate, GETDATE() as serverTime, GETUTCDATE() as utcTime FROM dbo.Reminders ORDER BY id DESC`;
    console.log(result.recordset);
    const jsTime = new Date();
    console.log('JS execution local time:', jsTime.toString());
    console.log('JS execution UTC time:', jsTime.toISOString());
    console.log('Javascript timezone offset:', jsTime.getTimezoneOffset());
    await sql.close();
  } catch (err) {
    console.error(err);
  }
}
run();
