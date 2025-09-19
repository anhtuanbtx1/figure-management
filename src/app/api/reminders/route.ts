import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.reminderDate,
        CONVERT(VARCHAR(5), r.reminderTime, 108) as reminderTime,
        r.reminderType,
        r.priority,
        c.name as categoryName,
        r.isActive,
        r.isPaused,
        r.createdDate,
        r.updatedDate
      FROM dbo.Reminders r
      LEFT JOIN dbo.ReminderCategories c ON r.categoryId = c.id
    `;
    const data = await executeQuery(query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: 'Failed to fetch reminders', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            description,
            reminderDate, // e.g., "2025-09-20"
            reminderTime, // e.g., "10:30:00"
            reminderType,
            priority,
            categoryId,
            isActive,
        } = body;

        if (!title || !reminderTime || !reminderDate) {
            return NextResponse.json({ success: false, message: "Validation failed: title, reminderTime, and reminderDate are required." }, { status: 400 });
        }

        // Combine date and time for nextTriggerDate
        const nextTriggerDate = new Date(`${reminderDate}T${reminderTime}`);
        if (isNaN(nextTriggerDate.getTime())) {
             return NextResponse.json({ success: false, message: "Invalid date/time format. Use YYYY-MM-DD for date and HH:mm:ss for time." }, { status: 400 });
        }

        // Add nextTriggerDate to the query
        const query = `
            INSERT INTO dbo.Reminders (
                title, description, categoryId, reminderType, 
                reminderDate, reminderTime, startDate, nextTriggerDate, 
                priority, isActive, isPaused, createdDate, updatedDate, createdBy
            )
            VALUES (
                @title, @description, @categoryId, @reminderType, 
                @reminderDate, @reminderTime, @startDate, @nextTriggerDate,
                @priority, @isActive, 0, GETDATE(), GETDATE(), 'API'
            )
        `;

        const parameters = {
            title: { type: sql.NVarChar, value: title },
            description: { type: sql.NVarChar, value: description },
            categoryId: { type: sql.Int, value: categoryId ? parseInt(String(categoryId), 10) : null },
            reminderType: { type: sql.VarChar, value: reminderType || 'once' },
            reminderDate: { type: sql.Date, value: reminderDate },
            reminderTime: { type: sql.NVarChar, value: reminderTime },
            startDate: { type: sql.Date, value: reminderDate },
            // Add nextTriggerDate parameter
            nextTriggerDate: { type: sql.DateTime, value: nextTriggerDate },
            priority: { type: sql.VarChar, value: priority || 'medium' },
            isActive: { type: sql.Bit, value: isActive === undefined ? true : isActive },
        };

        await executeQuery(query, parameters);

        return NextResponse.json({ success: true, message: 'Reminder created successfully.' }, { status: 201 });

    } catch (error) {
        console.error('--- ERROR CREATING REMINDER ---', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, message: 'Failed to create reminder.', error: errorMessage }, { status: 500 });
    }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) {
          return NextResponse.json({ success: false, message: 'Reminder ID is required' }, { status: 400 });
        }

        const query = `DELETE FROM dbo.Reminders WHERE id = @id`;
        await executeQuery(query, { id: { type: sql.Int, value: id } });

        return NextResponse.json({ success: true, message: 'Reminder deleted successfully' });

    } catch (error) {
        console.error('Error deleting reminder:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, message: 'Failed to delete reminder', error: errorMessage }, { status: 500 });
    }
}
