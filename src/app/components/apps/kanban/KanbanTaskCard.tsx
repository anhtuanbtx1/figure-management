"use client";
import React, { useState } from 'react';
import { Box, Chip, IconButton, Stack, Typography, Tooltip, useTheme, alpha, useMediaQuery } from '@mui/material';
import { IconPencil, IconTrash, IconUser, IconCheck, IconCircle } from '@tabler/icons-react';
import { KanbanTaskDb, KanbanPriority } from '@/types/apps/kanban-db';

interface Props {
  task: KanbanTaskDb;
  statusName?: string;
  onEdit: (task: KanbanTaskDb) => void;
  onDelete: (task: KanbanTaskDb) => void;
  isDragging?: boolean;
}

const priorityConfig = (p?: KanbanPriority) => {
  switch (p) {
    case 'Thấp':
      return { color: '#10B981', bg: '#10B98120', label: 'Thấp', icon: '🟢' };
    case 'Trung bình':
      return { color: '#3B82F6', bg: '#3B82F620', label: 'T.Bình', icon: '🔵' };
    case 'Cao':
      return { color: '#F59E0B', bg: '#F59E0B20', label: 'Cao', icon: '🟡' };
    case 'Khẩn cấp':
      return { color: '#EF4444', bg: '#EF444420', label: 'Khẩn!', icon: '🔴' };
    default:
      return { color: '#6B7280', bg: '#6B728020', label: '—', icon: '⚪' };
  }
};

const KanbanTaskCard: React.FC<Props> = ({ task, statusName = 'Chưa xác định', onEdit, onDelete, isDragging = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isHovered, setIsHovered] = useState(false);
  const priority = priorityConfig(task.priority);

  const isCompleted = task.columnId === 'col-done' || statusName.toLowerCase().includes('done') || statusName.toLowerCase().includes('hoàn thành');
  const isInProgress = task.columnId === 'col-progress' || statusName.toLowerCase().includes('progress') || statusName.toLowerCase().includes('đang làm');
  const isPending = task.columnId === 'col-pending' || statusName.toLowerCase().includes('pending') || statusName.toLowerCase().includes('chờ xử lý');

  const baseBackground = theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF';
  const cardBg = isCompleted
    ? alpha(theme.palette.success.main, 0.04)
    : isInProgress
      ? alpha(theme.palette.info.main, 0.02)
      : isPending
        ? alpha(theme.palette.warning.main, 0.02)
        : baseBackground;

  const statusColor = isCompleted
    ? theme.palette.success.main
    : isInProgress
      ? theme.palette.info.main
      : isPending
        ? theme.palette.warning.main
        : '#94A3B8';

  const isLight = theme.palette.mode === 'light';
  const customBorderColor = isLight ? 'rgba(0, 0, 0, 0.15)' : alpha(theme.palette.divider, 0.8);

  // On mobile, action buttons are always visible; on desktop, visible on hover
  const showActions = isMobile || isHovered;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 1,
        bgcolor: cardBg,
        border: '1px solid',
        borderColor: isDragging
          ? theme.palette.primary.main
          : isHovered
            ? alpha(theme.palette.text.primary, 0.3)
            : customBorderColor,
        boxShadow: isDragging
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.2)}`
          : isHovered
            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`
            : 'none',
        transform: isDragging ? 'rotate(1deg) scale(1.02)' : isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        cursor: isMobile ? 'pointer' : 'grab',
        position: 'relative',
        overflow: 'hidden',
        '&:active': {
          cursor: isMobile ? 'pointer' : 'grabbing',
        },
        // Thicker status accent border on mobile for easier scanning
        borderLeft: `${isMobile ? 5 : 4}px solid ${statusColor}`,
      }}
    >
      {/* Title Row */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} mb={isMobile ? 0.75 : 1}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {isCompleted && (
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${theme.palette.success.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconCheck size={12} color={theme.palette.success.main} />
            </Box>
          )}
          <Typography
            variant={isMobile ? 'body2' : 'subtitle1'}
            sx={{
              flex: 1,
              lineHeight: 1.3,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
              letterSpacing: '-0.02em',
              color: isCompleted ? 'text.disabled' : 'text.primary',
              fontSize: isMobile ? '0.88rem' : '0.95rem',
              textDecoration: isCompleted ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </Typography>
        </Stack>

        {/* Action buttons — always visible on mobile */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            opacity: showActions ? 1 : 0,
            transition: 'opacity 0.15s ease',
            flexShrink: 0,
          }}
        >
          <Tooltip title="Chỉnh sửa" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              sx={{
                borderRadius: 1,
                width: isMobile ? 28 : 24,
                height: isMobile ? 28 : 24,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <IconPencil size={isMobile ? 13 : 12} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(task); }}
              sx={{
                borderRadius: 1,
                width: isMobile ? 28 : 24,
                height: isMobile ? 28 : 24,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
              }}
            >
              <IconTrash size={isMobile ? 13 : 12} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Status Row */}
      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 600,
          color: statusColor,
          mb: isMobile ? 1 : 1.5,
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          fontSize: isMobile ? '0.65rem' : '0.7rem',
        }}
      >
        <IconCircle size={8} fill={statusColor} /> {statusName}
      </Typography>

      {/* Description */}
      {task.description && !isMobile && (
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: isCompleted ? 'text.disabled' : 'text.secondary',
          }}
        >
          {task.description}
        </Typography>
      )}

      {/* On mobile: description shortened to 1 line */}
      {task.description && isMobile && (
        <Typography
          variant="caption"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: isCompleted ? 'text.disabled' : 'text.secondary',
            mb: 1,
            lineHeight: 1.4,
          }}
        >
          {task.description}
        </Typography>
      )}

      {/* Footer Row: Priority + Assignee */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{
          mt: 'auto',
          pt: isMobile ? 0.75 : 1,
          borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`
        }}
      >
        <Chip
          size="small"
          label={priority.label.toUpperCase()}
          sx={{
            bgcolor: priority.bg,
            color: priority.color,
            borderRadius: 1,
            fontWeight: 700,
            fontSize: isMobile ? '0.68rem' : '0.65rem',
            letterSpacing: '0.05em',
            height: isMobile ? 24 : 22,
            border: `1px solid ${alpha(priority.color, 0.3)}`,
            '& .MuiChip-label': { px: isMobile ? 1.2 : 1 }
          }}
        />

        {task.assignee && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconUser size={12} color={theme.palette.text.secondary} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                maxWidth: isMobile ? 90 : 80,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                fontSize: '0.65rem',
              }}
            >
              {task.assignee}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default KanbanTaskCard;
