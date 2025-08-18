"use client";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { IconPlus, IconDotsVertical, IconChecklist, IconClock, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import TaskData from "./TaskData";
import EditCategoryModal from "./TaskModal/EditCategoryModal";
import AddNewTaskModal from "./TaskModal/AddNewTaskModal";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { KanbanDataContext } from "@/app/context/kanbancontext/index";
import axios from "@/utils/axios";
import { Box, IconButton, Stack, Tooltip, Typography, Chip } from "@mui/material";

function CategoryTaskList({ id }: any) {
  const { todoCategories, deleteCategory, clearAllTasks, deleteTodo } =
    useContext(KanbanDataContext);

  const category = todoCategories.find((cat) => cat.id === id) as any;

  const [allTasks, setAllTasks] = useState(category ? category.child : []);
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category.name);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showContainer, setShowContainer] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Find the category and update tasks
  useEffect(() => {
    const category = todoCategories.find((cat) => cat.id === id);
    if (category) {
      setAllTasks(category.child);
    }
  }, [todoCategories, id]);

  const [newTaskData, setNewTaskData]: any = useState({
    task: "",
    taskText: "",
    taskProperty: "",
    date: new Date().toISOString().split("T")[0],
    imageURL: null,
  });

  //Shows the modal for adding a new task.
  const handleShowModal = () => {
    setShowModal(true);
  };
  // Closes the modal
  const handleCloseModal = (): any => {
    setShowModal(false);
  };
  //  Shows the modal for editing a category.
  const handleShowEditCategoryModal = () => {
    handleClose();
    setShowEditCategoryModal(true);
  };
  //Closes the modal for editing a category.
  const handleCloseEditCategoryModal = () => setShowEditCategoryModal(false);

  //Updates the category name
  const handleUpdateCategory = async (
    updatedName: SetStateAction<string | any>
  ) => {
    try {
      const response = await axios.post("/api/TodoData/updateCategory", {
        categoryId: id,
        categoryName: updatedName,
      });
      if (response.status === 200) {
        setNewCategoryName(updatedName);
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };
  //Adds a new task to the category.
  const handleAddTask = async () => {
    try {
      const response = await axios.post("/api/TodoData/addTask", {
        categoryId: id,
        newTaskData: {
          ...newTaskData,
          id: Math.random(),
          taskImage: newTaskData.imageURL,
        },
      });
      if (response.status === 200) {
        setNewTaskData({
          taskText: "",
          taskProperty: "",
          date: newTaskData.date,
          imageURL: "",
        });
        handleCloseModal();
        setNewTaskData("Task added successfully");
        console.log("Task added successfully:", response.data);
      } else {
        throw new Error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  // Clears all tasks from the current category.
  const handleClearAll = () => {
    clearAllTasks(id);
    setAllTasks([]);
  };
  // Deletes a specific task.
  const handleDeleteTask = (taskId: number | any) => {
    deleteTodo(taskId);
    setAllTasks((prevTasks: any[]) =>
      prevTasks.filter((task: { id: number }) => task.id !== taskId)
    );
  };
  //Handles the deletion of the current category.
  const handleDeleteClick = () => {
    setShowContainer(false);
    deleteCategory(id);
  };

  // Map category names to Vietnamese
  const getCategoryDisplayName = (name: string) => {
    switch (name) {
      case "Todo":
        return "Cần làm";
      case "Progress":
        return "Đang thực hiện";
      case "Pending":
        return "Chờ xử lý";
      case "Done":
        return "Hoàn thành";
      default:
        return name;
    }
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Todo":
        return <IconChecklist size={18} />;
      case "Progress":
        return <IconClock size={18} />;
      case "Pending":
        return <IconAlertCircle size={18} />;
      case "Done":
        return <IconCheck size={18} />;
      default:
        return <IconChecklist size={18} />;
    }
  };

  const getCategoryColor = (name: string) => {
    switch (name) {
      case "Todo":
        return {
          bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '#2196f3',
          text: '#1976d2'
        };
      case "Progress":
        return {
          bg: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
          border: '#ff9800',
          text: '#f57c00'
        };
      case "Pending":
        return {
          bg: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
          border: '#ffc107',
          text: '#f57f17'
        };
      case "Done":
        return {
          bg: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          border: '#4caf50',
          text: '#2e7d32'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
          border: '#9e9e9e',
          text: '#616161'
        };
    }
  };

  const categoryStyle = category ? getCategoryColor(category.name) : getCategoryColor('default');

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {showContainer && category && (
          <Box
            sx={{
              background: categoryStyle.bg,
              borderRadius: 3,
              border: `2px solid ${categoryStyle.border}20`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              height: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${categoryStyle.border}15 0%, ${categoryStyle.border}25 100%)`,
                p: { xs: 2, sm: 2.5, md: 3 },
                borderBottom: `1px solid ${categoryStyle.border}20`,
                flexShrink: 0,
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Box display="flex" alignItems="center" gap={1.5} flex={1} minWidth={0}>
                  <Box sx={{ color: categoryStyle.text, flexShrink: 0 }}>
                    {getCategoryIcon(category.name)}
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: categoryStyle.text,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getCategoryDisplayName(category.name)}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Chip
                    label={allTasks.length}
                    size="small"
                    sx={{
                      backgroundColor: categoryStyle.text,
                      color: 'white',
                      fontWeight: 600,
                      minWidth: 24,
                      height: 24,
                    }}
                  />
                  <Box>
                    {category.name === "Todo" && (
                      <>
                        <Tooltip title="Thêm nhiệm vụ">
                          <IconButton
                            onClick={handleShowModal}
                            size="small"
                            sx={{
                              color: categoryStyle.text,
                              '&:hover': {
                                backgroundColor: `${categoryStyle.border}20`,
                              },
                            }}
                          >
                            <IconPlus size="1rem" />
                          </IconButton>
                        </Tooltip>
                        <AddNewTaskModal
                          show={showModal}
                          onHide={handleCloseModal}
                          onSave={handleAddTask}
                          newTaskData={newTaskData}
                          setNewTaskData={setNewTaskData}
                          updateTasks={() =>
                            setAllTasks([...allTasks, newTaskData])
                          }
                        />
                      </>
                    )}
                    <EditCategoryModal
                      showModal={showEditCategoryModal}
                      handleCloseModal={handleCloseEditCategoryModal}
                      initialCategoryName={newCategoryName}
                      handleUpdateCategory={handleUpdateCategory}
                    />
                  </Box>
                  <Tooltip title="Tùy chọn">
                    <IconButton
                      onClick={handleClick}
                      size="small"
                      sx={{
                        color: categoryStyle.text,
                        '&:hover': {
                          backgroundColor: `${categoryStyle.border}20`,
                        },
                      }}
                    >
                      <IconDotsVertical size="1rem" />
                    </IconButton>
                  </Tooltip>
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
                    <MenuItem onClick={handleShowEditCategoryModal}>
                      Chỉnh sửa
                    </MenuItem>
                    <MenuItem onClick={handleDeleteClick}>Xóa</MenuItem>
                    <MenuItem onClick={handleClearAll}>Xóa tất cả</MenuItem>
                  </Menu>
                </Stack>
              </Box>
            </Box>

            {/* Tasks Container */}
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                minHeight: { xs: 150, sm: 200 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {allTasks.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: { xs: 3, sm: 4 },
                    color: 'text.secondary',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    {category.name === "Todo" ? "Chưa có nhiệm vụ nào" : "Trống"}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {allTasks.map((task: { id: any }, index: number) => (
                    <TaskData
                      key={task.id}
                      task={task}
                      onDeleteTask={() => handleDeleteTask(task.id)}
                      index={index}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
export default CategoryTaskList;
