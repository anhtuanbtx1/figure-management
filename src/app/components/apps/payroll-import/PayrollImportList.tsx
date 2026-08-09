"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  IconArrowUpRight,
  IconChevronDown,
  IconChecklist,
  IconCoin,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconCalendar,
  IconTrendingUp,
  IconUserCircle,
  IconMoodEmpty,
} from "@tabler/icons-react";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import PayrollService, {
  PayrollListRow,
  PayrollPeriodGroup,
} from "@/app/(DashboardLayout)/apps/payroll/services/payrollService";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });


const HIGH_SALARY_THRESHOLD = 20000000;
const TOP_SALARY_THRESHOLD = 30000000;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount);

const formatPayrollPeriod = (value: string) => {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
  }).format(date);
};

const getGroupSubtitle = (employeeCount: number, totalSalary: number) =>
  `${employeeCount} nhân sự • Tổng lương ${formatCurrency(totalSalary)}`;

// ─── Sub-table: detail rows of a period ─────────────────────────────────────
const SubTableHeader = () => {
  const theme = useTheme();
  return (
    <TableHead>
      <TableRow
        sx={{
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.primary.main, 0.06),
        }}
      >
        <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", pl: 3 }}>
          #
        </TableCell>
        <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
          Mã NV
        </TableCell>
        <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
          Tên nhân viên
        </TableCell>
        <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
          Kỳ lương
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.78rem", pr: 3 }}>
          Lương
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const SubTableRows = ({
  items,
  startIndex = 0,
}: {
  items: PayrollListRow[];
  startIndex?: number;
}) => {
  const theme = useTheme();
  return (
    <TableBody>
      {items.map((item, idx) => {
        const isTop = item.salary > TOP_SALARY_THRESHOLD;
        const isHigh = item.salary > HIGH_SALARY_THRESHOLD;
        const rowColor = isTop
          ? theme.palette.success.main
          : isHigh
          ? theme.palette.warning.main
          : undefined;

        return (
          <TableRow
            key={`${item.id}-${item.code}`}
            hover
            sx={{
              bgcolor: isTop
                ? alpha(theme.palette.success.main, 0.04)
                : isHigh
                ? alpha(theme.palette.warning.main, 0.04)
                : "inherit",
              transition: "background 0.15s",
              "&:last-child td": { borderBottom: 0 },
            }}
          >
            {/* Row index */}
            <TableCell sx={{ pl: 3, color: "text.disabled", fontSize: "0.75rem" }}>
              {startIndex + idx + 1}
            </TableCell>

            {/* Code */}
            <TableCell>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="primary.main"
                  fontFamily="monospace"
                >
                  {item.code}
                </Typography>
              </Box>
            </TableCell>

            {/* Name */}
            <TableCell>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: rowColor
                      ? alpha(rowColor, 0.12)
                      : alpha(theme.palette.text.secondary, 0.1),
                    flexShrink: 0,
                  }}
                >
                  <IconUserCircle
                    size={16}
                    color={rowColor || theme.palette.text.secondary}
                  />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {item.name}
                </Typography>
              </Stack>
            </TableCell>

            {/* Period */}
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {formatPayrollPeriod(item.payrollPeriod)}
              </Typography>
            </TableCell>

            {/* Salary */}
            <TableCell align="right" sx={{ pr: 3 }}>
              {isTop ? (
                <Chip
                  label={`${formatCurrency(item.salary)} ₫`}
                  color="success"
                  size="small"
                  icon={<IconTrendingUp size={12} />}
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              ) : isHigh ? (
                <Chip
                  label={`${formatCurrency(item.salary)} ₫`}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              ) : (
                <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                  {formatCurrency(item.salary)} ₫
                </Typography>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

// ─── Group row (the clickable period row) ───────────────────────────────────
const PayrollGroupSection = ({
  group,
  expanded,
  details,
  loadingDetails,
  detailError,
  onToggle,
  groupIndex,
}: {
  group: PayrollPeriodGroup;
  expanded: boolean;
  details: PayrollListRow[];
  loadingDetails: boolean;
  detailError: string;
  onToggle: () => void;
  groupIndex: number;
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  // Salary bar as % of some reference (just visual)
  const maxVisualSalary = 200_000_000;
  const barPct = Math.min((group.totalSalary / maxVisualSalary) * 100, 100);

  return (
    <TableBody>
      {/* ── Group Header Row ── */}
      <TableRow
        hover
        onClick={onToggle}
        sx={{
          cursor: "pointer",
          bgcolor: expanded
            ? isLight
              ? alpha(theme.palette.primary.main, 0.06)
              : alpha(theme.palette.primary.main, 0.12)
            : "background.paper",
          "& > td": {
            borderBottom: expanded ? 0 : undefined,
            py: 1.5,
          },
          transition: "background 0.2s",
          "&:hover": {
            bgcolor: expanded
              ? isLight
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.primary.main, 0.18)
              : isLight
              ? alpha(theme.palette.action.hover, 0.6)
              : alpha(theme.palette.action.hover, 0.4),
          },
        }}
      >
        {/* Expand chevron + period info */}
        <TableCell colSpan={3} sx={{ pl: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Chevron circle */}
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: expanded
                  ? theme.palette.primary.main
                  : isLight
                  ? "grey.200"
                  : alpha(theme.palette.divider, 0.4),
                color: expanded ? "#fff" : "text.secondary",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                flexShrink: 0,
              }}
            >
              <IconChevronDown size={18} />
            </Box>

            {/* Period badge + stats */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                {/* Period chip */}
                <Chip
                  icon={<IconCalendar size={12} />}
                  label={group.label}
                  size="small"
                  color={expanded ? "primary" : "default"}
                  variant={expanded ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, fontSize: "0.78rem", height: 24 }}
                />
                {/* Group order badge */}
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontFamily="monospace"
                >
                  #{String(groupIndex + 1).padStart(2, "0")}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary" fontSize="0.78rem">
                  <b>{group.employeeCount}</b> nhân sự
                </Typography>
                {/* Mini salary bar */}
                <Box sx={{ flex: 1, maxWidth: 120 }}>
                  <LinearProgress
                    variant="determinate"
                    value={barPct}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: expanded
                          ? theme.palette.primary.main
                          : theme.palette.text.disabled,
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </TableCell>

        {/* Total salary */}
        <TableCell align="right" sx={{ pr: 2.5 }}>
          <Stack alignItems="flex-end" spacing={0.25}>
            <Chip
              label={`${formatCurrency(group.totalSalary)} ₫`}
              color={expanded ? "primary" : "default"}
              variant={expanded ? "filled" : "outlined"}
              sx={{ fontWeight: 800, fontSize: "0.78rem" }}
            />
            <Typography variant="caption" color="text.disabled" fontSize="0.68rem">
              tổng quỹ lương
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>

      {/* ── Sub-table collapse ── */}
      <TableRow>
        <TableCell colSpan={4} sx={{ p: 0, borderBottom: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                mx: { xs: 0, sm: 2 },
                mb: 2,
                mt: 0.5,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              {/* Sub-table header bar */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.25,
                  bgcolor: expanded
                    ? isLight
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.15)
                    : "transparent",
                  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconCalendar size={16} color={theme.palette.primary.main} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    Chi tiết bảng lương — {group.label}
                  </Typography>
                </Stack>
                {!loadingDetails && details.length > 0 && (
                  <Chip
                    label={`${details.length} nhân sự`}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                  />
                )}
              </Box>

              {/* Content */}
              {loadingDetails ? (
                <Stack spacing={1.5} alignItems="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} thickness={4} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải danh sách nhân sự tháng {group.label}...
                  </Typography>
                </Stack>
              ) : detailError ? (
                <Alert severity="error" sx={{ m: 2 }}>
                  {detailError}
                </Alert>
              ) : details.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <SubTableHeader />
                    <SubTableRows items={[...details].sort((a, b) => b.salary - a.salary)} startIndex={0} />
                  </Table>
                </TableContainer>
              ) : (
                <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.text.secondary, 0.08),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconMoodEmpty
                      size={26}
                      color={theme.palette.text.disabled}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu chi tiết cho tháng này.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

// ─── Empty / Loading states ──────────────────────────────────────────────────
const EmptyStateRow = () => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
        <Stack alignItems="center" spacing={1.5}>
          <IconMoodEmpty size={38} opacity={0.3} />
          <Typography variant="subtitle1" fontWeight={600}>
            Không tìm thấy dữ liệu phù hợp
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy thử đổi từ khóa tìm kiếm theo mã, tên, lương hoặc kỳ lương.
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  </TableBody>
);

const LoadingStateRow = () => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={32} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu bảng lương...
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  </TableBody>
);

// ─── Main component ──────────────────────────────────────────────────────────
const PayrollImportList = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const [codeKeyword, setCodeKeyword] = useState("");
  const [nameKeyword, setNameKeyword] = useState("");
  const [salaryDist, setSalaryDist] = useState<number[]>([0, 0, 0, 0, 0]);
  const [distLoading, setDistLoading] = useState(false);
  const [allPeriods, setAllPeriods] = useState<{ key: string; label: string }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

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

  const loadPayrolls = useCallback(
    async (nextPage: number, nextRowsPerPage: number) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const result = await PayrollService.getPayrollGroups({
          code: codeKeyword,
          name: nameKeyword,
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
        setErrorMessage(
          error?.message || "Không thể tải danh sách nhóm bảng lương từ database."
        );
      } finally {
        setLoading(false);
      }
    },
    [codeKeyword, nameKeyword]
  );

  // Fetch salary distribution for a specific period (or all if empty)
  const loadSalaryDist = useCallback(async (period: string) => {
    setDistLoading(true);
    try {
      const result = await PayrollService.getPayrollDetailsByPeriod({
        payrollPeriod: period,
        page: 1,
        pageSize: 9999,
      });
      const buckets = [0, 0, 0, 0, 0];
      result.rows.forEach((r) => {
        const m = r.salary / 1_000_000;
        if (m < 10) buckets[0]++;
        else if (m < 20) buckets[1]++;
        else if (m < 30) buckets[2]++;
        else if (m < 40) buckets[3]++;
        else buckets[4]++;
      });
      setSalaryDist(buckets);
    } catch {
      // silent
    } finally {
      setDistLoading(false);
    }
  }, []);

  // Load all available periods for the selector
  const loadAllPeriods = useCallback(async () => {
    try {
      const result = await PayrollService.getPayrollGroups({ page: 1, pageSize: 200 });
      const periods = result.groups.map((g) => ({ key: g.key, label: g.label }));
      setAllPeriods(periods);
      if (periods.length > 0) {
        setSelectedPeriod(periods[0].key);
        loadSalaryDist(periods[0].key);
      }
    } catch {
      // silent
    }
  }, [loadSalaryDist]);



  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPayrolls(0, rowsPerPage);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [codeKeyword, nameKeyword, rowsPerPage, loadPayrolls]);

  useEffect(() => {
    loadAllPeriods();
  }, [loadAllPeriods]);


  useEffect(() => {
    setExpandedPeriod((current) => {
      if (current && groups.some((g) => g.key === current)) return current;
      return null;
    });
  }, [groups]);

  const latestPayrollPeriod = useMemo(() => {
    if (groups.length === 0) return "Chưa có dữ liệu";
    return formatPayrollPeriod(groups[0]?.payrollPeriod);
  }, [groups]);

  const loadGroupDetails = async (group: PayrollPeriodGroup) => {
    if (groupDetails[group.key] || detailLoading[group.key]) return;
    setDetailLoading((prev) => ({ ...prev, [group.key]: true }));
    setDetailErrors((prev) => ({ ...prev, [group.key]: "" }));
    try {
      const result = await PayrollService.getPayrollDetailsByPeriod({
        payrollPeriod: group.key,
        code: codeKeyword,
        name: nameKeyword,
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
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    loadPayrolls(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseInt(event.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
    loadPayrolls(0, next);
  };

  return (
    <Stack spacing={3}>


      {/* ── Salary Distribution Charts ── */}
      {(() => {
        const labels = ["< 10 triệu", "10 – 20 triệu", "20 – 30 triệu", "30 – 40 triệu", "> 40 triệu"];
        const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];
        const total = salaryDist.reduce((s, v) => s + v, 0) || 1;

        const donutOpts: ApexOptions = {
          chart: { type: "donut", fontFamily: "'Plus Jakarta Sans', sans-serif", toolbar: { show: false } },
          labels,
          colors,
          legend: { position: "bottom", fontSize: "12px" },
          plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Tổng NV", fontSize: "13px", fontWeight: 700 } } } } },
          dataLabels: { enabled: false },
          tooltip: { theme: theme.palette.mode === "dark" ? "dark" : "light", y: { formatter: (v: number) => `${v} nhân sự` } },
        };

        const barOpts: ApexOptions = {
          chart: { type: "bar", fontFamily: "'Plus Jakarta Sans', sans-serif", toolbar: { show: false } },
          colors,
          plotOptions: { bar: { borderRadius: 6, columnWidth: "55%", distributed: true } },
          dataLabels: { enabled: true, style: { fontSize: "11px", fontWeight: 700 } },
          legend: { show: false },
          xaxis: { categories: ["<10M", "10-20M", "20-30M", "30-40M", ">40M"], labels: { style: { fontSize: "11px" } } },
          yaxis: { labels: { formatter: (v: number) => `${v} NV` } },
          tooltip: { theme: theme.palette.mode === "dark" ? "dark" : "light", y: { formatter: (v: number) => `${v} nhân sự` } },
          grid: { borderColor: theme.palette.divider },
        };

        const radialOpts: ApexOptions = {
          chart: { type: "radialBar", fontFamily: "'Plus Jakarta Sans', sans-serif", toolbar: { show: false } },
          colors,
          plotOptions: {
            radialBar: {
              offsetY: 0,
              startAngle: 0,
              endAngle: 270,
              hollow: { margin: 5, size: "30%" },
              dataLabels: { name: { fontSize: "12px" }, value: { fontSize: "11px", formatter: (v: number) => `${v}%` } },
              track: { background: alpha(theme.palette.divider, 0.3) },
            },
          },
          labels,
          legend: { show: true, position: "bottom", fontSize: "11px", floating: false },
          tooltip: { theme: theme.palette.mode === "dark" ? "dark" : "light" },
        };

        const radialSeries = salaryDist.map((v) => Math.round((v / total) * 100));
        const selectedLabel = allPeriods.find((p) => p.key === selectedPeriod)?.label || selectedPeriod;

        return (
          <Stack spacing={2}>
            {/* Period selector */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Phân tích lương theo kỳ</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedLabel ? `Đang xem: ${selectedLabel}` : "Chọn kỳ lương để xem thống kê"}
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedPeriod}
                  onChange={(e: SelectChangeEvent) => {
                    setSelectedPeriod(e.target.value);
                    loadSalaryDist(e.target.value);
                  }}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  {allPeriods.map((p) => (
                    <MenuItem key={p.key} value={p.key}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
              {/* Chart 1: Donut */}
              <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Phân bổ nhân sự theo lương</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>Tỷ lệ nhân sự trong từng khung lương</Typography>
                {distLoading ? <Stack alignItems="center" py={4}><CircularProgress size={28} /></Stack> : <Chart options={donutOpts} series={salaryDist} type="donut" height={260} />}
              </Box>
              {/* Chart 2: Bar */}
              <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Số lượng nhân sự theo khung lương</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>Tổng số nhân sự thuộc mỗi mức lương</Typography>
                {distLoading ? <Stack alignItems="center" py={4}><CircularProgress size={28} /></Stack> : <Chart options={barOpts} series={[{ name: "Nhân sự", data: salaryDist }]} type="bar" height={260} />}
              </Box>
              {/* Chart 3: Radial */}
              <Box sx={{ flex: 1, p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="subtitle1" fontWeight={700} mb={0.5}>Tỷ lệ % theo khung lương</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>Phần trăm nhân sự mỗi mức so với tổng thể</Typography>
                {distLoading ? <Stack alignItems="center" py={4}><CircularProgress size={28} /></Stack> : <Chart options={radialOpts} series={radialSeries} type="radialBar" height={260} />}
              </Box>
            </Stack>
          </Stack>
        );
      })()}



      {/* ── Filters ── */}
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
              <Button
                variant="outlined"
                startIcon={<IconRefresh size={16} />}
                onClick={() => loadPayrolls(page, rowsPerPage)}
              >
                Tải lại
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
            <CustomTextField
              fullWidth
              placeholder="Tìm theo mã nhân viên"
              value={codeKeyword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCodeKeyword(e.target.value);
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNameKeyword(e.target.value);
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

          </Stack>
        </Stack>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {/* ── Hint text ── */}
      {!loading && groups.length > 0 && (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <IconChevronDown size={14} color={theme.palette.text.disabled} />
          <Typography variant="caption" color="text.disabled">
            Click vào từng kỳ lương để xem danh sách nhân sự tháng đó
          </Typography>
        </Stack>
      )}

      {/* ── Main table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Table-level header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : alpha(theme.palette.divider, 0.5)}`,
            bgcolor: isLight ? "grey.50" : alpha(theme.palette.background.paper, 0.6),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            DANH SÁCH KỲ LƯƠNG
          </Typography>
          {!loading && (
            <Chip
              label={`${totalGroups} kỳ`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: "0.72rem" }}
            />
          )}
        </Box>

        <Table>
          {loading ? (
            <LoadingStateRow />
          ) : groups.length > 0 ? (
            groups.map((group, idx) => (
              <PayrollGroupSection
                key={group.key}
                group={group}
                expanded={expandedPeriod === group.key}
                details={groupDetails[group.key] || []}
                loadingDetails={!!detailLoading[group.key]}
                detailError={detailErrors[group.key] || ""}
                onToggle={() => handleToggleGroup(group)}
                groupIndex={idx}
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </TableContainer>
    </Stack>
  );
};

export default PayrollImportList;
