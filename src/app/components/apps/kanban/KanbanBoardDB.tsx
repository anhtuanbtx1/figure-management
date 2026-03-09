"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Card, CardHeader, CardContent, IconButton, Typography, Stack, Snackbar, Alert, LinearProgress, useTheme, alpha, Fade, Grow, Slide, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import KanbanService from '@/app/(DashboardLayout)/apps/kanban/services/kanbanService';
import { KanbanTaskDb as KanbanTask, KanbanColumn } from '@/types/apps/kanban-db';
import { IconPlus, IconGripVertical, IconColumns, IconCalendarTime, IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import TaskEditorDialog from './TaskEditorDialog';
import ConfirmDialog from './ConfirmDialog';
import KanbanTaskCard from './KanbanTaskCard';
import KanbanWeeklyGantt from './KanbanWeeklyGantt';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface ColumnState {
  id: string; // 'unscheduled' or 'YYYY-MM-DD'
  name: string;
  order: number;
  tasks: KanbanTask[];
}

interface KanbanBoardDBProps {
  onDataChange?: () => void; // Callback to notify parent of data changes
}

const KanbanBoardDB: React.FC<KanbanBoardDBProps> = ({ onDataChange }) => {
  const theme = useTheme();
  // We keep columns from DB to know status names, but we render Day columns
  const [dbColumns, setDbColumns] = useState<KanbanColumn[]>([]);
  const [allTasks, setAllTasks] = useState<KanbanTask[]>([]);

  const [columns, setColumns] = useState<ColumnState[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInit, setEditorInit] = useState<Partial<KanbanTask> & { columnId: string, startDate?: string, endDate?: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'board' | 'weekly'>('board');
  const [currentWeekDate, setCurrentWeekDate] = useState(dayjs());

  const generateWeekColumns = useCallback((tasks: KanbanTask[], weekDate: dayjs.Dayjs) => {
    const startOfWeek = weekDate.startOf('isoWeek');

    const newCols: ColumnState[] = [];
    newCols.push({ id: 'unscheduled', name: 'Chưa lên lịch', order: -1, tasks: [] });

    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      newCols.push({ id: day.format('YYYY-MM-DD'), name: day.format('dddd (DD/MM)'), order: i, tasks: [] });
    }

    // Distribute tasks
    tasks.forEach(task => {
      if (!task.startDate) {
        newCols[0].tasks.push(task);
      } else {
        const taskDate = dayjs(task.startDate).format('YYYY-MM-DD');
        const targetCol = newCols.find(c => c.id === taskDate);
        if (targetCol) {
          targetCol.tasks.push(task);
        } else {
          // If it belongs to a different week, we might still put it in unscheduled for this view, 
          // but usually we just don't show it if we are strictly filtering by week.
          // For safety, let's just not render it in this week's board if it doesn't match.
        }
      }
    });

    // We can sort tasks inside the column by orderIndex for stability
    newCols.forEach(col => col.tasks.sort((a, b) => a.orderIndex - b.orderIndex));
    return newCols;
  }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [fetchedColumns, fetchedTasks] = await Promise.all([
        KanbanService.fetchColumns('board-1'),
        KanbanService.fetchTasks('board-1')
      ]);
      setDbColumns(fetchedColumns);
      setAllTasks(fetchedTasks);
    } catch (e: any) {
      setError(e.message || 'Không thể tải Kanban');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (allTasks.length > 0 || dbColumns.length > 0) {
      setColumns(generateWeekColumns(allTasks, currentWeekDate));
    }
  }, [allTasks, currentWeekDate, generateWeekColumns, dbColumns.length]);

  const handlePrevWeek = () => setCurrentWeekDate(prev => prev.subtract(1, 'week'));
  const handleNextWeek = () => setCurrentWeekDate(prev => prev.add(1, 'week'));
  const handleToday = () => setCurrentWeekDate(dayjs());

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N: Create new task in first column
      if ((event.ctrlKey || event.metaKey) && event.key === 'n' && !editorOpen && !confirmOpen) {
        event.preventDefault();
        // Default to first real column if available
        if (dbColumns.length > 0) {
          const firstColId = dbColumns[0].id;
          openCreate(firstColId, 'unscheduled');
        }
      }
      // Escape: Close dialogs
      if (event.key === 'Escape') {
        if (editorOpen) setEditorOpen(false);
        if (confirmOpen) setConfirmOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dbColumns, editorOpen, confirmOpen]);

  const onDragStart = (start: any) => {
    setDraggedTask(start.draggableId);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    setDraggedTask(null);

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    let newStartDate: string | null = null;
    let newEndDate: string | null = null;

    if (destColId !== 'unscheduled') {
      newStartDate = destColId; // "YYYY-MM-DD"
      // Try to keep the same duration if possible, else 1 day.
      const originalTask = allTasks.find(t => t.id === draggableId);
      if (originalTask && originalTask.startDate && originalTask.endDate) {
        const daysDiff = dayjs(originalTask.endDate).diff(dayjs(originalTask.startDate), 'day');
        newEndDate = dayjs(newStartDate).add(daysDiff, 'day').format('YYYY-MM-DD');
      } else {
        newEndDate = newStartDate;
      }
    }

    // Optimistic UI update with smooth animation
    setColumns(prev => {
      const cols = prev.map(c => ({ ...c, tasks: [...c.tasks] }));
      const sourceCol = cols.find(c => c.id === sourceColId)!;
      const destCol = cols.find(c => c.id === destColId)!;
      const [moved] = sourceCol.tasks.splice(source.index, 1);

      const updatedMoved = { ...moved, startDate: newStartDate, endDate: newEndDate };
      destCol.tasks.splice(destination.index, 0, updatedMoved);

      return cols;
    });

    try {
      // Use updateTask instead of moveTask since we are changing dates, not status column
      await KanbanService.updateTask(draggableId, {
        startDate: newStartDate,
        endDate: newEndDate,
        // we might need to update ThuTu if we want ordering within day, but currently backend orders by columnId
      });
      setSnack({ open: true, message: 'Đã thay đổi lịch trình', severity: 'success' });
      onDataChange?.(); // Notify parent of data change
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Lỗi cập nhật', severity: 'error' });
      // Reload on failure to restore correct state
      await load();
    }
  };

  const openCreate = useCallback((columnId: string, destColId: string) => {
    // destColId is the visual column ('unscheduled' or 'YYYY-MM-DD')
    const initData: any = { columnId };
    if (destColId !== 'unscheduled') {
      initData.startDate = destColId;
      initData.endDate = destColId;
    }
    setEditorInit(initData);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((task: KanbanTask) => {
    setEditorInit({
      ...task,
      startDate: task.startDate || undefined,
      endDate: task.endDate || undefined
    });
    setEditorOpen(true);
  }, []);

  const handleSubmitEditor = async (payload: Partial<KanbanTask> & { columnId: string; title: string }) => {
    try {
      if (payload.id) {
        await KanbanService.updateTask(payload.id as string, payload);
        setSnack({ open: true, message: 'Cập nhật nhiệm vụ thành công', severity: 'success' });
      } else {
        const created = await KanbanService.createTask(payload);
        setNewTaskId(created.id);
        setTimeout(() => setNewTaskId(null), 1000); // Clear animation after 1s
        setSnack({ open: true, message: 'Tạo nhiệm vụ thành công', severity: 'success' });
      }
      setEditorOpen(false);
      await load();
      onDataChange?.(); // Notify parent of data change
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Lỗi xử lý nhiệm vụ', severity: 'error' });
    }
  };

  const requestDelete = useCallback((task: KanbanTask) => {
    setTaskToDelete(task);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeletingTaskId(taskToDelete.id);
      await KanbanService.deleteTask(taskToDelete.id);
      setSnack({ open: true, message: 'Đã xóa nhiệm vụ', severity: 'success' });
      setTimeout(async () => {
        setDeletingTaskId(null);
        await load();
        onDataChange?.(); // Notify parent of data change
      }, 300); // Delay to show delete animation
    } catch (e: any) {
      setDeletingTaskId(null);
      setSnack({ open: true, message: e.message || 'Xóa thất bại', severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack alignItems="center" spacing={2}>
          <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
          <Typography variant="body2" color="text.secondary" fontFamily="monospace">Khởi tạo hệ thống...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.error.main}` }}>
        <Typography color="error" variant="h6" gutterBottom fontFamily="monospace">Hệ thống báo lỗi</Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5), p: 0.5, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
            <IconButton size="small" onClick={handlePrevWeek} sx={{ borderRadius: 1 }}>
              <IconChevronLeft size={18} />
            </IconButton>
            <Typography variant="body2" fontWeight={700} sx={{ px: 2, fontFamily: 'monospace', minWidth: 140, textAlign: 'center' }}>
              Tuần {currentWeekDate.isoWeek()} - {currentWeekDate.format('YYYY')}
            </Typography>
            <IconButton size="small" onClick={handleNextWeek} sx={{ borderRadius: 1 }}>
              <IconChevronRight size={18} />
            </IconButton>
          </Box>
          <IconButton size="small" onClick={handleToday} sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            borderRadius: 1,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
          }}>
            <IconCalendar size={18} />
          </IconButton>
        </Stack>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newVal) => { if (newVal) setViewMode(newVal); }}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            '.MuiToggleButton-root': {
              fontFamily: 'monospace',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              letterSpacing: 0.5,
              border: 'none',
              transition: 'all 0.2s',
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: 'primary.main',
              }
            }
          }}
        >
          <ToggleButton value="board">
            <IconColumns size={18} style={{ marginRight: 8 }} />
            BOARD
          </ToggleButton>
          <ToggleButton value="weekly">
            <IconCalendarTime size={18} style={{ marginRight: 8 }} />
            GANTT
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {viewMode === 'board' ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: { xs: 2 },
            pb: 2,
            px: { xs: 1, sm: 1.5, md: 2 },
            width: '100%',
            overflowX: 'auto', // Important for 8 columns!
          }}
        >
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            {columns.map((col, colIndex) => {
              const isToday = col.id === dayjs().format('YYYY-MM-DD');
              return (
                <Grow
                  key={col.id}
                  in={true}
                  timeout={300 + colIndex * 50}
                  style={{ transformOrigin: 'top center' }}
                >
                  <Box sx={{
                    minWidth: 300,
                    width: 320,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Card
                      elevation={0}
                      sx={{
                        bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.4),
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1, // Sharp corners
                        border: '1px solid',
                        borderColor: isToday ? 'primary.main' : 'divider',
                        transition: 'all 0.2s ease',
                        height: '100%',
                        minHeight: { xs: 400, sm: 500, md: 600 },
                        display: 'flex',
                        flexDirection: 'column',
                        // Utilitarian header decoration concept
                      }}
                    >
                      <CardHeader
                        title={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconGripVertical size={16} color={theme.palette.text.disabled} />
                            <Typography variant="subtitle1" fontWeight={700} color={isToday ? 'primary.main' : 'text.primary'} sx={{
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                              fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace"
                            }}>
                              {col.name}
                            </Typography>
                            <Box
                              sx={{
                                bgcolor: isToday ? theme.palette.primary.main : theme.palette.text.primary,
                                color: theme.palette.background.default,
                                borderRadius: 1,
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}
                            >
                              {col.tasks.length}
                            </Box>
                          </Stack>
                        }
                        action={
                          <IconButton
                            size="small"
                            onClick={() => openCreate(dbColumns[0]?.id || '', col.id)}
                            sx={{
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <IconPlus size={18} />
                          </IconButton>
                        }
                        sx={{
                          pb: 1.5,
                          pt: 2,
                          px: 2,
                          borderBottom: `2px solid ${alpha(isToday ? theme.palette.primary.main : theme.palette.divider, 0.5)}`
                        }}
                      />
                      <CardContent sx={{ pt: 2, flex: 1, display: 'flex', flexDirection: 'column', bgcolor: alpha(theme.palette.background.default, 0.3) }}>
                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <Stack
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              spacing={2}
                              sx={{
                                flex: 1,
                                p: 0.5,
                                borderRadius: 1,
                                bgcolor: snapshot.isDraggingOver
                                  ? alpha(theme.palette.primary.main, 0.05)
                                  : 'transparent',
                                border: snapshot.isDraggingOver
                                  ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                                  : '2px dashed transparent',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                            >
                              {col.tasks.map((t, i) => (
                                <Draggable key={t.id} draggableId={t.id} index={i}>
                                  {(prov, snap) => (
                                    <Fade
                                      in={deletingTaskId !== t.id}
                                      timeout={300}
                                      appear={newTaskId === t.id}
                                    >
                                      <Box
                                        ref={prov.innerRef}
                                        {...prov.draggableProps}
                                        {...prov.dragHandleProps}
                                        sx={{
                                          opacity: snap.isDragging ? 0.8 : deletingTaskId === t.id ? 0 : 1,
                                          transform: snap.isDragging
                                            ? 'rotate(2deg) scale(1.02)'
                                            : newTaskId === t.id
                                              ? 'scale(1.05)'
                                              : deletingTaskId === t.id
                                                ? 'scale(0.8)'
                                                : 'none',
                                          zIndex: snap.isDragging ? 1000 : 'auto',
                                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                      >
                                        <KanbanTaskCard
                                          task={t}
                                          statusName={dbColumns.find(c => c.id === t.columnId)?.name || 'Chưa xác định'}
                                          onEdit={openEdit}
                                          onDelete={requestDelete}
                                          isDragging={draggedTask === t.id}
                                        />
                                      </Box>
                                    </Fade>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {/* Empty state */}
                              {col.tasks.length === 0 && (
                                <Box
                                  sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    color: 'text.disabled',
                                    borderRadius: 1,
                                    border: `1px dashed ${theme.palette.divider}`,
                                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                                  }}
                                >
                                  <Typography variant="body2" fontFamily="monospace">
                                    [ RỖNG ]
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  </Box>
                </Grow>
              )
            })}
          </DragDropContext>
        </Box>
      ) : (
        <Box sx={{ height: { xs: 500, md: 600 } }}>
          <KanbanWeeklyGantt columns={columns} />
        </Box>
      )}

      <TaskEditorDialog
        open={editorOpen}
        initial={editorInit as any}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmitEditor}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa nhiệm vụ"
        message="Hành động không thể khôi phục."
      />
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{
            borderRadius: 1,
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default KanbanBoardDB;

