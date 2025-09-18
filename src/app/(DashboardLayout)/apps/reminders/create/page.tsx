"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import {
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Paper,
} from "@mui/material";
import {
  IconBell,
  IconDeviceFloppy,
  IconArrowLeft,
  IconCalendar,
  IconClock,
} from "@tabler/icons-react";
import { format } from "date-fns";

interface Category {
  category_id: number;
  category_name: string;
}

interface Template {
  template_id: number;
  template_name: string;
  template_content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const CreateReminder = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminder_date: new Date(),
    reminder_time: new Date(),
    frequency: "ONCE",
    priority: "MEDIUM",
    category_id: "",
    template_id: "",
    is_active: true,
    attachments: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Load categories và templates
  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reminders/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reminders/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Khi chọn template
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.template_id === parseInt(templateId));
    if (template) {
      setFormData({
        ...formData,
        template_id: templateId,
        description: template.template_content,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        reminder_date: format(formData.reminder_date, "yyyy-MM-dd"),
        reminder_time: format(formData.reminder_time, "HH:mm:ss"),
        category_id: formData.category_id || null,
        template_id: formData.template_id || null,
      };

      const response = await fetch(`${API_URL}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: "Tạo nhắc nhở thành công!",
          severity: "success",
        });
        setTimeout(() => {
          router.push("/apps/reminders/list");
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Lỗi khi tạo nhắc nhở",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi tạo nhắc nhở",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <PageContainer title="Tạo nhắc nhở mới" description="Tạo nhắc nhở mới">
      <BlankCard>
        <CardContent>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">
              <IconBell size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Tạo nhắc nhở mới
            </Typography>
            <Button
              variant="outlined"
              startIcon={<IconArrowLeft />}
              onClick={() => router.push("/apps/reminders/list")}
            >
              Quay lại
            </Button>
          </Stack>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Thông tin cơ bản */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tiêu đề nhắc nhở"
                        value={formData.title}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                          value={formData.category_id}
                          onChange={(e) => handleFieldChange("category_id", e.target.value)}
                          label="Danh mục"
                        >
                          <MenuItem value="">
                            <em>Không chọn</em>
                          </MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.category_id} value={cat.category_id}>
                              {cat.category_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Mẫu nhắc nhở</InputLabel>
                        <Select
                          value={formData.template_id}
                          onChange={(e) => handleTemplateChange(e.target.value as string)}
                          label="Mẫu nhắc nhở"
                        >
                          <MenuItem value="">
                            <em>Không sử dụng mẫu</em>
                          </MenuItem>
                          {templates.map((template) => (
                            <MenuItem key={template.template_id} value={template.template_id}>
                              {template.template_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nội dung nhắc nhở"
                        value={formData.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        multiline
                        rows={4}
                        required
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Thời gian */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="h6" gutterBottom>
                    Thời gian nhắc nhở
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Ngày nhắc nhở"
                        type="date"
                        value={format(formData.reminder_date, "yyyy-MM-dd")}
                        onChange={(e) => handleFieldChange("reminder_date", new Date(e.target.value))}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Giờ nhắc nhở"
                        type="time"
                        value={format(formData.reminder_time, "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newTime = new Date();
                          newTime.setHours(parseInt(hours), parseInt(minutes));
                          handleFieldChange("reminder_time", newTime);
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Tần suất</InputLabel>
                        <Select
                          value={formData.frequency}
                          onChange={(e) => handleFieldChange("frequency", e.target.value)}
                          label="Tần suất"
                        >
                          <MenuItem value="ONCE">Một lần</MenuItem>
                          <MenuItem value="DAILY">Hàng ngày</MenuItem>
                          <MenuItem value="WEEKLY">Hàng tuần</MenuItem>
                          <MenuItem value="MONTHLY">Hàng tháng</MenuItem>
                          <MenuItem value="YEARLY">Hàng năm</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Cài đặt */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="h6" gutterBottom>
                    Cài đặt
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Độ ưu tiên</InputLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleFieldChange("priority", e.target.value)}
                          label="Độ ưu tiên"
                        >
                          <MenuItem value="LOW">Thấp</MenuItem>
                          <MenuItem value="MEDIUM">Trung bình</MenuItem>
                          <MenuItem value="HIGH">Cao</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.is_active}
                            onChange={(e) => handleFieldChange("is_active", e.target.checked)}
                          />
                        }
                        label="Kích hoạt nhắc nhở"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/apps/reminders/list")}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<IconDeviceFloppy />}
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Tạo nhắc nhở"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </BlankCard>

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

export default CreateReminder;