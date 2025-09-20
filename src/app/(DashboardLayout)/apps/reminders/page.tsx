'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Telegram as TelegramIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as BellIcon,
} from '@mui/icons-material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import ReminderList from './components/ReminderList';
import ReminderForm from './components/ReminderForm';
import ReminderStats from './components/ReminderStats';
import TelegramTestDialog from './components/TelegramTestDialog';
import * as reminderApi from './utils/reminderApi';
import { Reminder, ReminderCategory } from './types';

// This should be in reminderApi.ts, but for a quick fix, I'll add it here and move it later.
async function getCategories(): Promise<ReminderCategory[]> {
  return [
    { id: 1, name: 'Công việc', icon: '💼' },
    { id: 2, name: 'Cá nhân', icon: '👤' },
    { id: 3, name: 'Học tập', icon: '📚' },
  ];
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<ReminderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openTelegramTest, setOpenTelegramTest] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [remindersResponse, categoriesResponse] = await Promise.all([
        reminderApi.getAllReminders(),
        getCategories(), // Using placeholder
      ]);

      if (remindersResponse.success && remindersResponse.data) {
        setReminders(remindersResponse.data);
      }
      setCategories(categoriesResponse);
      checkSchedulerStatus();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showSnackbar('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await reminderApi.getAllReminders();
      if (response.success && response.data) {
        setReminders(response.data);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      showSnackbar('Lỗi khi tải danh sách nhắc nhở', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkSchedulerStatus = async () => {
    try {
      const response = await reminderApi.getSchedulerStatus();
      if (response.success) {
        setSchedulerStatus(response.data?.running || false);
      }
    } catch (error) {
      console.error('Error checking scheduler status:', error);
    }
  };

  const handleCreateReminder = () => {
    setSelectedReminder(null);
    setOpenForm(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setOpenForm(true);
  };

  // CORRECTED: Name, signature, and logic to handle an array of IDs
  const handleDeleteReminders = async (ids: number[]) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${ids.length} nhắc nhở đã chọn?`)) return;

    try {
      await reminderApi.deleteReminders(ids);
      showSnackbar(`Đã xóa ${ids.length} nhắc nhở thành công`, 'success');
      loadReminders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa nhắc nhở';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleTriggerReminder = async (id: number) => {
    try {
      await reminderApi.triggerReminder(id);
      showSnackbar('Đã gửi thông báo nhắc nhở', 'success');
    } catch (error) {
      showSnackbar('Lỗi khi gửi thông báo', 'error');
    }
  };

  const handleTogglePause = async (reminder: Reminder) => {
    try {
      await reminderApi.updateReminder(reminder.id!, {
        isPaused: !reminder.isPaused,
      });
      showSnackbar(
        reminder.isPaused ? 'Đã kích hoạt lại nhắc nhở' : 'Đã tạm dừng nhắc nhở',
        'success'
      );
      loadReminders();
    } catch (error) {
      showSnackbar('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedReminder(null);
  };

  const handleFormSave = async (reminderData: Partial<Reminder>) => {
    try {
      if (selectedReminder?.id) {
        // Update existing
        await reminderApi.updateReminder(selectedReminder.id, reminderData);
        showSnackbar('Cập nhật nhắc nhở thành công', 'success');
      } else {
        // Create new
        await reminderApi.createReminder(reminderData);
        showSnackbar('Tạo nhắc nhở mới thành công', 'success');
      }
      loadReminders();
      handleFormClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lưu nhắc nhở';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleToggleScheduler = async () => {
    try {
      if (schedulerStatus) {
        await reminderApi.stopScheduler();
        setSchedulerStatus(false);
        showSnackbar('Đã tắt bộ lập lịch tự động', 'warning');
      } else {
        await reminderApi.startScheduler();
        setSchedulerStatus(true);
        showSnackbar('Đã bật bộ lập lịch tự động', 'success');
      }
    } catch (error) {
      showSnackbar('Lỗi khi thay đổi trạng thái bộ lập lịch', 'error');
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <PageContainer title="Quản lý nhắc nhở" description="Quản lý nhắc nhở và thông báo tự động">
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            🔔 Quản lý nhắc nhở
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={schedulerStatus ? 'contained' : 'outlined'}
              color={schedulerStatus ? 'success' : 'inherit'}
              startIcon={<ScheduleIcon />}
              onClick={handleToggleScheduler}
            >
              {schedulerStatus ? 'Scheduler: ON' : 'Scheduler: OFF'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<TelegramIcon />}
              onClick={() => setOpenTelegramTest(true)}
            >
              Test Telegram
            </Button>
            <IconButton onClick={loadReminders} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateReminder}>
              Thêm nhắc nhở
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <ReminderStats reminders={reminders} />

        {/* Main Content */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <DashboardCard title="Danh sách nhắc nhở">
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ReminderList
                  reminders={reminders}
                  categories={categories}
                  onEdit={handleEditReminder}
                  onDelete={handleDeleteReminders} // CORRECTED: Pass the correct handler
                  onTrigger={handleTriggerReminder}
                  onTogglePause={handleTogglePause}
                />
              )}
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateReminder}
        >
          <AddIcon />
        </Fab>

        {/* Dialogs */}
        <ReminderForm
          open={openForm}
          onClose={handleFormClose}
          onSave={handleFormSave}
          reminder={selectedReminder}
          categories={categories}
        />

        <TelegramTestDialog
          open={openTelegramTest}
          onClose={() => setOpenTelegramTest(false)}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
