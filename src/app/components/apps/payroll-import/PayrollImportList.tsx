"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import {
  IconArrowUpRight,
  IconChecklist,
  IconCoin,
  IconRefresh,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import PayrollService, {
  PayrollListRow,
} from "@/app/(DashboardLayout)/apps/payroll/services/payrollService";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const formatPayrollPeriod = (value: string) => {
  if (!value) {
    return "Chưa có dữ liệu";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
  }).format(date);
};

const PayrollImportList = () => {
  const [codeKeyword, setCodeKeyword] = useState("");
  const [nameKeyword, setNameKeyword] = useState("");
  const [salaryKeyword, setSalaryKeyword] = useState("");
  const [payrollPeriodKeyword, setPayrollPeriodKeyword] = useState("");
  const [rows, setRows] = useState<PayrollListRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPayrolls = async (nextPage = page, nextRowsPerPage = rowsPerPage) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await PayrollService.getPayrollList({
        code: codeKeyword,
        name: nameKeyword,
        salary: salaryKeyword,
        payrollPeriod: payrollPeriodKeyword,
        page: nextPage + 1,
        pageSize: nextRowsPerPage,
      });

      setRows(result.rows);
      setTotalRows(result.totalRows);
      setTotalSalary(result.totalSalary);
      setPage(Math.max(0, result.page - 1));
      setRowsPerPage(result.pageSize);
    } catch (error: any) {
      setRows([]);
      setTotalRows(0);
      setTotalSalary(0);
      setErrorMessage(error?.message || "Không thể tải danh sách bảng lương từ database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPayrolls(0, rowsPerPage);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [codeKeyword, nameKeyword, salaryKeyword, payrollPeriodKeyword, rowsPerPage]);

  const latestPayrollPeriod = useMemo(() => {
    if (rows.length === 0) {
      return "Chưa có dữ liệu";
    }

    return formatPayrollPeriod(rows[0]?.payrollPeriod);
  }, [rows]);

  const clearFilters = () => {
    setCodeKeyword("");
    setNameKeyword("");
    setSalaryKeyword("");
    setPayrollPeriodKeyword("");
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    loadPayrolls(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(nextRowsPerPage);
    setPage(0);
    loadPayrolls(0, nextRowsPerPage);
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          borderRadius: 3,
          px: { xs: 2.5, md: 4 },
          py: { xs: 3, md: 3.5 },
          background: "linear-gradient(135deg, #082f49 0%, #0f766e 50%, #5eead4 100%)",
          color: "common.white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -20,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
          }}
        />
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Danh sách bảng lương
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 700, opacity: 0.9 }}>
              Tra cứu nhanh danh sách lương nhân sự theo mã nhân viên, tên nhân viên, mức lương và kỳ lương từ database.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Chip
              icon={<IconChecklist size={16} />}
              label={`${totalRows} nhân sự phù hợp`}
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "common.white",
                "& .MuiChip-icon": { color: "common.white" },
              }}
            />
            <Button
              variant="contained"
              color="inherit"
              endIcon={<IconArrowUpRight size={18} />}
              href="/apps/payroll/import"
              sx={{ color: "#0f172a" }}
            >
              Import bảng lương
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Box
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tổng nhân sự
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {totalRows}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tổng quỹ lương
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {formatCurrency(totalSalary)}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Kỳ lương gần nhất
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {latestPayrollPeriod}
          </Typography>
        </Box>
      </Stack>

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
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Bộ lọc tìm kiếm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tìm kiếm theo mã nhân viên, tên nhân viên, lương và kỳ lương.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
              <Button variant="outlined" startIcon={<IconRefresh size={16} />} onClick={() => loadPayrolls(page, rowsPerPage)}>
                Tải lại
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <CustomTextField
              fullWidth
              placeholder="Tìm theo mã nhân viên"
              value={codeKeyword}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setCodeKeyword(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <CustomTextField
              fullWidth
              placeholder="Tìm theo tên nhân viên"
              value={nameKeyword}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setNameKeyword(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconUsers size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <CustomTextField
              fullWidth
              placeholder="Tìm theo lương"
              value={salaryKeyword}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSalaryKeyword(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconCoin size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <CustomTextField
              fullWidth
              placeholder="Kỳ lương, ví dụ: 2026-04"
              value={payrollPeriodKeyword}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPayrollPeriodKeyword(event.target.value);
                setPage(0);
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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
              <TableCell>Mã nhân viên</TableCell>
              <TableCell>Tên nhân viên</TableCell>
              <TableCell>Kỳ lương</TableCell>
              <TableCell align="right">Lương</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Stack spacing={1.5} alignItems="center">
                    <CircularProgress size={28} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu bảng lương...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((item) => (
                <TableRow key={`${item.id}-${item.code}`} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatPayrollPeriod(item.payrollPeriod)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.salary)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Không tìm thấy dữ liệu phù hợp
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hãy thử đổi từ khóa tìm kiếm theo mã, tên, lương hoặc kỳ lương.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </TableContainer>

      <Typography variant="body2" color="text.secondary">
        Dữ liệu hiện được đọc trực tiếp từ bảng `dbo.Payrolls` thông qua API payroll list có hỗ trợ lọc và phân trang.
      </Typography>
    </Stack>
  );
};

export default PayrollImportList;
