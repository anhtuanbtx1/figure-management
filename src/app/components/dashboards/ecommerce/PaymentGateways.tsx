'use client'
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Box, Button } from '@mui/material';
import DashboardCard from '../../shared/DashboardCard';


const PaymentGateways = () => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;
  const error = theme.palette.error.main;
  const errorlight = theme.palette.error.light;
  const warning = theme.palette.warning.main;
  const warninglight = theme.palette.warning.light;
  const secondary = theme.palette.success.main;
  const secondarylight = theme.palette.success.light;

  const stats = [
    {
      title: 'Paypal',
      subtitle: 'Thương hiệu lớn',
      price: 6235,
      color: primary,
      lightcolor: primarylight,
      icon: "/images/svgs/icon-paypal.svg",
    },
    {
      title: 'Ví điện tử',
      subtitle: 'Thanh toán hóa đơn',
      price: 345,
      color: secondary,
      lightcolor: secondarylight,
      icon: "/images/svgs/icon-office-bag.svg",
    },
    {
      title: 'Thẻ tín dụng',
      subtitle: 'Hoàn tiền',
      price: 2235,
      color: warning,
      lightcolor: warninglight,
      icon: "/images/svgs/icon-master-card.svg",
    },
    {
      title: 'Hoàn tiền',
      subtitle: 'Thanh toán hóa đơn',
      price: 32,
      color: error,
      lightcolor: errorlight,
      icon: "/images/svgs/icon-pie.svg",
    },
  ];

  return (
    <DashboardCard title="Cổng thanh toán" subtitle="Nền tảng thu nhập">
      <>
        <Stack spacing={3} mt={5}>
          {stats.map((stat, i) => (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
              key={i}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: stat.lightcolor, color: stat.color, width: 40, height: 40 }}
                >
                    <Avatar src={stat.icon} alt={stat.icon} sx={{ width: 24, height: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb="4px">
                    {stat.title}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Stack>
              {stat.price < 400 ? (
                <Typography variant="subtitle2" color="textSecondary" fontWeight="600">
                  -{stat.price.toLocaleString('vi-VN')} VNĐ
                </Typography>
              ) : (
                <Typography variant="subtitle2" fontWeight="600">
                  +{stat.price.toLocaleString('vi-VN')} VNĐ
                </Typography>
              )}
            </Stack>
          ))}
          <Button variant="outlined" color="primary" sx={{mt: "40px !important"}}>
            Xem tất cả giao dịch
          </Button>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default PaymentGateways;
