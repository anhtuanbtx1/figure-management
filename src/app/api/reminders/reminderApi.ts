import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_REMINDER_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ReminderCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface Reminder {
  id?: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  reminderType: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderDate?: string;
  reminderTime: string;
  repeatInterval?: number;
  repeatDaysOfWeek?: string;
  repeatDayOfMonth?: number;
  repeatMonths?: string;
  startDate: string;
  endDate?: string;
  notifyBefore?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  telegramChatIds?: string;
  tags?: string;
  isActive: boolean;
  isPaused: boolean;
  lastTriggeredDate?: string;
  nextTriggerDate?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface NotificationHistory {
  id: number;
  reminderId: number;
  notificationType: string;
  recipient: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  errorMessage?: string;
  scheduledDate: string;
  sentDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

class ReminderApiService {
  // Health check
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  }

  // Reminders
  async getAllReminders(filters?: {
    isActive?: boolean;
    categoryId?: number;
    priority?: string;
  }): Promise<ApiResponse<Reminder[]>> {
    const response = await api.get('/api/reminders', { params: filters });
    return response.data;
  }

  async getTodayReminders(): Promise<ApiResponse<Reminder[]>> {
    const response = await api.get('/api/reminders/today');
    return response.data;
  }

  async getPendingReminders(): Promise<ApiResponse<Reminder[]>> {
    const response = await api.get('/api/reminders/pending');
    return response.data;
  }

  async getReminderById(id: number): Promise<ApiResponse<Reminder>> {
    const response = await api.get(`/api/reminders/${id}`);
    return response.data;
  }

  async createReminder(reminder: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    const response = await api.post('/api/reminders', reminder);
    return response.data;
  }

  async updateReminder(id: number, reminder: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    const response = await api.put(`/api/reminders/${id}`, reminder);
    return response.data;
  }

  async deleteReminder(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/api/reminders/${id}`);
    return response.data;
  }

  async triggerReminder(id: number): Promise<ApiResponse<any>> {
    const response = await api.post(`/api/reminders/${id}/trigger`);
    return response.data;
  }

  async updateTriggerDate(id: number): Promise<ApiResponse<Reminder>> {
    const response = await api.post(`/api/reminders/${id}/update-trigger`);
    return response.data;
  }

  // Notifications
  async sendTestNotification(data: {
    title: string;
    description: string;
    chatId?: string;
  }): Promise<ApiResponse<any>> {
    const response = await api.post('/api/reminders/test/notification', data);
    return response.data;
  }

  // Telegram
  async testTelegramConnection(): Promise<ApiResponse<any>> {
    const response = await api.get('/api/telegram/test');
    return response.data;
  }

  // Scheduler
  async getSchedulerStatus(): Promise<ApiResponse<{ running: boolean; jobs: string[] }>> {
    const response = await api.get('/api/scheduler/status');
    return response.data;
  }

  async startScheduler(): Promise<ApiResponse<void>> {
    const response = await api.post('/api/scheduler/start');
    return response.data;
  }

  async stopScheduler(): Promise<ApiResponse<void>> {
    const response = await api.post('/api/scheduler/stop');
    return response.data;
  }

  // Categories (mock data for now)
  async getCategories(): Promise<ReminderCategory[]> {
    return [
      { id: 1, name: 'Công việc', icon: '💼', color: '#2196F3', isActive: true },
      { id: 2, name: 'Cá nhân', icon: '👤', color: '#4CAF50', isActive: true },
      { id: 3, name: 'Gia đình', icon: '👨‍👩‍👧‍👦', color: '#FF9800', isActive: true },
      { id: 4, name: 'Sức khỏe', icon: '🏥', color: '#F44336', isActive: true },
      { id: 5, name: 'Tài chính', icon: '💰', color: '#9C27B0', isActive: true },
      { id: 6, name: 'Học tập', icon: '📚', color: '#00BCD4', isActive: true },
      { id: 7, name: 'Sự kiện', icon: '🎉', color: '#FF5722', isActive: true },
      { id: 8, name: 'Khác', icon: '📌', color: '#607D8B', isActive: true },
    ];
  }
}

export default new ReminderApiService();