import axios from 'axios';

/**
 * Escapes characters for Telegram's MarkdownV2 format.
 * @param text The text to escape.
 * @returns The escaped text.
 */
export function escapeMarkdownV2(text: string): string {
    if (!text) return '';
    // Characters to escape for MarkdownV2
    const charsToEscape = /[_*[\]()~`>#+\-=|{}.!]/g;
    return text.replace(charsToEscape, '\\$&');
}

/**
 * Sends a message to a specific Telegram chat.
 * 
 * @param botToken The token of the Telegram bot.
 * @param chatId The ID of the chat to send the message to.
 * @param text The message content, assumed to be formatted for MarkdownV2.
 * @returns The response from the Telegram API.
 */
export async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'MarkdownV2', // Use MarkdownV2 for formatting
    };

    try {
        console.log('--- Sending Request to Telegram API ---');
        console.log(`URL: ${url}`);
        console.log(`METHOD: POST`);
        console.log(`HEADERS: { 'Content-Type': 'application/json' }`);
        console.log(`BODY: ${JSON.stringify(body, null, 2)}`);
        console.log('---------------------------------------');

        const response = await axios.post(url, body);

        console.log('--- Telegram API Response ---');
        console.log(`STATUS: ${response.status}`);
        console.log(`BODY: ${JSON.stringify(response.data, null, 2)}`);
        console.log('-----------------------------');

        return response.data;

    } catch (error) {
        console.error('--- ERROR Sending to Telegram API ---');
        if (axios.isAxiosError(error) && error.response) {
            console.error(`STATUS: ${error.response.status}`);
            console.error(`BODY: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(error);
        }
        console.error('-------------------------------------');
        // Re-throw the error to be handled by the calling function
        throw error;
    }
}
