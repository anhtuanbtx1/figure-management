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
  Avatar,
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
} from '@tabler/icons-react';

import { Toy, ToyTableProps, ToyStatus } from '../../../types/apps/toy';
import CategoryIcon from './CategoryIcon';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const ToyTable: React.FC<ToyTableProps> = ({
  toys,
  loading,
  onEdit,
  onDelete,
  onView,
  onSort,
  sortField,
  sortDirection,
  selectedToys,
  onSelectToy,
  onSelectAll,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedToy, setSelectedToy] = React.useState<Toy | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletingToy, setDeletingToy] = React.useState<Toy | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, toy: Toy) => {
    setAnchorEl(event.currentTarget);
    setSelectedToy(toy);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedToy(null);
  };

  const handleDeleteClick = (toy: Toy) => {
    setDeletingToy(toy);
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (deletingToy) {
      await onDelete(deletingToy.id);
      setShowDeleteDialog(false);
      setDeletingToy(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingToy(null);
  };

  const handleSort = (field: keyof Toy) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    onSort(field, isAsc ? 'desc' : 'asc');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusColor = (status: ToyStatus) => {
    switch (status) {
      case ToyStatus.ACTIVE:
        return 'success';
      case ToyStatus.INACTIVE:
        return 'default';
      case ToyStatus.OUT_OF_STOCK:
        return 'warning';
      case ToyStatus.DISCONTINUED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ToyStatus) => {
    switch (status) {
      case ToyStatus.ACTIVE:
        return 'Hoạt động';
      case ToyStatus.INACTIVE:
        return 'Không hoạt động';
      case ToyStatus.OUT_OF_STOCK:
        return 'Hết hàng';
      case ToyStatus.DISCONTINUED:
        return 'Ngừng bán';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const isAllSelected = toys.length > 0 && selectedToys.length === toys.length;
  const isIndeterminate = selectedToys.length > 0 && selectedToys.length < toys.length;

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: 9 }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="100%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 9 }).map((_, cellIndex) => (
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
        <Table
          sx={{
            minWidth: { xs: 800, md: 1200 },
            tableLayout: 'fixed', // Enable fixed table layout for consistent column widths
            width: '100%'
          }}
        >
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

              <TableCell
                sx={{
                  display: { xs: 'none', sm: 'table-cell' },
                  width: 80,
                  minWidth: 70,
                  maxWidth: 90
                }}
              >
                Hình ảnh
              </TableCell>

              <TableCell
                sx={{
                  minWidth: 150,
                  width: '20%' // Reduced from 30% to optimize space
                }}
              >
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Tên đồ chơi
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  display: { xs: 'none', md: 'table-cell' },
                  width: 200, // Expanded from 150 to 200
                  minWidth: 180, // Increased from 130 to 180
                  maxWidth: 250 // Increased from 180 to 250
                }}
              >
                <TableSortLabel
                  active={sortField === 'category'}
                  direction={sortField === 'category' ? sortDirection : 'asc'}
                  onClick={() => handleSort('category')}
                >
                  Danh mục
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  width: 120,
                  minWidth: 100,
                  maxWidth: 140
                }}
              >
                <TableSortLabel
                  active={sortField === 'price'}
                  direction={sortField === 'price' ? sortDirection : 'asc'}
                  onClick={() => handleSort('price')}
                >
                  Giá
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  display: { xs: 'none', sm: 'table-cell' },
                  width: 100,
                  minWidth: 80,
                  maxWidth: 120
                }}
              >
                <TableSortLabel
                  active={sortField === 'stock'}
                  direction={sortField === 'stock' ? sortDirection : 'asc'}
                  onClick={() => handleSort('stock')}
                >
                  Tồn kho
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  display: { xs: 'none', lg: 'table-cell' },
                  width: 120,
                  minWidth: 100,
                  maxWidth: 140
                }}
              >
                Trạng thái
              </TableCell>

              <TableCell
                sx={{
                  display: { xs: 'none', md: 'table-cell' },
                  width: 130,
                  minWidth: 110,
                  maxWidth: 150
                }}
              >
                <TableSortLabel
                  active={sortField === 'createdAt'}
                  direction={sortField === 'createdAt' ? sortDirection : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Ngày tạo
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  width: 100,
                  minWidth: 80,
                  maxWidth: 120
                }}
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {toys.map((toy) => (
              <TableRow
                key={toy.id}
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
                    checked={selectedToys.includes(toy.id)}
                    onChange={() => onSelectToy(toy.id)}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Avatar
                    src={toy.image}
                    alt={toy.name}
                    variant="rounded"
                    sx={{
                      width: 50,
                      height: 50,
                      border: '2px solid',
                      borderColor: 'divider',
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {toy.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {toy.brand} • {toy.ageRange}
                    </Typography>
                    {toy.description && toy.description.trim() !== '' && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          mt: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                        title={toy.description}
                      >
                        {toy.description.length > 100
                          ? `${toy.description.slice(0, 100)}...`
                          : toy.description}
                      </Typography>
                    )}
                    {toy.isNew && (
                      <Chip
                        label="Mới"
                        size="small"
                        color="primary"
                        sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                      />
                    )}
                    {/* Show category on mobile */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 0.5 }}>
                      <Chip
                        icon={<CategoryIcon iconName={toy.category.icon} size={14} />}
                        label={toy.category.name}
                        size="small"
                        sx={{
                          backgroundColor: `${toy.category.color}20`,
                          color: toy.category.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 18,
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Chip
                    icon={<CategoryIcon iconName={toy.category.icon} size={16} />}
                    label={toy.category.name}
                    size="small"
                    sx={{
                      backgroundColor: `${toy.category.color}20`,
                      color: toy.category.color,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      {formatPrice(toy.price)}
                    </Typography>
                    {toy.originalPrice && toy.originalPrice > toy.price && (
                      <Typography
                        variant="caption"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                        }}
                      >
                        {formatPrice(toy.originalPrice)}
                      </Typography>
                    )}
                    {/* Show stock on mobile */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={toy.stock > 0 ? 'success.main' : 'error.main'}
                      >
                        Tồn: {toy.stock}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color={toy.stock > 0 ? 'success.main' : 'error.main'}
                  >
                    {toy.stock}
                  </Typography>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  <Chip
                    label={getStatusLabel(toy.status)}
                    size="small"
                    color={getStatusColor(toy.status)}
                    variant="filled"
                  />
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2">
                    {formatDate(toy.createdAt)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Thao tác">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, toy)}
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
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              minWidth: 160,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedToy) onView(selectedToy);
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
            if (selectedToy) onEdit(selectedToy);
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
            if (selectedToy) {
              handleDeleteClick(selectedToy);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <IconTrash size={18} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        toyName={deletingToy?.name || ''}
      />
    </>
  );
};

export default ToyTable;
