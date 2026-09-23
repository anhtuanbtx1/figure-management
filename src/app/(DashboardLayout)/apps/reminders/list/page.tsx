'use client';
import React, { useState, useEffect, useMemo } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
  useTheme,
  alpha,
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
  IconRepeat,
  IconPlayerPause,
  IconCircleCheck,
  IconBellOff,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { deleteReminder, getAllReminders } from "../utils/reminderApi";
import { Reminder } from "../types";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; darkColor: string }> = {
  low: { label: "Thấp", color: "#2563EB", darkColor: "#60A5FA" },
  medium: { label: "Trung bình", color: "#EA580C", darkColor: "#FB923C" },
  high: { label: "Cao", color: "#DC2626", darkColor: "#F87171" },
  urgent: { label: "Khẩn cấp", color: "#BE123C", darkColor: "#FB7185" },
};

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
  const isDark = theme.palette.mode === "dark";

  // Design tokens (shared look with the Kanban board)
  const surface = isDark ? "#1A1B1E" : "#FFFFFF";
  const canvas = isDark ? "#111113" : "#F9FAFB";
  const border = isDark ? "rgba(31, 41, 55, 0.8)" : "#E5E7EB";
  const subtleBorder = isDark ? "rgba(31, 41, 55, 0.6)" : "#F3F4F6";
  const softBg = isDark ? "#25262B" : "#F3F4F6";
  const textStrong = isDark ? "#F3F4F6" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";

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

  const stats = useMemo(() => ({
    total: reminders.length,
    active: reminders.filter((r) => r.isActive && !r.isPaused).length,
    paused: reminders.filter((r) => r.isPaused).length,
    recurring: reminders.filter((r) => r.reminderType && r.reminderType !== "once").length,
  }), [reminders]);

  const getStatus = (reminder: Reminder) => {
    if (reminder.isPaused) return { label: "Tạm dừng", dot: "#F97316" };
    if (!reminder.isActive) return { label: "Không hoạt động", dot: "#9CA3AF" };
    return { label: "Đang hoạt động", dot: "#22C55E" };
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case "once":
        return "Một lần";
      case "daily":
        return "Hàng ngày";
      case "weekly":
        return "Hàng tuần";
      case "monthly":
        return "Hàng tháng";
      case "yearly":
        return "Hàng năm";
      default:
        return type;
    }
  };

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

  const tagSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    px: 1,
    py: 0.5,
    borderRadius: "6px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.025em",
    textTransform: "uppercase" as const,
    lineHeight: 1.2,
    whiteSpace: "nowrap" as const,
  };

  const actionSx = (color: string) => ({
    borderRadius: "8px",
    p: 0.75,
    color: "#9CA3AF",
    "&:hover": { color, bgcolor: alpha(color, 0.08) },
  });

  const statItems = [
    { label: "Tổng số", value: stats.total, icon: IconBell, color: theme.palette.primary.main },
    { label: "Đang hoạt động", value: stats.active, icon: IconCircleCheck, color: "#22C55E" },
    { label: "Tạm dừng", value: stats.paused, icon: IconPlayerPause, color: "#F97316" },
    { label: "Lặp lại", value: stats.recurring, icon: IconRepeat, color: "#A855F7" },
  ];

  return (
    <PageContainer title="Danh sách nhắc nhở" description="Quản lý nhắc nhở">
      <Box
        sx={{
          bgcolor: canvas,
          borderRadius: "16px",
          border: `1px solid ${subtleBorder}`,
          p: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          mb={3}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <IconBell size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: textStrong, lineHeight: 1.3 }}>
                Danh sách nhắc nhở
              </Typography>
              <Typography sx={{ fontSize: 13, color: textMuted }}>
                Quản lý và theo dõi các nhắc nhở của bạn
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<IconRefresh size={18} />}
              onClick={fetchReminders}
              disabled={loading}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: surface,
                borderColor: border,
                color: textStrong,
                "&:hover": { borderColor: isDark ? "#374151" : "#D1D5DB", bgcolor: surface },
              }}
            >
              Làm mới
            </Button>
            <Link href="/apps/reminders/create" passHref>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconPlus size={18} />}
                sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600, boxShadow: "none" }}
              >
                Tạo nhắc nhở mới
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Summary */}
        <Grid container spacing={2} mb={3}>
          {statItems.map(({ label, value, icon: Icon, color }) => (
            <Grid item xs={6} md={3} key={label}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  p: 2,
                  bgcolor: surface,
                  borderRadius: "16px",
                  border: `1px solid ${border}`,
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(color, 0.12),
                    color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: textStrong, lineHeight: 1.2 }}>
                    {loading && reminders.length === 0 ? <Skeleton width={28} /> : value}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: 12, fontWeight: 500, color: textMuted }}>
                    {label}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm nhắc nhở..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} color="#9CA3AF" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")} sx={{ color: "#9CA3AF" }}>
                  <IconX size={16} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: surface,
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              "& fieldset": { borderColor: border },
              "&:hover fieldset": { borderColor: isDark ? "#374151" : "#D1D5DB" },
            },
          }}
        />

        {/* Cards */}
        <Grid container spacing={2.5}>
          {loading && reminders.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={4} key={`sk-${i}`}>
                <Box sx={{ p: 2.5, bgcolor: surface, borderRadius: "16px", border: `1px solid ${border}` }}>
                  <Skeleton width="40%" height={22} />
                  <Skeleton width="80%" height={28} sx={{ mt: 1 }} />
                  <Skeleton width="100%" />
                  <Skeleton variant="rounded" height={44} sx={{ mt: 2, borderRadius: "10px" }} />
                </Box>
              </Grid>
            ))}

          {filteredReminders.map((reminder) => {
            const status = getStatus(reminder);
            const priority = PRIORITY_CONFIG[reminder.priority];
            const inactive = reminder.isPaused || !reminder.isActive;

            return (
              <Grid item xs={12} sm={6} lg={4} key={reminder.id}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2.5,
                    bgcolor: surface,
                    borderRadius: "16px",
                    border: `1px solid ${border}`,
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* Tags */}
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    <Box component="span" sx={{ ...tagSx, bgcolor: softBg, color: isDark ? "#D1D5DB" : "#374151" }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: status.dot }} />
                      {status.label}
                    </Box>
                    {priority && (
                      <Box
                        component="span"
                        sx={{
                          ...tagSx,
                          fontWeight: 700,
                          color: isDark ? priority.darkColor : priority.color,
                          bgcolor: alpha(priority.color, isDark ? 0.1 : 0.08),
                        }}
                      >
                        {priority.label}
                      </Box>
                    )}
                    {reminder.reminderType && reminder.reminderType !== "once" && (
                      <Box component="span" sx={{ ...tagSx, color: isDark ? "#C084FC" : "#9333EA", bgcolor: alpha("#A855F7", isDark ? 0.1 : 0.08) }}>
                        <IconRepeat size={12} />
                        {getReminderTypeLabel(reminder.reminderType)}
                      </Box>
                    )}
                  </Stack>

                  {/* Title & description */}
                  <Stack spacing={0.75} sx={{ flex: 1, opacity: inactive ? 0.7 : 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: textStrong, wordBreak: "break-word" }}>
                      {reminder.title}
                    </Typography>
                    {reminder.description && (
                      <Typography
                        sx={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: textMuted,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {reminder.description}
                      </Typography>
                    )}
                  </Stack>

                  {/* Schedule */}
                  {(reminder.reminderDate || reminder.reminderTime) && (
                    <Stack
                      direction="row"
                      spacing={2.5}
                      sx={{
                        px: 1.5,
                        py: 1.25,
                        borderRadius: "10px",
                        bgcolor: isDark ? "#202125" : "#F9FAFB",
                        border: `1px solid ${subtleBorder}`,
                        fontSize: 13,
                        fontWeight: 600,
                        color: textStrong,
                      }}
                    >
                      {reminder.reminderDate && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <IconCalendar size={15} color="#9CA3AF" />
                          <span>{format(new Date(reminder.reminderDate), "dd/MM/yyyy", { locale: vi })}</span>
                        </Stack>
                      )}
                      {reminder.reminderTime && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <IconClock size={15} color="#9CA3AF" />
                          <span>{formatTime(reminder.reminderTime)}</span>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {/* Footer */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ pt: 1.5, borderTop: `1px solid ${subtleBorder}` }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      {reminder.categoryName && (
                        <Typography noWrap sx={{ fontSize: 12, fontWeight: 500, color: textMuted }}>
                          # {reminder.categoryName}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                      <Tooltip title="Gửi ngay" arrow>
                        <IconButton size="small" sx={actionSx(theme.palette.info.main)}>
                          <IconBellRinging size={17} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa" arrow>
                        <Link href={`/apps/reminders/edit/${reminder.id}`} passHref>
                          <IconButton size="small" sx={actionSx(theme.palette.primary.main)}>
                            <IconEdit size={17} />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="Xóa" arrow>
                        <IconButton
                          size="small"
                          sx={actionSx("#DC2626")}
                          onClick={() => {
                            setSelectedReminder(reminder);
                            setDeleteDialog(true);
                          }}
                        >
                          <IconTrash size={17} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {filteredReminders.length === 0 && !loading && (
          <Stack
            alignItems="center"
            spacing={1.5}
            sx={{
              py: 6,
              px: 2,
              borderRadius: "16px",
              border: `2px dashed ${border}`,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: softBg,
                color: "#9CA3AF",
              }}
            >
              <IconBellOff size={26} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: textStrong }}>
              {searchTerm ? "Không tìm thấy nhắc nhở phù hợp" : "Không có nhắc nhở nào"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: textMuted }}>
              {searchTerm ? "Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm." : "Tạo nhắc nhở đầu tiên để bắt đầu."}
            </Typography>
          </Stack>
        )}
      </Box>

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: "16px", maxWidth: 420, bgcolor: surface } }}
      >
        <DialogContent sx={{ pt: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha("#EF4444", 0.1),
                color: "#DC2626",
                flexShrink: 0,
              }}
            >
              <IconTrash size={20} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: textStrong, mb: 0.5 }}>
                Xác nhận xóa
              </Typography>
              <Typography sx={{ fontSize: 14, color: textMuted }}>
                Bạn có chắc chắn muốn xóa nhắc nhở &quot;{selectedReminder?.title}&quot;?
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, color: textMuted }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, boxShadow: "none" }}
          >
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
