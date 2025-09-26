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
  Typography,
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

const initialCreateState: ToyCreateRequest = {
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
  dimensions: { length: 0, width: 0, height: 0, weight: 0 },
  colors: [],
  tags: [],
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
  const [formData, setFormData] = useState<ToyCreateRequest | ToyUpdateRequest>(initialCreateState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState<string>('');

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
        setFormData(initialCreateState);
      }
      setError(null);
    } else {
      setFormData(initialCreateState);
    }
  }, [open, mode, toy]);

  useEffect(() => {
    const price = 'price' in formData ? formData.price : 0;
    const originalPrice = 'originalPrice' in formData ? formData.originalPrice : 0;
    setPriceDisplay(price ? formatNumberToVn(price) : '');
    setOriginalPriceDisplay(originalPrice ? formatNumberToVn(originalPrice) : '');
  }, [formData]);

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
    const value = formData[kind] || 0;
    const displaySetter = kind === 'price' ? setPriceDisplay : setOriginalPriceDisplay;
    displaySetter(value ? formatNumberToVn(value) : '');
  };

  const handleInputChange = (field: keyof ToyCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value } as ToyCreateRequest | ToyUpdateRequest));
  };

  const handleDimensionChange = (field: keyof Toy['dimensions'], value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || initialCreateState.dimensions),
        [field]: value,
      },
    } as ToyCreateRequest | ToyUpdateRequest));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!formData.name || !formData.name.trim()) throw new Error('Tên đồ chơi là bắt buộc');
      if (!formData.categoryId) throw new Error('Danh mục là bắt buộc');
      if (!formData.brand || !formData.brand.trim()) throw new Error('Thương hiệu là bắt buộc');
      if (formData.price === undefined || formData.price <= 0) throw new Error('Giá phải lớn hơn 0');
      if (formData.stock === undefined || formData.stock < 0) throw new Error('Số lượng không thể âm');
      
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">{mode === 'create' ? '🧸 Thêm đồ chơi mới' : '✏️ Chỉnh sửa đồ chơi'}</Typography>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto', p: 1 }}><IconX size={20} /></Button>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12}><Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>📋 Thông tin cơ bản</Typography></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Tên đồ chơi" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} required /></Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Danh mục</InputLabel>
              <Select value={formData.categoryId || ''} onChange={e => handleInputChange('categoryId', e.target.value)} label="Danh mục">
                {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}><TextField fullWidth label="Mô tả" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} multiline rows={3} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Hình ảnh (URL)" value={formData.image || ''} onChange={e => handleInputChange('image', e.target.value)} placeholder="/images/toys/example.jpg" /></Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Thương hiệu</InputLabel>
              <Select value={formData.brand || ''} onChange={e => handleInputChange('brand', e.target.value)} label="Thương hiệu">
                {brands.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {mode === 'edit' && 'status' in formData && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select 
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...(prev as ToyUpdateRequest), status: e.target.value as ToyStatus }))}
                  label="Trạng thái">
                  {Object.values(ToyStatus).map(s => <MenuItem key={s} value={s}>{statusTranslations[s]}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}><Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>💰 Giá cả & Kho hàng</Typography></Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Giá bán"
              placeholder="1.000.000"
              value={priceDisplay}
              onChange={e => handlePriceChange(e.target.value)}
              onBlur={() => normalizeCurrencyOnBlur('price')}
              InputProps={{ startAdornment: <InputAdornment position="start">₫</InputAdornment>, endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Giá gốc"
              placeholder="1.500.000"
              value={originalPriceDisplay}
              onChange={e => handleOriginalPriceChange(e.target.value)}
              onBlur={() => normalizeCurrencyOnBlur('originalPrice')}
              InputProps={{ startAdornment: <InputAdornment position="start">₫</InputAdornment>, endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Số lượng" type="number" value={formData.stock || 0} onChange={e => handleInputChange('stock', Number(e.target.value))} required /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <IconDeviceFloppy size={20} />}>
          {loading ? 'Đang lưu...' : (mode === 'create' ? 'Thêm mới' : 'Cập nhật')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToyForm;
