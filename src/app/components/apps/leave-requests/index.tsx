"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import LeaveRequestList from "./LeaveRequestList";

const LeaveRequestApp = () => {
  return (
    <Box sx={{ px: { xs: 0, lg: 1 }, pb: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" mb={0.5}>
              Quản lý đơn nghỉ phép
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Theo dõi danh sách đơn nghỉ phép và tạo đơn mới.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/apps/leave-requests/new"
          >
            Tạo đơn nghỉ phép
          </Button>
        </Stack>

        <LeaveRequestList />
      </Stack>
    </Box>
  );
};

export default LeaveRequestApp;
