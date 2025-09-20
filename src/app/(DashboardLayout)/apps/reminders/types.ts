export interface Reminder {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  reminderType: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderDate?: string;
  reminderTime?: string;
  startDate?: string;
  endDate?: string;
  nextTriggerDate?: string;
  lastTriggeredDate?: string;
  repeatDaysOfWeek?: string;
  repeatDayOfMonth?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  isPaused: boolean;
  createdBy?: string;
  createdDate: string;
  updatedDate: string;
  telegramChatIds?: string;
  telegramTemplate?: string;
}

export interface ReminderCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  content: string;
}
