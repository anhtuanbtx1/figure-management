'use client';
import { useState } from 'react';
import { Grid, Box, Typography, Button, Fade, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconRefresh, IconPlus, IconX } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import WalletDashboardFiltersComponent from '../../components/apps/wallet/WalletDashboardFilters';
import WalletStatsNew from '../../components/apps/wallet/WalletStatsNew';
import TransactionForm from '../../components/apps/wallet/TransactionForm';
import WalletTransactionList from '../../components/apps/wallet/WalletTransactionList';
import { WalletDashboardFilters } from '@/types/apps/wallet';

const WalletPage = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const getInitialFilters = (): WalletDashboardFilters => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      dateFrom: startOfMonth.toISOString(),
      dateTo: endOfDay.toISOString(),
      categoryId: '',
      type: '',
      status: '',
      dateRangeType: 'month',
      yearMonth: '',
      year: '',
    };
  };

  const [filters, setFilters] = useState<WalletDashboardFilters>(getInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<WalletDashboardFilters>(getInitialFilters);

  const handleFiltersChange = (newFilters: WalletDashboardFilters) => {
    setFilters(newFilters);
    // For quick preset selections, auto-apply so user gets instant updates
    if (newFilters.dateRangeType !== 'custom' && newFilters.dateRangeType !== 'yearMonth') {
      setAppliedFilters(newFilters);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = (resetValues: WalletDashboardFilters) => {
    setFilters(resetValues);
    setAppliedFilters(resetValues);
  };

  const handleRefresh = () => {
    window.dispatchEvent(new Event('walletTransactionCreated'));
  };

  return (
    <PageContainer title="Quản lý ví" description="Quản lý ví điện tử và giao dịch">
      <Grid container spacing={3}>
        {/* Shared Dashboard Filters */}
        <Grid item xs={12}>
          <Fade in timeout={600}>
            <Box>
              <WalletDashboardFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </Box>
          </Fade>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
            <Box>
              <WalletStatsNew filters={appliedFilters} hideFilters />
            </Box>
          </Fade>
        </Grid>

        {/* Transaction List */}
        <Grid item xs={12}>
          <Fade in timeout={800} style={{ transitionDelay: '400ms' }}>
            <Box>
              <Box display="flex" justifyContent="flex-end" mb={2} gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<IconRefresh size={18} />}
                  onClick={handleRefresh}
                  sx={{
                    fontWeight: 600,
                    px: 2.5,
                    py: 1.1,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  Làm mới
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #1B5E20 0%, #43A047 100%)',
                    fontWeight: 700,
                    px: 2.5,
                    py: 1.1,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(27, 94, 32, 0.28)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 18px rgba(27, 94, 32, 0.36)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  Thêm mới
                </Button>
              </Box>
              <WalletTransactionList commonFilters={appliedFilters} />
            </Box>
          </Fade>
        </Grid>
      </Grid>

      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Thêm mới giao dịch
          </Typography>
          <IconButton onClick={() => setOpenCreateDialog(false)} size="small" aria-label="Đóng">
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TransactionForm onCreated={() => setOpenCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default WalletPage;
