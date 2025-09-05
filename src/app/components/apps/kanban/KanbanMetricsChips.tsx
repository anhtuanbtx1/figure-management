"use client";
import React, { useState, useEffect } from 'react';
import { Stack, Chip, useTheme, alpha, Skeleton, Tooltip, Box, Typography, Fade, Grow } from '@mui/material';
import { IconTrendingUp, IconUsers, IconClock, IconTarget, IconActivity, IconRefresh } from '@tabler/icons-react';
import KanbanService from '@/app/(DashboardLayout)/apps/kanban/services/kanbanService';
import { KanbanStats } from '@/types/apps/kanban-db';

interface KanbanMetricsChipsProps {
  boardId?: string;
  onRefresh?: () => void;
}

const KanbanMetricsChips: React.FC<KanbanMetricsChipsProps> = ({ 
  boardId = 'board-1', 
  onRefresh 
}) => {
  const theme = useTheme();
  const [stats, setStats] = useState<KanbanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await KanbanService.fetchStats(boardId, 7); // Last 7 days
      setStats(data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || 'Không thể tải thống kê');
      console.error('Error fetching Kanban stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [boardId]);

  const handleRefresh = () => {
    fetchStats();
    onRefresh?.();
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(auto-fit, minmax(140px, 1fr))',
            sm: 'repeat(auto-fit, minmax(160px, 1fr))',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          width: '100%',
          '@media (max-width: 480px)': {
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }
        }}
      >
        <Skeleton variant="rounded" height={36} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={36} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={36} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={36} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          py: 2
        }}
      >
        <Chip
          icon={<IconRefresh size={16} />}
          label="Tải lại thống kê"
          clickable
          onClick={handleRefresh}
          variant="outlined"
          sx={{
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderColor: alpha(theme.palette.error.main, 0.3),
            color: 'error.main',
            fontWeight: 500,
            height: 40,
            px: 3,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.2),
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease'
          }}
        />
      </Box>
    );
  }

  const completionRate = stats.overview.completionRate;
  const activeUsers = stats.assignments.uniqueAssignees;
  const recentActivity = stats.recentActivity.totalActivity;
  const tasksCompleted = stats.recentActivity.tasksCompleted;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(auto-fit, minmax(140px, 1fr))', // Mobile: auto-fit with minimum width
          sm: 'repeat(auto-fit, minmax(160px, 1fr))', // Tablet: slightly larger minimum
          md: 'repeat(4, 1fr)', // Desktop: 4 equal columns
          lg: 'repeat(4, 1fr)'  // Large: 4 equal columns
        },
        gap: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
        alignItems: 'stretch', // Make all chips same height
        width: '100%',
        // Fallback to flexbox on very small screens
        '@media (max-width: 480px)': {
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        },
        // Ensure chips have consistent styling for visual balance
        '& .MuiChip-root': {
          height: { xs: 36, sm: 40, md: 44 },
          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
          fontWeight: 500,
          px: { xs: 1.5, sm: 2, md: 2.5 },
          justifyContent: 'center',
          // Ensure text doesn't wrap awkwardly
          '& .MuiChip-label': {
            px: { xs: 1, sm: 1.5, md: 2 },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            flex: 1
          },
          // Icon sizing and positioning
          '& .MuiChip-icon': {
            fontSize: { xs: 16, sm: 18, md: 20 },
            ml: { xs: 1, sm: 1.5, md: 2 },
            mr: { xs: 0.5, sm: 1, md: 1 }
          }
        }
      }}
    >
      {/* Performance Metric */}
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Hiệu suất 7 ngày qua:</Typography>
            <Typography variant="body2">• {tasksCompleted} nhiệm vụ hoàn thành</Typography>
            <Typography variant="body2">• {stats.overview.activeTasks} nhiệm vụ đang hoạt động</Typography>
            <Typography variant="body2">• Tỷ lệ hoàn thành: {completionRate.toFixed(1)}%</Typography>
          </Box>
        }
        arrow
        placement="bottom"
      >
        <Chip
          icon={<IconTrendingUp />}
          label={`${tasksCompleted} hoàn thành`}
          clickable
          onClick={handleRefresh}
          variant="outlined"
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            borderColor: alpha(theme.palette.success.main, 0.3),
            color: 'success.main',
            '&:hover': {
              bgcolor: alpha(theme.palette.success.main, 0.2),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.25)}`,
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </Tooltip>

      {/* Team Activity */}
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Hoạt động nhóm:</Typography>
            <Typography variant="body2">• {activeUsers} người đang tham gia</Typography>
            <Typography variant="body2">• {stats.assignments.assignedTasks} nhiệm vụ đã phân công</Typography>
            <Typography variant="body2">• {stats.assignments.unassignedTasks} nhiệm vụ chưa phân công</Typography>
            {stats.assignments.topAssignees.length > 0 && (
              <Typography variant="body2">
                • Hoạt động nhất: {stats.assignments.topAssignees[0].name} ({stats.assignments.topAssignees[0].taskCount} nhiệm vụ)
              </Typography>
            )}
          </Box>
        }
        arrow
        placement="bottom"
      >
        <Chip
          icon={<IconUsers />}
          label={`${activeUsers} thành viên`}
          clickable
          onClick={handleRefresh}
          variant="outlined"
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            borderColor: alpha(theme.palette.info.main, 0.3),
            color: 'info.main',
            '&:hover': {
              bgcolor: alpha(theme.palette.info.main, 0.2),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.25)}`,
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </Tooltip>

      {/* Real-time Activity */}
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Hoạt động gần đây (7 ngày):</Typography>
            <Typography variant="body2">• {stats.recentActivity.tasksCreated} nhiệm vụ mới</Typography>
            <Typography variant="body2">• {stats.recentActivity.tasksUpdated} nhiệm vụ cập nhật</Typography>
            <Typography variant="body2">• {stats.recentActivity.tasksCompleted} nhiệm vụ hoàn thành</Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Cập nhật: {lastUpdated ? formatLastUpdated(lastUpdated) : 'Chưa rõ'}
            </Typography>
          </Box>
        }
        arrow
        placement="bottom"
      >
        <Chip
          icon={<IconActivity />}
          label={`${recentActivity} hoạt động`}
          clickable
          onClick={handleRefresh}
          variant="outlined"
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            borderColor: alpha(theme.palette.warning.main, 0.3),
            color: 'warning.main',
            '&:hover': {
              bgcolor: alpha(theme.palette.warning.main, 0.2),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.25)}`,
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </Tooltip>

      {/* Urgent Tasks Indicator (if any) */}
      {stats.priorities.urgent > 0 && (
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Nhiệm vụ khẩn cấp:</Typography>
              <Typography variant="body2">• {stats.priorities.urgent} nhiệm vụ khẩn cấp</Typography>
              <Typography variant="body2">• {stats.priorities.high} nhiệm vụ ưu tiên cao</Typography>
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                Cần xử lý ngay!
              </Typography>
            </Box>
          }
          arrow
          placement="bottom"
        >
          <Chip
            icon={<IconTarget />}
            label={`${stats.priorities.urgent} khẩn cấp`}
            clickable
            onClick={handleRefresh}
            variant="outlined"
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              borderColor: alpha(theme.palette.error.main, 0.3),
              color: 'error.main',
              fontWeight: 600,
              animation: 'pulse 2s infinite',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.2),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.25)}`,
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 },
              }
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default KanbanMetricsChips;
