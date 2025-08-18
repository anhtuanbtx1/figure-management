'use client';
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Chip
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { IconWallet, IconTrendingUp, IconTrendingDown, IconCalendar } from '@tabler/icons-react';
import { AppState } from '../../../../store/store';
import { setTimePeriod } from '../../../../store/wallet/walletSlice';
import {
  formatCurrencyShort,
  TIME_PERIOD_OPTIONS,
  TimePeriod,
  getTimePeriodLabel,
  getTimePeriodDescription
} from '../../../../types/wallet';

const WalletStats = () => {
  const dispatch = useDispatch();
  const { stats, timePeriod } = useSelector((state: AppState) => state.walletReducer);

  const handleTimePeriodChange = (event: any) => {
    const newTimePeriod = event.target.value as TimePeriod;
    dispatch(setTimePeriod(newTimePeriod));
  };

  const statsData = [
    {
      title: 'Tổng số dư',
      value: stats.totalBalance,
      icon: <IconWallet size={28} />,
      color: stats.totalBalance >= 0 ? '#1976d2' : '#d32f2f',
      bgGradient: stats.totalBalance >= 0
        ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
        : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      iconBg: stats.totalBalance >= 0 ? '#1976d2' : '#d32f2f',
      shadowColor: stats.totalBalance >= 0 ? 'rgba(25, 118, 210, 0.3)' : 'rgba(211, 47, 47, 0.3)',
    },
    {
      title: 'Tổng thu nhập',
      value: stats.totalIncome,
      icon: <IconTrendingUp size={28} />,
      color: '#2e7d32',
      bgGradient: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      iconBg: '#2e7d32',
      shadowColor: 'rgba(46, 125, 50, 0.3)',
    },
    {
      title: 'Tổng chi tiêu',
      value: stats.totalExpense,
      icon: <IconTrendingDown size={28} />,
      color: '#d32f2f',
      bgGradient: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      iconBg: '#d32f2f',
      shadowColor: 'rgba(211, 47, 47, 0.3)',
    },
  ];

  return (
    <Box>
      {/* Time Period Selector */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Thống kê tài chính
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconCalendar size={16} />
            <Typography variant="body2" color="textSecondary">
              {getTimePeriodDescription(timePeriod)}
            </Typography>
          </Stack>
        </Box>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={timePeriod}
            onChange={handleTimePeriodChange}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
            }}
          >
            {TIME_PERIOD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card
            sx={{
              position: 'relative',
              background: stat.bgGradient,
              border: 'none',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${stat.shadowColor}`,
              '&:hover': {
                boxShadow: `0 12px 40px ${stat.shadowColor}`,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: stat.color,
              },
            }}
          >
            <CardContent sx={{ p: 2.5, position: 'relative' }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box flex={1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 0.5,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: stat.color,
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      lineHeight: 1.1,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {formatCurrencyShort(stat.value)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: stat.color,
                        opacity: 0.8,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.7rem'
                      }}
                    >
                      {stat.title === 'Tổng số dư' && (
                        stats.totalBalance >= 0 ? 'Số dư khả dụng' : 'Cần bổ sung'
                      )}
                      {stat.title === 'Tổng thu nhập' && `${stats.transactionCount} giao dịch`}
                      {stat.title === 'Tổng chi tiêu' && `${stats.transactionCount} giao dịch`}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: 'relative',
                    ml: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: stat.iconBg,
                      color: 'white',
                      width: 52,
                      height: 52,
                      boxShadow: `0 6px 20px ${stat.shadowColor}`,
                      '& svg': {
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      },
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  {/* Decorative circle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: stat.color,
                      opacity: 0.2,
                      zIndex: -1,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      </Grid>
    </Box>
  );
};

export default WalletStats;
