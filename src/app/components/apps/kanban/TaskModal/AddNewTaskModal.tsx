"use client";
import React from "react";
import {
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  TextField,
  FormLabel,
  Select,
} from "@mui/material";
import { IconPlus, IconChecklist } from "@tabler/icons-react";

function AddNewTaskModal({
  show,
  onHide,
  onSave,
  newTaskData,
  setNewTaskData,
  updateTasks,
}: any) {
  const { task, taskText, taskProperty, date, taskImage } = newTaskData;

  // Set default date to today if no date is provided
  const defaultDate = date || new Date();

  const handleDateChange = (newDate: any) => {
    try {
      const dateValue = newDate instanceof Date ? newDate : new Date(newDate);
      if (!isNaN(dateValue.getTime())) {
        setNewTaskData({ ...newTaskData, date: dateValue });
      }
    } catch (error) {
      console.error('Date change error:', error);
    }
  };

  // Function to handle saving changes and updating tasks
  const handleSave = () => {
    try {
      const updatedDate = date || new Date();
      // Update the task data with the default date if needed
      setNewTaskData({ ...newTaskData, date: updatedDate });
      onSave();
      updateTasks();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const isFormValid = () => {
    return task && taskText && taskProperty && date && taskImage;
  };
  return (
    <Dialog
      open={show}
      onClose={onHide}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: "form",
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconChecklist size={24} color="#667eea" />
          <Typography variant="h6" fontWeight={700}>
            Thêm nhiệm vụ mới
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            {/* task title */}
            <FormLabel
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
              htmlFor="task"
            >
              Tiêu đề nhiệm vụ *
            </FormLabel>
            <TextField
              id="task"
              variant="outlined"
              fullWidth
              placeholder="Nhập tiêu đề nhiệm vụ..."
              value={task}
              onChange={(e: { target: { value: any; }; }) =>
                setNewTaskData({ ...newTaskData, task: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* task text */}
            <FormLabel
              htmlFor="taskText"
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
            >
              Mô tả *
            </FormLabel>
            <TextField
              id="taskText"
              variant="outlined"
              fullWidth
              placeholder="Nhập mô tả nhiệm vụ..."
              value={taskText}
              onChange={(e: { target: { value: any; }; }) =>
                setNewTaskData({ ...newTaskData, taskText: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            {/* task image */}
            <FormLabel
              htmlFor="taskImage"
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
            >
              URL hình ảnh *
            </FormLabel>
            <TextField
              id="taskImage"
              variant="outlined"
              fullWidth
              placeholder="Nhập URL hình ảnh..."
              value={taskImage}
              onChange={(e: { target: { value: any; }; }) =>
                setNewTaskData({ ...newTaskData, taskImage: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                },
              }}
            />
            {taskImage !== undefined && taskImage && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  width={200}
                  height={200}
                  src={taskImage}
                  alt="Xem trước"
                  style={{
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* task property */}
            <FormLabel
              htmlFor="taskProperty"
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
            >
              Độ ưu tiên *
            </FormLabel>
            <Select
              fullWidth
              id="taskProperty"
              variant="outlined"
              value={taskProperty}
              onChange={(e: { target: { value: any; }; }) =>
                setNewTaskData({ ...newTaskData, taskProperty: e.target.value })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                },
              }}
            >
              <MenuItem value="">Chọn độ ưu tiên</MenuItem>
              <MenuItem value="Design">Thiết kế</MenuItem>
              <MenuItem value="Development">Phát triển</MenuItem>
              <MenuItem value="Testing">Kiểm thử</MenuItem>
              <MenuItem value="Research">Nghiên cứu</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* due date */}
            <FormLabel
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600,
              }}
            >
              Hạn hoàn thành *
            </FormLabel>
            <TextField
              type="date"
              fullWidth
              value={(() => {
                try {
                  if (date) {
                    const dateObj = new Date(date);
                    if (!isNaN(dateObj.getTime())) {
                      return dateObj.toISOString().split('T')[0];
                    }
                  }
                  return new Date().toISOString().split('T')[0];
                } catch (error) {
                  return new Date().toISOString().split('T')[0];
                }
              })()}
              onChange={(e) => {
                if (e.target.value) {
                  handleDateChange(new Date(e.target.value));
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          onClick={onHide}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            color: 'text.secondary',
            borderColor: 'divider',
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isFormValid()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
            '&:disabled': {
              background: 'rgba(0,0,0,0.12)',
            },
          }}
        >
          Thêm nhiệm vụ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default AddNewTaskModal;
