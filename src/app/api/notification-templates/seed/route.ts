import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

const DEFAULT_TELEGRAM_TEMPLATE_NAME = 'telegram_default_reminder';
const DEFAULT_TELEGRAM_TEMPLATE_CONTENT = `
🔔 *THÔNG BÁO NHẮC NHỞ* 🔔

*Tiêu đề:* {{title}}

*Mô tả:* 
{{description}}

*Thời gian:* {{reminderDate}} - {{reminderTime}}

*Loại:* {{reminderType}}
*Độ ưu tiên:* {{priority}}
`;

export async function GET(request: NextRequest) {
  try {
    // Check if the template already exists
    const checkQuery = `SELECT COUNT(*) as count FROM dbo.NotificationTemplates WHERE name = @name`;
    const checkParams = { name: { type: sql.NVarChar, value: DEFAULT_TELEGRAM_TEMPLATE_NAME } };
    const checkResult = await executeQuery(checkQuery, checkParams);

    if (checkResult[0].count > 0) {
      return NextResponse.json({ success: true, message: 'Default Telegram template already exists.' });
    }

    // Insert the default template, now including the required 'templateType' field.
    const insertQuery = `
      INSERT INTO dbo.NotificationTemplates (name, content, templateType, createdBy, isActive) 
      VALUES (@name, @content, @templateType, @createdBy, 1)
    `;
    const insertParams = {
      name: { type: sql.NVarChar, value: DEFAULT_TELEGRAM_TEMPLATE_NAME },
      content: { type: sql.NVarChar, value: DEFAULT_TELEGRAM_TEMPLATE_CONTENT },
      templateType: { type: sql.NVarChar, value: 'telegram' }, // Correctly providing the template type
      createdBy: { type: sql.NVarChar, value: 'system' },
    };
    
    await executeQuery(insertQuery, insertParams);

    return NextResponse.json({ success: true, message: 'Default Telegram notification template created successfully.' });

  } catch (error) {
    console.error('[ERROR] Seeding default Telegram template:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to seed default Telegram template', error: errorMessage }, { status: 500 });
  }
}
