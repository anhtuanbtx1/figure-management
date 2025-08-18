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
  Divider,
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  Receipt as TransactionIcon,
  Pending as PendingIcon,
  CheckCircle as CompletedIcon,
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

  // Load comprehensive dashboard statistics with filters
  const loadDashboardData = async (currentFilters = filters) => {
    try {
      setLoading(true);
      console.log('📊 Loading comprehensive wallet dashboard...', currentFilters);

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
      console.log('✅ Loaded comprehensive dashboard data:', data);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen for transaction changes to refresh dashboard
  useEffect(() => {
    const handleTransactionCreated = () => {
      console.log('🔄 Transaction created, refreshing dashboard...');
      loadDashboardData();
    };

    const handleTransactionDeleted = () => {
      console.log('🔄 Transaction deleted, refreshing dashboard...');
      loadDashboardData();
    };

    window.addEventListener('walletTransactionCreated', handleTransactionCreated);
    window.addEventListener('walletTransactionDeleted', handleTransactionDeleted);

    return () => {
      window.removeEventListener('walletTransactionCreated', handleTransactionCreated);
      window.removeEventListener('walletTransactionDeleted', handleTransactionDeleted);
    };
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  // Apply filters and reload data
  const handleApplyFilters = () => {
    loadDashboardData(filters);
  };

  // Format currency with proper Vietnamese formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Get stats data with comprehensive information
  const getStatsData = () => {
    if (!dashboardData) return [];

    const { summary, dateRangeComparison } = dashboardData;

    return [
      {
        title: 'Tổng thu nhập',
        subtitle: 'Chỉ giao dịch hoàn thành',
        value: formatCurrency(summary.totalIncome),
        icon: IncomeIcon,
        color: '#4CAF50',
        bgColor: '#E8F5E8',
        trend: dateRangeComparison.monthly.change,
        trendLabel: 'so với tháng trước',
      },
      {
        title: 'Tổng chi tiêu',
        subtitle: 'Chỉ giao dịch hoàn thành',
        value: formatCurrency(summary.totalExpense),
        icon: ExpenseIcon,
        color: '#F44336',
        bgColor: '#FFEBEE',
        trend: dateRangeComparison.monthly.change,
        trendLabel: 'so với tháng trước',
      },
      {
        title: 'Số dư ròng',
        subtitle: 'Thu nhập - Chi tiêu',
        value: formatCurrency(summary.netBalance),
        icon: BalanceIcon,
        color: summary.netBalance >= 0 ? '#2196F3' : '#FF9800',
        bgColor: summary.netBalance >= 0 ? '#E3F2FD' : '#FFF3E0',
        trend: summary.netBalance >= 0 ? 1 : -1,
        trendLabel: summary.netBalance >= 0 ? 'Dương' : 'Âm',
      },
      {
        title: 'Tổng giao dịch',
        subtitle: `${summary.completedTransactions} hoàn thành, ${summary.pendingTransactions} đang chờ`,
        value: summary.totalTransactions.toString(),
        icon: TransactionIcon,
        color: '#9C27B0',
        bgColor: '#F3E5F5',
        trend: dateRangeComparison.monthly.change,
        trendLabel: 'so với tháng trước',
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
          <LinearProgress />
        </Box>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeleton
          [1, 2, 3, 4].map((index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
                    <CircularProgress size={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          // Actual stats cards
          statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="center" flex={1}>
                      <Avatar
                        sx={{
                          bgcolor: stat.bgColor,
                          color: stat.color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <stat.icon />
                      </Avatar>
                      <Box ml={2} flex={1}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {stat.title}
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
                            stat.trend > 0 ? <TrendingUp /> :
                            stat.trend < 0 ? <TrendingDown /> : <TrendIcon />
                          }
                          label={typeof stat.trend === 'number' && stat.trend !== 1 && stat.trend !== -1
                            ? stat.trend.toString()
                            : stat.trendLabel
                          }
                          size="small"
                          color={stat.trend > 0 ? 'success' : stat.trend < 0 ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Additional Statistics */}
      {dashboardData && !loading && (
        <Box mt={3}>
          <Grid container spacing={3}>
            {/* Transaction Status Breakdown */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trạng thái giao dịch
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <CompletedIcon color="success" />
                    <Typography variant="body2" flex={1}>
                      Hoàn thành: {dashboardData.summary.completedTransactions}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(dashboardData.summary.totalIncome + dashboardData.summary.totalExpense)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PendingIcon color="warning" />
                    <Typography variant="body2" flex={1}>
                      Đang chờ: {dashboardData.summary.pendingTransactions}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Categories */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Danh mục hàng đầu
                  </Typography>
                  {dashboardData.topCategories.slice(0, 3).map((category, index) => (
                    <Box key={category.categoryId} display="flex" alignItems="center" gap={2} mb={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: category.categoryColor,
                        }}
                      />
                      <Typography variant="body2" flex={1}>
                        {category.categoryName}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(category.completedAmount)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default WalletStatsNew;
