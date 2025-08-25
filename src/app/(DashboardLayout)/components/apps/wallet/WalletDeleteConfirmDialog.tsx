'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Slide,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Receipt as TransactionIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { WalletTransaction } from '../../../../../types/apps/wallet';

// Smooth slide transition for the dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface WalletDeleteConfirmDialogProps {
  open: boolean;
  transaction: WalletTransaction | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const WalletDeleteConfirmDialog: React.FC<WalletDeleteConfirmDialogProps> = ({
  open,
  transaction,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  // Format currency in Vietnamese style
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0 as number,
      maximumFractionDigits: 0 as number,
    }).format(Math.abs(amount));
  };

  // Format date in Vietnamese style
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get transaction type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Thu nhập':
        return '#4CAF50';
      case 'Chi tiêu':
        return '#F44336';
      case 'Chuyển khoản':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    } else if (event.key === 'Enter' && !loading) {
      onConfirm();
    }
  };

  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onCancel}
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(244, 67, 54, 0.2)'
                : '#FFEBEE',
              color: 'error.main',
              width: 48,
              height: 48,
            }}
          >
            <WarningIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Xác nhận xóa giao dịch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hành động này không thể hoàn tác
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Dialog Content */}
      <DialogContent sx={{ py: 3 }}>
        <Box>
          {/* Main confirmation message */}
          <Typography variant="body1" color="text.primary" sx={{ mb: 3, lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xóa giao dịch{' '}
            <Typography component="span" fontWeight={600} color="primary">
              &quot;{transaction.description}&quot;
            </Typography>{' '}
            với số tiền{' '}
            <Typography component="span" fontWeight={600} color="error">
              {formatCurrency(transaction.amount)}
            </Typography>
            ?
          </Typography>

          {/* Transaction details card */}
          <Box
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'grey.50',
              borderRadius: 2,
              p: 2,
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.12)'
                : 'grey.200',
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                sx={{
                  bgcolor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(25, 118, 210, 0.2)'
                    : 'primary.50',
                  color: 'primary.main',
                  width: 40,
                  height: 40,
                }}
              >
                <TransactionIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {transaction.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={transaction.type}
                    size="small"
                    sx={{
                      bgcolor: getTypeColor(transaction.type),
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    label={transaction.status}
                    size="small"
                    variant="outlined"
                    color={transaction.status === 'Hoàn thành' ? 'success' : 'warning'}
                  />
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Transaction details */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Số tiền
                </Typography>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {formatCurrency(transaction.amount)}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  Ngày giao dịch
                </Typography>
                <Typography variant="body1" fontWeight={500} color="text.primary">
                  {formatDate(transaction.transactionDate)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Warning message */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 152, 0, 0.1)'
                : 'warning.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 152, 0, 0.3)'
                : 'warning.200',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: (theme) => theme.palette.mode === 'dark'
                  ? 'warning.light'
                  : 'warning.dark'
              }}
            >
              <WarningIcon fontSize="small" />
              Giao dịch sẽ bị xóa vĩnh viễn và không thể khôi phục. Thống kê và báo cáo sẽ được cập nhật tự động.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          size="large"
          startIcon={<CancelIcon />}
          disabled={loading}
          sx={{
            minWidth: 120,
            borderColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.23)'
              : 'grey.300',
            color: 'text.secondary',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.4)'
                : 'grey.400',
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'grey.50',
              transform: 'translateY(-1px)',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.1)',
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          size="large"
          startIcon={loading ? undefined : <DeleteIcon />}
          disabled={loading}
          sx={{
            minWidth: 120,
            bgcolor: 'error.main',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'error.dark',
              transform: 'translateY(-1px)',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(244, 67, 54, 0.4)'
                : '0 4px 12px rgba(244, 67, 54, 0.3)',
            },
            '&:disabled': {
              bgcolor: 'error.light',
              transform: 'none',
              boxShadow: 'none',
            },
          }}
        >
          {loading ? 'Đang xóa...' : 'Xóa giao dịch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletDeleteConfirmDialog;
