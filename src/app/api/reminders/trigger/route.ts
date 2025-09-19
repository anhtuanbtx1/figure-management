import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { sendTelegramMessage, escapeMarkdownV2 } from '@/lib/telegram';
import { format } from 'date-fns';
import sql from 'mssql';

// The main function to process and send reminders
async function triggerReminders() {
    console.log('[LOG] Step 1: triggerReminders function started.');

    // 1. Fetch Telegram settings
    console.log('[LOG] Step 1.1: Fetching Telegram settings.');
    const settingsQuery = "SELECT * FROM dbo.TelegramSettings WHERE isActive = 1";
    const settings = await executeQuery(settingsQuery);

    if (settings.length === 0) {
        console.log('[LOG] Step 1.2: No active Telegram settings found. Exiting.');
        return { success: true, message: 'No active Telegram settings.' };
    }
    console.log(`[LOG] Step 1.3: Found ${settings.length} active setting(s).`);

    const botToken = settings[0].botToken;
    const chatId = settings[0].defaultChatIds;

    if (!botToken || !chatId) {
        console.error('[ERROR] botToken or chatId is missing from settings.');
        throw new Error('Telegram botToken or chatId is missing from settings.');
    }

    // 2. Fetch the default notification template
    console.log('[LOG] Step 2.1: Fetching notification template.');
    const templateQuery = "SELECT content FROM dbo.NotificationTemplates WHERE name = @templateName";
    const templateParams = { templateName: { type: sql.NVarChar, value: 'telegram_default_reminder' } };
    const templateResult = await executeQuery(templateQuery, templateParams);

    if (templateResult.length === 0) {
        console.error('[ERROR] Default Telegram notification template not found.');
        throw new Error('Default Telegram notification template not found.');
    }
    const template = templateResult[0].content;
    console.log('[LOG] Step 2.2: Notification template fetched successfully.');

    // 3. Find due reminders
    console.log('[LOG] Step 3.1: Fetching due reminders.');
    const dueRemindersQuery = `
        SELECT * FROM dbo.Reminders 
        WHERE isActive = 1 AND isPaused = 0 AND nextTriggerDate <= GETDATE()
    `;
    const dueReminders = await executeQuery(dueRemindersQuery);
    
    if (dueReminders.length === 0) {
        console.log('[LOG] Step 3.2: No due reminders found. Exiting.');
        return { success: true, message: 'No due reminders.', sent: 0 };
    }
    console.log(`[LOG] Step 3.3: Found ${dueReminders.length} due reminder(s). Starting loop.`);

    let sentCount = 0;
    // 4. Process each due reminder
    for (const reminder of dueReminders) {
        console.log(`[LOG] Processing reminder ID: ${reminder.id}`);
        
        // Escape dynamic values for MarkdownV2
        const replacements = {
            title: escapeMarkdownV2(reminder.title),
            description: escapeMarkdownV2(reminder.description || 'Không có mô tả'),
            reminderDate: escapeMarkdownV2(format(new Date(reminder.reminderDate), 'dd/MM/yyyy')),
            reminderTime: escapeMarkdownV2(format(new Date(reminder.reminderTime), 'HH:mm')),
            reminderType: escapeMarkdownV2(reminder.reminderType), 
            priority: escapeMarkdownV2(reminder.priority), 
        };

        // Replace placeholders in the template
        let message = template;
        for (const [key, value] of Object.entries(replacements)) {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        console.log(`[LOG] Step 4.1: Sending message for reminder ID: ${reminder.id}`);
        await sendTelegramMessage(botToken, chatId, message);
        sentCount++;
        console.log(`[LOG] Step 4.2: Message sent for reminder ID: ${reminder.id}. Sent count: ${sentCount}`);

        // 5. Update the nextTriggerDate
        let nextTriggerDate = new Date();
        let shouldDeactivate = false;

        switch (reminder.reminderType) {
            case 'daily': nextTriggerDate.setDate(nextTriggerDate.getDate() + 1); break;
            case 'weekly': nextTriggerDate.setDate(nextTriggerDate.getDate() + 7); break;
            case 'monthly': nextTriggerDate.setMonth(nextTriggerDate.getMonth() + 1); break;
            case 'yearly': nextTriggerDate.setFullYear(nextTriggerDate.getFullYear() + 1); break;
            case 'once':
            default: shouldDeactivate = true; break;
        }

        const updateQuery = `
            UPDATE dbo.Reminders 
            SET 
                nextTriggerDate = @nextTriggerDate,
                isActive = @isActive,
                lastTriggeredDate = GETDATE()
            WHERE id = @id
        `;
        
        const updateParams = {
            nextTriggerDate: { type: sql.DateTime, value: shouldDeactivate ? null : nextTriggerDate },
            isActive: { type: sql.Bit, value: !shouldDeactivate },
            id: { type: sql.Int, value: reminder.id },
        };
        
        console.log(`[LOG] Step 5.1: Updating reminder ID: ${reminder.id}. Next trigger: ${shouldDeactivate ? 'deactivated' : nextTriggerDate.toISOString()}`);
        await executeQuery(updateQuery, updateParams);
        console.log(`[LOG] Step 5.2: Reminder ID: ${reminder.id} updated successfully.`);
    }
    
    console.log('[LOG] Step 6: Finished processing all reminders.');
    return { success: true, message: `Sent ${sentCount} reminders.`, sent: sentCount };
}

// The API route handler
export async function GET(request: NextRequest) {
    console.log('[LOG] GET /api/reminders/trigger received a request.');
    
    try {
        const result = await triggerReminders();
        
        console.log('--- CRON JOB RESULT ---', JSON.stringify(result, null, 2));
        return NextResponse.json(result);

    } catch (error) {
        console.error('[ERROR] in /api/reminders/trigger:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        console.log('--- CRON JOB ERROR ---', JSON.stringify({ success: false, message: 'Failed to trigger reminders', error: errorMessage }, null, 2));
        return NextResponse.json({ success: false, message: 'Failed to trigger reminders', error: errorMessage }, { status: 500 });
    }
}
