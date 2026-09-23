"use client";
import React, { useState } from 'react';
import { Avatar, Box, IconButton, ListItemIcon, Menu, MenuItem, Stack, Tooltip, Typography, useTheme, alpha, useMediaQuery } from '@mui/material';
import { IconDots, IconPencil, IconTrash, IconCalendar, IconCircleCheck, IconGripVertical } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { KanbanTaskDb, KanbanPriority } from '@/types/apps/kanban-db';

interface Props {
  task: KanbanTaskDb;
  statusName?: string;
  onEdit: (task: KanbanTaskDb) => void;
  onDelete: (task: KanbanTaskDb) => void;
  isDragging?: boolean;
  compact?: boolean; // Dense layout so a whole week fits on screen
}

const priorityConfig = (p?: KanbanPriority) => {
  switch (p) {
    case 'Thấp':
      return { color: '#2563EB', darkColor: '#60A5FA', label: 'Thấp' };
    case 'Trung bình':
      return { color: '#EA580C', darkColor: '#FB923C', label: 'T.Bình' };
    case 'Cao':
      return { color: '#DC2626', darkColor: '#F87171', label: 'Cao' };
    case 'Khẩn cấp':
      return { color: '#BE123C', darkColor: '#FB7185', label: 'Khẩn!' };
    default:
      return null;
  }
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start) return null;
  const s = dayjs(start);
  if (!end || dayjs(end).isSame(s, 'day')) return s.format('DD/MM');
  return `${s.format('DD/MM')} – ${dayjs(end).format('DD/MM')}`;
};

