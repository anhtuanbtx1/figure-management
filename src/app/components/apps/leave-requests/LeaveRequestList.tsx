"use client";

import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import MenuItem from "@mui/material/MenuItem";
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
  error: null,
};

const noop = () => {};

const getStatusColor = (status: string) => {
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

const summaryItems = (counts: LeaveRequestCounts | null, total: number) => [
  {
    title: "Tổng đơn",
    value: total,
    color: "primary.light",
    iconColor: "primary.main",
  },
  {
    title: "Nghỉ phép",
    value: counts?.countLeave ?? 0,
    color: "success.light",
    iconColor: "success.main",
  },
  {
    title: "Công tác",
    value: counts?.countBusinessTrip ?? 0,
    color: "secondary.light",
    iconColor: "secondary.main",
  },
  {
    title: "Đăng ký WS",
    value: counts?.countWSRegistration ?? 0,
    color: "warning.light",
    iconColor: "warning.main",
  },
];

const LeaveRequestList = ({ filter: _filter = "All", onCountsChange = noop }: LeaveRequestListProps) => {
  const [dataState, setDataState] = React.useState<LeaveRequestListState>(initialState);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(20);
  const [staffCodeInput, setStaffCodeInput] = React.useState("");
  const [debouncedStaffCode, setDebouncedStaffCode] = React.useState("");
  const [requestCategoryCode, setRequestCategoryCode] = React.useState<RequestCategoryCode>("LEAVE");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStaffCode(staffCodeInput.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [staffCodeInput]);

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
          error: null,
        });
      } catch (error) {
        if (!active) return;

        setDataState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Không thể tải danh sách đơn nghỉ phép",
        }));
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [currentPage, itemsPerPage, onCountsChange, debouncedStaffCode, requestCategoryCode]);

  const startIndex = dataState.total === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = dataState.total === 0 ? 0 : Math.min(startIndex + dataState.rows.length, dataState.total);

  return (
    <Stack spacing={3}>
      {dataState.error ? <Alert severity="error">{dataState.error}</Alert> : null}

      <Grid container spacing={3}>
        {summaryItems(dataState.counts, dataState.total).map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.title}>
            <Box
              sx={{
                p: 3,
                bgcolor: item.color,
                borderRadius: 1,
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1,
                    bgcolor: item.iconColor,
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h6">{item.value}</Typography>
                </Box>
              </Stack>
            </Box>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setRequestCategoryCode(e.target.value as RequestCategoryCode);
                  setCurrentPage(1);
                }}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setStaffCodeInput(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ width: { xs: "50%", md: 200 } }}
              />
            </Stack>
          </Stack>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Mã nhân viên</TableCell>
                  <TableCell>Loại nghỉ phép</TableCell>
                  <TableCell>Từ ngày</TableCell>
                  <TableCell>Đến ngày</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataState.rows.length === 0 && !dataState.loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography py={4} color="textSecondary">
                        Không có dữ liệu đơn nghỉ phép.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {dataState.rows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell>{row.staffCode}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.start_date}</TableCell>
                    <TableCell>{row.end_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={getStatusColor(row.status) as "success" | "warning" | "error" | "default"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.max(dataState.totalPages, 1)}
          itemsPerPage={dataState.pageSize}
          totalItems={dataState.total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
          canGoNext={dataState.hasNextPage}
          canGoPrevious={dataState.hasPreviousPage}
          itemsPerPageOptions={[5, 10, 20]}
        />
      </BlankCard>
    </Stack>
  );
};

export default LeaveRequestList;
