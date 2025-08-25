"use client";
import { Card, CardContent, Typography, Box, Stack, Avatar, Chip, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconCurrencyDollar, IconTrendingUp, IconCalendar } from '@tabler/icons-react';
import { useWalletSalaryStats, formatVND } from '@/hooks/useWalletSalaryStats';

interface YearlySalaryCardProps {
  isLoading?: boolean;
}

const YearlySalaryCard = ({ isLoading: initialLoading }: YearlySalaryCardProps) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  
  // Fetch salary data
  const { data: salaryData, isLoading: dataLoading, error: dataError } = useWalletSalaryStats(12); // Get 12 months data
  
  const loading = initialLoading || dataLoading;
  
  // Debug log
  console.log('YearlySalaryCard Debug:', {
    salaryData,
    dataLoading,
    dataError,
    yearToDate: salaryData?.yearToDate
  });
  
  // Extract year-to-date data from API
  const yearlyTotal = salaryData?.yearToDate?.totalSalary || 0;
  const monthsWithSalary = salaryData?.yearToDate?.monthsWithSalary || 0;
  const avgMonthlySalary = salaryData?.yearToDate?.avgMonthlySalary || 0;
  const formattedTotal = salaryData?.yearToDate?.formattedTotal || '0 triệu VNĐ';
  const currentYear = salaryData?.yearToDate?.year || new Date().getFullYear();
  
  // Calculate progress (assuming 12 months target)
  const progressPercent = (monthsWithSalary / 12) * 100;
  
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                Bảng lương
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Năm {currentYear}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 48,
                height: 48
              }}
            >
              <IconCurrencyDollar size={24} />
            </Avatar>
          </Box>
          
          {/* Main Amount */}
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              {formattedTotal}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Tổng thu nhập từ lương
            </Typography>
          </Box>
          
          {/* Stats Row */}
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<IconCalendar size={16} />}
              label={`${monthsWithSalary} tháng`}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
              size="small"
            />
            <Chip
              icon={<IconTrendingUp size={16} />}
              label={`TB: ${(avgMonthlySalary / 1000000).toFixed(1)}tr/tháng`}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
              size="small"
            />
          </Stack>
          
          {/* Progress */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Tiến độ năm
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {monthsWithSalary}/12 tháng
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                  borderRadius: 4
                }
              }}
            />
          </Box>
        </Stack>
        
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default YearlySalaryCard;