const KanbanTaskCard: React.FC<Props> = ({ task, statusName = 'Chưa xác định', onEdit, onDelete, isDragging = false, compact = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const priority = priorityConfig(task.priority);

  const status = statusName.toLowerCase();
  const isCompleted = task.columnId === 'col-done' || status.includes('done') || status.includes('hoàn thành');
  const isInProgress = task.columnId === 'col-progress' || status.includes('progress') || status.includes('đang làm');
  const isPending = task.columnId === 'col-pending' || status.includes('pending') || status.includes('chờ xử lý');

  const statusDot = isCompleted ? '#22C55E' : isInProgress ? '#3B82F6' : isPending ? '#F97316' : '#A855F7';
  const dateLabel = formatDateRange(task.startDate, task.endDate);

  const border = isDark ? 'rgba(31, 41, 55, 0.8)' : '#E5E7EB';
  const subtleBorder = isDark ? 'rgba(31, 41, 55, 0.6)' : '#F3F4F6';
  const muted = isDark ? '#9CA3AF' : '#6B7280';

  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box
      className="kanban-card"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 1 : isMobile ? 1.5 : 2,
        p: compact ? 1.5 : isMobile ? 2 : 2.5,
        bgcolor: isDark ? '#1A1B1E' : '#FFFFFF',
        borderRadius: compact ? '12px' : '16px',
        border: `1px solid ${isDragging ? theme.palette.primary.main : border}`,
        boxShadow: isDragging
          ? '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)'
          : '0 1px 2px 0 rgba(0,0,0,0.05)',
        cursor: isMobile ? 'pointer' : 'grab',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        },
        '&:hover .kanban-card-grip': { opacity: 1 },
        '&:active': { cursor: isMobile ? 'pointer' : 'grabbing' },
      }}
    >
      {/* Subtle drag handle on hover */}
      {!isMobile && !compact && (
        <Box
          className="kanban-card-grip"
          sx={{
            position: 'absolute',
            top: '50%',
            left: -12,
            transform: 'translateY(-50%)',
            opacity: 0,
            transition: 'opacity 0.2s',
            color: isDark ? '#4B5563' : '#D1D5DB',
            display: 'flex',
          }}
        >
          <IconGripVertical size={16} />
        </Box>
      )}

      {/* Header: Status tag, Priority & Action menu */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={compact ? 0.5 : 1}>
        <Stack direction="row" flexWrap="wrap" gap={compact ? 0.5 : 1} sx={{ minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: compact ? 0.75 : 1,
              py: compact ? 0.375 : 0.5,
              borderRadius: '6px',
              fontSize: compact ? 10 : 11,
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              bgcolor: isDark ? '#25262B' : '#F3F4F6',
              color: isDark ? '#D1D5DB' : '#374151',
              maxWidth: compact ? '100%' : 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusDot, flexShrink: 0 }} />
            {statusName}
          </Box>
          {priority && (
            <Box
              component="span"
              sx={{
                px: compact ? 0.75 : 1,
                py: compact ? 0.375 : 0.5,
                borderRadius: '6px',
                fontSize: compact ? 10 : 11,
                fontWeight: 700,
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                lineHeight: 1.2,
                color: isDark ? priority.darkColor : priority.color,
                bgcolor: alpha(priority.color, isDark ? 0.1 : 0.08),
              }}
            >
              {priority.label}
            </Box>
          )}
        </Stack>

        <IconButton
          size="small"
          aria-label="Tùy chọn"
          onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
          sx={{
            p: compact ? 0.25 : 0.5,
            mt: compact ? -0.25 : 0,
            color: '#9CA3AF',
            flexShrink: 0,
            '&:hover': { color: isDark ? '#E5E7EB' : '#4B5563', bgcolor: 'transparent' },
          }}
        >
          <IconDots size={compact ? 16 : 18} />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: 140,
                borderRadius: '8px',
                bgcolor: isDark ? '#25262B' : '#FFFFFF',
                border: `1px solid ${isDark ? '#1F2937' : '#F3F4F6'}`,
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                '& .MuiMenuItem-root': { fontSize: 14, fontWeight: 500, py: 1 },
                '& .MuiListItemIcon-root': { minWidth: 26 },
              },
            },
          }}
        >
          <MenuItem onClick={() => { closeMenu(); onEdit(task); }}>
            <ListItemIcon><IconPencil size={14} /></ListItemIcon>
            Chỉnh sửa
          </MenuItem>
          <MenuItem
            onClick={() => { closeMenu(); onDelete(task); }}
            sx={{ color: '#DC2626', '&:hover': { bgcolor: alpha('#EF4444', 0.08) } }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}><IconTrash size={14} /></ListItemIcon>
            Xóa
          </MenuItem>
        </Menu>
      </Stack>

      {/* Body: Title & Description */}
      <Stack spacing={compact ? 0.5 : 0.75} sx={{ mt: compact ? 0 : 0.5 }}>
        <Typography
          component="h4"
          sx={{
            fontSize: compact ? 13 : isMobile ? 14 : 15,
            fontWeight: 700,
            lineHeight: compact ? 1.35 : 1.375,
            ...(compact && {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }),
            color: isCompleted ? muted : isDark ? '#F3F4F6' : '#111827',
            textDecoration: isCompleted ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </Typography>
        {task.description && (
          <Typography
            sx={{
              fontSize: compact ? 12 : isMobile ? 13 : 14,
              lineHeight: compact ? 1.5 : 1.625,
              color: muted,
              display: '-webkit-box',
              WebkitLineClamp: isMobile ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.description}
          </Typography>
        )}
      </Stack>

      {/* Footer: Meta details & Assignee */}
      {(dateLabel || isCompleted || task.assignee) && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: compact ? 0.25 : 0.5, pt: compact ? 1 : 2, borderTop: `1px solid ${subtleBorder}` }}
        >
          <Stack direction="row" alignItems="center" spacing={compact ? 1 : 1.75} sx={{ fontSize: compact ? 11 : 12, fontWeight: 500, color: muted, minWidth: 0 }}>
            {dateLabel && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <IconCalendar size={compact ? 12 : 14} color="#9CA3AF" />
                <span>{dateLabel}</span>
              </Stack>
            )}
            {isCompleted && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <IconCircleCheck size={compact ? 12 : 14} color="#22C55E" />
                {!compact && <span>Xong</span>}
              </Stack>
            )}
          </Stack>

          {task.assignee && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: compact ? 1 : 2, minWidth: 0, flexShrink: 0 }}>
              {!compact && (
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: muted,
                  maxWidth: 90,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.assignee}
              </Typography>
              )}
              <Tooltip title={task.assignee} arrow disableHoverListener={!compact}>
              <Avatar
                sx={{
                  width: compact ? 22 : 28,
                  height: compact ? 22 : 28,
                  fontSize: compact ? 9 : 11,
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.25 : 0.12),
                  color: 'primary.main',
                  border: `2px solid ${isDark ? '#1A1B1E' : '#FFFFFF'}`,
                  boxShadow: `0 0 0 1px ${isDark ? '#1F2937' : '#F3F4F6'}`,
                }}
              >
                {getInitials(task.assignee)}
              </Avatar>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default KanbanTaskCard;
