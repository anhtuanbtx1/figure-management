import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/kanban/stats - Get comprehensive Kanban board statistics
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching Kanban board statistics...');

    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || 'board-1';
    const timeWindow = searchParams.get('timeWindow') || '7'; // days

    // Calculate date range for time-based metrics
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - parseInt(timeWindow));

    // Main statistics query
    const statsQuery = `
      SELECT
        -- Total task counts
        COUNT(*) as totalTasks,
        SUM(CASE WHEN t.IsActive = 1 THEN 1 ELSE 0 END) as activeTasks,
        SUM(CASE WHEN t.IsActive = 0 THEN 1 ELSE 0 END) as deletedTasks,
        
        -- Tasks by column
        SUM(CASE WHEN c.MaCot = 'todo' AND t.IsActive = 1 THEN 1 ELSE 0 END) as todoTasks,
        SUM(CASE WHEN c.MaCot = 'progress' AND t.IsActive = 1 THEN 1 ELSE 0 END) as inProgressTasks,
        SUM(CASE WHEN c.MaCot = 'pending' AND t.IsActive = 1 THEN 1 ELSE 0 END) as pendingTasks,
        SUM(CASE WHEN c.MaCot = 'done' AND t.IsActive = 1 THEN 1 ELSE 0 END) as completedTasks,
        
        -- Priority distribution
        SUM(CASE WHEN t.DoUuTien = N'Thấp' AND t.IsActive = 1 THEN 1 ELSE 0 END) as lowPriorityTasks,
        SUM(CASE WHEN t.DoUuTien = N'Trung bình' AND t.IsActive = 1 THEN 1 ELSE 0 END) as mediumPriorityTasks,
        SUM(CASE WHEN t.DoUuTien = N'Cao' AND t.IsActive = 1 THEN 1 ELSE 0 END) as highPriorityTasks,
        SUM(CASE WHEN t.DoUuTien = N'Khẩn cấp' AND t.IsActive = 1 THEN 1 ELSE 0 END) as urgentPriorityTasks,
        
        -- Assignment stats
        COUNT(DISTINCT t.NguoiDuocGan) as uniqueAssignees,
        SUM(CASE WHEN t.NguoiDuocGan IS NOT NULL AND t.NguoiDuocGan != '' AND t.IsActive = 1 THEN 1 ELSE 0 END) as assignedTasks,
        SUM(CASE WHEN (t.NguoiDuocGan IS NULL OR t.NguoiDuocGan = '') AND t.IsActive = 1 THEN 1 ELSE 0 END) as unassignedTasks
        
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      LEFT JOIN zen50558_ManagementStore.dbo.KanbanColumns c ON c.Id = t.ColumnId
      WHERE t.BoardId = @boardId
    `;

    // Recent activity query (tasks created/updated in time window)
    const recentActivityQuery = `
      SELECT
        COUNT(*) as recentlyCreated,
        SUM(CASE WHEN t.NgayCapNhat > t.NgayTao THEN 1 ELSE 0 END) as recentlyUpdated,
        MAX(t.NgayCapNhat) as lastActivity
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      WHERE t.BoardId = @boardId 
        AND t.IsActive = 1
        AND (t.NgayTao >= @startDate OR t.NgayCapNhat >= @startDate)
    `;

    // Completion rate query (tasks moved to done in time window)
    const completionQuery = `
      SELECT
        COUNT(*) as tasksCompletedInPeriod
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      LEFT JOIN zen50558_ManagementStore.dbo.KanbanColumns c ON c.Id = t.ColumnId
      WHERE t.BoardId = @boardId 
        AND c.MaCot = 'done'
        AND t.NgayCapNhat >= @startDate
        AND t.IsActive = 1
    `;

    // Top assignees query
    const topAssigneesQuery = `
      SELECT TOP 5
        t.NguoiDuocGan as assignee,
        COUNT(*) as taskCount,
        SUM(CASE WHEN c.MaCot = 'done' THEN 1 ELSE 0 END) as completedCount
      FROM zen50558_ManagementStore.dbo.KanbanTasks t
      LEFT JOIN zen50558_ManagementStore.dbo.KanbanColumns c ON c.Id = t.ColumnId
      WHERE t.BoardId = @boardId 
        AND t.IsActive = 1
        AND t.NguoiDuocGan IS NOT NULL 
        AND t.NguoiDuocGan != ''
      GROUP BY t.NguoiDuocGan
      ORDER BY taskCount DESC
    `;

    const params = {
      boardId: { type: sql.NVarChar, value: boardId },
      startDate: { type: sql.DateTime, value: startDate.toISOString() },
    };

    // Execute all queries in parallel
    const [
      mainStats,
      recentActivity,
      completionStats,
      topAssignees
    ] = await Promise.all([
      executeQuery(statsQuery, { boardId: params.boardId }),
      executeQuery(recentActivityQuery, params),
      executeQuery(completionQuery, params),
      executeQuery(topAssigneesQuery, { boardId: params.boardId })
    ]);

    const stats = mainStats[0];
    const activity = recentActivity[0];
    const completion = completionStats[0];

    // Calculate derived metrics
    const totalActiveTasks = parseInt(stats.activeTasks || 0);
    const completedTasks = parseInt(stats.completedTasks || 0);
    const completionRate = totalActiveTasks > 0 ? (completedTasks / totalActiveTasks * 100) : 0;
    const tasksCompletedInPeriod = parseInt(completion.tasksCompletedInPeriod || 0);
    const recentlyCreated = parseInt(activity.recentlyCreated || 0);
    const recentlyUpdated = parseInt(activity.recentlyUpdated || 0);

    console.log('✅ Kanban statistics calculated successfully');

    return NextResponse.json({
      success: true,
      message: 'Kanban statistics fetched successfully',
      data: {
        // Overview metrics
        overview: {
          totalTasks: parseInt(stats.totalTasks || 0),
          activeTasks: totalActiveTasks,
          deletedTasks: parseInt(stats.deletedTasks || 0),
          completionRate: Math.round(completionRate * 100) / 100,
          lastActivity: activity.lastActivity
        },

        // Column distribution
        columns: {
          todo: parseInt(stats.todoTasks || 0),
          inProgress: parseInt(stats.inProgressTasks || 0),
          pending: parseInt(stats.pendingTasks || 0),
          completed: parseInt(stats.completedTasks || 0)
        },

        // Priority distribution
        priorities: {
          low: parseInt(stats.lowPriorityTasks || 0),
          medium: parseInt(stats.mediumPriorityTasks || 0),
          high: parseInt(stats.highPriorityTasks || 0),
          urgent: parseInt(stats.urgentPriorityTasks || 0)
        },

        // Assignment metrics
        assignments: {
          uniqueAssignees: parseInt(stats.uniqueAssignees || 0),
          assignedTasks: parseInt(stats.assignedTasks || 0),
          unassignedTasks: parseInt(stats.unassignedTasks || 0),
          topAssignees: topAssignees.map(a => ({
            name: a.assignee,
            taskCount: parseInt(a.taskCount || 0),
            completedCount: parseInt(a.completedCount || 0),
            completionRate: parseInt(a.taskCount || 0) > 0 
              ? Math.round((parseInt(a.completedCount || 0) / parseInt(a.taskCount || 0)) * 100)
              : 0
          }))
        },

        // Recent activity (based on time window)
        recentActivity: {
          timeWindowDays: parseInt(timeWindow),
          tasksCreated: recentlyCreated,
          tasksUpdated: recentlyUpdated,
          tasksCompleted: tasksCompletedInPeriod,
          totalActivity: recentlyCreated + recentlyUpdated
        },

        // Performance indicators
        performance: {
          averageTasksPerAssignee: parseInt(stats.uniqueAssignees || 0) > 0 
            ? Math.round(totalActiveTasks / parseInt(stats.uniqueAssignees || 0) * 100) / 100
            : 0,
          workInProgressRatio: totalActiveTasks > 0 
            ? Math.round((parseInt(stats.inProgressTasks || 0) / totalActiveTasks) * 100)
            : 0,
          urgentTasksRatio: totalActiveTasks > 0 
            ? Math.round((parseInt(stats.urgentPriorityTasks || 0) / totalActiveTasks) * 100)
            : 0
        },

        // Metadata
        metadata: {
          boardId,
          timeWindow: parseInt(timeWindow),
          generatedAt: new Date().toISOString(),
          dateRange: {
            from: startDate.toISOString(),
            to: currentDate.toISOString()
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching Kanban statistics:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch Kanban statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
