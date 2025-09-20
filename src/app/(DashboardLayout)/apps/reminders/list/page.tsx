'use client';
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
  Alert,
  Snackbar,
  useTheme,
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
import { deleteReminder, getAllReminders } from "../utils/reminderApi"; 
import { Reminder } from "../types"; 

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

  const theme = useTheme();

  // FIXED: Correct error handling logic
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const responseData = await getAllReminders();
      if (responseData.success) {
        setReminders(responseData.data);
        setFilteredReminders(responseData.data);
      } else {
        // This case should ideally not be hit if the API throws an error on failure, but as a fallback:
        throw new Error("Lỗi khi tải danh sách nhắc nhở: API trả về trạng thái không thành công.");
      }
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      setSnackbar({
        open: true,
        message: error.message || "Lỗi khi tải danh sách nhắc nhở",
        severity: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    const filtered = reminders.filter((reminder) =>
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reminder.description && reminder.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredReminders(filtered);
  }, [searchTerm, reminders]);

  const handleDelete = async () => {
    if (!selectedReminder) return;
    try {
      const result = await deleteReminder(selectedReminder.id);
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || "Đã xóa nhắc nhở thành công",
          severity: "success",
        });
        fetchReminders(); 
      } else {
        throw new Error(result.message || "Lỗi khi xóa nhắc nhở");
      }
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      setSnackbar({
        open: true,
        message: error.message || "Lỗi khi xóa nhắc nhở",
        severity: "error",
      });
    }
    setDeleteDialog(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (reminder: Reminder) => {
    if (!reminder.isActive || reminder.isPaused) return "default";
    return "primary";
  };

  const getStatusLabel = (reminder: Reminder) => {
    if (reminder.isPaused) return "Tạm dừng";
    if (!reminder.isActive) return "Không hoạt động";
    return "Đang hoạt động";
  };

  return (
    <PageContainer title="Danh sách nhắc nhở" description="Quản lý nhắc nhở">
      <BlankCard>
        <CardContent>
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

          <Grid container spacing={3}>
            {filteredReminders.map((reminder) => (
              <Grid item xs={12} sm={6} md={4} key={reminder.id}>
                <Card sx={{ 
                  height: "100%", 
                  border: `2px solid ${theme.palette.mode === 'light' ? 'black' : theme.palette.divider}`
                }}>
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
                        {reminder.reminderDate && (
                          <Chip
                            icon={<IconCalendar size={16} />}
                            label={format(new Date(reminder.reminderDate), "dd/MM/yyyy", { locale: vi })}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {reminder.reminderTime && (
                          <Chip
                            icon={<IconClock size={16} />}
                            label={format(new Date(`1970-01-01T${reminder.reminderTime}Z`), "HH:mm")}
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
                        {reminder.categoryName && (
                          <Chip
                            label={reminder.categoryName}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {reminder.reminderType && reminder.reminderType !== "once" && (
                          <Chip
                            label={reminder.reminderType}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="info"
                          title="Gửi ngay"
                        >
                          <IconBellRinging size={18} />
                        </IconButton>
                        <Link href={`/apps/reminders/edit/${reminder.id}`} passHref>
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
            ))}
          </Grid>

          {filteredReminders.length === 0 && !loading && (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                Không có nhắc nhở nào
              </Typography>
            </Box>
          )}
        </CardContent>
      </BlankCard>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhắc nhở &quot;{selectedReminder?.title}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

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
