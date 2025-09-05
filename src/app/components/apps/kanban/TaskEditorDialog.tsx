"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Slide, useTheme, alpha, Stack, Typography, Chip, Box } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { KanbanTaskDb, KanbanPriority } from '@/types/apps/kanban-db';
import { IconX, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

interface TaskEditorDialogProps {
  open: boolean;
  initial?: Partial<KanbanTaskDb> & { columnId: string };
  onClose: () => void;
  onSubmit: (data: Partial<KanbanTaskDb> & { columnId: string; title: string }) => Promise<void> | void;
}

const PRIORITIES: KanbanPriority[] = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TaskEditorDialog: React.FC<TaskEditorDialogProps> = ({ open, initial, onClose, onSubmit }) => {
  const theme = useTheme();
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [priority, setPriority] = useState<KanbanPriority>(initial?.priority || 'Trung bình');
  const [assignee, setAssignee] = useState(initial?.assignee || '');
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setTitle(initial?.title || '');
    setDescription((initial?.description as string) || '');
    setPriority((initial?.priority as KanbanPriority) || 'Trung bình');
    setAssignee(initial?.assignee || '');
  }, [open, initial]);

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !initial?.columnId) return;
    await onSubmit({
      id: initial?.id as string,
      columnId: initial.columnId,
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee || null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 20px 60px ${alpha(theme.palette.grey[900], 0.15)}`,
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            {isEdit ? <IconDeviceFloppy size={20} /> : <IconPlus size={20} />}
            <Typography variant="h6" fontWeight={600}>
              {isEdit ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
            </Typography>
          </Stack>
          <Button
            onClick={onClose}
            size="small"
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.1) }
            }}
          >
            <IconX size={18} />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              label="Tiêu đề nhiệm vụ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả chi tiết"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={3}
              maxRows={6}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Độ ưu tiên"
              value={priority}
              onChange={(e) => setPriority(e.target.value as KanbanPriority)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: p === 'Thấp' ? '#10B981' : p === 'Trung bình' ? '#3B82F6' : p === 'Cao' ? '#F59E0B' : '#EF4444'
                      }}
                    />
                    <Typography>{p}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Người được gán"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: alpha(theme.palette.grey[500], 0.3),
            '&:hover': {
              borderColor: theme.palette.grey[400],
              bgcolor: alpha(theme.palette.grey[500], 0.05)
            }
          }}
        >
          Hủy
        </Button>
        <Button
          disabled={!canSubmit}
          variant="contained"
          onClick={handleSubmit}
          startIcon={isEdit ? <IconDeviceFloppy size={18} /> : <IconPlus size={18} />}
          sx={{
            borderRadius: 2,
            px: 3,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              bgcolor: alpha(theme.palette.grey[500], 0.2),
              color: alpha(theme.palette.grey[500], 0.6)
            },
            transition: 'all 0.2s ease'
          }}
        >
          {isEdit ? 'Lưu thay đổi' : 'Tạo nhiệm vụ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditorDialog;

