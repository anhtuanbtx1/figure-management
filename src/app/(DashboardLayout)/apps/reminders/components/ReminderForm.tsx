'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import reminderApi, { Reminder, ReminderCategory } from '@/app/api/reminders/reminderApi';

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<Reminder>) => void;
  reminder: Reminder | null;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ open, onClose, onSave, reminder }) => {
  const [formData, setFormData] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    categoryId: undefined,
    reminderType: 'once',
    reminderTime: '09:00:00',
    priority: 'medium',
    isActive: true,
    isPaused: false,
    telegramChatIds: '',
  });
  const [categories, setCategories] = useState<ReminderCategory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs('09:00', 'HH:mm'));
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (reminder) {
      setFormData(reminder);
      if (reminder.reminderDate) {
        setSelectedDate(dayjs(reminder.reminderDate));
      }
      if (reminder.reminderTime) {
        setSelectedTime(dayjs(reminder.reminderTime, 'HH:mm:ss'));
      }
      if (reminder.repeatDaysOfWeek) {
        setSelectedDays(reminder.repeatDaysOfWeek.split(','));
      }
      if (reminder.repeatDayOfMonth) {
        setDayOfMonth(reminder.repeatDayOfMonth);
      }
    } else {
      // Reset form for new reminder
      setFormData({
        title: '',
        description: '',
        categoryId: undefined,
        reminderType: 'once',
        reminderTime: '09:00:00',
        priority: 'medium',
        isActive: true,
        isPaused: false,
        telegramChatIds: '',
      });
      setSelectedDate(null);
      setSelectedTime(dayjs('09:00', 'HH:mm'));
      setSelectedDays([]);
      setDayOfMonth(1);
    }
  }, [reminder]);

  const loadCategories = async () => {
    try {
      const cats = await reminderApi.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (event: React.MouseEvent<HTMLElement>, newDays: string[]) => {
    setSelectedDays(newDays);
  };

  const handleSubmit = () => {
    const data: Partial<Reminder> = {
      ...formData,
      reminderTime: selectedTime?.format('HH:mm:ss') || '09:00:00',
      startDate: selectedDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
    };

    if (formData.reminderType === 'once' && selectedDate) {
      data.reminderDate = selectedDate.format('YYYY-MM-DD');
    }

    if (formData.reminderType === 'weekly' && selectedDays.length > 0) {
      data.repeatDaysOfWeek = selectedDays.join(',');
    }

    if (formData.reminderType === 'monthly') {
      data.repeatDayOfMonth = dayOfMonth;
    }

    // Convert telegramChatIds to JSON array if it's a string
    if (typeof data.telegramChatIds === 'string' && data.telegramChatIds) {
      try {
        // Check if it's already JSON
        JSON.parse(data.telegramChatIds);
      } catch {
        // Convert single chat ID to JSON array
        data.telegramChatIds = JSON.stringify([data.telegramChatIds.trim()]);
      }
    }

    onSave(data);
  };

  const daysOfWeek = [
    { value: '1', label: 'T2' },
    { value: '2', label: 'T3' },
    { value: '3', label: 'T4' },
    { value: '4', label: 'T5' },
    { value: '5', label: 'T6' },
    { value: '6', label: 'T7' },
    { value: '0', label: 'CN' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{reminder ? 'Chỉnh sửa nhắc nhở' : 'Thêm nhắc nhở mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.categoryId || ''}
                  onChange={(e) => handleSelectChange('categoryId', e.target.value)}
                  label="Danh mục"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleSelectChange('priority', e.target.value)}
                  label="Độ ưu tiên"
                >
                  <MenuItem value="low">Thấp</MenuItem>
                  <MenuItem value="medium">Trung bình</MenuItem>
                  <MenuItem value="high">Cao</MenuItem>
                  <MenuItem value="urgent">Khẩn cấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại nhắc nhở</InputLabel>
                <Select
                  value={formData.reminderType}
                  onChange={(e) => handleSelectChange('reminderType', e.target.value)}
                  label="Loại nhắc nhở"
                >
                  <MenuItem value="once">Một lần</MenuItem>
                  <MenuItem value="daily">Hàng ngày</MenuItem>
                  <MenuItem value="weekly">Hàng tuần</MenuItem>
                  <MenuItem value="monthly">Hàng tháng</MenuItem>
                  <MenuItem value="yearly">Hàng năm</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TimePicker
                label="Thời gian nhắc nhở"
                value={selectedTime}
                onChange={(newValue) => setSelectedTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            {formData.reminderType === 'once' && (
              <Grid item xs={12}>
                <DatePicker
                  label="Ngày nhắc nhở"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            )}

            {formData.reminderType === 'weekly' && (
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Chọn ngày trong tuần
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedDays}
                    onChange={handleDayToggle}
                    aria-label="days of week"
                    multiple
                  >
                    {daysOfWeek.map((day) => (
                      <ToggleButton key={day.value} value={day.value} aria-label={day.label}>
                        {day.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            )}

            {formData.reminderType === 'monthly' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Ngày trong tháng (1-31)"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telegram Chat ID"
                name="telegramChatIds"
                value={formData.telegramChatIds}
                onChange={handleInputChange}
                helperText='Nhập Chat ID hoặc JSON array ["chatId1", "chatId2"]'
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    onChange={(e) => handleSelectChange('isActive', e.target.checked)}
                  />
                }
                label="Kích hoạt nhắc nhở"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {reminder ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReminderForm;