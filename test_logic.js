const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const timeString = '07:00:00';
const baseDate = '2026-03-25';

const datePart = dayjs(baseDate);
const timePart = dayjs(timeString, 'HH:mm:ss');

const calculated = datePart.hour(timePart.hour()).minute(timePart.minute()).second(timePart.second()).millisecond(0).toDate();
console.log('calculated JS Date:', calculated);
console.log('toISOString:', calculated.toISOString());

const sql = require('mssql');
require('dotenv').config({path: '.env.local'});
const config = {
  server: process.env.DB_SERVER || '112.78.2.70',
  database: process.env.DB_DATABASE || 'zen50558_ManagementStore',
  user: process.env.DB_USER || 'zen50558_ManagementStore',
  password: process.env.DB_PASSWORD || 'Passwordla@123',
  options: { encrypt: true, trustServerCertificate: true }
};

async function insert() {
  await sql.connect(config);
  
  const req = new sql.Request();
  req.input('nextTriggerDate', sql.DateTime2, calculated);
  req.input('reminderTime', sql.Time, timePart.toDate());
  
  // Insert a dummy record & read it back
  await req.query(`INSERT INTO dbo.Reminders (title, reminderTime, nextTriggerDate, categoryId, reminderType) VALUES ('Test TZ', @reminderTime, @nextTriggerDate, 1, 'once')`);
  const top = await req.query(`SELECT TOP 1 reminderTime, nextTriggerDate, GETDATE() as currentDbTime FROM dbo.Reminders WHERE title='Test TZ' ORDER BY id DESC`);
  console.log('inserted to db -> selected:', top.recordset[0]);
  
  // clean up
  await req.query(`DELETE FROM dbo.Reminders WHERE title='Test TZ'`);
  process.exit(0);
}
insert();
