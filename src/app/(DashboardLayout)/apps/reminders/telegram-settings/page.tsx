
"use client";
import React, { useState, useEffect, useCallback } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { IconBrandTelegram, IconSettings, IconCheck, IconX, IconSend } from "@tabler/icons-react";

// Interface matches the API response and the database schema
interface TelegramSettings {
  id: number | null;
  botToken: string;
  botUsername: string;
  defaultChatIds: string;
}

const API_BASE_URL = "/api/telegram";

const TelegramSettingsPage = () => {
  const [settings, setSettings] = useState<TelegramSettings>({
    id: null,
    botToken: "",
    botUsername: "",
    defaultChatIds: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState("This is a test message from the Reminder System.");
  const [testChatId, setTestChatId] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const result = await response.json();

      if (result.success && result.data) {
        setSettings(result.data);
        // Pre-fill the test chat ID with the first one from the list
        const firstChatId = result.data.defaultChatIds?.split(',')[0] || '';
        setTestChatId(firstChatId);
      } else {
        throw new Error(result.message || "Failed to fetch settings");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setSnackbar({
        open: true,
        message: `Error loading settings: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setSnackbar({ open: true, message: "Settings saved successfully!", severity: "success" });
      fetchSettings();
    } catch (error) {
      setSnackbar({ open: true, message: `Error saving settings: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: "error" });
    } finally {
      setSaving(false);
    }
  };
  
  const handleOpenTestDialog = () => {
    // Ensure the test chat ID is up-to-date when opening the dialog
    const firstChatId = settings.defaultChatIds?.split(',')[0] || '';
    setTestChatId(firstChatId);
    setTestDialogOpen(true);
  }

  const handleSendTestMessage = async () => {
    setSendingTest(true);
    try {
        const response = await fetch(`${API_BASE_URL}/test-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: testMessage, chatId: testChatId }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `Request failed with status ${response.status}`);

        setSnackbar({ open: true, message: result.message, severity: 'success' });
        setTestDialogOpen(false);

    } catch (error) {
        setSnackbar({ open: true, message: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' });
    } finally {
        setSendingTest(false);
    }
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <PageContainer title="Telegram Settings" description="Configure the Telegram Bot for reminders">
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <IconBrandTelegram size={32} color="#0088cc" />
            <Typography variant="h4">Telegram Bot Settings</Typography>
          </Stack>

          {loading ? (
            <Box textAlign="center" p={5}><CircularProgress /><Typography>Loading settings...</Typography></Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <TextField fullWidth required label="Bot Token" value={settings.botToken} onChange={(e) => setSettings({ ...settings, botToken: e.target.value })} placeholder="Enter token from @BotFather" helperText="Secret token to authenticate your bot." />
                    <TextField fullWidth label="Bot Username" value={settings.botUsername} onChange={(e) => setSettings({ ...settings, botUsername: e.target.value })} placeholder="(Optional) @MyReminderBot" helperText="Your bot\'s username." />
                    <TextField fullWidth multiline rows={2} label="Default Chat IDs" value={settings.defaultChatIds} onChange={(e) => setSettings({ ...settings, defaultChatIds: e.target.value })} placeholder="Comma-separated chat or group IDs" helperText="Default destination for notifications." />
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" color="primary" onClick={handleSaveSettings} disabled={saving} startIcon={saving ? <CircularProgress size={20} /> : <IconCheck />}>
                        {saving ? "Saving..." : "Save Settings"}
                      </Button>
                       <Button variant="outlined" color="secondary" onClick={handleOpenTestDialog} disabled={!settings.botToken || saving} startIcon={<IconSend />}>
                        Send Test Message
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                 <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'action.hover'}}>
                    <Typography variant="h6" gutterBottom>Configuration Guide</Typography>
                    <Typography variant='body2' component='div'>
                      <ol style={{paddingLeft: '20px', marginTop: 0}}>
                        <li>Find <b>@BotFather</b> on Telegram.</li>
                        <li>Use <code>/newbot</code> to create a bot.</li>
                        <li>Paste the <b>Bot Token</b> above.</li>
                        <li>To get a <b>Chat ID</b>, message your bot and visit <code>https://api.telegram.org/bot[YOUR_TOKEN]/getUpdates</code>.</li>
                      </ol>
                    </Typography>
                 </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send a Test Message</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{pt: 1}}>
                <TextField fullWidth label="Target Chat ID" value={testChatId} onChange={(e) => setTestChatId(e.target.value)} placeholder="Enter the destination Chat ID" />
                <TextField fullWidth multiline rows={4} label="Message" value={testMessage} onChange={(e) => setTestMessage(e.target.value)} placeholder="Enter your test message..." />
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSendTestMessage} variant="contained" disabled={sendingTest || !testChatId || !testMessage} startIcon={sendingTest ? <CircularProgress size={20}/> : <IconSend />}>
            {sendingTest ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default TelegramSettingsPage;
