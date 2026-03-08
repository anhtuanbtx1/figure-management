"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Stack, Typography, Avatar, Skeleton, Box, Zoom, LinearProgress } from '@mui/material';
import { IconBrandPinterest, IconBrandFigma, IconBrandChrome, IconTrendingUp } from '@tabler/icons-react';

interface BrandStatItem {
  name: string;
  count: number;
  color: string;
}

const brandIconByName = (name: string) => {
  switch (name.toLowerCase()) {
    case 'lego':
      return <IconBrandChrome size={24} />;
    case 'mattel':
      return <IconBrandFigma size={24} />;
    case 'hasbro':
      return <IconBrandPinterest size={24} />;
    case 'fisher-price':
      return <IconBrandChrome size={24} />;
    default:
      return <IconBrandChrome size={24} />;
  }
};

const brandEmojis: Record<string, string> = {
  soccerwe: '⚽',
  kodoto: '🎨',
  repaint: '🖌️',
  prostart: '🌟',
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

  const totalCount = items.reduce((acc, b) => acc + b.count, 0);

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <IconTrendingUp size={22} color="#FF6B6B" />
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Thương hiệu nổi bật
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 3 }} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="rounded" width="100%" height={6} sx={{ mt: 1 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
          : items.map((b, i) => (
            <Grid item xs={12} sm={6} lg={3} key={`${b.name}-${i}`}>
              <Zoom in style={{ transitionDelay: `${i * 100}ms` }}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 32px ${b.color || '#1976d2'}20`,
                      borderColor: `${b.color || '#1976d2'}50`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: `linear-gradient(180deg, ${b.color || '#1976d2'}, ${b.color || '#1976d2'}60)`,
                      borderRadius: '4px 0 0 4px',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2.5} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: `${b.color || '#1976d2'}12`,
                          color: b.color || '#1976d2',
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          fontSize: 28,
                          transition: 'all 0.35s ease',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                        }}
                      >
                        {brandEmojis[b.name.toLowerCase()] || brandIconByName(b.name)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 0.3 }}>
                          {b.name || 'Khác'}
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                          {numberVN(b.count)}{' '}
                          <Typography component="span" variant="body2" color="text.secondary" fontWeight={500}>
                            sản phẩm
                          </Typography>
                        </Typography>
                        {/* Progress bar showing market share */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={totalCount > 0 ? (b.count / totalCount) * 100 : 0}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: `${b.color || '#1976d2'}15`,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                backgroundColor: b.color || '#1976d2',
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ minWidth: 32 }}>
                            {totalCount > 0 ? Math.round((b.count / totalCount) * 100) : 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                  {/* Large watermark icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -10,
                      bottom: -10,
                      opacity: 0.04,
                      fontSize: 80,
                      pointerEvents: 'none',
                      transition: 'all 0.35s ease',
                    }}
                  >
                    {brandEmojis[b.name.toLowerCase()] || '🧸'}
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default BrandStatsCards;
