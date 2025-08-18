"use client";
import React from "react";
import Box from "@mui/material/Box";
import { Autocomplete, Button, Grid, Typography } from "@mui/material";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { IconPlus } from "@tabler/icons-react";

const new_category = [
  { label: "Máy tính" },
  { label: "Đồng hồ" },
  { label: "Tai nghe" },
  { label: "Làm đẹp" },
  { label: "Thời trang" },
  { label: "Giày dép" },
];

const new_tags = [
  { label: "Mới" },
  { label: "Xu hướng" },
  { label: "Giày dép" },
  { label: "Mới nhất" },
];

const ProductDetails = () => {
  return (
    <Box p={3}>
      <Typography variant="h5">Chi tiết sản phẩm</Typography>
      <Grid container mt={3}>
        {/* 1 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="p_cat" sx={{ mt: 0 }}>
            Danh mục
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            fullWidth
            id="new-category"
            options={new_category}
            getOptionLabel={(option) => option.label}
            filterSelectedOptions
            renderInput={(params) => (
              <CustomTextField {...params} placeholder="Chọn danh mục" />
            )}
          />

          {/* <CustomTextField id="p_cat" fullWidth /> */}
          <Typography variant="body2" mb={2}>
            Thêm sản phẩm vào danh mục.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="text" startIcon={<IconPlus size={18} />}>
            Tạo danh mục mới
          </Button>
        </Grid>
        {/* 1 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="p_tag">Thẻ</CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            fullWidth
            id="new-tags"
            options={new_tags}
            getOptionLabel={(option) => option.label}
            filterSelectedOptions
            renderInput={(params) => (
              <CustomTextField {...params} placeholder="Chọn thẻ" />
            )}
          />
          {/* <CustomTextField id="p_tag" fullWidth /> */}
          <Typography variant="body2" mb={2}>
            Thêm thẻ cho sản phẩm.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetails;
