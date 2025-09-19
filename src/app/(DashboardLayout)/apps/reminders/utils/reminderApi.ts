import { Reminder } from '../types'; // Assuming you have a types file

const API_BASE_URL = '/api/reminders';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getAllReminders = async (): Promise<{ success: boolean; data: Reminder[] }> => {
  const response = await fetch(API_BASE_URL);
  return handleResponse(response);
};

export const getReminderById = async (id: number): Promise<{ success: boolean; data: Reminder }> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return handleResponse(response);
};

export const createReminder = async (reminderData: Partial<Reminder>): Promise<{ success: boolean; data: Reminder }> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderData),
  });
  return handleResponse(response);
};

export const updateReminder = async (id: number, reminderData: Partial<Reminder>): Promise<{ success: boolean; data: Reminder }> => {
  const response = await fetch(`${API_BASE_URL}/${id}`,
   {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderData),
  });
  return handleResponse(response);
};

export const deleteReminder = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const triggerReminder = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/trigger/${id}`, {
    method: 'POST', // Assuming POST to trigger a specific reminder
  });
  return handleResponse(response);
};

// You might not have these API endpoints yet, but they were in the original page file.
// I'll create them based on the usage in page.tsx

export const getSchedulerStatus = async (): Promise<{ success: boolean; data: { running: boolean } }> => {
    const response = await fetch('/api/scheduler/status'); // Assuming this endpoint
    return handleResponse(response);
}

export const startScheduler = async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch('/api/scheduler/start', { method: 'POST'});
    return handleResponse(response);
}

export const stopScheduler = async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch('/api/scheduler/stop', { method: 'POST'});
    return handleResponse(response);
}

export const sendTestTelegramMessage = async (message: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/telegram/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return handleResponse(response);
};
