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
  Grid,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  IconBrandTelegram,
  IconSettings,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
  IconSend,
  IconRefresh,
} from "@tabler/icons-react";

interface TelegramSettings {
  bot_token: string;
  chat_id: string;
  is_active: boolean;
  updated_at?: string;
}

interface Subscriber {
  subscriber_id: number;
  chat_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const TelegramSettingsPage = () => {
  const [settings, setSettings] = useState<TelegramSettings>({
    bot_token: "",
    chat_id: "",
    is_active: true,
  });
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [testDialog, setTestDialog] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Load settings
  useEffect(() => {
    fetchSettings();
    fetchSubscribers();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/telegram/settings`);
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/telegram/subscribers`);
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.data);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/telegram/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Cài đặt đã được lưu thành công",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi lưu cài đặt",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/telegram/test`, {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Kết nối Telegram thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Không thể kết nối với Telegram",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi kiểm tra kết nối",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleSendTestMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reminders/test/notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Notification",
          description: testMessage || "Đây là tin nhắn test từ hệ thống nhắc nhở",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Tin nhắn test đã được gửi!",
          severity: "success",
        });
        setTestDialog(false);
        setTestMessage("");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi gửi tin nhắn test",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleDeleteSubscriber = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/telegram/subscribers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Đã xóa subscriber",
          severity: "success",
        });
        fetchSubscribers();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi xóa subscriber",
        severity: "error",
      });
    }
  };

  return (
    <PageContainer title="Cài đặt Telegram" description="Cấu hình Telegram Bot">
      <BlankCard>
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" mb={3}>
            <IconBrandTelegram size={32} style={{ marginRight: 12, color: "#0088cc" }} />
            <Typography variant="h4">Cài đặt Telegram</Typography>
          </Stack>

          <Grid container spacing={3}>
            {/* Bot Configuration */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50", height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  <IconSettings size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
                  Cấu hình Bot
                </Typography>
                
                <Stack spacing={2} mt={2}>
                  <TextField
                    fullWidth
                    label="Bot Token"
                    value={settings.bot_token}
                    onChange={(e) => setSettings({ ...settings, bot_token: e.target.value })}
                    placeholder="Nhập Bot Token từ BotFather"
                    helperText="Token nhận được từ @BotFather khi tạo bot"
                  />
                  
                  <TextField
                    fullWidth
                    label="Chat ID"
                    value={settings.chat_id}
                    onChange={(e) => setSettings({ ...settings, chat_id: e.target.value })}
                    placeholder="Nhập Chat ID"
                    helperText="ID của chat hoặc group để gửi thông báo"
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveSettings}
                      disabled={loading}
                      startIcon={<IconCheck />}
                    >
                      Lưu cài đặt
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleTestConnection}
                      disabled={loading || !settings.bot_token}
                      startIcon={<IconRefresh />}
                    >
                      Test kết nối
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50", height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  <IconSend size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
                  Hành động nhanh
                </Typography>

                <Stack spacing={2} mt={2}>
                  <Alert severity="info">
                    Bot Token: {settings.bot_token ? "Đã cấu hình" : "Chưa cấu hình"}
                  </Alert>
                  <Alert severity={settings.chat_id ? "success" : "warning"}>
                    Chat ID: {settings.chat_id || "Chưa cấu hình"}
                  </Alert>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setTestDialog(true)}
                    disabled={!settings.bot_token || !settings.chat_id}
                    startIcon={<IconSend />}
                  >
                    Gửi tin nhắn test
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Subscribers List */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Danh sách Subscribers
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconRefresh />}
                    onClick={fetchSubscribers}
                  >
                    Làm mới
                  </Button>
                </Stack>

                {subscribers.length > 0 ? (
                  <List>
                    {subscribers.map((sub) => (
                      <ListItem
                        key={sub.subscriber_id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteSubscriber(sub.subscriber_id)}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <Chip
                            label={sub.is_active ? "Active" : "Inactive"}
                            color={sub.is_active ? "success" : "default"}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${sub.first_name || ""} ${sub.last_name || ""} ${sub.username ? `(@${sub.username})` : ""}`}
                          secondary={`Chat ID: ${sub.chat_id}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    Chưa có subscriber nào. Subscribers sẽ được thêm tự động khi người dùng tương tác với bot.
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Instructions */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "blue.50" }}>
                <Typography variant="h6" gutterBottom>
                  Hướng dẫn cấu hình
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>Truy cập @BotFather trên Telegram</li>
                  <li>Gửi lệnh /newbot để tạo bot mới</li>
                  <li>Đặt tên và username cho bot</li>
                  <li>Copy Bot Token và dán vào ô Bot Token ở trên</li>
                  <li>Để lấy Chat ID, gửi tin nhắn cho bot và truy cập: 
                    <code style={{ marginLeft: 4 }}>
                      https://api.telegram.org/bot[TOKEN]/getUpdates
                    </code>
                  </li>
                  <li>Tìm "chat": {"{"}"id": XXXXX{"}"} trong response</li>
                  <li>Copy Chat ID và dán vào ô Chat ID ở trên</li>
                  <li>Nhấn "Lưu cài đặt" và "Test kết nối"</li>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </BlankCard>

      {/* Test Message Dialog */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Gửi tin nhắn test</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nội dung tin nhắn"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Nhập nội dung tin nhắn test..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSendTestMessage}
            variant="contained"
            disabled={loading}
            startIcon={<IconSend />}
          >
            Gửi
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

export default TelegramSettingsPage;