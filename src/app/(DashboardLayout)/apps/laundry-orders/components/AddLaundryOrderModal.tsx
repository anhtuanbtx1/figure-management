"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  IconPlus,
  IconX,
  IconPhone,
  IconUser,
  IconNotes,
  IconCheck,
} from '@tabler/icons-react';

interface LaundryCustomer {
  id: number;
  fullName: string;
  phoneNumber: string;
  notes: string | null;
  totalOrders: number;
  totalSpent: number;
}

interface AddLaundryOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddLaundryOrderModal: React.FC<AddLaundryOrderModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<LaundryCustomer | null>(null);
  const [customerFound, setCustomerFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setPhoneNumber('');
      setFullName('');
      setNotes('');
      setCustomer(null);
      setCustomerFound(false);
      setErrors({});
    }
  }, [open]);

  // Auto search customer when phone number is complete (10-11 digits)
  useEffect(() => {
    const searchCustomer = async () => {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/laundry-customers?phone=${cleanPhone}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            setCustomer(result.data);
            setCustomerFound(true);
            setFullName(result.data.fullName);
            console.log('✅ Tìm thấy khách hàng:', result.data.fullName);
          } else {
            setCustomer(null);
            setCustomerFound(false);
            setFullName('');
            console.log('ℹ️ Chưa có khách hàng với SĐT này');
          }
        } catch (error) {
          console.error('❌ Lỗi tìm kiếm khách hàng:', error);
          setCustomer(null);
          setCustomerFound(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setCustomer(null);
        setCustomerFound(false);
      }
    };

    const timer = setTimeout(searchCustomer, 500);
    return () => clearTimeout(timer);
  }, [phoneNumber]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!cleanPhone) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Tên khách hàng là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    try {
      let customerId = customer?.id;

      // If customer doesn't exist, create new one
      if (!customer) {
        console.log('➕ Tạo khách hàng mới...');
        const createCustomerResponse = await fetch('/api/laundry-customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            phoneNumber: cleanPhone,
            notes: notes.trim() || null,
          }),
        });

        const customerResult = await createCustomerResponse.json();
        
        if (!customerResult.success) {
          throw new Error(customerResult.message || 'Không thể tạo khách hàng');
        }

        customerId = customerResult.data.id;
        console.log('✅ Đã tạo khách hàng mới với ID:', customerId);
      }

      // Create order
      console.log('➕ Tạo đơn hàng...');
      const createOrderResponse = await fetch('/api/laundry-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          customerName: fullName.trim(),
          phoneNumber: cleanPhone,
          totalCost: 0,
          status: 'Pending',
          notes: notes.trim() || null,
        }),
      });

      const orderResult = await createOrderResponse.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Không thể tạo đơn hàng');
      }

      console.log('✅ Đã tạo đơn hàng:', orderResult.data.orderNumber);
      
      // Success notification
      alert(`Đã tạo đơn hàng ${orderResult.data.orderNumber} thành công!`);
      
      onSuccess();
      onClose();

    } catch (error) {
      console.error('❌ Lỗi tạo đơn hàng:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(number));
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers and format nicely
    const cleaned = value.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    // Clear name if phone changes
    if (cleaned.length < 10) {
      setFullName('');
      setCustomer(null);
      setCustomerFound(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <IconPlus size={24} color="#667eea" />
            <Typography variant="h6" fontWeight={700}>
              Tạo đơn hàng giặt ủi mới
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 1 }}
            disabled={isSubmitting}
          >
            <IconX size={20} />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Phone Number */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Số điện thoại *"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              placeholder="VD: 0901234567"
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconPhone size={20} />
                  </InputAdornment>
                ),
                endAdornment: isSearching ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : customerFound ? (
                  <InputAdornment position="end">
                    <Chip 
                      icon={<IconCheck size={16} />} 
                      label="Đã có" 
                      color="success" 
                      size="small" 
                    />
                  </InputAdornment>
                ) : phoneNumber.length >= 10 ? (
                  <InputAdornment position="end">
                    <Chip 
                      label="Khách mới" 
                      color="info" 
                      size="small" 
                    />
                  </InputAdornment>
                ) : null,
              }}
            />
            {customer && (
              <Alert severity="success" sx={{ mt: 1 }} icon={<IconCheck size={20} />}>
                <Typography variant="body2">
                  <strong>{customer.fullName}</strong>
                  {customer.totalOrders > 0 && (
                    <> - Đã có {customer.totalOrders} đơn, tổng: {formatCurrency(customer.totalSpent.toString())} đ</>
                  )}
                </Typography>
              </Alert>
            )}
          </Grid>

          {/* Full Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên khách hàng *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={!!errors.fullName}
              helperText={errors.fullName}
              placeholder="VD: Nguyễn Văn An"
              disabled={customerFound || isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconUser size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Giặt khô, ủi phẳng, giao trước 5h chiều..."
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <IconNotes size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Vui lòng kiểm tra và sửa các lỗi trên form
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            color: 'text.secondary',
          }}
        >
          Hủy
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Đang tạo...
            </>
          ) : (
            'Tạo đơn hàng'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLaundryOrderModal;
