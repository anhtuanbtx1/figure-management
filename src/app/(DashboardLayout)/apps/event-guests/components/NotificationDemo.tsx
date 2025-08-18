import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ModernNotification from './ModernNotification';
import createGuestNotification, { NotificationConfig } from '../utils/notifications';

const NotificationDemo: React.FC = () => {
  const [notification, setNotification] = useState<NotificationConfig>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ open: true, message, severity: type });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Test Modern Notifications
      </Typography>
      
      <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
        <Button
          variant="contained"
          color="success"
          onClick={() => showNotification('success', '✅ Đã thêm khách mời "Nguyễn Văn An" thành công')}
        >
          Success Toast
        </Button>
        
        <Button
          variant="contained"
          color="error"
          onClick={() => showNotification('error', '❌ Không thể thêm khách mời: Missing required fields')}
        >
          Error Toast
        </Button>
        
        <Button
          variant="contained"
          color="warning"
          onClick={() => showNotification('warning', '⚠️ Vui lòng chọn ít nhất một khách mời')}
        >
          Warning Toast
        </Button>
        
        <Button
          variant="contained"
          color="info"
          onClick={() => showNotification('info', 'ℹ️ Thao tác đã được hủy')}
        >
          Info Toast
        </Button>
      </Stack>

      <ModernNotification
        notification={notification}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default NotificationDemo;
