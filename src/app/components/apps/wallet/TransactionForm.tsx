'use client';
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
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addTransaction, updateTransaction } from '../../../../store/wallet/walletSlice';
import {
  TransactionFormData,
  TransactionType,
  TransactionStatus,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  getCategoriesByType,
  Transaction,
} from '../../../../types/wallet';

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  onEditComplete?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  editingTransaction,
  onEditComplete,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
  });
  const [errors, setErrors] = useState<Partial<TransactionFormData>>({});
  const [success, setSuccess] = useState(false);

  // Load editing transaction data
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description,
        category: editingTransaction.category,
        date: editingTransaction.date,
        status: editingTransaction.status,
      });
    }
  }, [editingTransaction]);

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Reset category when type changes
    if (field === 'type') {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TransactionFormData> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingTransaction) {
        dispatch(updateTransaction({
          id: editingTransaction.id,
          data: formData,
        }));
      } else {
        dispatch(addTransaction(formData));
      }

      setSuccess(true);
      
      if (!editingTransaction) {
        // Reset form for new transaction
        setFormData({
          type: 'expense',
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
        });
      }

      if (onEditComplete) {
        onEditComplete();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const categories = getCategoriesByType(formData.type as TransactionType);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {editingTransaction ? 'Cập nhật giao dịch thành công!' : 'Thêm giao dịch thành công!'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Loại giao dịch</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại giao dịch"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số tiền (VNĐ)"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  label="Danh mục"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ngày"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {TRANSACTION_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {editingTransaction ? 'Cập nhật' : 'Thêm giao dịch'}
                </Button>
                {editingTransaction && onEditComplete && (
                  <Button
                    variant="outlined"
                    onClick={onEditComplete}
                    fullWidth
                  >
                    Hủy
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
