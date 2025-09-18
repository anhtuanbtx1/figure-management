import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

// components
import BlankCard from '../../shared/BlankCard';
import { Stack } from '@mui/system';
import { IconDeviceLaptop, IconDeviceMobile, IconDotsVertical } from '@tabler/icons-react';

const SecurityTab = () => {
  return (
    <>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={8}>
          <BlankCard>
            <CardContent>
              <Typography variant="h4" mb={2}>
                Xác thực hai yếu tố
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Tăng cường bảo mật tài khoản của bạn bằng cách bật xác thực hai yếu tố.
                  Điều này sẽ yêu cầu mã xác minh bổ sung khi đăng nhập.
                </Typography>
                <Button variant="contained" color="primary">
                  Bật
                </Button>
              </Stack>

              <Divider />

              {/* list 1 */}
              <Stack direction="row" spacing={2} py={2} alignItems="center">
                <Box>
                  <Typography variant="h6">Ứng dụng xác thực</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Ứng dụng Google Authenticator
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <Button variant="text" color="primary">
                    Thiết lập
                  </Button>
                </Box>
              </Stack>
              <Divider />
              {/* list 2 */}
              <Stack direction="row" spacing={2} py={2} alignItems="center">
                <Box>
                  <Typography variant="h6">Email khác</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Email để gửi liên kết xác minh
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <Button variant="text" color="primary">
                    Thiết lập
                  </Button>
                </Box>
              </Stack>
              <Divider />
              {/* list 3 */}
              <Stack direction="row" spacing={2} py={2} alignItems="center">
                <Box>
                  <Typography variant="h6">Khôi phục SMS</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Số điện thoại của bạn để khôi phục tài khoản
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <Button variant="text" color="primary">
                    Thiết lập
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <BlankCard>
            <CardContent>
              <Avatar
                variant="rounded"
                sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}
              >
                <IconDeviceLaptop size="26" />
              </Avatar>

              <Typography variant="h5" mt={2}>
                Thiết bị
              </Typography>
              <Typography color="textSecondary" mt={1} mb={2}>
                Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn.
              </Typography>
              <Button variant="contained" color="primary">
                Đăng xuất khỏi tất cả thiết bị
              </Button>

              {/* list 1 */}
              <Stack direction="row" spacing={2} py={2} mt={3} alignItems="center">
                <IconDeviceMobile size="26" />

                <Box>
                  <Typography variant="h6">iPhone 14</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    London UK, 23 tháng 10 lúc 1:15 AM
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <IconButton>
                    <IconDotsVertical size="22" />
                  </IconButton>
                </Box>
              </Stack>
              <Divider />
              {/* list 2 */}
              <Stack direction="row" spacing={2} py={2} alignItems="center">
                <IconDeviceLaptop size="26" />

                <Box>
                  <Typography variant="h6">Macbook Air </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Gujarat India, 24 tháng 10 lúc 3:15 AM
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <IconButton>
                    <IconDotsVertical size="22" />
                  </IconButton>
                </Box>
              </Stack>
              <Stack>
                <Button variant="text" color="primary">
                  Cần trợ giúp?
                </Button>
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

export default SecurityTab;
