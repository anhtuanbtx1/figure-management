"use client";
import { useState } from "react";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";
import { IconEdit } from "@tabler/icons-react";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";

function EditCategoryModal({
  showModal,
  handleCloseModal,
  handleUpdateCategory,
  initialCategoryName,
}: any) {
  const [newCategoryName, setNewCategoryName] = useState(initialCategoryName);
  // Function to handle saving changes and updating category name
  const handleSave = () => {
    handleUpdateCategory(newCategoryName);
    handleCloseModal();
  };
  return (
    <Dialog
      open={showModal}
      onClose={handleCloseModal}
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
          <IconEdit size={24} color="#667eea" />
          <Typography variant="h6" fontWeight={700}>
            Chỉnh sửa danh mục
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* category title */}
            <CustomFormLabel htmlFor="cname">Tên danh mục</CustomFormLabel>
            <CustomTextField
              id="cname"
              variant="outlined"
              fullWidth
              placeholder="Nhập tên danh mục..."
              value={newCategoryName}
              onChange={(e: any) => setNewCategoryName(e.target.value)}
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
          onClick={handleCloseModal}
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
export default EditCategoryModal;
