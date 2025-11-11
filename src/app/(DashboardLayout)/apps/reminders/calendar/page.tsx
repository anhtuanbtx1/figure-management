
"use client";
import React, { useState, useEffect } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import {
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import {
  IconCalendar,
  IconClock,
  IconBell,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from "@tabler/icons-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface Reminder {
  id: number;
  title: string;
  description: string;
  reminderDate: string | null;
  reminderTime: string | null;
  reminderType: string;
  priority: string;
  categoryName?: string;
  isActive: boolean;
}

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const formatTime = (timeInput: any): string => {
    if (!timeInput) return '--:--';
    if (typeof timeInput === 'string') {
      // Extract HH:mm from time string (e.g., "09:00:00" or "2024-01-01T09:00:00")
      if (timeInput.includes('T')) {
        return timeInput.substring(timeInput.indexOf('T') + 1, timeInput.indexOf('T') + 6);
      }
      // Already in HH:mm:ss or HH:mm format
      return timeInput.substring(0, 5);
    }
    return '--:--';
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reminders");
      const data = await response.json();
      if (data.success) {
        setReminders(data.data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
    setLoading(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Thêm các ngày trống để bắt đầu từ đúng thứ
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(reminder => {
      if (!reminder.reminderDate && reminder.reminderTime) {
        // Nếu không có ngày cụ thể, kiểm tra xem có phải reminder định kỳ không
        const reminderTime = new Date(reminder.reminderTime);
        if (reminder.reminderType === "daily") {
          return true;
        }
        if (reminder.reminderType === "weekly") {
          return getDay(date) === getDay(reminderTime);
        }
        if (reminder.reminderType === "monthly") {
          return date.getDate() === reminderTime.getDate();
        }
      }
      if (reminder.reminderDate) {
        return isSameDay(new Date(reminder.reminderDate), date);
      }
      return false;
    });
  };

  const getSelectedDateReminders = () => {
    if (!selectedDate) return [];
    return getRemindersForDate(selectedDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "urgent":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <PageContainer title="Lịch nhắc nhở" description="Xem lịch nhắc nhở">
      <BlankCard>
        <CardContent>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">
              <IconCalendar size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Lịch nhắc nhở
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<IconRefresh />}
                onClick={fetchReminders}
                disabled={loading}
              >
                Làm mới
              </Button>
              <Link href="/apps/reminders/create" passHref>
                <Button variant="contained" color="primary" startIcon={<IconBell />}>
                  Tạo nhắc nhở
                </Button>
              </Link>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {/* Calendar */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 2 }}>
                {/* Month Navigation */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <IconButton onClick={handlePrevMonth}>
                    <IconChevronLeft />
                  </IconButton>
                  <Typography variant="h5">
                    {format(currentMonth, "MMMM yyyy", { locale: vi })}
                  </Typography>
                  <IconButton onClick={handleNextMonth}>
                    <IconChevronRight />
                  </IconButton>
                </Stack>

                {/* Days of week */}
                <Grid container spacing={1} mb={1}>
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                    <Grid item xs={12 / 7} key={day}>
                      <Typography align="center" variant="caption" fontWeight="bold">
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar days */}
                <Grid container spacing={1}>
                  {emptyDays.map((_, index) => (
                    <Grid item xs={12 / 7} key={`empty-${index}`}>
                      <Box sx={{ height: 80 }} />
                    </Grid>
                  ))}
                  {monthDays.map((day) => {
                    const dayReminders = getRemindersForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <Grid item xs={12 / 7} key={day.toString()}>
                        <Paper
                          elevation={isSelected ? 3 : 0}
                          sx={{
                            p: 1,
                            height: 80,
                            cursor: "pointer",
                            bgcolor: isSelected ? "primary.light" : isToday ? "action.hover" : "background.paper",
                            border: isToday ? "2px solid" : "1px solid",
                            borderColor: isToday ? "primary.main" : "divider",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                          onClick={() => setSelectedDate(day)}
                        >
                          <Typography variant="caption" fontWeight={isToday ? "bold" : "normal"}>
                            {format(day, "d")}
                          </Typography>
                          {dayReminders.length > 0 && (
                            <Box mt={0.5}>
                              <Stack spacing={0.5}>
                                {dayReminders.slice(0, 2).map((reminder, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      bgcolor: getPriorityColor(reminder.priority) + ".main",
                                      borderRadius: 0.5,
                                      px: 0.5,
                                      height: 18,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "white",
                                        fontSize: "0.65rem",
                                        display: "block",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {reminder.title}
                                    </Typography>
                                  </Box>
                                ))}
                                {dayReminders.length > 2 && (
                                  <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                                    +{dayReminders.length - 2} khác
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>

            {/* Selected Date Details */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  {selectedDate
                    ? format(selectedDate, "dd MMMM yyyy", { locale: vi })
                    : "Chọn một ngày"}
                </Typography>

                {selectedDate && (
                  <>
                    {getSelectedDateReminders().length > 0 ? (
                      <List>
                        {getSelectedDateReminders().map((reminder) => (
                          <ListItem key={reminder.id} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <IconBell size={20} />
                            </ListItemIcon>
                            <ListItemText
                              primary={reminder.title}
                              secondary={
                                <Stack spacing={1} mt={1}>
                                  <Typography variant="caption">
                                    {reminder.description}
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    {reminder.reminderTime && (
                                      <Chip
                                        icon={<IconClock size={14} />}
                                        label={formatTime(reminder.reminderTime)}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                    <Chip
                                      label={reminder.priority}
                                      color={getPriorityColor(reminder.priority) as any}
                                      size="small"
                                    />
                                  </Stack>
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" mt={2}>
                        Không có nhắc nhở nào trong ngày này
                      </Typography>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
};

export default CalendarPage;
