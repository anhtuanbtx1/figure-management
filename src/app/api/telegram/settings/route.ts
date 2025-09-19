
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

/**
 * @swagger
 * /api/telegram/settings:
 *   get:
 *     summary: Get the current Telegram bot settings
 *     description: Retrieves the active Telegram settings from the database. Assumes a single settings record.
 *     tags: [Telegram]
 *     responses:
 *       200:
 *         description: Successfully retrieved settings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     botToken:
 *                       type: string
 *                     botUsername:
 *                       type: string
 *                     defaultChatIds:
 *                       type: string
 *       404:
 *         description: No active settings found.
 *       500:
 *         description: Failed to fetch settings.
 */
export async function GET(request: NextRequest) {
  try {
    // Fetches the first available setting. Assumes a single-row settings table.
    const query = `
      SELECT TOP 1 *
      FROM dbo.TelegramSettings
      ORDER BY id ASC
    `;

    const data = await executeQuery(query);

    if (!data || data.length === 0) {
      // Return a default empty object if no settings exist yet
      return NextResponse.json({ 
        success: true, 
        data: {
          id: null,
          botToken: '',
          botUsername: '',
          defaultChatIds: ''
        } 
      });
    }

    return NextResponse.json({ success: true, data: data[0] });

  } catch (error) {
    console.error('Error fetching Telegram settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to fetch Telegram settings', error: errorMessage }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/telegram/settings:
 *   post:
 *     summary: Create or update Telegram bot settings
 *     description: Saves the Telegram bot settings to the database using an "upsert" operation.
 *     tags: [Telegram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               botToken:
 *                 type: string
 *                 description: "The token for your Telegram bot."
 *               botUsername:
 *                 type: string
 *                 description: "The username for your Telegram bot."
 *               defaultChatIds:
 *                 type: string
 *                 description: "A comma-separated list of default chat IDs to send messages to."
 *     responses:
 *       200:
 *         description: Settings saved successfully.
 *       400:
 *         description: Invalid input, required fields missing.
 *       500:
 *         description: Failed to save settings.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            botToken,
            botUsername,
            defaultChatIds,
        } = body;

        if (!botToken) {
            return NextResponse.json({ success: false, message: 'Bot Token is required.' }, { status: 400 });
        }
        
        // Use MERGE to perform an "upsert". It will update the record if it exists (assuming id=1), 
        // or insert a new one if it doesn't. This is robust for a single-record settings table.
        const query = `
            MERGE INTO dbo.TelegramSettings AS target
            USING (
                SELECT 
                    @botToken AS botToken, 
                    @botUsername AS botUsername, 
                    @defaultChatIds AS defaultChatIds
            ) AS source
            ON (target.id = 1)
            WHEN MATCHED THEN
                UPDATE SET
                    botToken = source.botToken,
                    botUsername = source.botUsername,
                    defaultChatIds = source.defaultChatIds,
                    updatedDate = GETDATE(),
                    updatedBy = 'API'
            WHEN NOT MATCHED BY TARGET THEN
                INSERT (botToken, botUsername, defaultChatIds, isActive, createdBy, updatedBy)
                VALUES (source.botToken, source.botUsername, source.defaultChatIds, 1, 'API', 'API');
        `;

        const parameters = {
            botToken: { type: sql.NVarChar, value: botToken },
            botUsername: { type: sql.NVarChar, value: botUsername },
            defaultChatIds: { type: sql.NVarChar, value: defaultChatIds },
        };

        await executeQuery(query, parameters);

        return NextResponse.json({ success: true, message: 'Telegram settings saved successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Error saving Telegram settings:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, message: 'Failed to save Telegram settings', error: errorMessage }, { status: 500 });
    }
}
