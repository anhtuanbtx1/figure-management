"use client";
import React, { useState } from 'react';
import { Box, Chip, IconButton, Stack, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { IconPencil, IconTrash, IconUser, IconCheck, IconCircle } from '@tabler/icons-react';
import { KanbanTaskDb, KanbanPriority } from '@/types/apps/kanban-db';

interface Props {
  task: KanbanTaskDb;
  statusName?: string; // Passed from parent since columns are now Days
  onEdit: (task: KanbanTaskDb) => void;
  onDelete: (task: KanbanTaskDb) => void;
  isDragging?: boolean;
}

const priorityConfig = (p?: KanbanPriority) => {
  switch (p) {
    case 'Thấp':
      return { color: '#10B981', bg: '#10B98115', label: 'Thấp', icon: '🟢' };
    case 'Trung bình':
      return { color: '#3B82F6', bg: '#3B82F615', label: 'Trung bình', icon: '🔵' };
    case 'Cao':
      return { color: '#F59E0B', bg: '#F59E0B15', label: 'Cao', icon: '🟡' };
    case 'Khẩn cấp':
      return { color: '#EF4444', bg: '#EF444415', label: 'Khẩn cấp', icon: '🔴' };
    default:
      return { color: '#6B7280', bg: '#6B728015', label: 'Không xác định', icon: '⚪' };
  }
};

const KanbanTaskCard: React.FC<Props> = ({ task, statusName = 'Chưa xác định', onEdit, onDelete, isDragging = false }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const priority = priorityConfig(task.priority);

  const isCompleted = task.columnId === 'col-done' || statusName.toLowerCase().includes('done') || statusName.toLowerCase().includes('hoàn thành');
  const isInProgress = statusName.toLowerCase().includes('progress') || statusName.toLowerCase().includes('đang làm');

  const baseBackground = theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF';
  const completedBg = isCompleted ? alpha(theme.palette.success.main, 0.04) : baseBackground;

  const statusColor = isCompleted
    ? theme.palette.success.main
    : isInProgress
      ? theme.palette.info.main
      : theme.palette.text.secondary;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 2,
        borderRadius: 1, // Sharper corners for utilitarian feel
        bgcolor: completedBg,
        border: '1px solid',
        borderColor: isDragging
          ? theme.palette.primary.main
          : isHovered
            ? alpha(theme.palette.text.primary, 0.2)
            : alpha(theme.palette.divider, 0.8),
        boxShadow: isDragging
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.2)}`
          : isHovered
            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`
            : 'none', // Flat design by default
        transform: isDragging ? 'rotate(1deg) scale(1.02)' : isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
        '&:active': {
          cursor: 'grabbing',
        },
        // Industrial Accent Border
        borderLeft: `4px solid ${isCompleted ? theme.palette.success.main : priority.color}`,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} mb={1}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          {isCompleted && (
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${theme.palette.success.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconCheck size={14} color={theme.palette.success.main} />
            </Box>
          )}
          <Typography
            variant="subtitle1"
            sx={{
              flex: 1,
              lineHeight: 1.3,
              fontWeight: 700, // Bolder typography
              fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace", // Utilitarian monospace hint if available, else clean sans
              letterSpacing: '-0.02em',
              color: isCompleted ? 'text.disabled' : 'text.primary',
              fontSize: '0.95rem',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            ml: 1
          }}
        >
          <Tooltip title="Chỉnh sửa" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              sx={{
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <IconPencil size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(task); }}
              sx={{
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
              }}
            >
              <IconTrash size={14} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 600,
          color: statusColor,
          mb: 1.5,
          fontFamily: 'monospace',
          textTransform: 'uppercase'
        }}
      >
        <IconCircle size={10} fill={statusColor} /> {statusName}
      </Typography>

      {task.description && (
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

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 'auto', pt: 1, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}` }}>
        <Chip
          size="small"
          label={priority.label.toUpperCase()}
          sx={{
            bgcolor: priority.bg,
            color: priority.color,
            borderRadius: 1, // Blocky chips
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.05em',
            height: 22,
            '& .MuiChip-label': { px: 1 }
          }}
        />

        {task.assignee && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconUser
              size={14}
              color={theme.palette.text.secondary}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                maxWidth: 80,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                fontSize: '0.65rem'
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

