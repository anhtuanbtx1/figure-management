"use client";
import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  IconTrash,
  IconDownload,
  IconX,
  IconCheck,
  IconClock,
  IconBan,
  IconAlertTriangle,
} from '@tabler/icons-react';

import { BulkGuestActionsProps, GuestStatus } from '../../../types/apps/eventGuest';

const BulkGuestActions: React.FC<BulkGuestActionsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onBulkExport,
  onClearSelection,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    onBulkDelete();
    setDeleteDialog(false);
  };

  const handleStatusChange = (status: GuestStatus) => {
    onBulkStatusChange(status);
    handleStatusMenuClose();
    handleMenuClose();
  };

  const handleExport = () => {
    onBulkExport();
    handleMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          mx: 3,
          mb: 2,
          backgroundColor: 'primary.light',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle2" fontWeight={600} color="primary.main">
            Đã chọn {selectedCount} khách mời
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Quick Actions */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<IconDownload size={16} />}
            onClick={handleExport}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
            }}
          >
            Xuất Excel
          </Button>

          {/* More Actions Menu */}
          <Button
            size="small"
            variant="outlined"
            onClick={handleMenuClick}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            Thao tác khác
          </Button>

          {/* Clear Selection */}
          <Button
            size="small"
            variant="text"
            startIcon={<IconX size={16} />}
            onClick={onClearSelection}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              minWidth: 'auto',
            }}
          >
            Bỏ chọn
          </Button>
        </Box>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 200,
          },
        }}
      >
        {/* Status Change */}
        <MenuItem onClick={handleStatusMenuClick}>
          <ListItemIcon>
            <IconCheck size={18} />
          </ListItemIcon>
          <ListItemText>Thay đổi trạng thái</ListItemText>
        </MenuItem>

        <Divider />

        {/* Delete */}
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <IconTrash size={18} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Xóa đã chọn</ListItemText>
        </MenuItem>
      </Menu>

      {/* Status Change Submenu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleStatusChange(GuestStatus.CONFIRMED)}>
          <ListItemIcon>
            <IconCheck size={18} color="#4CAF50" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="success.main">Đã xác nhận</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleStatusChange(GuestStatus.PENDING)}>
          <ListItemIcon>
            <IconClock size={18} color="#FF9800" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="warning.main">Chờ phản hồi</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleStatusChange(GuestStatus.DECLINED)}>
          <ListItemIcon>
            <IconBan size={18} color="#F44336" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error.main">Từ chối</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconTrash size={24} color="#F44336" />
            <Typography variant="h6" fontWeight={700}>
              Xác nhận xóa
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Hành động này không thể hoàn tác!
            </Typography>
          </Alert>

          <Typography variant="body1">
            Bạn có chắc chắn muốn xóa <strong>{selectedCount}</strong> khách mời đã chọn không?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả thông tin liên quan đến các khách mời này sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              color: 'text.secondary',
              borderColor: 'divider',
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Xóa {selectedCount} khách mời
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkGuestActions;
