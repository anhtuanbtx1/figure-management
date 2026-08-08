"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Card, CardHeader, CardContent, IconButton, Typography, Stack, LinearProgress, useTheme, alpha, Fade, Grow, ToggleButton, ToggleButtonGroup, Tabs, Tab, Chip, useMediaQuery, Fab, Tooltip } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import KanbanService from '@/app/(DashboardLayout)/apps/kanban/services/kanbanService';
import { KanbanTaskDb as KanbanTask, KanbanColumn } from '@/types/apps/kanban-db';
import { IconPlus, IconGripVertical, IconColumns, IconCalendarTime, IconCalendar, IconChevronLeft, IconChevronRight, IconCalendarOff } from '@tabler/icons-react';
import TaskEditorDialog from './TaskEditorDialog';
import ConfirmDialog from './ConfirmDialog';
import KanbanTaskCard from './KanbanTaskCard';
import KanbanWeeklyGantt from './KanbanWeeklyGantt';
import ModernNotification from '@/app/components/shared/ModernNotification';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

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
  }, [dbColumns, editorOpen, confirmOpen, openCreate]);

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

  const isLight = theme.palette.mode === 'light';
  const customBorderColor = isLight ? 'rgba(0, 0, 0, 0.12)' : alpha(theme.palette.divider, 0.5);

  return (
    <>
      {/* === HEADER: Week Navigation + View Toggle === */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: isMobile ? 1.5 : 3 }}
        flexWrap="wrap"
        gap={1}
      >
        {/* Week Navigation */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            p: 0.5,
            borderRadius: 1,
            border: `1px solid ${customBorderColor}`
          }}>
            <IconButton size="small" onClick={handlePrevWeek} sx={{ borderRadius: 1, p: isMobile ? 0.5 : 0.75 }}>
              <IconChevronLeft size={isMobile ? 16 : 18} />
            </IconButton>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                px: isMobile ? 1 : 2,
                fontFamily: 'monospace',
                minWidth: isMobile ? 100 : 140,
                textAlign: 'center',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              }}
            >
              {isMobile
                ? `T${currentWeekDate.isoWeek()}/${currentWeekDate.format('YY')}`
                : `Tuần ${currentWeekDate.isoWeek()} - ${currentWeekDate.format('YYYY')}`
              }
            </Typography>
            <IconButton size="small" onClick={handleNextWeek} sx={{ borderRadius: 1, p: isMobile ? 0.5 : 0.75 }}>
              <IconChevronRight size={isMobile ? 16 : 18} />
            </IconButton>
          </Box>
          <Tooltip title="Hôm nay" arrow>
            <IconButton
              size="small"
              onClick={handleToday}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                borderRadius: 1,
                p: isMobile ? 0.5 : 0.75,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <IconCalendar size={isMobile ? 16 : 18} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newVal) => { if (newVal) setViewMode(newVal); }}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${customBorderColor}`,
            '.MuiToggleButton-root': {
              fontFamily: 'monospace',
              fontWeight: 600,
              px: isMobile ? 1.25 : 2,
              py: 0.75,
              letterSpacing: 0.5,
              fontSize: isMobile ? '0.7rem' : '0.8rem',
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
            <IconColumns size={isMobile ? 14 : 18} style={{ marginRight: isMobile ? 4 : 8 }} />
            {isMobile ? 'BOARD' : 'BOARD'}
          </ToggleButton>
          <ToggleButton value="weekly">
            <IconCalendarTime size={isMobile ? 14 : 18} style={{ marginRight: isMobile ? 4 : 8 }} />
            GANTT
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* === MOBILE TAB BAR: Compact day selector === */}
      {isMobile && viewMode === 'board' && (
        <Box sx={{
          mb: 2,
          borderRadius: 1.5,
          overflow: 'hidden',
          border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : alpha(theme.palette.divider, 0.4)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(12px)',
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{
              style: {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: theme.palette.primary.main,
              }
            }}
            sx={{
              minHeight: 60,
              '& .MuiTab-root': {
                minWidth: 56,
                minHeight: 60,
                p: 0,
                textTransform: 'none',
              },
              '& .MuiTabScrollButton-root': {
                width: 24,
              }
            }}
          >
            {columns.map((col, index) => {
              const isToday = col.id === dayjs().format('YYYY-MM-DD');
              const isActiveTab = activeTab === index;
              const hasTask = col.tasks.length > 0;

              let dayLabel = '';
              let dateLabel = '';

              if (col.id === 'unscheduled') {
                dayLabel = '?';
                dateLabel = 'Lịch';
              } else {
                const d = dayjs(col.id);
                // Vietnamese day abbreviation: Mon=T2, Tue=T3 ...
                const dayOfWeek = d.day(); // 0=Sun,1=Mon,...
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                dayLabel = dayNames[dayOfWeek];
                dateLabel = d.format('DD');
              }

              return (
                <Tab
                  key={col.id}
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3, py: 0.75 }}>
                      {/* Day abbreviation */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          letterSpacing: '0.05em',
                          color: isActiveTab
                            ? 'primary.main'
                            : isToday
                              ? theme.palette.warning.main
                              : 'text.secondary',
                          lineHeight: 1,
                        }}
                      >
                        {dayLabel}
                      </Typography>

                      {/* Date number in circle */}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isActiveTab
                            ? theme.palette.primary.main
                            : isToday
                              ? alpha(theme.palette.warning.main, 0.15)
                              : 'transparent',
                          border: isToday && !isActiveTab
                            ? `1.5px solid ${theme.palette.warning.main}`
                            : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            lineHeight: 1,
                            color: isActiveTab
                              ? '#fff'
                              : isToday
                                ? theme.palette.warning.main
                                : 'text.primary',
                          }}
                        >
                          {dateLabel}
                        </Typography>
                      </Box>

                      {/* Task count dot */}
                      {hasTask ? (
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: isActiveTab
                              ? alpha(theme.palette.primary.main, 0.15)
                              : alpha(theme.palette.text.secondary, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              lineHeight: 1,
                              color: isActiveTab ? 'primary.main' : 'text.secondary',
                              fontFamily: 'monospace',
                            }}
                          >
                            {col.tasks.length}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ width: 16, height: 16 }} />
                      )}
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>
      )}

      {viewMode === 'board' ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: { xs: 2 },
            pb: 2,
            px: { xs: 1, sm: 1.5, md: 2 },
            width: '100%',
            overflowX: isMobile ? 'hidden' : 'auto', // Disable horizontal scroll when on mobile
          }}
        >
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            {columns.filter((_, idx) => !isMobile || idx === activeTab).map((col, colIndex) => {
              const isToday = col.id === dayjs().format('YYYY-MM-DD');
              return (
                <Grow
                  key={col.id}
                  in={true}
                  timeout={300 + colIndex * 50}
                  style={{ transformOrigin: 'top center' }}
                >
                  <Box sx={{
                    minWidth: isMobile ? '100%' : 300,
                    width: isMobile ? '100%' : 320,
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
                        borderColor: isToday ? 'primary.main' : customBorderColor,
                        transition: 'all 0.2s ease',
                        height: '100%',
                        minHeight: { xs: 280, sm: 400, md: 600 },
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
                          borderBottom: `2px solid ${isToday ? alpha(theme.palette.primary.main, 0.5) : customBorderColor}`
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
                                    p: isMobile ? 2 : 3,
                                    textAlign: 'center',
                                    color: 'text.disabled',
                                    borderRadius: 1,
                                    border: `1px dashed ${customBorderColor}`,
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.75,
                                  }}
                                >
                                  <IconCalendarOff size={isMobile ? 20 : 26} opacity={0.35} />
                                  <Typography
                                    variant="caption"
                                    fontFamily="monospace"
                                    sx={{ opacity: 0.6, fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                                  >
                                    Không có nhiệm vụ
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
        <Box sx={{ height: { xs: 400, md: 600 } }}>
          <KanbanWeeklyGantt columns={columns} />
        </Box>
      )}

      {/* === FAB: Mobile quick-add button === */}
      {isMobile && viewMode === 'board' && (
        <Fab
          color="primary"
          size="medium"
          onClick={() => openCreate(dbColumns[0]?.id || '', columns[activeTab]?.id || 'unscheduled')}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            zIndex: 1200,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&:hover': {
              transform: 'scale(1.08)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <IconPlus size={22} />
        </Fab>
      )}

      <TaskEditorDialog
        open={editorOpen}
        initial={editorInit as any}
        columns={dbColumns}
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
      <ModernNotification
        notification={snack}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </>
  );
};

export default KanbanBoardDB;

