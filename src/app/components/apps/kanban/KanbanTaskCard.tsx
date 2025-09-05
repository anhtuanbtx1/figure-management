"use client";
import React, { useState } from 'react';
import { Box, Chip, IconButton, Stack, Typography, Tooltip, Avatar, useTheme, alpha } from '@mui/material';
import { IconPencil, IconTrash, IconUser, IconClock, IconCheck } from '@tabler/icons-react';
import { KanbanTaskDb, KanbanPriority } from '@/types/apps/kanban-db';

interface Props {
  task: KanbanTaskDb;
  onEdit: (task: KanbanTaskDb) => void;
  onDelete: (task: KanbanTaskDb) => void;
  isDragging?: boolean;
}

const priorityConfig = (p?: KanbanPriority) => {
  switch (p) {
    case 'Thấp':
      return { color: '#10B981', bg: '#ECFDF5', label: 'Thấp', icon: '🟢' };
    case 'Trung bình':
      return { color: '#3B82F6', bg: '#EFF6FF', label: 'Trung bình', icon: '🔵' };
    case 'Cao':
      return { color: '#F59E0B', bg: '#FFFBEB', label: 'Cao', icon: '🟡' };
    case 'Khẩn cấp':
      return { color: '#EF4444', bg: '#FEF2F2', label: 'Khẩn cấp', icon: '🔴' };
    default:
      return { color: '#6B7280', bg: '#F9FAFB', label: 'Không xác định', icon: '⚪' };
  }
};

const KanbanTaskCard: React.FC<Props> = ({ task, onEdit, onDelete, isDragging = false }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const priority = priorityConfig(task.priority);

  // Check if task is in completed column
  const isCompleted = task.columnId === 'col-done';

  // Define theme-aware completed task colors
  const completedColors = {
    // Background colors that work with both light and dark themes
    background: isCompleted
      ? theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.dark, 0.15) // Dark theme: darker green with transparency
        : alpha(theme.palette.success.light, 0.1)  // Light theme: light green with transparency
      : 'background.paper',

    // Hover background
    hoverBackground: isCompleted
      ? theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.dark, 0.25) // Dark theme: slightly more opaque
        : alpha(theme.palette.success.light, 0.15) // Light theme: slightly more opaque
      : 'background.paper',

    // Border color
    borderColor: isCompleted
      ? alpha(theme.palette.success.main, 0.3) // Use theme success color for border
      : 'divider',

    // Shadow color for hover
    shadowColor: isCompleted
      ? alpha(theme.palette.success.main, 0.2)
      : alpha(theme.palette.grey[500], 0.1)
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: completedColors.background,
        border: '1px solid',
        borderColor: isDragging
          ? 'primary.main'
          : completedColors.borderColor,
        boxShadow: isDragging
          ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
          : isHovered
            ? `0 4px 20px ${completedColors.shadowColor}`
            : `0 1px 3px ${alpha(theme.palette.grey[500], 0.08)}`,
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : isHovered ? 'translateY(-2px)' : 'none',
        transition: isCompleted
          ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' // Slightly longer transition for completed tasks
          : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          bgcolor: completedColors.hoverBackground,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: priority.color,
          borderRadius: '12px 12px 0 0',
        }
      }}
    >
      {/* Header with title and actions */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} mb={1}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          {isCompleted && (
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 2px 4px ${alpha(theme.palette.success.main, 0.3)}`
              }}
            >
              <IconCheck size={12} color="white" />
            </Box>
          )}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              flex: 1,
              lineHeight: 1.3,
              color: isCompleted
                ? theme.palette.mode === 'dark'
                  ? alpha(theme.palette.text.primary, 0.9) // Better contrast in dark mode
                  : alpha(theme.palette.text.primary, 0.8) // Slightly muted in light mode
                : 'text.primary',
              fontSize: '0.95rem',
              textDecoration: isCompleted ? 'line-through' : 'none',
              textDecorationColor: isCompleted
                ? alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.6 : 0.4)
                : 'transparent'
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
          <Tooltip title="Chỉnh sửa" arrow>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <IconPencil size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa" arrow>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(task); }}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
              }}
            >
              <IconTrash size={14} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Description */}
      {task.description && (
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: isCompleted
              ? theme.palette.mode === 'dark'
                ? alpha(theme.palette.text.secondary, 0.8) // Better contrast in dark mode
                : alpha(theme.palette.text.secondary, 0.7) // Slightly muted in light mode
              : 'text.secondary',
            opacity: isCompleted
              ? theme.palette.mode === 'dark' ? 0.9 : 0.8 // Better visibility in dark mode
              : 1
          }}
        >
          {task.description}
        </Typography>
      )}

      {/* Footer with priority, assignee, and metadata */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Priority indicator */}
          <Chip
            size="small"
            label={priority.label}
            sx={{
              bgcolor: isCompleted
                ? theme.palette.mode === 'dark'
                  ? alpha(priority.color, 0.15) // Slightly more visible in dark mode
                  : alpha(priority.color, 0.1)  // Subtle in light mode
                : priority.bg,
              color: isCompleted
                ? theme.palette.mode === 'dark'
                  ? alpha(priority.color, 0.9) // Better contrast in dark mode
                  : alpha(priority.color, 0.8) // Slightly muted in light mode
                : priority.color,
              border: `1px solid ${alpha(priority.color, isCompleted
                ? theme.palette.mode === 'dark' ? 0.2 : 0.15
                : 0.2)}`,
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 24,
              opacity: isCompleted
                ? theme.palette.mode === 'dark' ? 0.95 : 0.9 // Better visibility in dark mode
                : 1,
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Stack>

        {/* Assignee */}
        {task.assignee && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconUser
              size={14}
              color={isCompleted
                ? theme.palette.mode === 'dark'
                  ? alpha(theme.palette.text.secondary, 0.8)
                  : alpha(theme.palette.text.secondary, 0.7)
                : theme.palette.text.secondary
              }
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                maxWidth: 80,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: isCompleted
                  ? theme.palette.mode === 'dark'
                    ? alpha(theme.palette.text.secondary, 0.8)
                    : alpha(theme.palette.text.secondary, 0.7)
                  : 'text.secondary',
                opacity: isCompleted
                  ? theme.palette.mode === 'dark' ? 0.9 : 0.8
                  : 1
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

