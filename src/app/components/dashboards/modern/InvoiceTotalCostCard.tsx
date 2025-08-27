'use client'
import { useEffect, useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../shared/DashboardCard';
import { IconReceipt2, IconCurrencyDollar } from '@tabler/icons-react';
import axios from '@/utils/axios';
import { formatVndText } from '@/utils/currency';

interface Props { isLoading?: boolean }

const InvoiceTotalCostCard = ({ isLoading }: Props) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const [total, setTotal] = useState<number>(0);

  const loadTotal = async () => {
    try {
      const res = await axios.get('/api/invoices/total-grand');
      const t = Number(res.data?.data?.total || 0);
      setTotal(t);
    } catch (e) {
      console.error('Failed to load invoice total', e);
    }
  };

  useEffect(() => {
    loadTotal();
    // realtime removed by request
  }, []);

  return (
    <DashboardCard>
      <>
        <Typography variant="subtitle2" color="textSecondary">
          Tổng chi phí hóa đơn
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
          <IconCurrencyDollar width={22} color={primary} />
          <Typography variant="h4">{formatVndText(total)}</Typography>
        </Stack>

        <Box height="8px" />
      </>
    </DashboardCard>
  );
};

export default InvoiceTotalCostCard;

