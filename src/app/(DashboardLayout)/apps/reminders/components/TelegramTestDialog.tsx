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
import * as reminderApi from '../utils/reminderApi';

interface TelegramTestDialogProps {
  open: boolean;
  onClose: () => void;
}

const TelegramTestDialog: React.FC<TelegramTestDialogProps> = ({ open, onClose }) => {
  const [message, setMessage] = useState('Đây là một tin nhắn thử nghiệm từ hệ thống Modernize.');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSendTest = async () => {
    if (!message) {
      setResult({ success: false, message: 'Vui lòng nhập nội dung tin nhắn' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
        const response = await reminderApi.sendTestTelegramMessage(message);

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
    setMessage('Đây là một tin nhắn thử nghiệm từ hệ thống Modernize.');
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
          
          <TextField
            fullWidth
            label="Nội dung"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
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
