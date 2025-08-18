"use client";
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { IconTrash, IconX, IconAlertTriangle } from '@tabler/icons-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  toyName: string;
  loading?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  toyName,
  loading = false,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        pb: 1,
        color: 'error.main'
      }}>
        <IconAlertTriangle size={24} />
        <Typography variant="h6" component="span">
          Xác nhận xóa đồ chơi
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <IconTrash size={48} color="#f44336" style={{ marginBottom: 16 }} />
          
          <Typography variant="body1" gutterBottom>
            Bạn có chắc chắn muốn xóa đồ chơi:
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              mt: 1,
              mb: 2,
              p: 1,
              bgcolor: 'primary.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200'
            }}
          >
            "{toyName}"
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Đồ chơi sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          startIcon={<IconX size={18} />}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={<IconTrash size={18} />}
          sx={{
            '&:hover': {
              backgroundColor: 'error.dark',
            }
          }}
        >
          {loading ? 'Đang xóa...' : 'Xóa đồ chơi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
