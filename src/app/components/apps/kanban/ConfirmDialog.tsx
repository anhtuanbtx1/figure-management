"use client";
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useTheme, alpha, Stack, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { IconAlertTriangle, IconTrash, IconX } from '@tabler/icons-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn?',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  onClose,
  onConfirm
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 20px 60px ${alpha(theme.palette.grey[900], 0.15)}`,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main'
            }}
          >
            <IconAlertTriangle size={24} />
          </Stack>
          <Stack>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thao tác này không thể hoàn tác
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: alpha(theme.palette.grey[500], 0.3),
            '&:hover': {
              borderColor: theme.palette.grey[400],
              bgcolor: alpha(theme.palette.grey[500], 0.05)
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          startIcon={<IconTrash size={18} />}
          sx={{
            borderRadius: 2,
            px: 3,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

