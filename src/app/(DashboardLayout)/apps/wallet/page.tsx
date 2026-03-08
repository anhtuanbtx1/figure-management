'use client';
import { Grid, Box, Typography, Button, Fade, Zoom, Chip } from '@mui/material';
import { IconWallet, IconRefresh, IconCash, IconArrowsExchange } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import WalletStatsNew from '../../components/apps/wallet/WalletStatsNew';
import TransactionForm from '../../components/apps/wallet/TransactionForm';
import WalletTransactionList from '../../components/apps/wallet/WalletTransactionList';

const WalletPage = () => {
  return (
    <PageContainer title="Quản lý ví" description="Quản lý ví điện tử và giao dịch">
      {/* Keyframes */}
      <style>{`
        @keyframes walletFloat1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(6deg); }
        }
        @keyframes walletFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-4deg); }
        }
        @keyframes walletPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 24px 8px rgba(255,255,255,0.1); }
        }
        @keyframes coinSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>

      {/* Hero Header */}
      <Fade in timeout={600}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 30%, #43A047 60%, #66BB6A 100%)',
            color: 'white',
            p: 4,
            borderRadius: 4,
            mb: 3,
            boxShadow: '0 12px 40px rgba(27, 94, 32, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -90,
              left: -40,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            },
          }}
        >
          {/* Floating decorations */}
          <Box sx={{ position: 'absolute', top: 18, right: 70, fontSize: 30, opacity: 0.12, animation: 'walletFloat1 4s ease-in-out infinite', zIndex: 0 }}>💰</Box>
          <Box sx={{ position: 'absolute', top: 55, right: 200, fontSize: 22, opacity: 0.08, animation: 'walletFloat2 5s ease-in-out infinite 0.5s', zIndex: 0 }}>💳</Box>
          <Box sx={{ position: 'absolute', bottom: 12, right: 130, fontSize: 26, opacity: 0.1, animation: 'walletFloat1 3.5s ease-in-out infinite 1s', zIndex: 0 }}>📊</Box>
          <Box sx={{ position: 'absolute', top: 25, right: 340, fontSize: 18, opacity: 0.06, animation: 'walletFloat2 6s ease-in-out infinite 1.5s', zIndex: 0 }}>🏦</Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" gap={2.5}>
              <Box sx={{
                p: 2, borderRadius: 3,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                animation: 'walletPulse 3s ease-in-out infinite',
              }}>
                <IconWallet size={36} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  💵 Quản lý Ví
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Theo dõi thu chi, quản lý tài chính cá nhân hiệu quả
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1.5}>
              <Button
                variant="contained"
                startIcon={<IconRefresh size={18} />}
                onClick={() => window.dispatchEvent(new Event('walletTransactionCreated'))}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Làm mới
              </Button>
            </Box>
          </Box>

          {/* Quick info chips */}
          <Box display="flex" gap={2} mt={3} position="relative" zIndex={1} flexWrap="wrap">
            {[
              { icon: <IconCash size={16} />, label: 'Thu chi hàng ngày', delay: 0 },
              { icon: <IconArrowsExchange size={16} />, label: 'Giao dịch tự động', delay: 100 },
              { icon: <IconWallet size={16} />, label: 'Quản lý danh mục', delay: 200 },
            ].map((item, i) => (
              <Zoom in key={i} style={{ transitionDelay: `${item.delay}ms` }}>
                <Chip
                  icon={item.icon}
                  label={item.label}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    '& .MuiChip-icon': { color: 'white' },
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </Zoom>
            ))}
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
            <Box>
              <WalletStatsNew />
            </Box>
          </Fade>
        </Grid>

        {/* Transaction Form */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={800} style={{ transitionDelay: '400ms' }}>
            <Box>
              <TransactionForm />
            </Box>
          </Fade>
        </Grid>

        {/* Transaction List */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={800} style={{ transitionDelay: '500ms' }}>
            <Box>
              <WalletTransactionList />
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default WalletPage;
