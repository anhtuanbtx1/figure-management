"use client";
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Box,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconPhone,
  IconMail,
} from '@tabler/icons-react';

import { EventGuest, GuestTableProps, GuestStatus } from '../../../types/apps/eventGuest';

const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  loading,
  onEdit,
  onDelete,
  onView,
  onSort,
  sortField,
  sortDirection,
  selectedGuests,
  onSelectGuest,
  onSelectAll,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedGuest, setSelectedGuest] = React.useState<EventGuest | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, guest: EventGuest) => {
    setAnchorEl(event.currentTarget);
    setSelectedGuest(guest);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGuest(null);
  };

  const handleSort = (field: keyof EventGuest) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    onSort(field, isAsc ? 'desc' : 'asc');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: GuestStatus) => {
    switch (status) {
      case GuestStatus.CONFIRMED:
        return 'success';
      case GuestStatus.PENDING:
        return 'warning';
      case GuestStatus.DECLINED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: GuestStatus) => {
    switch (status) {
      case GuestStatus.CONFIRMED:
        return 'Đã xác nhận';
      case GuestStatus.PENDING:
        return 'Chờ phản hồi';
      case GuestStatus.DECLINED:
        return 'Từ chối';
      default:
        return status;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const isAllSelected = guests.length > 0 && selectedGuests.length === guests.length;
  const isIndeterminate = selectedGuests.length > 0 && selectedGuests.length < guests.length;

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="100%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 10 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 900, md: 1100 } }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'rgba(0,0,0,0.02)',
                '& .MuiTableCell-head': {
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={sortField === 'id'}
                  direction={sortField === 'id' ? sortDirection : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={sortField === 'fullName'}
                  direction={sortField === 'fullName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('fullName')}
                >
                  Họ và tên
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                Đơn vị
              </TableCell>

              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                Số người
              </TableCell>

              <TableCell>
                Trạng thái
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={sortField === 'contributionAmount'}
                  direction={sortField === 'contributionAmount' ? sortDirection : 'asc'}
                  onClick={() => handleSort('contributionAmount')}
                >
                  Số tiền đóng góp
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {guests.map((guest) => (
              <TableRow
                key={guest.id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)',
                  },
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedGuests.includes(guest.id)}
                    onChange={() => onSelectGuest(guest.id)}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    #{guest.id}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {guest.fullName}
                    </Typography>
                    {/* Show unit and numberOfPeople on mobile */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {guest.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {guest.numberOfPeople} người
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {guest.unit}
                  </Typography>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {guest.numberOfPeople}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getStatusLabel(guest.status)}
                    size="small"
                    color={getStatusColor(guest.status)}
                    variant="filled"
                  />
                </TableCell>

                <TableCell>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={guest.contributionAmount > 0 ? 'success.main' : 'text.secondary'}
                  >
                    {guest.contributionAmount > 0 ? formatCurrency(guest.contributionAmount) : 'Chưa đóng góp'}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Thao tác">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, guest)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.main',
                        },
                      }}
                    >
                      <IconDotsVertical size={16} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 160,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedGuest) onView(selectedGuest);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedGuest) onEdit(selectedGuest);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedGuest) onDelete(selectedGuest.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <IconTrash size={18} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default GuestTable;
