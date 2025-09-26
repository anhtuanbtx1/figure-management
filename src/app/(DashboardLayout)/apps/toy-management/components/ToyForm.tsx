'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { formatNumberToVn, parseVnToNumber } from '@/utils/currency';
import { Toy, ToyCategory, ToyCreateRequest, ToyUpdateRequest, ToyStatus } from '../../../types/apps/toy';

interface ToyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (toy: ToyCreateRequest | ToyUpdateRequest) => Promise<void>;
  toy?: Toy | null;
  categories: ToyCategory[];
  brands: string[];
  mode: 'create' | 'edit';
}

const statusTranslations: Record<ToyStatus, string> = {
  [ToyStatus.ACTIVE]: 'Đang hoạt động',
  [ToyStatus.INACTIVE]: 'Không hoạt động',
  [ToyStatus.OUT_OF_STOCK]: 'Hết hàng',
  [ToyStatus.DISCONTINUED]: 'Ngừng kinh doanh',
};

const ToyForm: React.FC<ToyFormProps> = ({
  open,
  onClose,
  onSubmit,
  toy,
  categories,
  brands,
  mode,
}) => {
  const [formData, setFormData] = useState<ToyCreateRequest | ToyUpdateRequest>({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    ageRange: '',
    brand: '',
    material: '',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
    colors: [],
    tags: [],
    status: ToyStatus.ACTIVE,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Local display states for currency inputs
  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState<string>('');

  // Reset form when dialog opens/closes or toy changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && toy) {
        setFormData({
          id: toy.id,
          name: toy.name,
          description: toy.description,
          image: toy.image,
          categoryId: toy.category.id,
          price: toy.price,
          originalPrice: toy.originalPrice || 0,
          stock: toy.stock,
          ageRange: toy.ageRange || '',
          brand: toy.brand,
          material: toy.material || '',
          dimensions: toy.dimensions,
          colors: toy.colors,
          tags: toy.tags,
          status: toy.status,
        });
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          description: '',
          image: '',
          categoryId: '',
          price: 0,
          originalPrice: 0,
          stock: 0,
          ageRange: '',
          brand: '',
          material: '',
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
            weight: 0,
          },
          colors: [],
          tags: [],
          status: ToyStatus.ACTIVE,
        });
      }
      setError(null);
    }
  }, [open, mode, toy]);

  // Sync display values when formData changes
  useEffect(() => {
    setPriceDisplay(formData.price ? formatNumberToVn(formData.price) : '');
    setOriginalPriceDisplay(formData.originalPrice ? formatNumberToVn(formData.originalPrice) : '');
  }, [formData.price, formData.originalPrice]);

  // Handlers for formatted currency inputs
  const handlePriceChange = (input: string) => {
    const formatted = formatNumberToVn(input);
    setPriceDisplay(formatted);
    const numeric = parseVnToNumber(formatted);
    handleInputChange('price', numeric);
  };

  const handleOriginalPriceChange = (input: string) => {
    const formatted = formatNumberToVn(input);
    setOriginalPriceDisplay(formatted);
    const numeric = parseVnToNumber(formatted);
    handleInputChange('originalPrice', numeric);
  };

  const normalizeCurrencyOnBlur = (kind: 'price' | 'originalPrice') => {
    if (kind === 'price') {
      setPriceDisplay(formData.price ? formatNumberToVn(formData.price) : '');
    } else {
      setOriginalPriceDisplay(formData.originalPrice ? formatNumberToVn(formData.originalPrice) : '');
    }
  };

  const handleInputChange = (field: keyof (ToyCreateRequest | ToyUpdateRequest), value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (field: keyof typeof formData.dimensions, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
  };

  const addColor = () => {
    if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()],
      }));
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Tên đồ chơi là bắt buộc');
      }
      if (!formData.categoryId) {
        throw new Error('Danh mục là bắt buộc');
      }
      if (!formData.brand.trim()) {
        throw new Error('Thương hiệu là bắt buộc');
      }
      if (formData.price <= 0) {
        throw new Error('Giá phải lớn hơn 0');
      }
      if (formData.stock < 0) {
        throw new Error('Số lượng không thể âm');
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">
          {mode === 'create' ? '🧸 Thêm đồ chơi mới' : '✏️ Chỉnh sửa đồ chơi'}
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <IconX size={20} />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              📋 Thông tin cơ bản
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên đồ chơi"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                label="Danh mục"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hình ảnh (URL)"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="/images/toys/example.jpg"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Thương hiệu</InputLabel>
              <Select
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                label="Thương hiệu"
              >
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {mode === 'edit' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Trạng thái"
                >
                  {Object.values(ToyStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusTranslations[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Pricing & Stock */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              💰 Giá cả & Kho hàng
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Giá bán"
              placeholder="1.000.000"
              inputMode="numeric"
              value={priceDisplay}
              onChange={(e) => handlePriceChange(e.target.value)}
              onBlur={() => normalizeCurrencyOnBlur('price')}
              InputProps={{
                startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Giá gốc"
              placeholder="1.500.000"
              inputMode="numeric"
              value={originalPriceDisplay}
              onChange={(e) => handleOriginalPriceChange(e.target.value)}
              onBlur={() => normalizeCurrencyOnBlur('originalPrice')}
              InputProps={{
                startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Số lượng"
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', Number(e.target.value))}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <IconDeviceFloppy size={20} />}
        >
          {loading ? 'Đang lưu...' : (mode === 'create' ? 'Thêm mới' : 'Cập nhật')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToyForm;
