import { NextRequest, NextResponse } from 'next/server';
// import { headers } from 'next/headers'; // No longer needed for auth
import { executeQuery } from '@/lib/database';
import { sendTelegramMessage } from '@/lib/telegram';
import { format } from 'date-fns';
import sql from 'mssql';

// The main function to process and send reminders
async function triggerReminders() {
    // 1. Fetch Telegram settings
    const settingsQuery = "SELECT * FROM dbo.TelegramSettings WHERE isActive = 1";
    const settings = await executeQuery(settingsQuery);

    if (settings.length === 0) {
        return { success: true, message: 'No active Telegram settings.' };
    }

    const botToken = settings[0].botToken;
    const chatId = settings[0].defaultChatIds;

    if (!botToken || !chatId) {
        throw new Error('Telegram botToken or chatId is missing from settings.');
    }

    // 2. Fetch the default notification template
    const templateQuery = "SELECT content FROM dbo.NotificationTemplates WHERE name = @templateName";
    const templateParams = { templateName: { type: sql.NVarChar, value: 'telegram_default_reminder' } };
    const templateResult = await executeQuery(templateQuery, templateParams);

    if (templateResult.length === 0) {
        throw new Error('Default Telegram notification template not found.');
    }
    const template = templateResult[0].content;

    // 3. Find due reminders
    const dueRemindersQuery = `
        SELECT * FROM dbo.Reminders 
        WHERE isActive = 1 AND isPaused = 0 AND nextTriggerDate <= GETDATE()
    `;
    const dueReminders = await executeQuery(dueRemindersQuery);
    
    if (dueReminders.length === 0) {
        return { success: true, message: 'No due reminders.', sent: 0 };
    }

    let sentCount = 0;
    // 4. Process each due reminder
    for (const reminder of dueReminders) {
        // Format the message using the template
        let message = template;
        const replacements = {
            title: reminder.title,
            description: reminder.description || 'Không có mô tả',
            reminderDate: format(new Date(reminder.reminderDate), 'dd/MM/yyyy'),
            reminderTime: format(new Date(reminder.reminderTime), 'HH:mm'),
            reminderType: reminder.reminderType, 
            priority: reminder.priority, 
        };

        for (const [key, value] of Object.entries(replacements)) {
            message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        // Send the notification
        await sendTelegramMessage(botToken, chatId, message);
        sentCount++;

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
        
        await executeQuery(updateQuery, updateParams);
    }
    
    return { success: true, message: `Sent ${sentCount} reminders.`, sent: sentCount };
}

// The API route handler
export async function GET(request: NextRequest) {
    // WARNING: Authentication is currently disabled as a temporary workaround.
    
    try {
        const result = await triggerReminders();
        
        // Explicitly log the result before returning the response
        console.log('--- CRON JOB RESULT ---', JSON.stringify(result, null, 2));
        
        return NextResponse.json(result);

    } catch (error) {
        console.error('[ERROR] in /api/reminders/trigger:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        // Explicitly log the error details
        console.log('--- CRON JOB ERROR ---', JSON.stringify({ success: false, message: 'Failed to trigger reminders', error: errorMessage }, null, 2));
        
        return NextResponse.json({ success: false, message: 'Failed to trigger reminders', error: errorMessage }, { status: 500 });
    }
}
