const fetch = require('node-fetch');

async function run() {
  const body = {
    title: 'Test Reminder 07:00',
    description: 'Testing timezone',
    categoryId: 1,
    reminderType: 'daily',
    reminderTime: '07:00',
    priority: 'high',
    isActive: true,
    startDate: '2026-03-25',
    telegramChatIds: '123'
  };

  try {
    const res = await fetch('http://localhost:3000/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    // We cannot reliably access localhost:3000 if it's not running. Let's instead just use the exact DB insertion logic.
  } catch(e) { console.error(e) }
}
run();
