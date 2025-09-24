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
  Typography,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { Reminder, ReminderCategory, NotificationTemplate } from '../types';
import axios from 'axios';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<Reminder>) => void;
  onDelete: (ids: number[]) => void;
  reminder: Reminder | null;
  categories: ReminderCategory[];
}

const ReminderForm: React.FC<ReminderFormProps> = ({ open, onClose, onSave, onDelete, reminder, categories }) => {
  console.log("ReminderForm rendered with reminder:", reminder);
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
    telegramTemplate: '',
  });
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs('09:00', 'HH:mm'));
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [formErrors, setFormErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    const fetchTemplates = async () => {
      console.log("Fetching notification templates");
      try {
        const response = await axios.get('/api/notification-templates');
        if (response.data.success) {
          setNotificationTemplates(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notification templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    console.log("useEffect for reminder update triggered:", reminder);
    if (reminder) {
      setFormData(reminder);
      const effectiveDate = reminder.reminderType === 'once' ? reminder.reminderDate : reminder.startDate;
      setSelectedDate(effectiveDate ? dayjs(effectiveDate) : null);
      
      if (reminder.reminderTime) {
        setSelectedTime(dayjs(reminder.reminderTime as string, 'HH:mm:ss'));
      }
      if (reminder.repeatDaysOfWeek) {
        setSelectedDays(reminder.repeatDaysOfWeek.split(','));
      }
      if (reminder.repeatDayOfMonth) {
        setDayOfMonth(reminder.repeatDayOfMonth);
      }
    } else {
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
        telegramTemplate: '',
      });
      setSelectedDate(dayjs()); // Default to today
      setSelectedTime(dayjs('09:00', 'HH:mm'));
      setSelectedDays([]);
      setDayOfMonth(1);
    }
    setFormErrors({}); // Clear errors when reminder changes
  }, [reminder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`handleInputChange for ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    console.log(`handleSelectChange for ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (event: React.MouseEvent<HTMLElement>, newDays: string[]) => {
    console.log("handleDayToggle called with:", newDays);
    setSelectedDays(newDays);
  };

  const validate = (): boolean => {
    console.log("validate called");
    let errors: { title?: string } = {};
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Tiêu đề là bắt buộc';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


 const handleSubmit = () => {
    console.log("handleSubmit called");
    if (!validate()) {
      console.log("Validation failed");
      return;
    }

    const baseDate = selectedDate || dayjs();
    const time = selectedTime || dayjs('09:00', 'HH:mm');

    const nextTriggerDate = baseDate
      .hour(time.hour())
      .minute(time.minute())
      .second(time.second())
      .millisecond(0)
      .toISOString();

    const data: Partial<Reminder> = {
      ...formData,
      reminderTime: time.format('HH:mm:ss'),
      nextTriggerDate: nextTriggerDate, 
    };

    if (formData.reminderType === 'once') {
      data.reminderDate = baseDate.format('YYYY-MM-DD');
    } else {
      data.startDate = baseDate.format('YYYY-MM-DD');
    }

    if (formData.reminderType === 'weekly') {
      data.repeatDaysOfWeek = selectedDays.join(',');
    }

    if (formData.reminderType === 'monthly') {
      data.repeatDayOfMonth = dayOfMonth;
    }

    if (typeof data.telegramChatIds === 'string' && data.telegramChatIds) {
      try {
        JSON.parse(data.telegramChatIds);
      } catch {
        data.telegramChatIds = JSON.stringify([data.telegramChatIds.trim()]);
      }
    }
    
    if (data.reminderType !== 'once') {
        delete data.reminderDate;
    }
    if (data.reminderType === 'once') {
        delete data.startDate;
        delete data.repeatDaysOfWeek;
        delete data.repeatDayOfMonth;
    }
    if (data.reminderType !== 'weekly') {
        delete data.repeatDaysOfWeek;
    }
     if (data.reminderType !== 'monthly') {
        delete data.repeatDayOfMonth;
    }

    console.log("Calling onSave with data:", data);
    onSave(data);
  };

  const handleDelete = () => {
    console.log("handleDelete called");
    if (reminder && reminder.id) {
        console.log("Calling onDelete with id:", reminder.id);
        onDelete([reminder.id]);
        onClose();
    }
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
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Mẫu thông báo (Telegram)</InputLabel>
                    <Select
                        value={formData.telegramTemplate || ''}
                        onChange={(e) => handleSelectChange('telegramTemplate', e.target.value)}
                        label="Mẫu thông báo (Telegram)"
                        name="telegramTemplate"
                    >
                        <MenuItem value="">
                            <em>Không sử dụng mẫu</em>
                        </MenuItem>
                        {notificationTemplates.map((template) => (
                            <MenuItem key={template.id} value={template.name}>
                                {template.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                  onChange={(e) => {
                    handleSelectChange('reminderType', e.target.value);
                  }}
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
                onChange={(newValue: Dayjs | null) => setSelectedTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
                 <DatePicker
                  label={formData.reminderType === 'once' ? "Ngày nhắc nhở" : "Ngày bắt đầu"}
                  value={selectedDate}
                  onChange={(newValue: Dayjs | null) => setSelectedDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
            </Grid>

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
        <DialogActions sx={{ justifyContent: 'space-between', paddingX: 3, paddingBottom: 2 }}>
            <Box>
                {reminder && (
                    <IconButton onClick={handleDelete} color="error">
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>
            <Box>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {reminder ? 'Cập nhật' : 'Tạo mới'}
                </Button>
            </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReminderForm;
