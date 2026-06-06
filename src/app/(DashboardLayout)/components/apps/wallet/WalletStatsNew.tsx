'use client';
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  Chip,
  LinearProgress,
  Zoom,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  Receipt as TransactionIcon,
  TrendingFlat as TrendIcon,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { WalletService } from '@/app/(DashboardLayout)/apps/wallet/services/walletService';
import WalletDashboardFilters from './WalletDashboardFilters';
import {
  WalletDashboardData,
  WalletDashboardFilters as FilterType,
  WalletDashboardSummary,
} from '../../../../../types/apps/wallet';

const WalletStatsNew = () => {
  const [dashboardData, setDashboardData] = useState<WalletDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      dateFrom: startOfMonth.toISOString(),
      dateTo: now.toISOString(),
      categoryId: '',
      type: '',
      status: '',
      dateRangeType: 'month',
      yearMonth: '',
      year: '',
    };
  });

  const loadDashboardData = async (currentFilters = filters) => {
    try {
      setLoading(true);
      const data = await WalletService.getDashboard(
        currentFilters.dateFrom,
        currentFilters.dateTo,
        {
          categoryId: currentFilters.categoryId,
          type: currentFilters.type,
          status: currentFilters.status,
          dateRangeType: currentFilters.dateRangeType,
          yearMonth: currentFilters.yearMonth,
          year: currentFilters.year,
        }
      );
      setDashboardData(data);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('walletTransactionCreated', handleRefresh);
    window.addEventListener('walletTransactionDeleted', handleRefresh);
    return () => {
      window.removeEventListener('walletTransactionCreated', handleRefresh);
      window.removeEventListener('walletTransactionDeleted', handleRefresh);
    };
  }, []);

  const handleFiltersChange = (newFilters: FilterType) => setFilters(newFilters);
  const handleApplyFilters = () => loadDashboardData(filters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0 as number,
      maximumFractionDigits: 0 as number,
    }).format(amount);
  };

  const getStatsData = () => {
    if (!dashboardData) return [];
    const { summary, dateRangeComparison } = dashboardData;

    return [
      {
        title: 'Tổng thu nhập',
        subtitle: 'Giao dịch hoàn thành',
        value: formatCurrency(summary.totalIncome),
        icon: IncomeIcon,
        color: '#2E7D32',
        gradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        iconBg: '#2E7D32',
        trend: dateRangeComparison.monthly.change,
        trendLabel: 'so với tháng trước',
        emoji: '📈',
      },
      {
        title: 'Tổng chi tiêu',
        subtitle: 'Giao dịch hoàn thành',
        value: formatCurrency(summary.totalExpense),
        icon: ExpenseIcon,
        color: '#C62828',
        gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
        iconBg: '#C62828',
        trend: dateRangeComparison.monthly.change,
        trendLabel: 'so với tháng trước',
        emoji: '📉',
      },
      {
        title: 'Số dư ròng',
        subtitle: 'Thu nhập - Chi tiêu',
        value: formatCurrency(summary.netBalance),
        icon: BalanceIcon,
        color: summary.netBalance >= 0 ? '#1565C0' : '#E65100',
        gradient: summary.netBalance >= 0
          ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
          : 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        iconBg: summary.netBalance >= 0 ? '#1565C0' : '#E65100',
        trend: summary.netBalance >= 0 ? 1 : -1,
        trendLabel: summary.netBalance >= 0 ? 'Dương' : 'Âm',
        emoji: summary.netBalance >= 0 ? '💰' : '⚠️',
      },
      {
        title: 'Tổng giao dịch',
        subtitle: `${summary.completedTransactions} hoàn thành, ${summary.pendingTransactions} chờ`,
        value: summary.totalTransactions.toString(),
        icon: TransactionIcon,
        color: '#6A1B9A',
        gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        iconBg: '#6A1B9A',
        trend: dateRangeComparison.monthly.change,
        trendLabel: 'so với tháng trước',
        emoji: '🧾',
      },
    ];
  };

  const statsData = getStatsData();

  return (
    <Box>
      {/* Dashboard Filters */}
      <Box mb={3}>
        <WalletDashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
        />
      </Box>

      {/* Loading State */}
      {loading && (
        <Box mb={2}>
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: 2,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #2E7D32, #66BB6A, #2E7D32)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              },
            }}
          />
        </Box>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        {loading ? (
          [1, 2, 3, 4].map((index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 3 }} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="80%" height={28} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Zoom in style={{ transitionDelay: `${index * 80}ms` }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 32px ${stat.color}18`,
                      borderColor: `${stat.color}40`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Box display="flex" alignItems="center" flex={1} gap={2}>
                        <Avatar
                          sx={{
                            background: stat.gradient,
                            color: stat.color,
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            fontSize: 28,
                            transition: 'all 0.35s ease',
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                            },
                          }}
                        >
                          {stat.emoji}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="h5" component="div" sx={{ fontWeight: 800, mb: 0.5, color: stat.color }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Trend indicator */}
                      {stat.trend !== undefined && (
                        <Box textAlign="right">
                          <Chip
                            icon={
                              stat.trend > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> :
                                stat.trend < 0 ? <TrendingDown sx={{ fontSize: 16 }} /> : <TrendIcon sx={{ fontSize: 16 }} />
                            }
                            label={typeof stat.trend === 'number' && stat.trend !== 1 && stat.trend !== -1
                              ? stat.trend.toString()
                              : stat.trendLabel
                            }
                            size="small"
                            color={stat.trend > 0 ? 'success' : stat.trend < 0 ? 'error' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  {/* Watermark */}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -8,
                      bottom: -8,
                      fontSize: 64,
                      opacity: 0.04,
                      pointerEvents: 'none',
                    }}
                  >
                    {stat.emoji}
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          ))
        )}
      </Grid>

    </Box>
  );
};

export default WalletStatsNew;

