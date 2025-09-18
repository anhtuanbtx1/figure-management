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
import CustomSwitch from '../../forms/theme-elements/CustomSwitch';
import { Stack } from '@mui/system';
import {
  IconArticle,
  IconCheckbox,
  IconClock,
  IconDownload,
  IconMail,
  IconPlayerPause,
  IconTruckDelivery,
} from '@tabler/icons-react';

const NotificationTab = () => {
  return (
    <>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={9}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" mb={2}>
                Tùy chọn thông báo
              </Typography>
              <Typography color="textSecondary">
                Chọn các thông báo bạn muốn nhận qua email. Lưu ý rằng bạn không thể từ chối nhận
                các thông báo dịch vụ như thanh toán, bảo mật hoặc thông báo pháp lý.
              </Typography>

              <CustomFormLabel htmlFor="text-email">Địa chỉ Email*</CustomFormLabel>
              <CustomTextField id="text-email" variant="outlined" fullWidth />
              <Typography color="textSecondary">Bắt buộc để nhận thông báo.</Typography>

              {/* list 1 */}
              <Stack direction="row" spacing={2} mt={4}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconArticle size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Bản tin của chúng tôi
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Chúng tôi sẽ luôn thông báo cho bạn về những thay đổi quan trọng
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <CustomSwitch />
                </Box>
              </Stack>

              {/* list 2 */}
              <Stack direction="row" spacing={2} mt={3}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconCheckbox size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Xác nhận đơn hàng
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Bạn sẽ được thông báo khi khách hàng đặt hàng bất kỳ sản phẩm nào
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <CustomSwitch checked />
                </Box>
              </Stack>

              {/* list 3 */}
              <Stack direction="row" spacing={2} mt={3}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconClock size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Trạng thái đơn hàng thay đổi
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Bạn sẽ được thông báo khi khách hàng thay đổi đơn hàng
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <CustomSwitch checked />
                </Box>
              </Stack>

              {/* list 4 */}
              <Stack direction="row" spacing={2} mt={3}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconTruckDelivery size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Đơn hàng đã giao
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Bạn sẽ được thông báo khi đơn hàng được giao thành công
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <CustomSwitch />
                </Box>
              </Stack>

              {/* list 5 */}
              <Stack direction="row" spacing={2} mt={3}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconMail size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Thông báo Email
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Bật thông báo email để nhận cập nhật qua email
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <CustomSwitch checked />
                </Box>
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>

        {/* 2 */}
        <Grid item xs={12} lg={9}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" mb={2}>
                Ngày & Giờ
              </Typography>
              <Typography color="textSecondary">
                Cài đặt múi giờ và hiển thị lịch.
              </Typography>

              {/* list 1 */}
              <Stack direction="row" spacing={2} mt={4}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconClock size="22" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Múi giờ
                  </Typography>
                  <Typography variant="h6" mb={1}>
                    (UTC + 02:00) Athens, Bucharet
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <Tooltip title="Tải xuống">
                    <IconButton>
                      <IconDownload size="22" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>

        {/* 3 */}
        <Grid item xs={12} lg={9}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" mb={2}>
                Bỏ qua theo dõi
              </Typography>

              {/* list 1 */}
              <Stack direction="row" spacing={2} mt={4}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'grey.100', color: 'grey.500', width: 48, height: 48 }}
                >
                  <IconPlayerPause size="22" />
                </Avatar>
                <Box>
                  <Typography variant="h6" mb={1}>
                    Bỏ qua theo dõi trình duyệt
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Cookie trình duyệt
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <CustomSwitch />
                </Box>
              </Stack>
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

export default NotificationTab;
