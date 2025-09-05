export type KanbanPriority = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';

export interface KanbanTaskDb {
  id: string;
  boardId: string;
  columnId: string;
  columnName?: string;
  columnOrder?: number;
  title: string;
  description?: string | null;
  priority?: KanbanPriority;
  orderIndex: number; // ThuTu
  assignee?: string | null;
  metadata?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  code: string;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface KanbanListResponse {
  success: boolean;
  message: string;
  data: KanbanTaskDb[];
  count: number;
}

export interface KanbanColumnsResponse {
  success: boolean;
  message: string;
  data: KanbanColumn[];
  count: number;
}

export interface KanbanStats {
  overview: {
    totalTasks: number;
    activeTasks: number;
    deletedTasks: number;
    completionRate: number;
    lastActivity: string | null;
  };
  columns: {
    todo: number;
    inProgress: number;
    pending: number;
    completed: number;
  };
  priorities: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  assignments: {
    uniqueAssignees: number;
    assignedTasks: number;
    unassignedTasks: number;
    topAssignees: Array<{
      name: string;
      taskCount: number;
      completedCount: number;
      completionRate: number;
    }>;
  };
  recentActivity: {
    timeWindowDays: number;
    tasksCreated: number;
    tasksUpdated: number;
    tasksCompleted: number;
    totalActivity: number;
  };
  performance: {
    averageTasksPerAssignee: number;
    workInProgressRatio: number;
    urgentTasksRatio: number;
  };
  metadata: {
    boardId: string;
    timeWindow: number;
    generatedAt: string;
    dateRange: {
      from: string;
      to: string;
    };
  };
}

export interface KanbanStatsResponse {
  success: boolean;
  message: string;
  data: KanbanStats | null;
}

