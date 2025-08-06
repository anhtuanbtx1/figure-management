'use client';
import React from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  itemsPerPageOptions?: number[];
  showItemsPerPageSelector?: boolean;
  showPageInfo?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
  canGoNext,
  canGoPrevious,
  itemsPerPageOptions = [5, 10, 25, 50],
  showItemsPerPageSelector = true,
  showPageInfo = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalItems === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`
      }}
    >
      {/* Items per page selector */}
      {showItemsPerPageSelector && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            Rows per page:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              variant="outlined"
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Page info */}
      {showPageInfo && (
        <Typography variant="body2" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          Showing {startIndex + 1}-{endIndex} of {totalItems} items
        </Typography>
      )}

      {/* Pagination controls */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* First page */}
        <IconButton
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <IconChevronsLeft size={18} />
        </IconButton>

        {/* Previous page */}
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          size="small"
        >
          <IconChevronLeft size={18} />
        </IconButton>

        {/* Page numbers */}
        <Stack direction="row" spacing={0.5}>
          {pageNumbers.map((pageNumber, index) => (
            <React.Fragment key={index}>
              {pageNumber === '...' ? (
                <Typography
                  variant="body2"
                  sx={{
                    px: 1,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ...
                </Typography>
              ) : (
                <Button
                  variant={pageNumber === currentPage ? 'contained' : 'text'}
                  onClick={() => onPageChange(pageNumber as number)}
                  size="small"
                  sx={{
                    minWidth: 32,
                    height: 32,
                    p: 0,
                    fontSize: '0.875rem'
                  }}
                >
                  {pageNumber}
                </Button>
              )}
            </React.Fragment>
          ))}
        </Stack>

        {/* Next page */}
        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          size="small"
        >
          <IconChevronRight size={18} />
        </IconButton>

        {/* Last page */}
        <IconButton
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <IconChevronsRight size={18} />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default PaginationControls;
