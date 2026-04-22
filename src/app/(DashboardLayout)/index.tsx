"use client";

import { Alert, Box } from "@mui/material";

function DashboardHome() {
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info">
        Trang tong quan cu da duoc don dep sau khi go bo module hoa don va thuong mai dien tu.
      </Alert>
    </Box>
  );
}

export default DashboardHome;
