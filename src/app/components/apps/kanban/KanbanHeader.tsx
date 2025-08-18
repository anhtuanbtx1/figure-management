import { useState, useContext } from "react";
import { KanbanDataContext } from "@/app/context/kanbancontext/index";
import axios from "@/utils/axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { IconPlus, IconColumns } from "@tabler/icons-react";
import CustomFormLabel from "../../forms/theme-elements/CustomFormLabel";
import CustomTextField from "../../forms/theme-elements/CustomTextField";

function KanbanHeader() {
  const { addCategory, setError } = useContext(KanbanDataContext);
  const [show, setShow] = useState(false);
  const [listName, setListName] = useState("");

  //Closes the modal
  const handleClose = () => setShow(false);
  //open the modal
  const handleShow = () => setShow(true);

  //Handles Add a new category.
  const handleSave = async () => {
    try {
      const response = await axios.post("/api/TodoData/addCategory", {
        categoryName: listName,
      });
      addCategory(response.data.name);
      setListName("");
      setShow(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const isAddButtonDisabled = listName.trim().length === 0;

  return (
    <>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconColumns size={32} />
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
              Cải thiện quy trình làm việc
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Quản lý và theo dõi tiến độ công việc hiệu quả
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={handleShow}
          startIcon={<IconPlus size={20} />}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Thêm danh sách
        </Button>
      </Box>
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconPlus size={24} color="#667eea" />
            <Typography variant="h6" fontWeight={700}>
              Thêm danh sách mới
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomFormLabel htmlFor="default-value">
                Tên danh sách
              </CustomFormLabel>
              <CustomTextField
                autoFocus
                id="default-value"
                variant="outlined"
                value={listName}
                fullWidth
                placeholder="Nhập tên danh sách..."
                onChange={(e: any) => setListName(e.target.value)}
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
            onClick={handleClose}
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
            disabled={isAddButtonDisabled}
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
            Thêm danh sách
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

}
export default KanbanHeader;
