export interface Reminder {
  id: number;
  title: string;
  description?: string;
  startDate: string | Date;
  reminderDate: string | Date;
  reminderTime: string | Date;
  reminderType: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  isPaused: boolean;
  nextTriggerDate?: string | Date;
  createdDate: string | Date;
  lastTriggeredDate?: string | Date | null;
  // Added from ReminderForm
  categoryId?: number;
  telegramChatIds?: string;
  repeatDaysOfWeek?: string;
  repeatDayOfMonth?: number;
}

export interface ReminderCategory {
  id: number;
  name: string;
  icon: string;
}
