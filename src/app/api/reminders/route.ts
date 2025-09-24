
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { executeQuery, getDbPool } from '@/lib/database';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const formatReminderTime = (time: any): Date | null => {
    if (!time) return null;
    
    const d = dayjs(time, ['HH:mm:ss', 'HH:mm']);
    
    if (d.isValid()) {
        return d.toDate(); 
    }
    return null;
};

const calculateNextTriggerDate = (
    baseDate: string | Date | null | undefined,
    time: string | null | undefined
): Date | null => {
    if (!baseDate || !time) return null;

    const datePart = dayjs(baseDate);
    const timeString = typeof time === 'string' ? time : dayjs(time).format('HH:mm:ss');
    const timePart = dayjs(timeString, 'HH:mm:ss');

    if (datePart.isValid() && timePart.isValid()) {
        return datePart
            .hour(timePart.hour())
            .minute(timePart.minute())
            .second(timePart.second())
            .millisecond(0)
            .toDate();
    }

    return null;
};

// GET all reminders
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT 
        r.*,
        c.name as categoryName
      FROM dbo.Reminders r
      LEFT JOIN dbo.ReminderCategories c ON r.categoryId = c.id
      ORDER BY r.createdDate DESC
    `;
    const reminders = await executeQuery(query);
    return NextResponse.json({ success: true, data: reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to fetch reminders', error: errorMessage }, { status: 500 });
  }
}

// POST a new reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body for new reminder:', body);

    let { 
      title, description, categoryId, reminderType, reminderTime, 
      priority, isActive, telegramChatIds, startDate, reminderDate,
      repeatDaysOfWeek, repeatDayOfMonth, templateTelegram
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const formattedTimeAsDate = formatReminderTime(reminderTime);
    if (reminderTime && !formattedTimeAsDate) {
        return NextResponse.json({ success: false, message: `Invalid time format for reminderTime: ${reminderTime}` }, { status: 400 });
    }

    const baseDateForTrigger = reminderType === 'once' ? reminderDate : startDate;
    const nextTriggerDate = calculateNextTriggerDate(baseDateForTrigger, reminderTime);

    // Ensure reminderDate is aligned with nextTriggerDate for 'once' reminders
    if (reminderType === 'once' && nextTriggerDate) {
        reminderDate = dayjs(nextTriggerDate).startOf('day').toDate();
    }

    const pool = await getDbPool();
    const req = pool.request();

    req.input('title', sql.NVarChar, title);
    req.input('description', sql.NVarChar, description);
    req.input('categoryId', sql.Int, categoryId);
    req.input('reminderType', sql.NVarChar, reminderType);
    req.input('reminderTime', sql.Time, formattedTimeAsDate); 
    req.input('priority', sql.NVarChar, priority);
    req.input('isActive', sql.Bit, isActive);
    req.input('telegramChatIds', sql.NVarChar, telegramChatIds);
    req.input('startDate', sql.Date, startDate ? dayjs(startDate).toDate() : null);
    req.input('reminderDate', sql.Date, reminderDate ? dayjs(reminderDate).toDate() : null);
    req.input('repeatDaysOfWeek', sql.NVarChar, repeatDaysOfWeek);
    req.input('repeatDayOfMonth', sql.Int, repeatDayOfMonth);
    req.input('telegramTemplate', sql.NVarChar, templateTelegram);
    req.input('nextTriggerDate', sql.DateTime2, nextTriggerDate);

    const query = `
        INSERT INTO dbo.Reminders (
            title, description, categoryId, reminderType, reminderTime, priority, isActive, 
            telegramChatIds, startDate, reminderDate, repeatDaysOfWeek, repeatDayOfMonth, 
            telegramTemplate, isPaused, createdDate, updatedDate, nextTriggerDate
        )
        VALUES (
            @title, @description, @categoryId, @reminderType, @reminderTime, @priority, @isActive, 
            @telegramChatIds, @startDate, @reminderDate, @repeatDaysOfWeek, @repeatDayOfMonth,
            @telegramTemplate, 0, GETDATE(), GETDATE(), @nextTriggerDate
        );
        SELECT SCOPE_IDENTITY() AS id;
    `;

    const result = await req.query(query);
    const newReminderId = result.recordset[0].id;

    return NextResponse.json({ 
      success: true, 
      message: 'Reminder created successfully', 
      data: { id: newReminderId, ...body } 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reminder:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to create reminder', error: errorMessage }, { status: 500 });
  }
}


// PUT (update) a reminder
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, message: 'Reminder ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log(`Received body for updating reminder ${id}:`, body);

    // Map frontend field to backend DB field for update consistency
    if (body.hasOwnProperty('templateTelegram')) {
      body.telegramTemplate = body.templateTelegram;
    }

    const pool = await getDbPool();

    // Fetch the existing reminder to get all fields for recalculation
    const originalReminderResult = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM dbo.Reminders WHERE id = @id');
    
    if (originalReminderResult.recordset.length === 0) {
        return NextResponse.json({ success: false, message: 'Reminder not found' }, { status: 404 });
    }
    const originalReminder = originalReminderResult.recordset[0];

    // Merge original reminder with the update body
    const mergedData = { ...originalReminder, ...body };

    // --- Recalculate nextTriggerDate ---
    const baseDateForTrigger = mergedData.reminderType === 'once' ? mergedData.reminderDate : mergedData.startDate;
    const timeValue = body.reminderTime || originalReminder.reminderTime;
    const nextTriggerDate = calculateNextTriggerDate(baseDateForTrigger, timeValue);
    body.nextTriggerDate = nextTriggerDate; // Add it to the body to be updated
    
    // Ensure reminderDate is aligned with nextTriggerDate for 'once' reminders
    if (mergedData.reminderType === 'once' && nextTriggerDate) {
        body.reminderDate = dayjs(nextTriggerDate).startOf('day').toDate();
    }
    
    // --- Handle time/date conversions for incoming data ---
    if (body.hasOwnProperty('reminderTime')) {
        const formattedTimeAsDate = formatReminderTime(body.reminderTime);
        if (body.reminderTime && !formattedTimeAsDate) {
            return NextResponse.json({ success: false, message: `Invalid time format for reminderTime: ${body.reminderTime}` }, { status: 400 });
        }
        body.reminderTime = formattedTimeAsDate;
    }
     if (body.hasOwnProperty('startDate') && body.startDate) {
        body.startDate = dayjs(body.startDate).toDate();
    }
    if (body.hasOwnProperty('reminderDate') && body.reminderDate) {
        body.reminderDate = dayjs(body.reminderDate).toDate();
    }

    const req = pool.request();
    const setClauses: string[] = [];
    const addInput = (name: string, type: any, value: any) => {
        if (Object.prototype.hasOwnProperty.call(body, name)) {
            setClauses.push(`${name} = @${name}`);
            req.input(name, type, value);
        }
    };
    
    const typeMap: Record<string, any> = {
        title: sql.NVarChar,
        description: sql.NVarChar,
        reminderType: sql.NVarChar,
        priority: sql.NVarChar,
        telegramChatIds: sql.NVarChar,
        repeatDaysOfWeek: sql.NVarChar,
        telegramTemplate: sql.NVarChar,
        categoryId: sql.Int,
        repeatDayOfMonth: sql.Int,
        reminderTime: sql.Time,
        startDate: sql.Date,
        reminderDate: sql.Date,
        isActive: sql.Bit,
        isPaused: sql.Bit,
        nextTriggerDate: sql.DateTime2
    };

    for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(typeMap, key)) {
            addInput(key, typeMap[key], body[key]);
        }
    }

    if (setClauses.length > 0) {
      setClauses.push('updatedDate = GETDATE()');
      const query = `
          UPDATE dbo.Reminders
          SET ${setClauses.join(', ')}
          WHERE id = @id;
      `;
      req.input('id', sql.Int, id);
      await req.query(query);
    } 

    return NextResponse.json({ 
      success: true, 
      message: 'Reminder updated successfully'
    });

  } catch (error) {
    console.error('Error updating reminder:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to update reminder', error: errorMessage }, { status: 500 });
  }
}

// DELETE a reminder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Reminder ID is required' }, { status: 400 });
    }

    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Reminders WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ success: false, message: 'Reminder not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reminder deleted successfully' });

  } catch (error) {
    console.error('Error deleting reminder:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to delete reminder', error: errorMessage }, { status: 500 });
  }
}
