'use client';

import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  NotificationsActive as ActiveIcon,
  PauseCircle as PausedIcon,
  Warning as UrgentIcon,
  EventAvailable as UpcomingIcon,
} from '@mui/icons-material';
import { Reminder } from '@/app/api/reminders/reminderApi';

interface ReminderStatsProps {
  reminders: Reminder[];
}

const ReminderStats: React.FC<ReminderStatsProps> = ({ reminders }) => {
  const stats = {
    total: reminders.length,
    active: reminders.filter((r) => r.isActive && !r.isPaused).length,
    paused: reminders.filter((r) => r.isPaused).length,
    urgent: reminders.filter((r) => r.priority === 'urgent').length,
    today: reminders.filter((r) => {
      if (!r.nextTriggerDate) return false;
      const today = new Date().toDateString();
      const triggerDate = new Date(r.nextTriggerDate).toDateString();
      return today === triggerDate;
    }).length,
    upcoming: reminders.filter((r) => {
      if (!r.nextTriggerDate) return false;
      const next7Days = new Date();
      next7Days.setDate(next7Days.getDate() + 7);
      return new Date(r.nextTriggerDate) <= next7Days;
    }).length,
  };

  const statCards = [
    {
      title: 'Tổng số',
      value: stats.total,
      icon: <ScheduleIcon />,
      color: '#1976d2',
    },
    {
      title: 'Đang hoạt động',
      value: stats.active,
      icon: <ActiveIcon />,
      color: '#4caf50',
    },
    {
      title: 'Tạm dừng',
      value: stats.paused,
      icon: <PausedIcon />,
      color: '#ff9800',
    },
    {
      title: 'Khẩn cấp',
      value: stats.urgent,
      icon: <UrgentIcon />,
      color: '#f44336',
    },
    {
      title: 'Hôm nay',
      value: stats.today,
      icon: <TodayIcon />,
      color: '#9c27b0',
    },
    {
      title: '7 ngày tới',
      value: stats.upcoming,
      icon: <UpcomingIcon />,
      color: '#00bcd4',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700} color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color, opacity: 0.3 }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReminderStats;