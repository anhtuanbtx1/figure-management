"use client";

import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import BlankCard from "@/app/components/shared/BlankCard";
import PaginationControls from "@/app/components/shared/PaginationControls";
import {
  fetchLeaveRequests,
  LeaveRequestCounts,
  LeaveRequestRow,
  RequestCategoryCode,
} from "./leaveRequestService";

interface LeaveRequestListProps {
  filter?: string;
  onCountsChange?: (counts: LeaveRequestCounts | null, total: number) => void;
}

interface LeaveRequestListState {
  rows: LeaveRequestRow[];
  counts: LeaveRequestCounts | null;
  total: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: LeaveRequestListState = {
  rows: [],
  counts: null,
  total: 0,
  totalPages: 0,
  pageSize: 20,
  hasNextPage: false,
  hasPreviousPage: false,
  loading: false,
  loaded: false,
  error: null,
};

const noop = () => {};

const TABLE_COLUMNS = [
  "Mã đơn",
  "Họ và tên",
  "Mã nhân viên",
  "Loại nghỉ phép",
  "Từ ngày",
  "Đến ngày",
  "Trạng thái",
] as const;

type StatusColor = "success" | "warning" | "error" | "default";

const getStatusColor = (status: string): StatusColor => {
  switch (status) {
    case "Approved":
      return "success";
    case "Pending":
      return "warning";
    case "Rejected":
      return "error";
    default:
      return "default";
  }
};

// ---- Memoized table row: chỉ re-render khi dữ liệu của chính nó đổi ----
const LeaveRequestTableRow = React.memo(function LeaveRequestTableRow({
  row,
}: {
  row: LeaveRequestRow;
}) {
  return (
    <TableRow hover>
      <TableCell>{row.id}</TableCell>
      <TableCell>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {row.fullName}
        </Typography>
      </TableCell>
      <TableCell>{row.staffCode}</TableCell>
      <TableCell>{row.type}</TableCell>
      <TableCell>{row.start_date}</TableCell>
      <TableCell>{row.end_date}</TableCell>
      <TableCell>
        <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
      </TableCell>
    </TableRow>
  );
});

// ---- Skeleton rows hiển thị khi load lần đầu ----
const SkeletonRows = React.memo(function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`}>
          {TABLE_COLUMNS.map((_col, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton variant="text" width={colIndex === 1 ? "80%" : "60%"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
});

// ---- Summary cards ----
interface SummaryItem {
  title: string;
  value: number;
  color: string;
  iconColor: string;
}

const buildSummaryItems = (counts: LeaveRequestCounts | null, total: number): SummaryItem[] => [
  { title: "Tổng đơn", value: total, color: "primary.light", iconColor: "primary.main" },
  { title: "Nghỉ phép", value: counts?.countLeave ?? 0, color: "success.light", iconColor: "success.main" },
  { title: "Công tác", value: counts?.countBusinessTrip ?? 0, color: "secondary.light", iconColor: "secondary.main" },
  { title: "Đăng ký WS", value: counts?.countWSRegistration ?? 0, color: "warning.light", iconColor: "warning.main" },
];

const SummaryCard = React.memo(function SummaryCard({ item }: { item: SummaryItem }) {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: item.color,
        borderRadius: 2,
        height: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 3,
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: item.iconColor }} />
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {item.title}
          </Typography>
          <Typography variant="h6">{item.value}</Typography>
        </Box>
      </Stack>
    </Box>
  );
});

const LeaveRequestList = ({ filter: _filter = "All", onCountsChange = noop }: LeaveRequestListProps) => {
  const [dataState, setDataState] = React.useState<LeaveRequestListState>(initialState);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(20);
  const [staffCodeInput, setStaffCodeInput] = React.useState("");
  const [debouncedStaffCode, setDebouncedStaffCode] = React.useState("");
  const [requestCategoryCode, setRequestCategoryCode] = React.useState<RequestCategoryCode>("LEAVE");

  // Debounce ô nhập mã nhân viên
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStaffCode(staffCodeInput.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [staffCodeInput]);

  // Fetch dữ liệu — giữ data cũ khi đang load để tránh nhảy layout
  React.useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setDataState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetchLeaveRequests(
          currentPage,
          itemsPerPage,
          "leave",
          debouncedStaffCode || undefined,
          requestCategoryCode
        );

        if (!active) return;

        onCountsChange(response.counts, response.pagination.total);

        setDataState({
          rows: response.data,
          counts: response.counts,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
          pageSize: response.pagination.pageSize,
          hasNextPage: response.pagination.hasNextPage,
          hasPreviousPage: response.pagination.hasPreviousPage,
          loading: false,
          loaded: true,
          error: null,
        });
      } catch (error) {
        if (!active) return;

        setDataState((prev) => ({
          ...prev,
          loading: false,
          loaded: true,
          error: error instanceof Error ? error.message : "Không thể tải danh sách đơn nghỉ phép",
        }));
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [currentPage, itemsPerPage, onCountsChange, debouncedStaffCode, requestCategoryCode]);

  // ---- Memoized values & callbacks ----
  const summaryItems = React.useMemo(
    () => buildSummaryItems(dataState.counts, dataState.total),
    [dataState.counts, dataState.total]
  );

  const startIndex = dataState.total === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex =
    dataState.total === 0 ? 0 : Math.min(startIndex + dataState.rows.length, dataState.total);

  const handleCategoryChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestCategoryCode(e.target.value as RequestCategoryCode);
    setCurrentPage(1);
  }, []);

  const handleStaffCodeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffCodeInput(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleItemsPerPageChange = React.useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const isInitialLoading = dataState.loading && !dataState.loaded;
  const isEmpty = dataState.loaded && !dataState.loading && dataState.rows.length === 0;

  return (
    <Stack spacing={3}>
      {dataState.error ? (
        <Fade in>
          <Alert severity="error">{dataState.error}</Alert>
        </Fade>
      ) : null}

      <Grid container spacing={3}>
        {summaryItems.map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.title}>
            <SummaryCard item={item} />
          </Grid>
        ))}
      </Grid>

      <BlankCard>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box>
              <Typography variant="h5" mb={0.5}>
                Danh sách đơn nghỉ phép
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Theo dõi và tra cứu đơn nghỉ phép theo mã nhân viên.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
              <CustomTextField
                select
                label="Loại đơn"
                variant="outlined"
                size="small"
                value={requestCategoryCode}
                onChange={handleCategoryChange}
                sx={{ width: { xs: "50%", md: 200 } }}
              >
                <MenuItem value="LEAVE">Nghỉ phép</MenuItem>
                <MenuItem value="UPDATE_ATTENDANCE">Cập nhật công</MenuItem>
              </CustomTextField>
              <CustomTextField
                label="Mã nhân viên"
                variant="outlined"
                size="small"
                value={staffCodeInput}
                onChange={handleStaffCodeChange}
                sx={{ width: { xs: "50%", md: 200 } }}
              />
            </Stack>
          </Stack>

          {/* Thanh tiến trình mảnh hiển thị khi đang refetch (đã có data) */}
          <Box sx={{ position: "relative" }}>
            <Box sx={{ height: 2, mb: -0.5 }}>
              {dataState.loading && dataState.loaded ? (
                <LinearProgress sx={{ borderRadius: 1 }} />
              ) : null}
            </Box>

            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 900 }} stickyHeader>
                <TableHead>
                  <TableRow>
                    {TABLE_COLUMNS.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isInitialLoading ? (
                    <SkeletonRows rows={itemsPerPage > 10 ? 8 : itemsPerPage} />
                  ) : isEmpty ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_COLUMNS.length} align="center">
                        <Typography py={5} color="textSecondary">
                          Không có dữ liệu đơn nghỉ phép.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataState.rows.map((row) => <LeaveRequestTableRow key={row.id} row={row} />)
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mờ nhẹ + khóa tương tác khi đang refetch để báo trạng thái loading mượt */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "background.paper",
                opacity: dataState.loading && dataState.loaded ? 0.5 : 0,
                pointerEvents: dataState.loading && dataState.loaded ? "auto" : "none",
                transition: "opacity 0.2s ease",
              }}
            />
          </Box>
        </Stack>

        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.max(dataState.totalPages, 1)}
          itemsPerPage={itemsPerPage}
          totalItems={dataState.total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          canGoNext={dataState.hasNextPage}
          canGoPrevious={dataState.hasPreviousPage}
          itemsPerPageOptions={[5, 10, 20]}
        />
      </BlankCard>
    </Stack>
  );
};

export default LeaveRequestList;
