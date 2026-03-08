"use client";
import React, { useState, useEffect } from 'react';
import { formatNumberToVn, parseVnToNumber } from '@/utils/currency';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ModernNotification from '@/app/components/shared/ModernNotification';
import { WalletService } from '@/app/(DashboardLayout)/apps/wallet/services/walletService';
import {
  WalletCategory,
  WalletCreateRequest,
  WalletFormErrors,
  WalletNotificationState
} from '../../../../../types/apps/wallet';

const TransactionForm: React.FC = () => {
  // Categories state - simplified like working component
  const [categories, setCategories] = useState<WalletCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WalletCreateRequest>({
    type: '',
    amount: 0,
    description: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    status: 'Hoàn thành'
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<WalletFormErrors>({});

  // Notification state
  const [notification, setNotification] = useState<WalletNotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Local display state for currency formatting
  const [amountDisplay, setAmountDisplay] = useState<string>('');

  // Sync display when numeric amount changes (e.g., reset or edit)
  useEffect(() => {
    setAmountDisplay(formData.amount ? formatNumberToVn(formData.amount) : '');
  }, [formData.amount]);

  const handleAmountChange = (input: string) => {
    const formatted = formatNumberToVn(input);
    setAmountDisplay(formatted);
    const numeric = parseVnToNumber(formatted);
    handleFieldChange('amount', numeric);
  };

  const normalizeAmountOnBlur = () => {
    setAmountDisplay(formData.amount ? formatNumberToVn(formData.amount) : '');
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Load categories - simplified like working component
  const loadCategories = async () => {
    try {
      console.log('📂 Loading wallet categories for form...');
      const categoriesData = await WalletService.fetchCategories();
      setCategories(categoriesData);
      console.log(`✅ Loaded ${categoriesData.length} categories for form`);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      showNotification(
        `❌ Lỗi khi tải danh mục: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);



  // Handle form field change - simplified like working component
  const handleFieldChange = (field: keyof WalletCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: WalletFormErrors = {};

    if (!formData.type) errors.type = 'Vui lòng chọn loại giao dịch';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Vui lòng nhập số tiền hợp lệ';
    if (!formData.description.trim()) errors.description = 'Vui lòng nhập mô tả';
    if (!formData.categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
    if (!formData.transactionDate) errors.transactionDate = 'Vui lòng chọn ngày';
    if (!formData.status) errors.status = 'Vui lòng chọn trạng thái';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('❌ Vui lòng kiểm tra lại thông tin form', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('💳 Creating new transaction from form...');

      // Prepare data for API
      const apiData = {
        ...formData,
        // Convert amount based on transaction type
        amount: formData.type === 'Chi tiêu' ? -Math.abs(formData.amount) : Math.abs(formData.amount)
      };

      await WalletService.createTransaction(apiData);

      showNotification('✅ Tạo giao dịch thành công!');

      // Reset form
      setFormData({
        type: '',
        amount: 0,
        description: '',
        categoryId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        status: 'Hoàn thành'
      });
      setFormErrors({});

      // Trigger refresh of transaction list (you can use context or props for this)
      window.dispatchEvent(new CustomEvent('walletTransactionCreated'));

    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      showNotification(
        `❌ Lỗi khi tạo giao dịch: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      type: '',
      amount: 0,
      description: '',
      categoryId: '',
      transactionDate: new Date().toISOString().split('T')[0],
      status: 'Hoàn thành'
    });
    setFormErrors({});
  };

  // Simple inline filtering like the working component
  // No need for complex getFilteredCategories function

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Form header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #43A047 100%)',
            px: 3,
            py: 2,
            color: 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ fontSize: 22 }}>✍️</Box>
            <Typography variant="h6" fontWeight={700}>
              Thêm giao dịch mới
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Transaction Type */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!formErrors.type}>
                  <InputLabel>Loại giao dịch *</InputLabel>
                  <Select
                    value={formData.type}
                    label="Loại giao dịch *"
                    onChange={(e) => {
                      handleFieldChange('type', e.target.value);
                      handleFieldChange('categoryId', '');
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Thu nhập">📈 Thu nhập</MenuItem>
                    <MenuItem value="Chi tiêu">📉 Chi tiêu</MenuItem>
                    <MenuItem value="Chuyển khoản">🔄 Chuyển khoản</MenuItem>
                  </Select>
                  {formErrors.type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {formErrors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Số tiền (VND) *"
                  placeholder="1.000.000"
                  value={amountDisplay}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onBlur={normalizeAmountOnBlur}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                  }}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mô tả *"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  placeholder="Nhập mô tả giao dịch..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!formErrors.categoryId}>
                  <InputLabel>Danh mục *</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Danh mục *"
                    onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                    disabled={!formData.type || loading}
                    sx={{ borderRadius: 2 }}
                  >
                    {categories
                      .filter(cat => {
                        if (!formData.type) return true;
                        const directMatch = cat.type === formData.type;
                        if (!directMatch) {
                          const normalizeString = (str: string) => {
                            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
                          };
                          return normalizeString(cat.type) === normalizeString(formData.type);
                        }
                        return directMatch;
                      })
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color
                              }}
                            />
                            {category.name}
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                  {formErrors.categoryId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {formErrors.categoryId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Transaction Date */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ngày *"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => handleFieldChange('transactionDate', e.target.value)}
                  error={!!formErrors.transactionDate}
                  helperText={formErrors.transactionDate}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!formErrors.status}>
                  <InputLabel>Trạng thái *</InputLabel>
                  <Select
                    value={formData.status}
                    label="Trạng thái *"
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Hoàn thành">✅ Hoàn thành</MenuItem>
                    <MenuItem value="Đang chờ">⏳ Đang chờ</MenuItem>
                  </Select>
                  {formErrors.status && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {formErrors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={loading}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #1B5E20 0%, #43A047 100%)',
                      fontWeight: 700,
                      py: 1.2,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 12px rgba(27, 94, 32, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(27, 94, 32, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Đang tạo...' : '💳 Thêm giao dịch'}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                  fullWidth
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  🔄 Xóa form
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Modern unified notification */}
      <ModernNotification
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default TransactionForm;
