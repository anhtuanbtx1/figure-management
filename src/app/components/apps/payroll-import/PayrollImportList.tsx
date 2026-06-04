"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
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
  IconChevronDown,
  IconChecklist,
  IconCoin,
  IconRefresh,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import PayrollService, {
  PayrollListRow,
  PayrollPeriodGroup,
} from "@/app/(DashboardLayout)/apps/payroll/services/payrollService";

const HIGH_SALARY_THRESHOLD = 20000000;

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


const getGroupSubtitle = (employeeCount: number, totalSalary: number) => {
  return `${employeeCount} nhân sự • Tổng lương ${formatCurrency(totalSalary)}`;
};

const GroupTableHeader = () => (
  <TableHead>
    <TableRow sx={{ bgcolor: "grey.100" }}>
      <TableCell>Mã nhân viên</TableCell>
      <TableCell>Tên nhân viên</TableCell>
      <TableCell>Kỳ lương</TableCell>
      <TableCell align="right">Lương</TableCell>
    </TableRow>
  </TableHead>
);

const GroupTableRows = ({ items }: { items: PayrollListRow[] }) => (
  <TableBody>
    {items.map((item) => {
      const isHighSalary = item.salary > HIGH_SALARY_THRESHOLD;

      return (
        <TableRow
          key={`${item.id}-${item.code}`}
          hover
          sx={{
            bgcolor: isHighSalary ? "warning.lighter" : "inherit",
            "&:hover": {
              bgcolor: isHighSalary ? "warning.light" : undefined,
            },
          }}
        >
          <TableCell>
            <Typography variant="subtitle2" fontWeight={700}>
              {item.code}
            </Typography>
          </TableCell>
          <TableCell>{item.name}</TableCell>
          <TableCell>{formatPayrollPeriod(item.payrollPeriod)}</TableCell>
          <TableCell align="right">
            {isHighSalary ? (
              <Chip
                label={formatCurrency(item.salary)}
                color="warning"
                size="small"
                sx={{ fontWeight: 800 }}
              />
            ) : (
              formatCurrency(item.salary)
            )}
          </TableCell>
        </TableRow>
      );
    })}
  </TableBody>
);

