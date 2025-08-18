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
  Switch,
  FormControlLabel,
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
} from '@tabler/icons-react';

import { ToyFiltersProps, ToyStatus } from '../../../types/apps/toy';
import CategoryIcon from './CategoryIcon';

const ToyFilters: React.FC<ToyFiltersProps> = ({
  filters,
  categories,
  brands,
  onFiltersChange,
  onClearFilters,
}) => {
  const theme = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.priceRange.min, filters.priceRange.max]);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number[];
    setPriceRange(value);
  };

  const handlePriceCommit = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const value = newValue as number[];
    onFiltersChange({
      priceRange: { min: value[0], max: value[1] }
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.brand) count++;
    if (filters.ageRange) count++;
    if (filters.inStock) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 5000000) count++;
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm đồ chơi..."
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

          {/* Category */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                Danh mục
              </InputLabel>
              <Select
                value={filters.category}
                label="Danh mục"
                onChange={(e) => onFiltersChange({ category: e.target.value })}
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
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CategoryIcon
                        iconName={category.icon}
                        size={18}
                        color={category.color}
                      />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6} md={2}>
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
                onChange={(e) => onFiltersChange({ status: e.target.value as ToyStatus | '' })}
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
                <MenuItem value={ToyStatus.ACTIVE}>Hoạt động</MenuItem>
                <MenuItem value={ToyStatus.INACTIVE}>Không hoạt động</MenuItem>
                <MenuItem value={ToyStatus.OUT_OF_STOCK}>Hết hàng</MenuItem>
                <MenuItem value={ToyStatus.DISCONTINUED}>Ngừng bán</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Brand */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                Thương hiệu
              </InputLabel>
              <Select
                value={filters.brand}
                label="Thương hiệu"
                onChange={(e) => onFiltersChange({ brand: e.target.value })}
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
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1} alignItems="center">
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
              {/* Price Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                  Khoảng giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  onChangeCommitted={handlePriceCommit}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatPrice}
                  min={0}
                  max={5000000}
                  step={100000}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    },
                    '& .MuiSlider-valueLabel': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </Grid>

              {/* Age Range */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Độ tuổi"
                  placeholder="VD: 3-6 tuổi"
                  value={filters.ageRange}
                  onChange={(e) => onFiltersChange({ ageRange: e.target.value })}
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

                    // Label color
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main,
                      }
                    },
                  }}
                />
              </Grid>

              {/* In Stock Only */}
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.inStock}
                      onChange={(e) => onFiltersChange({ inStock: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Chỉ hiển thị còn hàng"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    },
                  }}
                />
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
              {filters.category && (
                <Chip
                  label={`Danh mục: ${categories.find(c => c.id === filters.category)?.name}`}
                  size="small"
                  onDelete={() => onFiltersChange({ category: '' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.status && (
                <Chip
                  label={`Trạng thái: ${filters.status === ToyStatus.ACTIVE ? 'Hoạt động' : 
                    filters.status === ToyStatus.INACTIVE ? 'Không hoạt động' :
                    filters.status === ToyStatus.OUT_OF_STOCK ? 'Hết hàng' : 'Ngừng bán'}`}
                  size="small"
                  onDelete={() => onFiltersChange({ status: '' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.brand && (
                <Chip
                  label={`Thương hiệu: ${filters.brand}`}
                  size="small"
                  onDelete={() => onFiltersChange({ brand: '' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.inStock && (
                <Chip
                  label="Còn hàng"
                  size="small"
                  onDelete={() => onFiltersChange({ inStock: false })}
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

export default ToyFilters;
