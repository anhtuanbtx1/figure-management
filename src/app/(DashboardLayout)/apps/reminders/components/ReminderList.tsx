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
import { Reminder } from '@/app/api/reminders/reminderApi';

interface ReminderListProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
  onTrigger: (id: number) => void;
  onTogglePause: (reminder: Reminder) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  onEdit,
  onDelete,
  onTrigger,
  onTogglePause,
}) => {
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

  const formatDateTime = (date: string | undefined) => {
    if (!date) return '-';
    try {
      return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return date;
    }
  };

  if (reminders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Chưa có nhắc nhở nào
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Nhấn "Thêm nhắc nhở" để tạo nhắc nhở mới
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
          {reminders.map((reminder) => (
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
                      <span>{reminder.categoryIcon}</span>
                      <span>{reminder.categoryName || 'Khác'}</span>
                    </Box>
                  }
                  size="small"
                  style={{
                    backgroundColor: reminder.categoryColor || '#607D8B',
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
                  <Typography variant="body2">{reminder.reminderTime}</Typography>
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
                      onClick={() => onDelete(reminder.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReminderList;