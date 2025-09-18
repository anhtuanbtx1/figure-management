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
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  IconBell,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconClock,
  IconCalendar,
  IconBellRinging,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface Reminder {
  id: number;
  reminder_id?: number; // For compatibility
  title: string;
  description: string;
  reminderDate: string | null;
  reminder_date?: string | null; // For compatibility
  reminderTime: string | null;
  reminder_time?: string | null; // For compatibility
  reminderType: string;
  frequency?: string; // For compatibility
  priority: string;
  categoryName?: string;
  category_name?: string; // For compatibility
  categoryId?: number;
  isActive: boolean;
  is_active?: boolean; // For compatibility  
  isPaused?: boolean;
  is_sent?: boolean;
  createdDate: string;
  created_at?: string; // For compatibility
  startDate?: string;
  endDate?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const ReminderList = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Load reminders từ API
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reminders`);
      const data = await response.json();
      if (data.success) {
        setReminders(data.data);
        setFilteredReminders(data.data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi tải danh sách nhắc nhở",
        severity: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Tìm kiếm
  useEffect(() => {
    const filtered = reminders.filter((reminder) =>
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReminders(filtered);
  }, [searchTerm, reminders]);

  // Xóa reminder
  const handleDelete = async () => {
    if (!selectedReminder) return;
    const reminderId = selectedReminder.id || selectedReminder.reminder_id;
    
    try {
      const response = await fetch(`${API_URL}/api/reminders/${reminderId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Đã xóa nhắc nhở thành công",
          severity: "success",
        });
        fetchReminders();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi xóa nhắc nhở",
        severity: "error",
      });
    }
    setDeleteDialog(false);
  };

  // Trigger reminder thủ công
  const handleTrigger = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/reminders/trigger/${id}`, {
        method: "POST",
      });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Đã gửi nhắc nhở qua Telegram",
          severity: "success",
        });
        fetchReminders();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi gửi nhắc nhở",
        severity: "error",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "error";
      case "MEDIUM": return "warning";
      case "LOW": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (reminder: Reminder) => {
    const isActive = reminder.isActive ?? reminder.is_active;
    const isPaused = reminder.isPaused ?? false;
    const isSent = reminder.is_sent ?? false;
    
    if (isSent) return "default";
    if (!isActive || isPaused) return "default";
    return "primary";
  };

  const getStatusLabel = (reminder: Reminder) => {
    const isActive = reminder.isActive ?? reminder.is_active;
    const isPaused = reminder.isPaused ?? false;
    const isSent = reminder.is_sent ?? false;
    
    if (isSent) return "Đã gửi";
    if (isPaused) return "Tạm dừng";
    if (!isActive) return "Không hoạt động";
    return "Đang hoạt động";
  };

  return (
    <PageContainer title="Danh sách nhắc nhở" description="Quản lý nhắc nhở">
      <BlankCard>
        <CardContent>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">
              <IconBell size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Danh sách nhắc nhở
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<IconRefresh />}
                onClick={fetchReminders}
              >
                Làm mới
              </Button>
              <Link href="/apps/reminders/create" passHref>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconPlus />}
                >
                  Tạo nhắc nhở mới
                </Button>
              </Link>
            </Stack>
          </Stack>

          {/* Search bar */}
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm nhắc nhở..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Reminder Grid */}
          <Grid container spacing={3}>
            {filteredReminders.map((reminder) => {
              const reminderId = reminder.id || reminder.reminder_id || 0;
              const reminderDate = reminder.reminderDate || reminder.reminder_date;
              const reminderTime = reminder.reminderTime || reminder.reminder_time;
              const categoryName = reminder.categoryName || reminder.category_name;
              const reminderType = reminder.reminderType || reminder.frequency || "";
              
              return (
              <Grid item xs={12} sm={6} md={4} key={reminderId}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                          <Typography variant="h6" gutterBottom>
                            {reminder.title}
                          </Typography>
                          <Chip
                            label={getStatusLabel(reminder)}
                            color={getStatusColor(reminder) as any}
                            size="small"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {reminder.description}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        {reminderDate && (
                          <Chip
                            icon={<IconCalendar size={16} />}
                            label={format(new Date(reminderDate), "dd/MM/yyyy", { locale: vi })}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {reminderTime && (
                          <Chip
                            icon={<IconClock size={16} />}
                            label={
                              (() => {
                                if (typeof reminderTime === 'string' && reminderTime.includes('T')) {
                                  // ISO string with date 1970-01-01
                                  // Extract just the time part without timezone conversion
                                  const timePart = reminderTime.split('T')[1];
                                  if (timePart) {
                                    // Remove Z or timezone info and take HH:mm
                                    const time = timePart.split('.')[0];
                                    return time.substring(0, 5); // HH:mm
                                  }
                                } else if (reminderTime instanceof Date) {
                                  return format(reminderTime, "HH:mm");
                                }
                                return reminderTime;
                              })()
                            }
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        {reminder.priority && (
                          <Chip
                            label={reminder.priority}
                            color={getPriorityColor(reminder.priority) as any}
                            size="small"
                          />
                        )}
                        {categoryName && (
                          <Chip
                            label={categoryName}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {reminderType && reminderType !== "once" && (
                          <Chip
                            label={reminderType}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleTrigger(reminderId)}
                          title="Gửi ngay"
                        >
                          <IconBellRinging size={18} />
                        </IconButton>
                        <Link href={`/apps/reminders/edit/${reminderId}`} passHref>
                          <IconButton size="small" color="primary" title="Chỉnh sửa">
                            <IconEdit size={18} />
                          </IconButton>
                        </Link>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedReminder(reminder);
                            setDeleteDialog(true);
                          }}
                          title="Xóa"
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>

          {filteredReminders.length === 0 && (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                Không có nhắc nhở nào
              </Typography>
            </Box>
          )}
        </CardContent>
      </BlankCard>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhắc nhở "{selectedReminder?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ReminderList;