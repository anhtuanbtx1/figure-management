
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, chatId } = body;

        if (!message || !chatId) {
            return NextResponse.json({ success: false, message: 'Message and Chat ID are required.' }, { status: 400 });
        }

        const settingsQuery = `SELECT TOP 1 botToken FROM dbo.TelegramSettings ORDER BY id ASC`;
        const settingsResult = await executeQuery(settingsQuery);

        if (!settingsResult || settingsResult.length === 0 || !settingsResult[0].botToken) {
            return NextResponse.json({ success: false, message: 'Bot Token not configured. Please save your settings first.' }, { status: 404 });
        }

        const botToken = settingsResult[0].botToken;

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const params = new URLSearchParams();
        params.append('chat_id', chatId);
        params.append('text', message);
        params.append('parse_mode', 'Markdown');
        
        // --- ADDED DETAILED LOGGING FOR DIAGNOSTICS ---
        console.log('--- Sending Request to Telegram API ---');
        console.log('URL:', telegramApiUrl);
        console.log('METHOD:', 'POST');
        console.log('HEADERS:', { 'Content-Type': 'application/x-www-form-urlencoded' });
        console.log('BODY:', params.toString());
        console.log('---------------------------------------');

        const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const telegramResult = await telegramResponse.json();

        if (telegramResult.ok) {
            return NextResponse.json({ success: true, message: `Test message sent successfully to Chat ID: ${chatId}` });
        } else {
            console.error('--- Telegram API Error Response ---');
            console.error(telegramResult);
            console.error('---------------------------------');

            let userMessage = `Telegram API Error: ${telegramResult.description}`;
            let statusCode = 400;

            const description = telegramResult.description.toLowerCase();
            if (description.includes('chat not found')) {
                userMessage = `Telegram Error: Chat not found for ID '${chatId}'. Please ensure the Chat ID is correct and that your bot has been added to the chat/group. For private chats, the user must start a conversation with the bot first.`;
                statusCode = 404;
            } else if (description.includes('bot token')) {
                userMessage = 'Telegram Error: The Bot Token is invalid or expired. Please verify your token in the settings.';
                statusCode = 401;
            }
            
            return NextResponse.json({ success: false, message: userMessage }, { status: statusCode });
        }

    } catch (error) {
        console.error('Internal server error in test-message API:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, message: 'Internal server error while sending test message.', error: errorMessage }, { status: 500 });
    }
}
