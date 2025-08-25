"use client";
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  Slider,
  Collapse,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconCurrencyDollar,
} from '@tabler/icons-react';

import { GuestFiltersProps, GuestStatus } from '../../../types/apps/eventGuest';

const GuestFilters: React.FC<GuestFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const theme = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contributionRange, setContributionRange] = useState([filters.contributionRange.min, filters.contributionRange.max]);

  const handleContributionChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number[];
    setContributionRange(value);
  };

  const handleContributionCommit = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const value = newValue as number[];
    onFiltersChange({
      contributionRange: { min: value[0], max: value[1] }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0 as number,
    }).format(value);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.contributionRange.min > 0 || filters.contributionRange.max < 5000000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card
      sx={{
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Basic Filters Row */}
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo tên khách mời..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease-in-out',

                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },

                  '&.Mui-focused': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.9)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 0 0 2px ${theme.palette.primary.main}40`
                      : `0 0 0 2px ${theme.palette.primary.main}20`,
                  },

                  // Input text color
                  '& input': {
                    color: theme.palette.text.primary,
                  },

                  // Placeholder color
                  '& input::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.7,
                  },

                  // Border color
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.12)',
                  },

                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.2)',
                  },

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                },

                // Icon color in InputAdornment
                '& .MuiInputAdornment-root': {
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                Trạng thái
              </InputLabel>
              <Select
                value={filters.status}
                label="Trạng thái"
                onChange={(e) => onFiltersChange({ status: e.target.value as GuestStatus | '' })}
                sx={{
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease-in-out',

                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                  },

                  '&.Mui-focused': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.9)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 0 0 2px ${theme.palette.primary.main}40`
                      : `0 0 0 2px ${theme.palette.primary.main}20`,
                  },

                  // Border color
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.12)',
                  },

                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.2)',
                  },

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },

                  // Select text color
                  '& .MuiSelect-select': {
                    color: theme.palette.text.primary,
                  },

                  // Select icon color
                  '& .MuiSelect-icon': {
                    color: theme.palette.text.secondary,
                  },
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={GuestStatus.CONFIRMED}>Đã xác nhận</MenuItem>
                <MenuItem value={GuestStatus.PENDING}>Chờ phản hồi</MenuItem>
                <MenuItem value={GuestStatus.DECLINED}>Từ chối</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} md={5}>
            <Box display="flex" gap={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  minWidth: 'auto',
                }}
              >
                <IconFilter size={16} />
                Bộ lọc nâng cao
                {activeFiltersCount > 0 && (
                  <Chip
                    label={activeFiltersCount}
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 20, minWidth: 20 }}
                  />
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<IconX size={16} />}
                  onClick={onClearFilters}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    minWidth: 'auto',
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showAdvanced}>
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Bộ lọc nâng cao
            </Typography>

            <Grid container spacing={3}>
              {/* Contribution Range */}
              <Grid item xs={12} md={8}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconCurrencyDollar size={16} />
                  Khoảng số tiền đóng góp: {formatCurrency(contributionRange[0])} - {formatCurrency(contributionRange[1])}
                </Typography>
                <Slider
                  value={contributionRange}
                  onChange={handleContributionChange}
                  onChangeCommitted={handleContributionCommit}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  min={0}
                  max={5000000}
                  step={100000}
                  marks={[
                    { value: 0, label: '0đ' },
                    { value: 1000000, label: '1M' },
                    { value: 2000000, label: '2M' },
                    { value: 3000000, label: '3M' },
                    { value: 5000000, label: '5M' },
                  ]}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    },
                    '& .MuiSlider-valueLabel': {
                      fontSize: '0.75rem',
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'currentColor',
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </Grid>

              {/* Quick Amount Filters */}
              <Grid item xs={12} md={4}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                  Lọc nhanh theo số tiền:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    label="Chưa đóng góp"
                    size="small"
                    variant={filters.contributionRange.min === 0 && filters.contributionRange.max === 0 ? "filled" : "outlined"}
                    onClick={() => onFiltersChange({ contributionRange: { min: 0, max: 0 } })}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Dưới 1M"
                    size="small"
                    variant={filters.contributionRange.min === 1 && filters.contributionRange.max === 999999 ? "filled" : "outlined"}
                    onClick={() => onFiltersChange({ contributionRange: { min: 1, max: 999999 } })}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="1M - 2M"
                    size="small"
                    variant={filters.contributionRange.min === 1000000 && filters.contributionRange.max === 2000000 ? "filled" : "outlined"}
                    onClick={() => onFiltersChange({ contributionRange: { min: 1000000, max: 2000000 } })}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Trên 2M"
                    size="small"
                    variant={filters.contributionRange.min === 2000001 && filters.contributionRange.max === 5000000 ? "filled" : "outlined"}
                    onClick={() => onFiltersChange({ contributionRange: { min: 2000001, max: 5000000 } })}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Bộ lọc đang áp dụng:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {filters.search && (
                <Chip
                  label={`Tìm kiếm: "${filters.search}"`}
                  size="small"
                  onDelete={() => onFiltersChange({ search: '' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.status && (
                <Chip
                  label={`Trạng thái: ${
                    filters.status === GuestStatus.CONFIRMED ? 'Đã xác nhận' :
                    filters.status === GuestStatus.PENDING ? 'Chờ phản hồi' :
                    filters.status === GuestStatus.DECLINED ? 'Từ chối' : filters.status
                  }`}
                  size="small"
                  onDelete={() => onFiltersChange({ status: '' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {(filters.contributionRange.min > 0 || filters.contributionRange.max < 5000000) && (
                <Chip
                  label={`Số tiền: ${formatCurrency(filters.contributionRange.min)} - ${formatCurrency(filters.contributionRange.max)}`}
                  size="small"
                  onDelete={() => onFiltersChange({ contributionRange: { min: 0, max: 5000000 } })}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestFilters;
