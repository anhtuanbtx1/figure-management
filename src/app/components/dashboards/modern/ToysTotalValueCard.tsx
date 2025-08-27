"use client";
import { Card, CardContent, Typography, Box, Stack, Avatar, Chip, LinearProgress, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconCurrencyDollar, IconTrendingUp, IconToy, IconShoppingCart } from '@tabler/icons-react';
import { useToysTotalValue, formatVND, formatNumber } from '@/hooks/useToysTotalValue';

interface ToysTotalValueCardProps {
  isLoading?: boolean;
}

const ToysTotalValueCard = ({ isLoading = false }: ToysTotalValueCardProps) => {
  const theme = useTheme();
  const { data, loading, error, refresh } = useToysTotalValue();

  // Show loading state
  const showLoading = isLoading || loading;

  // Handle error state
  if (error && !showLoading) {
    console.error('ToysTotalValueCard error:', error);
  }

  // Calculate display values
  const totalValue = data?.totalValue || 0;
  const totalCount = data?.totalCount || 0;
  const averagePrice = data?.averagePrice || 0;

  // Format values for display
  const formattedTotalValue = formatVND(totalValue);
  const formattedAveragePrice = formatVND(averagePrice);
  const formattedTotalCount = formatNumber(totalCount);

  // Calculate progress percentage (example: based on a target of 100M VND)
  const targetValue = 100000000; // 100 million VND
  const progressPercentage = Math.min((totalValue / targetValue) * 100, 100);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                Tổng giá trị đồ chơi
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Báo cáo thống kê tổng tiền
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 48,
                height: 48
              }}
            >
              <IconShoppingCart size={24} />
            </Avatar>
          </Box>
          
          {/* Loading State */}
          {showLoading && (
            <Box>
              <LinearProgress 
                sx={{ 
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'rgba(255, 255, 255, 0.8)'
                  }
                }} 
              />
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                Đang tải...
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Đang tính toán tổng giá trị
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && !showLoading && (
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                Lỗi tải dữ liệu
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Không thể tải thông tin tổng giá trị
              </Typography>
              <Chip 
                label="Thử lại" 
                size="small" 
                onClick={refresh}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              />
            </Box>
          )}

          {/* Success State */}
          {data && !showLoading && !error && (
            <>
              {/* Main Amount */}
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  {formattedTotalValue}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng giá trị {formattedTotalCount} sản phẩm
                </Typography>
              </Box>

              {/* Statistics */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Box flex={1}>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Giá trung bình
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formattedAveragePrice}
                  </Typography>
                </Box>
                
                <Tooltip title={`${progressPercentage.toFixed(1)}% của mục tiêu ${formatVND(targetValue)}`}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 32, height: 32, mr: 1 }}>
                      <IconTrendingUp size={16} />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {progressPercentage.toFixed(0)}%
                    </Typography>
                  </Box>
                </Tooltip>
              </Stack>

              {/* Progress Bar */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Tiến độ mục tiêu
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    {formatVND(targetValue)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  sx={{ 
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 3
                    }
                  }} 
                />
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ToysTotalValueCard;
