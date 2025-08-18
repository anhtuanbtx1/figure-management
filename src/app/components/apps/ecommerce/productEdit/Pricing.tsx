"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import {
  Typography,
  FormControlLabel,
  RadioGroup,
  Stack,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import { MenuItem } from "@mui/material";
import CustomRadio from "@/app/components/forms/theme-elements/CustomRadio";
import CustomSlider from "@/app/components/forms/theme-elements/CustomSlider";

const PricingCard = () => {
  const theme = useTheme();

  const [age, setAge] = React.useState("1");
  const handleChange = (event: any) => {
    setAge(event.target.value);
  };

  const [selectedValue, setSelectedValue] = useState("percentage");

  const handleValue = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const [value3, setValue3] = React.useState(30);
  const handleChange6 = (event: any, newValue: any) => {
    setValue3(newValue);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Định giá
      </Typography>

      <Grid container spacing={3}>
        {/* 1 */}
        <Grid item xs={12}>
          <CustomFormLabel htmlFor="p_price" sx={{ mt: 0 }}>
            Giá gốc{" "}
            <Typography color="error.main" component="span">
              *
            </Typography>
          </CustomFormLabel>
          <CustomTextField
            id="p_price"
            placeholder="Nhập giá sản phẩm"
            value="199.99"
            fullWidth
          />
          <Typography variant="body2">Thiết lập giá sản phẩm.</Typography>
        </Grid>
        <Grid item xs={12}>
          <CustomFormLabel htmlFor="p_price" sx={{ mt: 0 }}>
            Loại giảm giá{" "}
            <Typography color="error.main" component="span">
              *
            </Typography>
          </CustomFormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-form-control-label-placement"
            name="position"
            value={selectedValue}
            onChange={handleValue}
          >
            <Stack
              direction="row"
              spacing={3}
              width="100%"
              useFlexGap
              flexWrap="wrap"
            >
              <Box
                px={2}
                py={1}
                flexGrow={1}
                sx={{
                  border: `1px dashed ${theme.palette.divider}`,
                  textAlign: "center",
                }}
              >
                <FormControlLabel
                  value="no_discount"
                  control={<CustomRadio />}
                  label="Không giảm giá"
                />
              </Box>
              <Box
                px={2}
                py={1}
                flexGrow={1}
                sx={{
                  border: `1px dashed ${theme.palette.divider}`,
                  textAlign: "center",
                }}
              >
                <FormControlLabel
                  value="percentage"
                  control={<CustomRadio />}
                  label="Phần trăm %"
                />
              </Box>
              <Box
                px={2}
                py={1}
                flexGrow={1}
                sx={{
                  border: `1px dashed ${theme.palette.divider}`,
                  textAlign: "center",
                }}
              >
                <FormControlLabel
                  value="fixed"
                  control={<CustomRadio />}
                  label="Giá cố định"
                />
              </Box>
            </Stack>
          </RadioGroup>

          {selectedValue === "no_discount" && null}

          {selectedValue === "percentage" && (
            <>
              <CustomFormLabel>
                Thiết lập phần trăm giảm giá{" "}
                <Typography color="error.main" component="span">
                  *
                </Typography>
              </CustomFormLabel>
              <CustomSlider
                aria-label="Volume"
                value={value3}
                onChange={handleChange6}
              />
              <Typography variant="body2">
                Thiết lập phần trăm giảm giá áp dụng cho sản phẩm này.
              </Typography>
            </>
          )}

          {selectedValue === "fixed" && (
            <>
              <CustomFormLabel htmlFor="p_fixed">
                Giá giảm cố định{" "}
                <Typography color="error.main" component="span">
                  *
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="p_fixed"
                placeholder="Giá sau giảm"
                fullWidth
              />
              <Typography variant="body2">
                Thiết lập giá giảm cố định cho sản phẩm. Sản phẩm sẽ được giảm theo giá cố định đã xác định.
              </Typography>
            </>
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          <CustomFormLabel htmlFor="p_tax" sx={{ mt: 0 }}>
            Loại thuế{" "}
            <Typography color="error.main" component="span">
              *
            </Typography>
          </CustomFormLabel>
          <CustomSelect
            id="p_tax"
            value={age}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value={0}>Chọn một tùy chọn</MenuItem>
            <MenuItem value={1}>Miễn thuế</MenuItem>
            <MenuItem value={2}>Hàng hóa chịu thuế</MenuItem>
            <MenuItem value={3}>Sản phẩm tải xuống</MenuItem>
          </CustomSelect>
          <Typography variant="body2">Thiết lập loại thuế cho sản phẩm.</Typography>
        </Grid>
        <Grid item xs={12} lg={6}>
          <CustomFormLabel htmlFor="p_vat" sx={{ mt: 0 }}>
            Thuế VAT (%){" "}
            <Typography color="error.main" component="span">
              *
            </Typography>
          </CustomFormLabel>
          <CustomTextField id="p_vat" fullWidth value="40" />
          <Typography variant="body2">Thiết lập thuế VAT cho sản phẩm.</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PricingCard;
