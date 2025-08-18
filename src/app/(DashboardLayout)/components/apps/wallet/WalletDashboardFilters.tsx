'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { WalletService } from '@/app/(DashboardLayout)/apps/wallet/services/walletService';
import {
  WalletDashboardFilters,
  WalletCategory,
} from '../../../../../types/apps/wallet';

interface WalletDashboardFiltersProps {
  filters: WalletDashboardFilters;
  onFiltersChange: (filters: WalletDashboardFilters) => void;
  onApplyFilters: () => void;
}

const WalletDashboardFilters: React.FC<WalletDashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const [categories, setCategories] = useState<WalletCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Load categories for filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await WalletService.fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field: keyof WalletDashboardFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    
    // Auto-calculate date ranges for predefined types
    if (field === 'dateRangeType') {
      const now = new Date();
      let dateFrom = '';
      let dateTo = now.toISOString();

      switch (value) {
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          dateFrom = startOfWeek.toISOString();
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          break;
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
        case 'yearMonth':
          if (filters.yearMonth) {
            const [year, month] = filters.yearMonth.split('-');
            dateFrom = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
            dateTo = new Date(parseInt(year), parseInt(month), 0).toISOString();
          }
          break;
        default:
          // Keep existing dates for custom
          dateFrom = filters.dateFrom;
          dateTo = filters.dateTo;
      }

      newFilters.dateFrom = dateFrom;
      newFilters.dateTo = dateTo;
    }

    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    onFiltersChange({
      dateFrom: startOfMonth.toISOString(),
      dateTo: now.toISOString(),
      categoryId: '',
      type: '',
      status: '',
      dateRangeType: 'month',
      yearMonth: '',
      year: '',
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.dateRangeType !== 'month') count++; // Default is month
    return count;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon color="primary" />
            <Typography variant="h6">Bộ lọc thống kê</Typography>
            {getActiveFilterCount() > 0 && (
              <Chip 
                label={`${getActiveFilterCount()} bộ lọc`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Box>
          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            size="small"
            disabled={getActiveFilterCount() === 0}
          >
            Xóa bộ lọc
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Date Range Type */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Khoảng thời gian</InputLabel>
              <Select
                value={filters.dateRangeType}
                label="Khoảng thời gian"
                onChange={(e) => handleFilterChange('dateRangeType', e.target.value)}
              >
                <MenuItem value="custom">Tùy chỉnh</MenuItem>
                <MenuItem value="week">Tuần này</MenuItem>
                <MenuItem value="month">Tháng này</MenuItem>
                <MenuItem value="year">Năm này</MenuItem>
                <MenuItem value="yearMonth">Theo tháng/năm</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Year-Month Selector */}
          {filters.dateRangeType === 'yearMonth' && (
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Tháng/Năm"
                type="month"
                value={filters.yearMonth}
                onChange={(e) => handleFilterChange('yearMonth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {/* Custom Date Range */}
          {filters.dateRangeType === 'custom' && (
            <>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Từ ngày"
                  type="date"
                  value={filters.dateFrom.split('T')[0]}
                  onChange={(e) => handleFilterChange('dateFrom', new Date(e.target.value).toISOString())}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Đến ngày"
                  type="date"
                  value={filters.dateTo.split('T')[0]}
                  onChange={(e) => handleFilterChange('dateTo', new Date(e.target.value).toISOString())}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* Category Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={filters.categoryId}
                label="Danh mục"
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <MenuItem value="">Tất cả danh mục</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                        }}
                      />
                      {category.name} ({category.type})
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Transaction Type Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại giao dịch</InputLabel>
              <Select
                value={filters.type}
                label="Loại giao dịch"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">Tất cả loại</MenuItem>
                <MenuItem value="Thu nhập">Thu nhập</MenuItem>
                <MenuItem value="Chi tiêu">Chi tiêu</MenuItem>
                <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.status}
                label="Trạng thái"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                <MenuItem value="Đang chờ">Đang chờ</MenuItem>
                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bộ lọc đang áp dụng:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<DateIcon />}
                  label={`${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`}
                  size="small"
                  variant="outlined"
                />
                {filters.categoryId && (
                  <Chip
                    icon={<CategoryIcon />}
                    label={categories.find(c => c.id === filters.categoryId)?.name || 'Danh mục'}
                    size="small"
                    variant="outlined"
                  />
                )}
                {filters.type && (
                  <Chip
                    label={filters.type}
                    size="small"
                    variant="outlined"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={filters.status}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          </>
        )}

        {/* Apply Button */}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={onApplyFilters}
            disabled={loading}
            startIcon={<FilterIcon />}
          >
            Áp dụng bộ lọc
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletDashboardFilters;
