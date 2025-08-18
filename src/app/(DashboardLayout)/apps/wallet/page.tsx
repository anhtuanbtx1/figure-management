'use client';
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import WalletStatsNew from '../../components/apps/wallet/WalletStatsNew';
import TransactionForm from '../../components/apps/wallet/TransactionForm';
import WalletTransactionList from '../../components/apps/wallet/WalletTransactionList';

const BCrumb = [
  {
    to: '/',
    title: 'Trang chủ',
  },
  {
    title: 'Quản lý ví',
  },
];

const WalletPage = () => {
  return (
    <PageContainer title="Quản lý ví" description="Quản lý ví điện tử và giao dịch">
      {/* <Breadcrumb title="Quản lý ví" items={BCrumb} /> */}
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <WalletStatsNew />
        </Grid>

        {/* Transaction Form */}
        <Grid item xs={12} lg={4}>
          <TransactionForm />
        </Grid>

        {/* Transaction List */}
        <Grid item xs={12} lg={8}>
          <WalletTransactionList />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default WalletPage;
