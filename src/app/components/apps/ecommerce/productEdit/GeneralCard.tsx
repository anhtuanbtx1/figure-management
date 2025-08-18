import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { Grid } from "@mui/material";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import QuillEdit from "@/app/components/forms/form-quill/QuillEdit";

const GeneralCard = () => {
  return (
    <Box p={3}>
      <Typography variant="h5">Thông tin chung</Typography>

      <Grid container mt={3}>
        {/* 1 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="p_name" sx={{ mt: 0 }}>
            Tên sản phẩm{" "}
            <Typography color="error.main" component="span">
              *
            </Typography>
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            id="p_name"
            placeholder="Nhập tên sản phẩm"
            value="Sản phẩm mẫu"
            fullWidth
          />
          <Typography variant="body2">
            Tên sản phẩm là bắt buộc và nên là duy nhất.
          </Typography>
        </Grid>

        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="desc">Mô tả</CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <QuillEdit />
          <Typography variant="body2">
            Thêm mô tả cho sản phẩm để tăng khả năng hiển thị.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralCard;
