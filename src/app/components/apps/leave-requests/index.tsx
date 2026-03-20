"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "next/link";

import LeaveRequestList from "./LeaveRequestList";

const LeaveRequestApp = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="flex-end" mb={3}>
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
    </Box>
  );
};

export default LeaveRequestApp;
