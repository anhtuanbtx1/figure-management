"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Stack, Typography, Avatar, Skeleton, Box } from '@mui/material';
import { IconBrandPinterest, IconBrandFigma, IconBrandChrome } from '@tabler/icons-react';

interface BrandStatItem {
  name: string;
  count: number;
  color: string;
}

const brandIconByName = (name: string) => {
  // Using available Tabler icons as placeholders; can be swapped per brand assets
  switch (name.toLowerCase()) {
    case 'lego':
      return <IconBrandChrome size={22} />; // placeholder
    case 'mattel':
      return <IconBrandFigma size={22} />; // placeholder
    case 'hasbro':
      return <IconBrandPinterest size={22} />; // placeholder
    case 'fisher-price':
      return <IconBrandChrome size={22} />; // placeholder
    default:
      return <IconBrandChrome size={22} />;
  }
};

const numberVN = (n: number) => n.toLocaleString('vi-VN');

const BrandStatsCards: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BrandStatItem[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/toys/stats/brands');
        const data = await res.json();
        if (data?.success && Array.isArray(data.brands)) {
          // Pick top 4
          setItems(data.brands.slice(0, 4));
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error('Failed to fetch brand stats', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : items.map((b, i) => (
              <Grid item xs={12} sm={6} lg={3} key={`${b.name}-${i}`}>
                <Card sx={{ borderLeft: `4px solid ${b.color}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: `${b.color}22`, color: b.color, width: 40, height: 40 }}>
                        {brandIconByName(b.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {b.name || 'Khác'}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {numberVN(b.count)} sản phẩm
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
};

export default BrandStatsCards;

