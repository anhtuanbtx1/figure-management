import * as React from 'react';
import { addNote } from '@/store/apps/notes/NotesSlice';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from '@/store/hooks';
import { IconCheck, IconPlus, IconPalette, IconNote } from '@tabler/icons-react';

interface Props {
  colors: any[];
}

const AddNotes = ({ colors }: Props) => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [scolor, setScolor] = React.useState<string>('primary');
  const id = useSelector((state) => state.notesReducer.notes.length + 1);
  const [title, setTitle] = React.useState('');

  const setColor = (e: string) => {
    setScolor(e);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        disableElevation
        onClick={handleClickOpen}
        startIcon={<IconPlus size={18} />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1,
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.3)',
          },
        }}
      >
        Thêm ghi chú
      </Button>
      <Dialog
        open={open}
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
        <DialogContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <IconNote size={28} color="#667eea" />
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Tạo ghi chú mới
            </Typography>
          </Box>
          <DialogContentText sx={{ mb: 3, color: 'text.secondary' }}>
            Nhập nội dung ghi chú và chọn màu sắc phù hợp. Bấm &quot;Tạo ghi chú&quot; để hoàn thành.
          </DialogContentText>
          <TextField
            multiline
            rows={6}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            id="description"
            label="Nội dung ghi chú"
            placeholder="Nhập nội dung ghi chú của bạn..."
            type="text"
            fullWidth
            variant="outlined"
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
          <Box display="flex" alignItems="center" gap={1} mt={3} mb={2}>
            <IconPalette size={20} />
            <Typography variant="h6" fontWeight={600}>
              Chọn màu ghi chú
            </Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            {colors.map((color) => (
              <Fab
                color={color.disp}
                sx={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: scolor === color.disp ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: scolor === color.disp
                    ? `0 4px 12px ${color.lineColor}40`
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  border: scolor === color.disp ? `2px solid ${color.lineColor}` : '2px solid transparent',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 6px 16px ${color.lineColor}40`,
                  },
                }}
                size="medium"
                key={color.disp}
                onClick={() => setColor(color.disp)}
              >
                {scolor === color.disp ? <IconCheck size={20} /> : ''}
              </Fab>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            Hủy
          </Button>
          <Button
            disabled={title === ''}
            onClick={(e) => {
              e.preventDefault();
              dispatch(addNote(id, title, scolor));
              setOpen(false);
              setTitle('');
              setColor('primary');
            }}
            variant="contained"
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
            Tạo ghi chú
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNotes;
