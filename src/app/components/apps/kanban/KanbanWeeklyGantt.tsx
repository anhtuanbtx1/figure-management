"use client";
import React, { useState, useMemo } from 'react';
import { Box, Typography, Stack, IconButton, useTheme, alpha } from '@mui/material';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { KanbanTaskDb } from '@/types/apps/kanban-db';

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface KanbanWeeklyGanttProps {
    columns: { id: string; name: string; tasks: KanbanTaskDb[] }[];
}

const KanbanWeeklyGantt: React.FC<KanbanWeeklyGanttProps> = ({ columns }) => {
    const theme = useTheme();

    // Navigate by weeks
    const [currentDate, setCurrentDate] = useState(dayjs());

    // Determine start and end of the currently viewed week (Monday to Sunday)
    const startOfWeek = currentDate.startOf('isoWeek');
    const endOfWeek = currentDate.endOf('isoWeek');

    // Generate an array of 7 days for the header
    const daysInWeek = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
    }, [startOfWeek]);

    // Aggregate all tasks from columns
    const allTasks = useMemo(() => {
        return columns.flatMap(col => col.tasks).filter(task => {
            // Only include tasks that have a date range and overlap with this week
            if (!task.startDate || !task.endDate) return false;

            const s = dayjs(task.startDate);
            const e = dayjs(task.endDate);

            // Task overlaps if it starts before week ends AND ends after week starts
            return s.isSameOrBefore(endOfWeek, 'day') && e.isSameOrAfter(startOfWeek, 'day');
        }).sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()); // Sort by start date
    }, [columns, startOfWeek, endOfWeek]);

    const handlePrevWeek = () => setCurrentDate(prev => prev.subtract(1, 'week'));
    const handleNextWeek = () => setCurrentDate(prev => prev.add(1, 'week'));
    const handleToday = () => setCurrentDate(dayjs());

    // Get color based on column status (simplified logic based on standard names)
    const getTaskColor = (colId: string, colName: string) => {
        const normalizeName = colName.toLowerCase();
        if (normalizeName.includes('done') || normalizeName.includes('hoàn thành')) {
            return theme.palette.success;
        }
        if (normalizeName.includes('progress') || normalizeName.includes('đang làm')) {
            return theme.palette.info;
        }
        if (normalizeName.includes('review') || normalizeName.includes('kiểm tra')) {
            return theme.palette.warning;
        }
        // Default / To do
        return {
            main: theme.palette.text.secondary,
            light: alpha(theme.palette.text.secondary, 0.2),
            dark: theme.palette.text.primary
        };
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Gantt Header & Controls */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5), p: 0.5, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
                        <IconButton size="small" onClick={handlePrevWeek} sx={{ borderRadius: 1 }}>
                            <IconChevronLeft size={18} />
                        </IconButton>
                        <Typography variant="body2" fontWeight={700} sx={{ px: 2, fontFamily: 'monospace', minWidth: 140, textAlign: 'center' }}>
                            Tuần {startOfWeek.isoWeek()} - {startOfWeek.format('YYYY')}
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

                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {startOfWeek.format('DD/MM/YYYY')} - {endOfWeek.format('DD/MM/YYYY')}
                </Typography>
            </Stack>

            {/* Gantt Chart Container */}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(10px)',
            }}>
                {/* CSS Grid Setup: 1 fixed column for task info, 7 flexible columns for days */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(250px, 30%) repeat(7, minmax(100px, 1fr))',
                    minWidth: 1000 // Ensure horizontal scroll on small screens
                }}>

                    {/* Calendar Header Row */}
                    <Box sx={{
                        p: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        position: 'sticky',
                        top: 0,
                        bgcolor: theme.palette.background.paper,
                        zIndex: 10
                    }}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" fontFamily="monospace">
                            NHIỆM VỤ / TASK
                        </Typography>
                    </Box>

                    {daysInWeek.map((day, idx) => {
                        const isToday = day.isSame(dayjs(), 'day');
                        return (
                            <Box key={idx} sx={{
                                p: 2,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                borderRight: idx < 6 ? `1px dashed ${alpha(theme.palette.divider, 0.5)}` : 'none',
                                textAlign: 'center',
                                position: 'sticky',
                                top: 0,
                                bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                                zIndex: 10
                            }}>
                                <Typography variant="caption" display="block" color={isToday ? "primary.main" : "text.secondary"} fontWeight={600} fontFamily="monospace" sx={{ textTransform: 'uppercase' }}>
                                    {day.format('dddd')}
                                </Typography>
                                <Typography variant="h6" fontWeight={800} color={isToday ? "primary.main" : "text.primary"} fontFamily="monospace">
                                    {day.format('DD')}
                                </Typography>
                            </Box>
                        );
                    })}

                    {/* Empty State */}
                    {allTasks.length === 0 && (
                        <Box sx={{ gridColumn: '1 / -1', p: 8, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.disabled" fontFamily="monospace">
                                [ KHÔNG TÌM THẤY NHIỆM VỤ CÓ NGÀY TRONG TUẦN NÀY ]
                            </Typography>
                        </Box>
                    )}

                    {/* Task Rows */}
                    {allTasks.map((task) => {
                        const tStart = dayjs(task.startDate);
                        const tEnd = dayjs(task.endDate || task.startDate); // Fallback if no end date

                        // Calculate grid spanning (1-based index, column 1 is task info, days are 2-8)
                        // If task started before this week, it snaps to start of week (grid col 2)
                        const gridStart = tStart.isBefore(startOfWeek, 'day')
                            ? 2
                            : tStart.diff(startOfWeek, 'day') + 2;

                        // If task ends after this week, it snaps to end of week (grid col 9)
                        const gridEnd = tEnd.isAfter(endOfWeek, 'day')
                            ? 9
                            : tEnd.diff(startOfWeek, 'day') + 3; // +2 for offset, +1 because ending line is exclusive in grid

                        const colName = columns.find(c => c.id === task.columnId)?.name || '';
                        const statusColor = getTaskColor(task.columnId, colName);

                        return (
                            <React.Fragment key={task.id}>
                                {/* Task Info Cell */}
                                <Box sx={{
                                    p: 2,
                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: alpha(theme.palette.background.paper, 0.2)
                                }}>
                                    <Stack direction="column" spacing={0.5} sx={{ overflow: 'hidden', width: '100%' }}>
                                        <Typography variant="body2" fontWeight={700} noWrap sx={{ fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace" }}>
                                            {task.title}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="caption" color="text.secondary" sx={{ p: 0.5, bgcolor: alpha(statusColor.main, 0.1), color: statusColor.main, borderRadius: 1, fontWeight: 700, fontSize: '0.6rem' }}>
                                                {colName.toUpperCase()}
                                            </Typography>
                                            {task.assignee && (
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {task.assignee}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Box>

                                {/* Task Timeline Grid Area */}
                                <Box sx={{
                                    gridColumn: '2 / -1', // Span all 7 days
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    position: 'relative'
                                }}>
                                    {/* Grid Lines for days */}
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <Box key={i} sx={{
                                            borderRight: i < 6 ? `1px dashed ${alpha(theme.palette.divider, 0.3)}` : 'none',
                                            height: '100%',
                                            gridColumn: i + 1,
                                            gridRow: 1
                                        }} />
                                    ))}

                                    {/* The Actual Timeline Bar */}
                                    <Box sx={{
                                        gridColumn: `${gridStart - 1} / ${gridEnd - 1}`, // Relative to the 7-col inner grid
                                        gridRow: 1,
                                        m: 1,
                                        my: 1.5,
                                        borderRadius: 1,
                                        bgcolor: alpha(statusColor.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                                        border: `1px solid ${statusColor.main}`,
                                        borderLeft: `4px solid ${statusColor.main}`,
                                        position: 'relative',
                                        zIndex: 2,
                                        boxShadow: `0 4px 12px ${alpha(statusColor.main, 0.15)}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 1.5,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 6px 16px ${alpha(statusColor.main, 0.25)}`,
                                        }
                                    }}>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: statusColor.main, fontFamily: 'monospace' }} noWrap>
                                            {tStart.format('DD/MM')} - {tEnd.format('DD/MM')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

export default KanbanWeeklyGantt;
