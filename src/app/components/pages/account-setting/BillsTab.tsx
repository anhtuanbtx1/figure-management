import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// components
import BlankCard from '../../shared/BlankCard';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { Stack } from '@mui/system';
import { IconCirclePlus, IconCreditCard, IconPackage, IconPencilMinus } from '@tabler/icons-react';

const BillsTab = () => {
  return (
    <>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={9}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" mb={2}>
                Thông tin thanh toán
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-bname">
                    Tên doanh nghiệp*
                  </CustomFormLabel>
                  <CustomTextField
                    id="text-bname"
                    value="Visitor Analytics"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-bsector">
                    Lĩnh vực kinh doanh*
                  </CustomFormLabel>
                  <CustomTextField
                    id="text-bsector"
                    value="Arts, Media & Entertainment"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-baddress">
                    Địa chỉ doanh nghiệp*
                  </CustomFormLabel>
                  <CustomTextField id="text-baddress" value="" variant="outlined" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-bcy">
                    Quốc gia*
                  </CustomFormLabel>
                  <CustomTextField id="text-bcy" value="Romania" variant="outlined" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-fname">
                    Tên*
                  </CustomFormLabel>
                  <CustomTextField id="text-fname" value="" variant="outlined" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomFormLabel sx={{ mt: 0 }} htmlFor="text-lname">
                    Họ*
                  </CustomFormLabel>
                  <CustomTextField id="text-lname" value="" variant="outlined" fullWidth />
                </Grid>
              </Grid>
            </CardContent>
          </BlankCard>
        </Grid>

        {/* 2 */}
        <Grid item xs={12} lg={9}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" display="flex" mb={2}>
                Gói hiện tại :
                <Typography variant="h4" component="div" ml="2px" color="success.main">
                  Executive
                </Typography>
              </Typography>
              <Typography color="textSecondary">
                Cảm ơn bạn đã là thành viên cao cấp và hỗ trợ phát triển của chúng tôi.
              </Typography>

              {/* list 1 */}
              <Stack direction="row" spacing={2} mt={4} mb={2}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconPackage size="22" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Gói hiện tại
                  </Typography>
                  <Typography variant="h6" mb={1}>
                    750.000 Monthly Visits
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <Tooltip title="Thêm">
                    <IconButton>
                      <IconCirclePlus size="22" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary">
                  Thay đổi gói
                </Button>
                <Button variant="outlined" color="error">
                  Đặt lại gói
                </Button>
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>

        {/* 3 */}
        <Grid item xs={12} lg={9}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" mb={2}>
                Phương thức thanh toán
              </Typography>
              <Typography color="textSecondary">Vào ngày 26 tháng 12, 2025</Typography>
              {/* list 1 */}
              <Stack direction="row" spacing={2} mt={4}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconCreditCard size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Visa
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    *****2102
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton>
                      <IconPencilMinus size="22" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Typography color="textSecondary" my={1}>
                Nếu bạn cập nhật phương thức thanh toán, nó sẽ chỉ được hiển thị ở đây sau chu kỳ
                thanh toán tiếp theo của bạn.
              </Typography>
              <Button variant="outlined" color="error">
                Hủy đăng ký
              </Button>
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }} mt={3}>
        <Button size="large" variant="contained" color="primary">
          Lưu
        </Button>
        <Button size="large" variant="text" color="error">
          Hủy
        </Button>
      </Stack>
    </>
  );
};

export default BillsTab;
