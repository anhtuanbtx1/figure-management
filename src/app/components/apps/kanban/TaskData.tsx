"use client";
import { useContext, useState } from "react";
import {
  IconPencil,
  IconDotsVertical,
  IconTrash,
  IconCalendar,
} from "@tabler/icons-react";
import EditTaskModal from "./TaskModal/EditTaskModal";
import { KanbanDataContext } from "@/app/context/kanbancontext/index";
import { Draggable } from "react-beautiful-dnd";
import axios from "@/utils/axios";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Box,
  Card,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import BlankCard from "../../shared/BlankCard";
interface TaskDataProps {
  task: { id: any };
  onDeleteTask: () => void;
  index: number;
}
const TaskData: React.FC<TaskDataProps> = ({
  task,
  onDeleteTask,
  index,
}: any) => {
  const { setError } = useContext(KanbanDataContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleShowEditModal = () => {
    handleClose();
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => onDeleteTask(task.id);

  const handleSaveEditedTask = async (editedTaskData: { id: any }) => {
    try {
      const response = await axios.put("/api/TodoData/editTask", {
        taskId: editedTaskData.id,
        newData: editedTaskData,
      });
      if (response.status === 200) {
        setEditedTask(editedTaskData);
      } else {
        throw new Error("Failed to edit task");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const formatDate = (selectedDate: string | number | Date) => {
    try {
      if (!selectedDate) return 'Chưa có ngày';

      const dateObj = new Date(selectedDate);

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return selectedDate.toString(); // Return original string if invalid
      }

      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("vi-VN", { month: "long" });
      return `${day} ${month}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return selectedDate ? selectedDate.toString() : 'Chưa có ngày';
    }
  };

  const backgroundColor =
    editedTask.taskProperty === "Design"
      ? "success.main"
      : editedTask.taskProperty === "Development"
        ? "warning.main"
        : editedTask.taskProperty === "Mobile"
          ? "primary.main"
          : editedTask.taskProperty === "UX Stage"
            ? "warning.main"
            : editedTask.taskProperty === "Research"
              ? "secondary.main"
              : editedTask.taskProperty === "Data Science"
                ? "error.main"
                : editedTask.taskProperty === "Branding"
                  ? "success.main"
                  : "primary.contrastText";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Box
          mb={2}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
          }}
        >
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          >
            <Box p={2.5}>
              {/* Header */}
              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                mb={2}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.4,
                    flex: 1,
                    mr: 1,
                  }}
                >
                  {editedTask.task}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleClick}
                  sx={{
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <IconDotsVertical size="1rem" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <MenuItem onClick={handleShowEditModal}>
                    <ListItemIcon>
                      <IconPencil size="1.2rem" />
                    </ListItemIcon>
                    <ListItemText>Chỉnh sửa</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                      <IconTrash size="1.2rem" />
                    </ListItemIcon>
                    <ListItemText>Xóa</ListItemText>
                  </MenuItem>
                </Menu>
                <EditTaskModal
                  show={showEditModal}
                  onHide={handleCloseEditModal}
                  task={task}
                  editedTask={editedTask}
                  onSave={handleSaveEditedTask}
                />
              </Box>

              {/* Task Description */}
              {editedTask.taskText && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {editedTask.taskText}
                </Typography>
              )}

              {/* Task Image */}
              {editedTask.taskImage && (
                <Box mb={2}>
                  <img
                    src={editedTask.taskImage}
                    alt="Hình ảnh nhiệm vụ"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.1)"
                    }}
                  />
                </Box>
              )}

              {/* Footer */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pt={1}
                borderTop="1px solid"
                borderColor="divider"
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <IconCalendar size="1rem" style={{ opacity: 0.7 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatDate(editedTask.date)}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={
                    editedTask.taskProperty === 'Design' ? 'Thiết kế' :
                    editedTask.taskProperty === 'Development' ? 'Phát triển' :
                    editedTask.taskProperty === 'Testing' ? 'Kiểm thử' :
                    editedTask.taskProperty === 'Research' ? 'Nghiên cứu' :
                    editedTask.taskProperty
                  }
                  sx={{
                    backgroundColor:
                      editedTask.taskProperty === 'Design' ? '#e91e63' :
                      editedTask.taskProperty === 'Development' ? '#2196f3' :
                      editedTask.taskProperty === 'Testing' ? '#ff9800' :
                      editedTask.taskProperty === 'Research' ? '#4caf50' :
                      '#9e9e9e',
                    color: "white",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                />
              </Box>
            </Box>
          </Card>
        </Box>
      )}
    </Draggable>
  );
};
export default TaskData;
