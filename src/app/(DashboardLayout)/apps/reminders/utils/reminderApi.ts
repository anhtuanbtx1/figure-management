import { Reminder } from '../types';

const API_BASE_URL = '/api/reminders';

const handleResponse = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch (e) {
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }
  }
  // Handle empty responses, which are valid in DELETE/PUT scenarios
  return text ? JSON.parse(text) : { success: true, message: 'Operation successful' }; 
};

export const getAllReminders = async (): Promise<{ success: boolean; data: Reminder[] }> => {
  const response = await fetch(API_BASE_URL);
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
  const response = await fetch(`${API_BASE_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminderData),
  });
  return handleResponse(response);
};

export const deleteReminder = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}?id=${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// CONFIRMED: This function now uses POST to the correct endpoint.
export const deleteReminders = async (ids: number[]): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/bulk-delete`, { 
    method: 'POST', // Use POST as per your request
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return handleResponse(response);
};

export const triggerReminder = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/trigger/${id}`, {
    method: 'POST',
  });
  return handleResponse(response);
};

export const getSchedulerStatus = async (): Promise<{ success: boolean; data: { running: boolean } }> => {
    const response = await fetch('/api/scheduler/status');
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
