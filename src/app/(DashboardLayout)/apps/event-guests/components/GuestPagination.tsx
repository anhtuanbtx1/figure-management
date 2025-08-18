"use client";
import React from 'react';
import {
  Box,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';

import { GuestPaginationProps } from '../../../types/apps/eventGuest';

const GuestPagination: React.FC<GuestPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showSizeChanger = true,
  showQuickJumper = true,
}) => {
  const [jumpPage, setJumpPage] = React.useState('');

  const handleJumpToPage = () => {
    const page = parseInt(jumpPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpPage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleJumpToPage();
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        p: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(0,0,0,0.01)',
      }}
    >
      {/* Left side - Items info and page size selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        {/* Items info */}
        <Typography variant="body2" color="text.secondary">
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trong tổng số{' '}
          <strong>{totalItems}</strong> khách mời
        </Typography>

        {/* Page size selector */}
        {showSizeChanger && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              / trang
            </Typography>
          </Box>
        )}
      </Box>

      {/* Right side - Pagination controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Quick jumper */}
        {showQuickJumper && totalPages > 5 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Đến trang:
            </Typography>
            <TextField
              size="small"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="1"
              sx={{
                width: 60,
                '& .MuiOutlinedInput-root': {
                  height: 32,
                },
              }}
              inputProps={{
                style: { textAlign: 'center' },
                min: 1,
                max: totalPages,
              }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleJumpToPage}
              disabled={!jumpPage || parseInt(jumpPage) < 1 || parseInt(jumpPage) > totalPages}
              sx={{
                minWidth: 'auto',
                px: 2,
                textTransform: 'none',
              }}
            >
              Đi
            </Button>
          </Box>
        )}

        {/* Navigation buttons for mobile */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <IconChevronsLeft size={16} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <IconChevronLeft size={16} />
          </Button>
          <Typography variant="body2" sx={{ mx: 2 }}>
            {currentPage} / {totalPages}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <IconChevronRight size={16} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <IconChevronsRight size={16} />
          </Button>
        </Box>

        {/* Pagination component for desktop */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 600,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default GuestPagination;
