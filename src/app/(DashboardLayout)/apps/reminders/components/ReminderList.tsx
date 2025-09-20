'use client';

import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Reminder, ReminderCategory } from '../types';

interface ReminderListProps {
  reminders: Reminder[];
  categories: ReminderCategory[];
  onEdit: (reminder: Reminder) => void;
  onDelete: (ids: number[]) => void; // CORRECTED: Expect an array of numbers
  onTrigger: (id: number) => void;
  onTogglePause: (reminder: Reminder) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  categories,
  onEdit,
  onDelete,
  onTrigger,
  onTogglePause,
}) => {
  const getCategoryInfo = (categoryId: number | undefined) => {
    if (categoryId === undefined) return { name: 'Khác', icon: '' };
    const category = categories.find((c) => c.id === categoryId);
    return category || { name: 'Khác', icon: '' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'once':
        return 'Một lần';
      case 'daily':
        return 'Hàng ngày';
      case 'weekly':
        return 'Hàng tuần';
      case 'monthly':
        return 'Hàng tháng';
      case 'yearly':
        return 'Hàng năm';
      default:
        return type;
    }
  };
  
  const formatTime = (timeInput: any): string => {
    if (typeof timeInput === 'string' && timeInput.includes('T')) {
      return timeInput.substring(timeInput.indexOf('T') + 1, timeInput.indexOf('T') + 6);
    } 
    if (typeof timeInput === 'string' && timeInput.length >= 5) {
      return timeInput.substring(0, 5);
    }
    return '--:--';
  };

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return '-';
    try {
      const dateToFormat = typeof date === 'string' ? parseISO(date) : date;
      return format(dateToFormat, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return String(date);
    }
  };

  if (reminders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Chưa có nhắc nhở nào
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Nhấn &quot;Thêm nhắc nhở&quot; để tạo nhắc nhở mới
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Danh mục</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Thời gian</TableCell>
            <TableCell>Độ ưu tiên</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Lần kế tiếp</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reminders.map((reminder) => {
            const categoryInfo = getCategoryInfo(reminder.categoryId);
            return (
              <TableRow key={reminder.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {reminder.title}
                    </Typography>
                    {reminder.description && (
                      <Typography variant="caption" color="textSecondary">
                        {reminder.description.substring(0, 50)}
                        {reminder.description.length > 50 && '...'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>{categoryInfo.icon}</span>
                        <span>{categoryInfo.name}</span>
                      </Box>
                    }
                    size="small"
                    style={{
                      backgroundColor: '#607D8B',
                      color: '#fff',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip label={getTypeLabel(reminder.reminderType)} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">{formatTime(reminder.reminderTime)}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={reminder.priority.toUpperCase()}
                    size="small"
                    color={getPriorityColor(reminder.priority) as any}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {reminder.isActive ? (
                      <Chip label="Hoạt động" size="small" color="success" />
                    ) : (
                      <Chip label="Ngưng" size="small" color="default" />
                    )}
                    {reminder.isPaused && <Chip label="Tạm dừng" size="small" color="warning" />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDateTime(reminder.nextTriggerDate)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title={reminder.isPaused ? 'Tiếp tục' : 'Tạm dừng'}>
                      <IconButton
                        size="small"
                        onClick={() => onTogglePause(reminder)}
                        color={reminder.isPaused ? 'success' : 'warning'}
                      >
                        {reminder.isPaused ? <PlayIcon /> : <PauseIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Gửi thông báo">
                      <IconButton
                        size="small"
                        onClick={() => onTrigger(reminder.id!)}
                        color="info"
                      >
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" onClick={() => onEdit(reminder)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => onDelete([reminder.id!])} // CORRECTED: Pass an array with the id
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReminderList;
