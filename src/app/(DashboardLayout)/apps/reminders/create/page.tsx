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
} from "@tabler/icons-react";
import { format } from "date-fns";

interface Category {
  id: number;
  name: string;
}

interface Template {
  id: number;
  name: string;
  content: string; // Add content field
}

const CreateReminder = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminderDate: new Date(),
    reminderTime: new Date(),
    reminderType: "once",
    priority: "medium",
    categoryId: "",
    templateId: "",
    isActive: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/reminder-categories`);
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
      const response = await fetch(`/api/notification-templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === parseInt(templateId));
    setFormData(prevData => ({
      ...prevData,
      templateId: templateId,
      // Update description with template content
      description: selectedTemplate ? selectedTemplate.content : prevData.description,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        reminderDate: format(formData.reminderDate, "yyyy-MM-dd"),
        reminderTime: format(formData.reminderTime, "HH:mm:ss"),
        categoryId: formData.categoryId || null,
        templateId: formData.templateId || null,
        startDate: format(new Date(), "yyyy-MM-dd"), 
      };

      const response = await fetch(`/api/reminders`, {
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

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
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
                          value={formData.categoryId}
                          onChange={(e) => handleFieldChange("categoryId", e.target.value)}
                          label="Danh mục"
                        >
                          <MenuItem value="">
                            <em>Không chọn</em>
                          </MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Mẫu nhắc nhở</InputLabel>
                        <Select
                          value={formData.templateId}
                          onChange={(e) => handleTemplateChange(e.target.value as string)}
                          label="Mẫu nhắc nhở"
                        >
                          <MenuItem value="">
                            <em>Không sử dụng mẫu</em>
                          </MenuItem>
                          {templates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                              {template.name}
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
                        value={format(formData.reminderDate, "yyyy-MM-dd")}
                        onChange={(e) => handleFieldChange("reminderDate", new Date(e.target.value))}
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
                        value={format(formData.reminderTime, "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newTime = new Date();
                          newTime.setHours(parseInt(hours), parseInt(minutes));
                          handleFieldChange("reminderTime", newTime);
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
                          value={formData.reminderType}
                          onChange={(e) => handleFieldChange("reminderType", e.target.value)}
                          label="Tần suất"
                        >
                          <MenuItem value="once">Một lần</MenuItem>
                          <MenuItem value="daily">Hàng ngày</MenuItem>
                          <MenuItem value="weekly">Hàng tuần</MenuItem>
                          <MenuItem value="monthly">Hàng tháng</MenuItem>
                          <MenuItem value="yearly">Hàng năm</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

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
                          <MenuItem value="low">Thấp</MenuItem>
                          <MenuItem value="medium">Trung bình</MenuItem>
                          <MenuItem value="high">Cao</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.isActive}
                            onChange={(e) => handleFieldChange("isActive", e.target.checked)}
                          />
                        }
                        label="Kích hoạt nhắc nhở"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

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
