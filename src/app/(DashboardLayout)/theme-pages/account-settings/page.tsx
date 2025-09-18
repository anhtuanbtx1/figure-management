'use client'

import * as React from 'react';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import { Grid, Tabs, Tab, Box, CardContent, Divider } from '@mui/material';

// components
import AccountTab from '@/app/components/pages/account-setting/AccountTab';
import { IconArticle, IconBell, IconLock, IconUserCircle } from '@tabler/icons-react';
import BlankCard from '@/app/components/shared/BlankCard';
import NotificationTab from '@/app/components/pages/account-setting/NotificationTab';
import BillsTab from '@/app/components/pages/account-setting/BillsTab';
import SecurityTab from '@/app/components/pages/account-setting/SecurityTab';

const BCrumb = [
  {
    to: '/',
    title: 'Trang chủ',
  },
  {
    title: 'Cài đặt tài khoản',
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AccountSetting = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Cài đặt tài khoản" description="Trang cài đặt tài khoản người dùng">
      {/* breadcrumb */}
      <Breadcrumb title="Cài đặt tài khoản" items={BCrumb} />
      {/* end breadcrumb */}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BlankCard>
            <Box sx={{ maxWidth: { xs: 320, sm: 480 } }}>
              <Tabs
                value={value}
                onChange={handleChange}
                scrollButtons="auto"
                aria-label="basic tabs example"
              >
                <Tab
                  iconPosition="start"
                  icon={<IconUserCircle size="22" />}
                  label="Tài khoản"
                  {...a11yProps(0)}
                />

                <Tab
                  iconPosition="start"
                  icon={<IconBell size="22" />}
                  label="Thông báo"
                  {...a11yProps(1)}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconArticle size="22" />}
                  label="Thanh toán"
                  {...a11yProps(2)}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconLock size="22" />}
                  label="Bảo mật"
                  {...a11yProps(3)}
                />
              </Tabs>
            </Box>
            <Divider />
            <CardContent>
              <TabPanel value={value} index={0}>
                <AccountTab />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <NotificationTab />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <BillsTab />
              </TabPanel>
              <TabPanel value={value} index={3}>
                <SecurityTab />
              </TabPanel>
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AccountSetting;
