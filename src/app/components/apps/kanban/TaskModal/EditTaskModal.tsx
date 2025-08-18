"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  FormLabel,
  Select,
  Box
} from "@mui/material";
import { IconEdit } from "@tabler/icons-react";

function EditTaskModal({ show, onHide, editedTask, onSave }: any) {
  const [tempEditedTask, setTempEditedTask] = useState(editedTask);
  const [newImageUrl, setNewImageUrl] = useState(editedTask.taskImage || "");
  const [imagePreview, setImagePreview] = useState(editedTask.taskImage || "");

  useEffect(() => {
    setTempEditedTask(editedTask);
    setNewImageUrl(editedTask.taskImage || "");
    setImagePreview(editedTask.taskImage || "");
  }, [editedTask]);

  // Function to handle changes in the task input fields
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setTempEditedTask({ ...tempEditedTask, [name]: value });
  };

  // Function to handle changes in the task property
  const handlePropertyChange = (property: any) => {
    setTempEditedTask({ ...tempEditedTask, taskProperty: property });
  };

  // Function to handle saving the changes made to the task and hiding the modal
  const handleSaveChanges = () => {
    const updatedTask = { ...tempEditedTask, taskImage: newImageUrl };
    onSave(updatedTask);
    onHide();
  };

  // Function to handle date change from DatePicker
  const handleDateChange = (newDate: any) => {
    try {
      const dateValue = newDate instanceof Date ? newDate : new Date(newDate);
      if (!isNaN(dateValue.getTime())) {
        setTempEditedTask({ ...tempEditedTask, date: dateValue });
      }
    } catch (error) {
      console.error('Date change error:', error);
    }
  };

  // Function to handle new image URL input
  const handleNewImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewImageUrl(url);
    setImagePreview(url); // Update the preview with the new image URL
  };

  return (
    <Dialog
      open={show}
      onClose={onHide}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{ component: "form" }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconEdit size={24} color="#667eea" />
          <Typography variant="h6" fontWeight={700}>
            Chỉnh sửa nhiệm vụ
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            {/* Task title */}
            <FormLabel
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600
              }}
              htmlFor="task"
            >
              Tiêu đề nhiệm vụ
            </FormLabel>
            <TextField
              id="task"
              name="task"
              variant="outlined"
              fullWidth
              value={tempEditedTask.task}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* Task property */}
            <FormLabel
              htmlFor="taskProperty"
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600
              }}
            >
              Độ ưu tiên *
            </FormLabel>
            <Select
              fullWidth
              id="taskProperty"
              variant="outlined"
              value={tempEditedTask.taskProperty}
              onChange={(e: any) => handlePropertyChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                },
              }}
            >
              <MenuItem value="Design">Thiết kế</MenuItem>
              <MenuItem value="Development">Phát triển</MenuItem>
              <MenuItem value="Testing">Kiểm thử</MenuItem>
              <MenuItem value="Research">Nghiên cứu</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* Task text or image */}
            {tempEditedTask.taskImage ? (
              <>
                {/* Image handling */}
                <FormLabel
                  htmlFor="taskImage"
                  sx={{
                    mt: 0,
                    mb: 1,
                    display: 'block',
                    fontWeight: 600
                  }}
                >
                  URL hình ảnh
                </FormLabel>
                <TextField
                  id="taskImage"
                  variant="outlined"
                  fullWidth
                  value={newImageUrl}
                  onChange={handleNewImageUrlChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      Xem trước hình ảnh:
                    </Typography>
                    <img
                      src={imagePreview}
                      alt="Xem trước"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: "8px" }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <>
                {/* Task text */}
                <FormLabel
                  sx={{
                    mt: 0,
                    mb: 1,
                    display: 'block',
                    fontWeight: 600
                  }}
                  htmlFor="task-text"
                >
                  Mô tả
                </FormLabel>
                <TextField
                  id="task-text"
                  variant="outlined"
                  fullWidth
                  name="taskText"
                  value={tempEditedTask.taskText}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
              </>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {/* Due date */}
            <FormLabel
              htmlFor="date"
              sx={{
                mt: 0,
                mb: 1,
                display: 'block',
                fontWeight: 600
              }}
            >
              Hạn hoàn thành *
            </FormLabel>
            <TextField
              type="date"
              fullWidth
              value={(() => {
                try {
                  if (tempEditedTask.date) {
                    const dateObj = new Date(tempEditedTask.date);
                    if (!isNaN(dateObj.getTime())) {
                      return dateObj.toISOString().split('T')[0];
                    }
                  }
                  return '';
                } catch (error) {
                  return '';
                }
              })()}
              onChange={(e) => {
                if (e.target.value) {
                  handleDateChange(new Date(e.target.value));
                }
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
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
          onClick={handleSaveChanges}
          autoFocus
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTaskModal;

