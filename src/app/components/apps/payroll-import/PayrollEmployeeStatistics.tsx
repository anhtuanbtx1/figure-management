"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconChartBar,
  IconSearch,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import PayrollService, {
  EmployeeSalaryStatisticsItem,
} from "@/app/(DashboardLayout)/apps/payroll/services/payrollService";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const formatPayrollPeriod = (value: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const PayrollEmployeeStatistics = () => {
  const theme = useTheme();
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeNameQuery, setEmployeeNameQuery] = useState("");
  const [items, setItems] = useState<EmployeeSalaryStatisticsItem[]>([]);
  const [employeeName, setEmployeeName] = useState("");
  const [totalMonths, setTotalMonths] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);
  const [latestSalary, setLatestSalary] = useState(0);
  const [highestSalary, setHighestSalary] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!employeeCode.trim() && !employeeNameQuery.trim()) {
      setErrorMessage("Vui lòng nhập mã hoặc tên nhân viên để xem dashboard lương.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const result = await PayrollService.getEmployeeSalaryStatistics({
        employeeCode: employeeCode.trim(),
        employeeName: employeeNameQuery.trim(),
      });
      setItems(result.items);
      setEmployeeName(result.employeeName);
      setTotalMonths(result.totalMonths);
      setTotalSalary(result.totalSalary);
      setAverageSalary(result.averageSalary);
      setLatestSalary(result.latestSalary);
      setHighestSalary(result.highestSalary);
      setMessage(result.message);
    } catch (error: any) {
      setItems([]);
      setEmployeeName("");
      setTotalMonths(0);
      setTotalSalary(0);
      setAverageSalary(0);
      setLatestSalary(0);
      setHighestSalary(0);
      setErrorMessage(error?.message || "Không thể lấy thống kê lương nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = useMemo<ApexOptions>(() => {
    return {
      chart: {
        type: "bar" as const,
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: "#adb0bb",
        toolbar: { show: false },
        height: 320,
      },
      colors: [theme.palette.primary.main],
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "42%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: items.map((item) => formatPayrollPeriod(item.payrollPeriod)),
      },
      yaxis: {
        labels: {
          formatter: (value: number) => formatCurrency(value),
        },
      },
      tooltip: {
        theme: theme.palette.mode === "dark" ? "dark" : "light",
        y: {
          formatter: (value: number) => `${formatCurrency(value)} VND`,
        },
      },
      grid: {
        borderColor: theme.palette.divider,
      },
    };
  }, [items, theme]);

  const chartSeries = useMemo(() => {
    return [
      {
        name: "Lương",
        data: items.map((item) => item.salary),
      },
    ];
  }, [items]);

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          borderRadius: 3,
          px: { xs: 2.5, md: 4 },
          py: { xs: 3, md: 3.5 },
          background: "linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #60a5fa 100%)",
          color: "common.white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<IconChartBar size={16} />}
            label="Dashboard lương theo tháng"
            sx={{
              width: "fit-content",
              bgcolor: "rgba(255,255,255,0.16)",
              color: "common.white",
              "& .MuiChip-icon": { color: "common.white" },
            }}
          />
          <Typography variant="h4" fontWeight={700}>
            Thống kê lương của 1 nhân viên
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 760, opacity: 0.9 }}>
            Nhập mã hoặc tên nhân viên để xem lịch sử lương theo tháng, tổng quỹ lương và xu hướng lương trên dashboard.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Tra cứu theo mã hoặc tên nhân viên
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <CustomTextField
              fullWidth
              placeholder="Nhập mã nhân viên, ví dụ: 009"
              value={employeeCode}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmployeeCode(event.target.value)}
            />
            <CustomTextField
              fullWidth
              placeholder="Hoặc nhập tên nhân viên, ví dụ: Nguyễn Văn A"
              value={employeeNameQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmployeeNameQuery(event.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconSearch size={18} />}
              sx={{ minWidth: 180 }}
            >
              {loading ? "Đang thống kê..." : "Xem dashboard"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {message ? <Alert severity="info">{message}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {items.length > 0 ? (
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <IconUser size={18} />
                <Typography variant="subtitle2" color="text.secondary">
                  Nhân viên
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700}>{employeeName || "Chưa có tên"}</Typography>
              <Typography variant="body2" color="text.secondary">Mã: {employeeCode.trim()}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tổng số tháng có dữ liệu
              </Typography>
              <Typography variant="h4" fontWeight={700}>{totalMonths}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lương tháng gần nhất
              </Typography>
              <Typography variant="h4" fontWeight={700}>{formatCurrency(latestSalary)}</Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <IconWallet size={18} />
                <Typography variant="subtitle2" color="text.secondary">
                  Tổng lương đã ghi nhận
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700}>{formatCurrency(totalSalary)}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lương trung bình / tháng
              </Typography>
              <Typography variant="h4" fontWeight={700}>{formatCurrency(averageSalary)}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Mức lương cao nhất
              </Typography>
              <Typography variant="h4" fontWeight={700}>{formatCurrency(highestSalary)}</Typography>
            </Box>
          </Stack>

          <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Biểu đồ lương theo tháng
              </Typography>
              <Divider />
              <Box className="rounded-bars">
                <Chart options={chartOptions} series={chartSeries} type="bar" height="320px" width="100%" />
              </Box>
            </Stack>
          </Box>

          <TableContainer
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Tháng lương</TableCell>
                  <TableCell align="right">Lương</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.employeeCode}-${item.payrollPeriod}`} hover>
                    <TableCell>{formatPayrollPeriod(item.payrollPeriod)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default PayrollEmployeeStatistics;
