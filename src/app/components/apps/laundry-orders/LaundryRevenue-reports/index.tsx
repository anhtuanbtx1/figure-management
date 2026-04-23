"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  useTheme,
} from "@mui/material";
import {
  IconCalendar,
  IconCurrencyDollar,
  IconShoppingCart,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { formatVndText } from "@/utils/currency";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RevenueStats {
  Date?: string;
  Year?: number;
  Week?: number;
  Month?: number;
  WeekStart?: string;
  WeekEnd?: string;
  MonthStart?: string;
  TotalOrders: number;
  CompletedOrders: number;
  PendingOrders: number;
  ProcessingOrders: number;
  CancelledOrders: number;
  TotalRevenue: number;
  CompletedRevenue: number;
  AverageOrderValue: number;
}

const LaundryRevenueReports = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<RevenueStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  
  // Date filters - default to last 30 days
  const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    return {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  };

  const defaultRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);

  const loadRevenueStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        groupBy,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/laundry-orders/revenue-stats?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        console.error("Failed to load revenue stats:", data.message);
      }
    } catch (error) {
      console.error("Error loading revenue stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueStats();
  }, [groupBy]);

  const handleGroupByChange = (
    event: React.MouseEvent<HTMLElement>,
    newGroupBy: "day" | "week" | "month" | null
  ) => {
    if (newGroupBy !== null) {
      setGroupBy(newGroupBy);
    }
  };

  // Calculate summary stats
  const totalRevenue = stats.reduce((sum, s) => sum + s.TotalRevenue, 0);
  const completedRevenue = stats.reduce((sum, s) => sum + s.CompletedRevenue, 0);
  const totalOrders = stats.reduce((sum, s) => sum + s.TotalOrders, 0);
  const completedOrders = stats.reduce((sum, s) => sum + s.CompletedOrders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Format date for display
  const formatDateDisplay = (stat: RevenueStats) => {
    if (groupBy === "day") {
      return new Date(stat.Date!).toLocaleDateString("vi-VN");
    } else if (groupBy === "week") {
      const start = new Date(stat.WeekStart!).toLocaleDateString("vi-VN");
      const end = new Date(stat.WeekEnd!).toLocaleDateString("vi-VN");
      return `Tuần ${stat.Week} (${start} - ${end})`;
    } else {
      return `Tháng ${stat.Month}/${stat.Year}`;
    }
  };

  // Prepare chart data
  const chartCategories = stats.map((s) => formatDateDisplay(s)).reverse();
  const chartTotalRevenue = stats.map((s) => s.TotalRevenue).reverse();
  const chartCompletedRevenue = stats.map((s) => s.CompletedRevenue).reverse();
  const chartTotalOrders = stats.map((s) => s.TotalOrders).reverse();
  const chartCompletedOrders = stats.map((s) => s.CompletedOrders).reverse();

  const revenueChartOptions: any = {
    chart: {
      type: "line",
      toolbar: { show: true },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.text.secondary,
    },
    colors: ["#5D87FF", "#49BEFF"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: chartCategories,
      labels: { 
        rotate: -45,
        style: {
          colors: theme.palette.text.secondary,
        }
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => formatVndText(value),
        style: {
          colors: theme.palette.text.secondary,
        }
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value: number) => formatVndText(value),
      },
    },
    legend: { 
      show: true, 
      position: "top",
      labels: {
        colors: theme.palette.text.primary,
      }
    },
    grid: {
      borderColor: theme.palette.mode === 'dark' ? '#333' : '#e7e7e7',
      strokeDashArray: 5,
    },
  };

  const revenueChartSeries = [
    {
      name: "Tổng doanh thu",
      data: chartTotalRevenue,
    },
    {
      name: "Doanh thu hoàn thành",
      data: chartCompletedRevenue,
    },
  ];

  const ordersChartOptions: any = {
    chart: {
      type: "bar",
      toolbar: { show: true },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.text.secondary,
    },
    colors: ["#13DEB9", "#FA896B"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: chartCategories,
      labels: { 
        rotate: -45,
        style: {
          colors: theme.palette.text.secondary,
        }
      },
    },
    yaxis: {
      title: { 
        text: "Số đơn hàng",
        style: {
          color: theme.palette.text.secondary,
        }
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        }
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value: number) => `${value} đơn`,
      },
    },
    legend: { 
      show: true, 
      position: "top",
      labels: {
        colors: theme.palette.text.primary,
      }
    },
    grid: {
      borderColor: theme.palette.mode === 'dark' ? '#333' : '#e7e7e7',
      strokeDashArray: 5,
    },
  };

  const ordersChartSeries = [
    {
      name: "Tổng đơn hàng",
      data: chartTotalOrders,
    },
    {
      name: "Đơn hoàn thành",
      data: chartCompletedOrders,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Báo cáo thống kê doanh thu</Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ToggleButtonGroup
                value={groupBy}
                exclusive
                onChange={handleGroupByChange}
                size="small"
                fullWidth
              >
                <ToggleButton value="day">Theo ngày</ToggleButton>
                <ToggleButton value="week">Theo tuần</ToggleButton>
                <ToggleButton value="month">Theo tháng</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={loadRevenueStats}
                startIcon={<IconRefresh size={18} />}
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Lọc"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "primary.light", color: "primary.main" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <IconCurrencyDollar size={40} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {formatVndText(totalRevenue)}
                  </Typography>
                  <Typography variant="body2">Tổng doanh thu</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "success.light", color: "success.main" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <IconCheck size={40} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {formatVndText(completedRevenue)}
                  </Typography>
                  <Typography variant="body2">Doanh thu hoàn thành</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "info.light", color: "info.main" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <IconShoppingCart size={40} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {totalOrders} / {completedOrders}
                  </Typography>
                  <Typography variant="body2">Tổng đơn / Hoàn thành</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "warning.light", color: "warning.main" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <IconCalendar size={40} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {formatVndText(averageOrderValue)}
                  </Typography>
                  <Typography variant="body2">Giá trị đơn TB</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Biểu đồ doanh thu
              </Typography>
              <Chart
                options={revenueChartOptions}
                series={revenueChartSeries}
                type="line"
                height={350}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Biểu đồ số đơn hàng
              </Typography>
              <Chart
                options={ordersChartOptions}
                series={ordersChartSeries}
                type="bar"
                height={350}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Chi tiết dữ liệu
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={600}>Thời gian</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Tổng đơn</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Hoàn thành</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Đang xử lý</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Chờ xử lý</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Đã hủy</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Tổng doanh thu</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>DT hoàn thành</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Giá trị TB</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="textSecondary">
                        Không có dữ liệu
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((stat, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography fontSize="14px">
                          {formatDateDisplay(stat)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontSize="14px">{stat.TotalOrders}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={stat.CompletedOrders}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={stat.ProcessingOrders}
                          color="info"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={stat.PendingOrders}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={stat.CancelledOrders}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontSize="14px" fontWeight={600}>
                          {formatVndText(stat.TotalRevenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontSize="14px" color="success.main">
                          {formatVndText(stat.CompletedRevenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontSize="14px">
                          {formatVndText(stat.AverageOrderValue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LaundryRevenueReports;