const PayrollGroupSection = ({
  group,
  expanded,
  details,
  loadingDetails,
  detailError,
  onToggle,
}: {
  group: PayrollPeriodGroup;
  expanded: boolean;
  details: PayrollListRow[];
  loadingDetails: boolean;
  detailError: string;
  onToggle: () => void;
}) => {
  return (
    <TableBody>
      <TableRow
        hover
        onClick={onToggle}
        sx={{
          cursor: "pointer",
          bgcolor: expanded ? "primary.lighter" : "background.paper",
          "& > td": {
            borderBottom: expanded ? 0 : undefined,
          },
        }}
      >
        <TableCell colSpan={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: expanded ? "primary.main" : "grey.200",
                color: expanded ? "primary.contrastText" : "text.secondary",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "all 0.2s ease",
              }}
            >
              <IconChevronDown size={18} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {group.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getGroupSubtitle(group.employeeCount, group.totalSalary)}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell align="right">
          <Chip
            label={formatCurrency(group.totalSalary)}
            color={expanded ? "primary" : "default"}
            variant={expanded ? "filled" : "outlined"}
            sx={{ fontWeight: 700 }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} sx={{ p: 0, borderBottom: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {loadingDetails ? (
              <Stack spacing={1.5} alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  Đang tải chi tiết bảng lương tháng này...
                </Typography>
              </Stack>
            ) : detailError ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {detailError}
              </Alert>
            ) : details.length > 0 ? (
              <Table size="small">
                <GroupTableHeader />
                <GroupTableRows items={details} />
              </Table>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có dữ liệu chi tiết cho tháng này.
                </Typography>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

const EmptyStateRow = () => (
  <TableBody>
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
  </TableBody>
);

const LoadingStateRow = () => (
  <TableBody>
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
  </TableBody>
);

const PayrollImportList = () => {
  const [codeKeyword, setCodeKeyword] = useState("");
  const [nameKeyword, setNameKeyword] = useState("");
  const [salaryKeyword, setSalaryKeyword] = useState("");
  const [payrollPeriodKeyword, setPayrollPeriodKeyword] = useState("");
  const [groups, setGroups] = useState<PayrollPeriodGroup[]>([]);
  const [groupDetails, setGroupDetails] = useState<Record<string, PayrollListRow[]>>({});
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const loadPayrolls = async (nextPage = page, nextRowsPerPage = rowsPerPage) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await PayrollService.getPayrollGroups({
        code: codeKeyword,
        name: nameKeyword,
        salary: salaryKeyword,
        payrollPeriod: payrollPeriodKeyword,
        page: nextPage + 1,
        pageSize: nextRowsPerPage,
      });

      setGroups(result.groups);
      setGroupDetails({});
      setDetailLoading({});
      setDetailErrors({});
      setExpandedPeriod(null);
      setTotalGroups(result.totalGroups);
      setTotalEmployees(result.totalEmployees);
      setTotalSalary(result.totalSalary);
      setPage(Math.max(0, result.page - 1));
      setRowsPerPage(result.pageSize);
    } catch (error: any) {
      setGroups([]);
      setGroupDetails({});
      setDetailLoading({});
      setDetailErrors({});
      setExpandedPeriod(null);
      setTotalGroups(0);
      setTotalEmployees(0);
      setTotalSalary(0);
      setErrorMessage(error?.message || "Không thể tải danh sách nhóm bảng lương từ database.");
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

  useEffect(() => {
    setExpandedPeriod((current) => {
      if (current && groups.some((group) => group.key === current)) {
        return current;
      }

      return null;
    });
  }, [groups]);

  const latestPayrollPeriod = useMemo(() => {
    if (groups.length === 0) {
      return "Chưa có dữ liệu";
    }

    return formatPayrollPeriod(groups[0]?.payrollPeriod);
  }, [groups]);

  const loadGroupDetails = async (group: PayrollPeriodGroup) => {
    if (groupDetails[group.key] || detailLoading[group.key]) {
      return;
    }

    setDetailLoading((prev) => ({ ...prev, [group.key]: true }));
    setDetailErrors((prev) => ({ ...prev, [group.key]: "" }));

    try {
      const result = await PayrollService.getPayrollDetailsByPeriod({
        payrollPeriod: group.key,
        code: codeKeyword,
        name: nameKeyword,
        salary: salaryKeyword,
        page: 1,
        pageSize: Math.max(group.employeeCount, 1),
      });

      setGroupDetails((prev) => ({ ...prev, [group.key]: result.rows }));
    } catch (error: any) {
      setDetailErrors((prev) => ({
        ...prev,
        [group.key]: error?.message || "Không thể tải chi tiết bảng lương tháng này.",
      }));
    } finally {
      setDetailLoading((prev) => ({ ...prev, [group.key]: false }));
    }
  };

  const handleToggleGroup = (group: PayrollPeriodGroup) => {
    if (expandedPeriod === group.key) {
      setExpandedPeriod(null);
      return;
    }

    setExpandedPeriod(group.key);
    loadGroupDetails(group);
  };

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
              label={`${totalEmployees} nhân sự phù hợp`}
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
            {totalEmployees}
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
          {loading ? (
            <LoadingStateRow />
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <PayrollGroupSection
                key={group.key}
                group={group}
                expanded={expandedPeriod === group.key}
                details={groupDetails[group.key] || []}
                loadingDetails={!!detailLoading[group.key]}
                detailError={detailErrors[group.key] || ""}
                onToggle={() => handleToggleGroup(group)}
              />
            ))
          ) : (
            <EmptyStateRow />
          )}
        </Table>
        <TablePagination
          component="div"
          count={totalGroups}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </TableContainer>
    </Stack>
  );
};

export default PayrollImportList;
