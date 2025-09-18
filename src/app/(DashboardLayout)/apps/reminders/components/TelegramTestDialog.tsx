'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Telegram as TelegramIcon } from '@mui/icons-material';
import reminderApi from '@/app/api/reminders/reminderApi';

interface TelegramTestDialogProps {
  open: boolean;
  onClose: () => void;
}

const TelegramTestDialog: React.FC<TelegramTestDialogProps> = ({ open, onClose }) => {
  const [title, setTitle] = useState('Test Notification');
  const [description, setDescription] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await reminderApi.testTelegramConnection();
      setResult({
        success: response.success,
        message: response.success
          ? 'Kết nối Telegram thành công!'
          : 'Kết nối Telegram thất bại',
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Lỗi khi test kết nối: ' + (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!title || !description) {
      setResult({
        success: false,
        message: 'Vui lòng nhập tiêu đề và nội dung',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await reminderApi.sendTestNotification({
        title,
        description: description || `Test message sent at ${new Date().toLocaleString('vi-VN')}`,
        chatId: chatId || undefined,
      });

      setResult({
        success: response.success,
        message: response.success
          ? 'Đã gửi thông báo test thành công!'
          : 'Gửi thông báo thất bại',
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Lỗi khi gửi thông báo: ' + (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('Test Notification');
    setDescription('');
    setChatId('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TelegramIcon color="primary" />
          <span>Test Telegram Notification</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleTestConnection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <TelegramIcon />}
          >
            Test kết nối Telegram Bot
          </Button>

          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
            Hoặc gửi thông báo test:
          </Typography>

          <TextField
            fullWidth
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Nội dung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            disabled={loading}
            placeholder="Nhập nội dung test..."
          />

          <TextField
            fullWidth
            label="Chat ID (tùy chọn)"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            disabled={loading}
            helperText="Để trống sẽ dùng Chat ID mặc định"
          />

          {result && (
            <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 1 }}>
              {result.message}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Đóng</Button>
        <Button
          onClick={handleSendTest}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <TelegramIcon />}
        >
          Gửi thông báo test
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TelegramTestDialog;