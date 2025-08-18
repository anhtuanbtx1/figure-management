"use client";
import React, { useState, useEffect } from 'react';
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
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thêm giao dịch mới
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Transaction Type */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!formErrors.type}>
                  <InputLabel>Loại giao dịch *</InputLabel>
                  <Select
                    value={formData.type}
                    label="Loại giao dịch *"
                    onChange={(e) => {
                      handleFieldChange('type', e.target.value);
                      // Reset category when type changes
                      handleFieldChange('categoryId', '');
                    }}
                  >
                    <MenuItem value="Thu nhập">Thu nhập</MenuItem>
                    <MenuItem value="Chi tiêu">Chi tiêu</MenuItem>
                    <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
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
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  InputProps={{
                    inputProps: { min: 0, step: 1000 }
                  }}
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
                />
              </Grid>

              {/* Category - Using Working Pattern from WalletTransactionList */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!formErrors.categoryId}>
                  <InputLabel>Danh mục *</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Danh mục *"
                    onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                    disabled={!formData.type || loading}
                  >
                    {categories
                      .filter(cat => {
                        if (!formData.type) return true;

                        // Direct match should work now that database encoding is fixed
                        const directMatch = cat.type === formData.type;

                        // Fallback: normalize strings for comparison to handle any remaining encoding issues
                        if (!directMatch) {
                          const normalizeString = (str: string) => {
                            return str
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                              .toLowerCase()
                              .trim();
                          };

                          const categoryType = normalizeString(cat.type);
                          const formType = normalizeString(formData.type);
                          return categoryType === formType;
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
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                  >
                    <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                    <MenuItem value="Đang chờ">Đang chờ</MenuItem>
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
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Đang tạo...' : 'Thêm giao dịch'}
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
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TransactionForm;
