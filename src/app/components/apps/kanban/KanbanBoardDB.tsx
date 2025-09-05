"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Card, CardHeader, CardContent, IconButton, Typography, Stack, Snackbar, Alert, LinearProgress, useTheme, alpha, Fade, Grow, Slide } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import KanbanService from '@/app/(DashboardLayout)/apps/kanban/services/kanbanService';
import { KanbanTaskDb as KanbanTask, KanbanColumn } from '@/types/apps/kanban-db';
import { IconPlus, IconGripVertical } from '@tabler/icons-react';
import TaskEditorDialog from './TaskEditorDialog';
import ConfirmDialog from './ConfirmDialog';
import KanbanTaskCard from './KanbanTaskCard';

interface ColumnState {
  id: string;
  name: string;
  order: number;
  tasks: KanbanTask[];
}

interface KanbanBoardDBProps {
  onDataChange?: () => void; // Callback to notify parent of data changes
}

const organizeTasksIntoColumns = (columns: KanbanColumn[], tasks: KanbanTask[]): ColumnState[] => {
  // Create a map of tasks by columnId
  const tasksByColumn = new Map<string, KanbanTask[]>();
  tasks.forEach(task => {
    const columnTasks = tasksByColumn.get(task.columnId) || [];
    columnTasks.push(task);
    tasksByColumn.set(task.columnId, columnTasks);
  });

  // Create column states with all columns (even empty ones)
  const columnStates = columns.map(col => ({
    id: col.id,
    name: col.name,
    order: col.orderIndex,
    tasks: (tasksByColumn.get(col.id) || []).sort((a, b) => a.orderIndex - b.orderIndex)
  }));

  return columnStates.sort((a, b) => a.order - b.order);
};

