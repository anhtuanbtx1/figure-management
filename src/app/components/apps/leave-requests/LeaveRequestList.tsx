"use client";

import React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from "@mui/x-data-grid";

import { fetchLeaveRequests, LeaveRequestCounts, LeaveRequestRow } from "./leaveRequestService";

interface LeaveRequestListProps {
  filter?: string;
  onCountsChange?: (counts: LeaveRequestCounts | null, total: number) => void;
}

interface LeaveRequestListState {
  rows: LeaveRequestRow[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: LeaveRequestListState = {
  rows: [],
  total: 0,
  loading: false,
  error: null,
};

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = {
  page: 0,
  pageSize: 20,
};

const noop = () => {};

const loadLeaveRequests = async (
  paginationModel: GridPaginationModel,
  onCountsChange: (counts: LeaveRequestCounts | null, total: number) => void,
  staffCode?: string
) => {
  const response = await fetchLeaveRequests(paginationModel.page + 1, paginationModel.pageSize, "leave", staffCode);

  onCountsChange(response.counts, response.pagination.total);

  return {
    rows: response.data,
    total: response.pagination.total,
  };
};

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

const columns: GridColDef[] = [
  { field: "id", headerName: "Mã đơn", width: 120 },
  {
    field: "fullName",
    headerName: "Họ và tên",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "staffCode",
    headerName: "Mã nhân viên",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "type",
    headerName: "Loại nghỉ phép",
    flex: 1,
    minWidth: 180,
  },
  {
    field: "start_date",
    headerName: "Từ ngày",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "end_date",
    headerName: "Đến ngày",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "status",
    headerName: "Trạng thái",
    flex: 1,
    minWidth: 140,
    renderCell: (params: GridRenderCellParams) => {
      const color = getStatusColor(params.value as string);
      return (
        <Chip
          label={params.value as string}
          color={color as "success" | "warning" | "error" | "default"}
          size="small"
        />
      );
    },
  },
];

const LeaveRequestList = ({ filter: _filter = "All", onCountsChange = noop }: LeaveRequestListProps) => {
  const [dataState, setDataState] = React.useState<LeaveRequestListState>(initialState);
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [staffCodeInput, setStaffCodeInput] = React.useState<string>("");
  const [debouncedStaffCode, setDebouncedStaffCode] = React.useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStaffCode(staffCodeInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [staffCodeInput]);

  React.useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setDataState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await loadLeaveRequests(paginationModel, onCountsChange, debouncedStaffCode);

        if (!active) return;

        setDataState({
          rows: result.rows,
          total: result.total,
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
  }, [paginationModel, onCountsChange, debouncedStaffCode]);

  return (
    <Box sx={{ width: "100%", height: 500 }}>
      {dataState.error ? <Alert severity="error" sx={{ mb: 2 }}>{dataState.error}</Alert> : null}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          label="Mã nhân viên"
          variant="outlined"
          size="small"
          value={staffCodeInput}
          onChange={(e) => {
            setStaffCodeInput(e.target.value);
            if (paginationModel.page !== 0) {
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }
          }}
          sx={{ width: 300 }}
        />
      </Box>
      <DataGrid
        rows={dataState.rows}
        columns={columns}
        rowCount={dataState.total}
        loading={dataState.loading}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default LeaveRequestList;
