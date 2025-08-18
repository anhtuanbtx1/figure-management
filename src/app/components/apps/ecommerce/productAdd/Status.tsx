"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Grid, Typography } from "@mui/material";
import { MenuItem, Avatar } from "@mui/material";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";

const StatusCard = () => {
  const [status, setStatus] = useState(0);
  const handleChange = (event: any) => {
    setStatus(event.target.value);
    console.log("test");
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Trạng thái</Typography>

        <Avatar
          sx={{
            backgroundColor:
              status === 0
                ? "primary.main"
                : status === 1
                ? "error.main"
                : status === 2
                ? "secondary.main"
                : status === 3
                ? "warning.main"
                : "error.main",
            "& svg": { display: "none" },
            width: 15,
            height: 15,
          }}
        ></Avatar>
      </Box>

      <Grid container mt={3}>
        <Grid item xs={12}>
          <CustomSelect value={status} onChange={handleChange} fullWidth>
            <MenuItem value={0}>Đã xuất bản</MenuItem>
            <MenuItem value={1}>Bản nháp</MenuItem>
            <MenuItem value={2}>Đã lên lịch</MenuItem>
            <MenuItem value={3}>Không hoạt động</MenuItem>
          </CustomSelect>
          <Typography variant="body2">Thiết lập trạng thái sản phẩm.</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusCard;