const KanbanBoardDB: React.FC<KanbanBoardDBProps> = ({ onDataChange }) => {
  const theme = useTheme();
  const [columns, setColumns] = useState<ColumnState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [snack, setSnack] = useState<{open:boolean; message:string; severity:'success'|'error'|'info'|'warning'}>({open:false,message:'',severity:'success'});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInit, setEditorInit] = useState<Partial<KanbanTask> & { columnId: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [columns, tasks] = await Promise.all([
        KanbanService.fetchColumns('board-1'),
        KanbanService.fetchTasks('board-1')
      ]);
      setColumns(organizeTasksIntoColumns(columns, tasks));
    } catch (e:any) {
      setError(e.message || 'Không thể tải Kanban');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N: Create new task in first column
      if ((event.ctrlKey || event.metaKey) && event.key === 'n' && !editorOpen && !confirmOpen) {
        event.preventDefault();
        if (columns.length > 0) {
          openCreate(columns[0].id);
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
  }, [columns, editorOpen, confirmOpen]);

  const onDragStart = (start: any) => {
    setDraggedTask(start.draggableId);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    setDraggedTask(null);

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update with smooth animation
    setColumns(prev => {
      const cols = prev.map(c => ({ ...c, tasks: [...c.tasks] }));
      const sourceCol = cols.find(c => c.id === source.droppableId)!;
      const destCol = cols.find(c => c.id === destination.droppableId)!;
      const [moved] = sourceCol.tasks.splice(source.index, 1);
      destCol.tasks.splice(destination.index, 0, { ...moved, columnId: destCol.id });
      // reindex
      sourceCol.tasks.forEach((t, i) => (t.orderIndex = i + 1));
      destCol.tasks.forEach((t, i) => (t.orderIndex = i + 1));
      return cols;
    });

    try {
      await KanbanService.moveTask(draggableId, {
        toColumnId: destination.droppableId,
        toPosition: destination.index + 1,
        fromColumnId: source.droppableId,
        boardId: 'board-1',
      });
      setSnack({ open: true, message: 'Đã di chuyển nhiệm vụ', severity: 'success' });
      onDataChange?.(); // Notify parent of data change
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Lỗi di chuyển', severity: 'error' });
      // Reload on failure to restore correct state
      await load();
    }
  };

  const openCreate = useCallback((columnId: string) => {
    setEditorInit({ columnId });
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((task: KanbanTask) => {
    setEditorInit({ ...task });
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
    } catch (e:any) {
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
    } catch (e:any) {
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
          <Typography variant="body2" color="text.secondary">Đang tải bảng Kanban...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>Có lỗi xảy ra</Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // Mobile: single column
            sm: 'repeat(2, 1fr)', // Tablet: 2 columns
            md: 'repeat(4, 1fr)', // Desktop: 4 equal columns
            lg: 'repeat(4, 1fr)'  // Large: 4 equal columns
          },
          gridTemplateRows: {
            xs: 'repeat(4, minmax(400px, auto))', // Mobile: 4 rows
            sm: 'repeat(2, minmax(500px, auto))', // Tablet: 2 rows
            md: 'minmax(600px, auto)', // Desktop: 1 row
            lg: 'minmax(600px, auto)'  // Large: 1 row
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          alignItems: 'stretch', // Make all columns same height
          pb: 2,
          px: { xs: 1, sm: 1.5, md: 2 },
          minHeight: { xs: 'auto', sm: 'calc(100vh - 400px)' },
          width: '100%',
          maxWidth: '100%',
          // Ensure proper grid behavior
          '& > *': {
            minWidth: 0, // Prevent grid items from overflowing
            width: '100%'
          },
          // Fallback for browsers that don't support grid
          '@supports not (display: grid)': {
            display: 'flex',
            flexWrap: 'wrap',
            '& > *': {
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }
            }
          },
          // Mobile: stack columns vertically with scroll
          '@media (max-width: 599px)': {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 300px)',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.grey[300], 0.3),
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.grey[500], 0.5),
              borderRadius: 3,
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[600], 0.7),
              }
            }
          },
          // Tablet and up: horizontal scroll if needed
          '@media (min-width: 600px)': {
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.grey[300], 0.3),
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.grey[500], 0.5),
              borderRadius: 4,
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[600], 0.7),
              }
            }
          },
          // Smooth scrolling
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          {columns.map((col, colIndex) => (
            <Grow
              key={col.id}
              in={true}
              timeout={300 + colIndex * 100}
              style={{ transformOrigin: 'top center' }}
            >
              <Box sx={{
                width: '100%',
                minHeight: { xs: 400, sm: 500, md: 600 },
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`,
                    transition: 'all 0.2s ease',
                    height: '100%',
                    minHeight: { xs: 400, sm: 500, md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.12)}`,
                    }
                  }}
                >
                  <CardHeader
                    title={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconGripVertical size={16} color={theme.palette.text.disabled} />
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {col.name}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {col.tasks.length}
                        </Box>
                      </Stack>
                    }
                    action={
                      <IconButton
                        size="small"
                        onClick={() => openCreate(col.id)}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <IconPlus size={18} color={theme.palette.primary.main} />
                      </IconButton>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent sx={{ pt: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <Stack
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          spacing={2}
                          sx={{
                            flex: 1,
                            minHeight: { xs: 300, sm: 350, md: 400 },
                            p: 1,
                            borderRadius: 2,
                            bgcolor: snapshot.isDraggingOver
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                            border: snapshot.isDraggingOver
                              ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                              : '2px dashed transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: snapshot.isDraggingOver ? 'scale(1.02)' : 'scale(1)',
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
                                        ? 'rotate(5deg)'
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
                                p: 4,
                                textAlign: 'center',
                                color: 'text.disabled',
                                borderRadius: 2,
                                border: `1px dashed ${theme.palette.divider}`,
                              }}
                            >
                              <Typography variant="body2">
                                Chưa có nhiệm vụ nào
                              </Typography>
                              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                Nhấn + để thêm nhiệm vụ mới
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
          ))}
        </DragDropContext>
      </Box>

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
            borderRadius: 2,
            boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.15)}`,
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default KanbanBoardDB;

