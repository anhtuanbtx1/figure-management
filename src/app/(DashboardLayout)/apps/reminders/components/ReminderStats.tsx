'use client';

import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  ListAlt as TotalIcon,
  CheckCircle as ActiveIcon,
  PauseCircle as PausedIcon,
  EventAvailable as UpcomingIcon,
} from '@mui/icons-material';
import { Reminder } from '../types';

interface ReminderStatsProps {
  reminders: Reminder[];
}

const ReminderStats: React.FC<ReminderStatsProps> = ({ reminders }) => {
  const totalReminders = reminders.length;
  const activeReminders = reminders.filter((r) => r.isActive && !r.isPaused).length;
  const pausedReminders = reminders.filter((r) => r.isPaused).length;

  const upcomingReminders = reminders.filter((r) => {
    if (!r.nextTriggerDate) return false;
    const nextTrigger = new Date(r.nextTriggerDate);
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return nextTrigger > now && nextTrigger <= in24Hours;
  }).length;

  const stats = [
    {
      title: 'Tổng số',
      value: totalReminders,
      icon: <TotalIcon color="primary" />,
      color: 'primary.main',
    },
    {
      title: 'Đang hoạt động',
      value: activeReminders,
      icon: <ActiveIcon color="success" />,
      color: 'success.main',
    },
    {
      title: 'Đang tạm dừng',
      value: pausedReminders,
      icon: <PausedIcon color="warning" />,
      color: 'warning.main',
    },
    {
      title: 'Sắp tới (24h)',
      value: upcomingReminders,
      icon: <UpcomingIcon color="info" />,
      color: 'info.main',
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card elevation={0} sx={{ border: `1px solid ${stat.color}`, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReminderStats;
