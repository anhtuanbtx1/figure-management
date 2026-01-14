"use client";
import { Typography, Box, Stack, Avatar, Chip, LinearProgress, Tooltip, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconTrendingUp, IconShoppingCart } from '@tabler/icons-react';
import { useToysTotalValue, formatVND, formatNumber } from '@/hooks/useToysTotalValue';
import DashboardCard from '../../shared/DashboardCard';

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

  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;
  const successlight = theme.palette.success.light;

  return (
    <DashboardCard title="Tổng giá trị đồ chơi">
      <>
        {/* Loading State */}
        {showLoading && (
          <Box>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h3" fontWeight="700">
              Đang tải...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Đang tính toán tổng giá trị
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !showLoading && (
          <Box>
            <Typography variant="h3" fontWeight="700" color="textSecondary">
              Lỗi tải dữ liệu
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={1}>
              Không thể tải thông tin tổng giá trị
            </Typography>
            <Chip
              label="Thử lại"
              size="small"
              color="primary"
              onClick={refresh}
            />
          </Box>
        )}

        {/* Success State */}
        {data && !showLoading && !error && (
          <Grid container spacing={3}>
            <Grid item xs={7} sm={7}>
              <Typography variant="h3" fontWeight="700">
                {formattedTotalValue}
              </Typography>
              <Stack direction="row" spacing={1} mt={1} alignItems="center">
                <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
                  <IconTrendingUp width={20} color="#39B69A" />
                </Avatar>
                <Typography variant="subtitle2" fontWeight="600">
                  {formattedTotalCount}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  sản phẩm
                </Typography>
              </Stack>
              <Stack spacing={3} mt={3} direction="row">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}
                  ></Avatar>
                  <Typography variant="subtitle2" color="textSecondary">
                    TB: {formattedAveragePrice}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={5} sm={5}>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Avatar
                  sx={{
                    bgcolor: primarylight,
                    width: 60,
                    height: 60,
                    mb: 1
                  }}
                >
                  <IconShoppingCart size={30} color={primary} />
                </Avatar>
                <Tooltip title={`${progressPercentage.toFixed(1)}% của mục tiêu`}>
                  <Typography variant="h5" fontWeight="600" color="primary">
                    {progressPercentage.toFixed(0)}%
                  </Typography>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        )}
      </>
    </DashboardCard>
  );
};

export default ToysTotalValueCard;

