"use client";
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import { IconRefresh, IconAlertTriangle } from '@tabler/icons-react';

interface LoadingFallbackProps {
  categoriesLoading: boolean;
  brandsLoading: boolean;
  toysLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  categoriesLoading,
  brandsLoading,
  toysLoading,
  hasError,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const isLoading = categoriesLoading || brandsLoading || toysLoading;
  const progress = [
    !categoriesLoading,
    !brandsLoading,
    !toysLoading,
  ].filter(Boolean).length;
  const totalSteps = 3;
  const progressPercentage = (progress / totalSteps) * 100;

  if (!isLoading && !hasError) {
    return null; // Don't show anything when everything is loaded
  }

  return (
    <Paper 
      sx={{ 
        p: 4, 
        mb: 3, 
        textAlign: 'center',
        bgcolor: hasError ? 'error.50' : 'primary.50',
        border: '1px solid',
        borderColor: hasError ? 'error.200' : 'primary.200',
      }}
    >
      {hasError ? (
        // Error state
        <Box>
          <IconAlertTriangle size={48} color="#f44336" style={{ marginBottom: 16 }} />
          
          <Typography variant="h6" gutterBottom color="error.main">
            Lỗi tải dữ liệu
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Không thể tải danh mục và thương hiệu. Vui lòng thử lại.
            {retryCount > 0 && ` (Lần thử: ${retryCount}/${maxRetries})`}
          </Typography>
          
          <Button
            variant="contained"
            onClick={onRetry}
            startIcon={<IconRefresh size={18} />}
            sx={{ mt: 1 }}
          >
            Thử lại
          </Button>
        </Box>
      ) : (
        // Loading state
        <Box>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Đang tải dữ liệu...
          </Typography>
          
          <Box sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress}/{totalSteps} bước hoàn thành ({Math.round(progressPercentage)}%)
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'left', maxWidth: 300, mx: 'auto' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Box component="span" sx={{ 
                color: categoriesLoading ? 'text.secondary' : 'success.main',
                fontWeight: categoriesLoading ? 400 : 600
              }}>
                {categoriesLoading ? '⏳' : '✅'} Đang tải danh mục...
              </Box>
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Box component="span" sx={{ 
                color: brandsLoading ? 'text.secondary' : 'success.main',
                fontWeight: brandsLoading ? 400 : 600
              }}>
                {brandsLoading ? '⏳' : '✅'} Đang tải thương hiệu...
              </Box>
            </Typography>
            
            <Typography variant="body2">
              <Box component="span" sx={{ 
                color: toysLoading ? 'text.secondary' : 'success.main',
                fontWeight: toysLoading ? 400 : 600
              }}>
                {toysLoading ? '⏳' : '✅'} Đang tải đồ chơi...
              </Box>
            </Typography>
          </Box>
          
          {retryCount > 0 && (
            <Alert severity="info" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
              Đang thử lại... (Lần {retryCount}/{maxRetries})
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default LoadingFallback;
