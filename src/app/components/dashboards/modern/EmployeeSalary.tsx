"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { useWalletSalaryStats, formatVND, getShortMonthName } from '@/hooks/useWalletSalaryStats';
import DashboardWidgetCard from '../../shared/DashboardWidgetCard';
import SkeletonEmployeeSalaryCard from "../skeleton/EmployeeSalaryCard";
import { Box, Typography, Chip } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';


interface EmployeeSalaryCardProps {
  isLoading ?: boolean;
}


const EmployeeSalary = ({ isLoading: initialLoading }: EmployeeSalaryCardProps) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.grey[100];
  const success = theme.palette.success.main;
  const error = theme.palette.error.main;

  // Fetch salary data from wallet API
  const { data: salaryData, isLoading: dataLoading, error: dataError } = useWalletSalaryStats(12);

  // Combine loading states
  const loading = initialLoading || dataLoading;

  // Prepare chart data from API response
  const monthlyData = salaryData?.monthlyTrend || [];
  const reversedData = [...monthlyData].reverse(); // Reverse to show oldest to newest
  
  // Get current month index for highlighting
  const currentMonthIndex = reversedData.length - 1;

  // Generate colors array - highlight current month
  const chartColors = reversedData.map((_, index) => 
    index === currentMonthIndex ? primary : primarylight
  );

  // Chart options
  const optionscolumnchart: any = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 280,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: chartColors,
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: true,
        endingShape: 'rounded',
        dataLabels: {
          position: 'top'
        }
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val > 0 ? `${(val / 1000000).toFixed(0)}tr` : '';
      },
      offsetY: -20,
      style: {
        fontSize: '10px',
        colors: [theme.palette.text.secondary]
      }
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: reversedData.map(item => getShortMonthName(item.month)),
      axisBorder: {
        show: false,
      },
      labels: {
        style: {
          colors: reversedData.map((_, index) => 
            index === currentMonthIndex ? primary : theme.palette.text.secondary
          ),
          fontSize: '12px',
          fontWeight: reversedData.map((_, index) => 
            index === currentMonthIndex ? 600 : 400
          )
        }
      }
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: function(value: number) {
          return formatVND(value);
        },
        title: {
          formatter: () => 'Lương:'
        }
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const amount = series[seriesIndex][dataPointIndex];
        const month = reversedData[dataPointIndex];
        return '<div class="px-2 py-1">' +
          '<div class="text-xs opacity-70">' + getShortMonthName(month.month) + '</div>' +
          '<div class="font-semibold">' + formatVND(amount) + '</div>' +
          '<div class="text-xs opacity-70">Số giao dịch: ' + month.transactionCount + '</div>' +
          '</div>';
      }
    },
  };

  // Chart series data
  const seriescolumnchart = [
    {
      name: 'Lương',
      data: reversedData.map(item => item.totalSalary),
    },
  ];

  // Calculate display values
  const currentMonthSalary = salaryData?.currentMonth?.totalSalary || 0;
  const currentMonthProfit = salaryData?.currentMonth?.estimatedProfit || 0;
  const salaryTrend = salaryData?.comparison?.trend || 'stable';
  const salaryChangePercent = salaryData?.comparison?.salaryChangePercent || 0;

  return (
    <>
      {
        loading ? (
          <SkeletonEmployeeSalaryCard />
        ) : dataError ? (
          <DashboardWidgetCard
            title="Lương nhân viên"
            subtitle="Không thể tải dữ liệu"
            dataLabel1="Lỗi"
            dataItem1={dataError}
            dataLabel2=""
            dataItem2=""
          >
            <Box height="295px" display="flex" alignItems="center" justifyContent="center">
              <Typography color="error">Không thể tải dữ liệu lương</Typography>
            </Box>
          </DashboardWidgetCard>
        ) : (
          <DashboardWidgetCard
            title="Lương nhân viên"
            subtitle={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">Hàng tháng</Typography>
                {salaryTrend !== 'stable' && (
                  <Chip
                    size="small"
                    icon={salaryTrend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={`${salaryChangePercent > 0 ? '+' : ''}${salaryChangePercent}%`}
                    color={salaryTrend === 'up' ? 'success' : 'error'}
                    variant="outlined"
                  />
                )}
              </Box>
            }
            dataLabel1="Lương tháng này"
            dataItem1={formatVND(currentMonthSalary)}
            dataLabel2="Lợi nhuận ước tính"
            dataItem2={formatVND(currentMonthProfit)}
          >
            <>
              <Box height="295px">
                {reversedData.length > 0 ? (
                  <Chart 
                    options={optionscolumnchart} 
                    series={seriescolumnchart} 
                    type="bar" 
                    height={280} 
                    width={"100%"} 
                  />
                ) : (
                  <Box 
                    height="100%" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                  >
                    <Typography color="textSecondary">
                      Chưa có dữ liệu lương
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          </DashboardWidgetCard>
        )}
    </>
  );
};

export default EmployeeSalary;
