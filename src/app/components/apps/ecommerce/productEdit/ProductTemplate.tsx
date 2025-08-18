"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Grid, MenuItem, Typography } from "@mui/material";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";

const ProductTemplate = () => {
  const [age, setAge] = useState("1");
  const handleChange = (event: any) => {
    setAge(event.target.value);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Mẫu sản phẩm
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomFormLabel htmlFor="p_tax" sx={{ mt: 0 }}>
            Chọn mẫu sản phẩm
          </CustomFormLabel>
          <CustomSelect
            id="p_tax"
            value={age}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value={0}>Mẫu mặc định</MenuItem>
            <MenuItem value={1}>Thời trang</MenuItem>
            <MenuItem value={2}>Văn phòng phẩm</MenuItem>
            <MenuItem value={3}>Điện tử</MenuItem>
          </CustomSelect>
          <Typography variant="body2" mt={1}>
            Chỉ định một mẫu từ theme hiện tại để xác định cách hiển thị một sản phẩm.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductTemplate;
