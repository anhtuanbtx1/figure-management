"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  IconPlus,
  IconX,
  IconUser,
  IconCurrencyDollar,
  IconNotes,
  IconEdit,
} from '@tabler/icons-react';

import { AddGuestModalProps, GuestCreateRequest, GuestStatus } from '../../../types/apps/eventGuest';

const AddGuestModal: React.FC<AddGuestModalProps> = ({
  open,
  onClose,
  onSubmit,
  editGuest,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [formData, setFormData] = useState<GuestCreateRequest>({
    fullName: '',
    unit: '',
    numberOfPeople: 1,
    status: GuestStatus.PENDING,
    contributionAmount: 0,
    relationship: null,
    notes: '',
  });

  // Reset form when modal opens/closes or editGuest changes
  useEffect(() => {
    console.log('🔄 Modal useEffect triggered:', { open, editGuest: editGuest?.fullName });
    if (open) {
      if (editGuest) {
        const predefinedUnits = ['OTS', 'Bạn bè', 'Eximbank', 'Bên nội', 'Bên ngoại', 'Bạn bố', 'Bạn mẹ', 'Bên vợ'];
        const isCustomUnit = !predefinedUnits.includes(editGuest.unit);

        console.log('📝 Setting edit guest data:', {
          unit: editGuest.unit,
          isCustomUnit,
          predefinedUnits
        });

        setFormData({
          fullName: editGuest.fullName,
          unit: editGuest.unit,
          numberOfPeople: editGuest.numberOfPeople,
          status: editGuest.status,
          contributionAmount: editGuest.contributionAmount,
          relationship: editGuest.relationship,
          notes: editGuest.notes,
        });
        setShowCustomUnit(isCustomUnit);
      } else {
        console.log('📝 Setting new guest data');
        setFormData({
          fullName: '',
          unit: '',
          numberOfPeople: 1,
          status: GuestStatus.PENDING,
          contributionAmount: 0,
          relationship: null,
          notes: '',
        });
        setShowCustomUnit(false);
      }
      setErrors({});
    }
  }, [open, editGuest]);

  const handleInputChange = (field: keyof GuestCreateRequest, value: any) => {
    console.log(`🔄 handleInputChange: ${field} = ${value}`);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('📝 New form data:', newData);
      return newData;
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.unit || !formData.unit.trim()) {
      newErrors.unit = 'Vui lòng chọn đơn vị';
    }

    if (formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Số người phải lớn hơn 0';
    }

    if (formData.contributionAmount < 0) {
      newErrors.contributionAmount = 'Số tiền không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🚀 handleSubmit called with formData:', formData);
    if (validateForm()) {
      console.log('✅ Form validation passed, submitting...');
      onSubmit(formData);
    } else {
      console.log('❌ Form validation failed, errors:', errors);
    }
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(Number(number));
  };

  const handleCurrencyChange = (value: string) => {
    const number = value.replace(/\D/g, '');
    handleInputChange('contributionAmount', Number(number));
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
              {editGuest ? <IconEdit size={24} color="#667eea" /> : <IconPlus size={24} color="#667eea" />}
              <Typography variant="h6" fontWeight={700}>
                {editGuest ? 'Chỉnh sửa khách mời' : 'Thêm khách mời mới'}
              </Typography>
            </Box>
            <Button
              onClick={onClose}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <IconX size={20} />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Full Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên *"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={!!errors.fullName}
                helperText={errors.fullName}
                placeholder="VD: Nguyễn Văn An"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconUser size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Unit */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.unit}>
                <InputLabel>Đơn vị *</InputLabel>
                <Select
                  value={showCustomUnit ? 'custom' : (formData.unit || '')}
                  label="Đơn vị *"
                  onChange={(e) => {
                    const selectedValue = e.target.value as string;
                    console.log('🔄 Unit selected:', selectedValue);

                    if (selectedValue === 'custom') {
                      setShowCustomUnit(true);
                      handleInputChange('unit', '');
                    } else {
                      setShowCustomUnit(false);
                      handleInputChange('unit', selectedValue);
                      console.log('✅ Unit set to:', selectedValue);
                    }
                  }}
                >
                  <MenuItem value="OTS">OTS</MenuItem>
                  <MenuItem value="Bạn bè">Bạn bè</MenuItem>
                  <MenuItem value="Eximbank">Eximbank</MenuItem>
                   <MenuItem value="Bên vợ">Bên vợ</MenuItem>
                  <MenuItem value="Bên nội">Bên nội</MenuItem>
                  <MenuItem value="Bên ngoại">Bên ngoại</MenuItem>
                  <MenuItem value="Bạn bố">Bạn bố</MenuItem>
                  <MenuItem value="Bạn mẹ">Bạn mẹ</MenuItem>
                  <MenuItem value="custom">Khác (nhập tùy chỉnh)</MenuItem>
                </Select>
                {errors.unit && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.unit}
                  </Typography>
                )}
              </FormControl>

              {/* Custom Unit Input */}
              {showCustomUnit && (
                <TextField
                  fullWidth
                  label="Nhập đơn vị tùy chỉnh"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder="VD: Công ty ABC, Trường XYZ..."
                  sx={{ mt: 2 }}
                  size="small"
                />
              )}
            </Grid>

            {/* Number of People */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số người *"
                type="number"
                value={formData.numberOfPeople}
                onChange={(e) => handleInputChange('numberOfPeople', parseInt(e.target.value) || 1)}
                error={!!errors.numberOfPeople}
                helperText={errors.numberOfPeople}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            {/* Relationship */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mối quan hệ"
                value={formData.relationship || ''}
                onChange={(e) => handleInputChange('relationship', e.target.value || null)}
                placeholder="VD: Bạn thân, Đồng nghiệp, Họ hàng"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Trạng thái tham gia *</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái tham gia *"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value={GuestStatus.CONFIRMED}>Đã xác nhận</MenuItem>
                  <MenuItem value={GuestStatus.PENDING}>Chờ phản hồi</MenuItem>
                  <MenuItem value={GuestStatus.DECLINED}>Từ chối</MenuItem>
                </Select>
                {errors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Contribution Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số tiền đóng góp (VND)"
                value={formData.contributionAmount > 0 ? formatCurrency(formData.contributionAmount.toString()) : ''}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                error={!!errors.contributionAmount}
                helperText={errors.contributionAmount || 'Nhập 0 nếu chưa đóng góp'}
                placeholder="VD: 1,000,000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCurrencyDollar size={20} />
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
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="VD: Khách VIP, cần chỗ ngồi ưu tiên..."
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
            {editGuest ? 'Cập nhật khách mời' : 'Thêm khách mời'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default AddGuestModal;
