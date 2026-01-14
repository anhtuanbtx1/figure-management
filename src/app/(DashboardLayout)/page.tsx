'use client'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useEffect, useState } from 'react';

import PageContainer from '@/app/components/container/PageContainer';
// components
import YearlyBreakup from '@/app/components/dashboards/modern/YearlyBreakup';
import TopCards from '@/app/components/dashboards/modern/TopCards';
import RevenueUpdates from '@/app/components/dashboards/modern/RevenueUpdates';
import EmployeeSalary from '@/app/components/dashboards/modern/EmployeeSalary';
import RecentWalletTransactions from '@/app/components/dashboards/modern/RecentWalletTransactions';
import ToysTotalValueCard from '@/app/components/dashboards/modern/ToysTotalValueCard';


export default function Dashboard() {

  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          {/* column */}
          <Grid item xs={12} lg={12}>
            <TopCards />
          </Grid>
          {/* Row with Revenue Updates and side cards */}
          <Grid item xs={12}>
            <Grid container spacing={3} sx={{ minHeight: 500 }}>
              {/* column - Revenue Updates */}
              <Grid item xs={12} lg={8}>
                <RevenueUpdates isLoading={isLoading} />
              </Grid>
              {/* column - YearlyBreakup & ToysTotalValueCard */}
              <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <YearlyBreakup isLoading={isLoading} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <ToysTotalValueCard isLoading={isLoading} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          {/* Row with EmployeeSalary and RecentWalletTransactions */}
          <Grid item xs={12}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
                <Box sx={{ width: '100%', height: '100%' }}>
                  <EmployeeSalary isLoading={isLoading} />
                </Box>
              </Grid>
              <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
                <Box sx={{ width: '100%', height: '100%' }}>
                  <RecentWalletTransactions />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}

