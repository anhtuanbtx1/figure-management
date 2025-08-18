import React from 'react';
import { useSelector, useDispatch } from '@/store/hooks';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { IconCheck, IconMenu2, IconEdit, IconPalette, IconNote } from '@tabler/icons-react';

import { UpdateNote } from '@/store/apps/notes/NotesSlice';
import AddNotes from './AddNotes';
import { NotesType } from '../../../(DashboardLayout)/types/apps/notes';

interface colorsType {
  lineColor: string;
  disp: string | any;
  id: number;
}

interface Props {
  toggleNoteSidebar: (event: React.MouseEvent<HTMLElement>) => void,
}

const NoteContent = ({ toggleNoteSidebar }: Props) => {
  const notelength: any = useSelector(
    (state) => state.notesReducer.notes.length-1,
  );
  const noteDetails: NotesType = useSelector(
    (state) => state.notesReducer.notes[state.notesReducer.notesContent>notelength ?  0 : state.notesReducer.notesContent],
  );
  
  const theme = useTheme();

  const dispatch = useDispatch();

  const colorvariation: colorsType[] = [
    {
      id: 1,
      lineColor: theme.palette.warning.main,
      disp: 'warning',
    },
    {
      id: 2,
      lineColor: theme.palette.info.main,
      disp: 'info',
    },
    {
      id: 3,
      lineColor: theme.palette.error.main,
      disp: 'error',
    },
    {
      id: 4,
      lineColor: theme.palette.success.main,
      disp: 'success',
    },
    {
      id: 5,
      lineColor: theme.palette.primary.main,
      disp: 'primary',
    },
  ];

  return (
    <Box sx={{
      height: { lg: 'calc(100vh - 250px)', sm: '100vh' },
      maxHeight: '700px',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    }}>
      {/* ------------------------------------------- */}
      {/* Header Part */}
      {/* ------------------------------------------- */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={3}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={toggleNoteSidebar}
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <IconMenu2 stroke={1.5} />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1}>
            <IconEdit size={24} />
            <Typography variant="h6" fontWeight={600}>
              Chỉnh sửa ghi chú
            </Typography>
          </Box>
        </Box>
        <AddNotes colors={colorvariation} />
      </Box>
      <Divider />
      {/* ------------------------------------------- */}
      {/* Edit notes */}
      {/* ------------------------------------------- */}
      {noteDetails ? (
        <Box p={4}>
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 3,
              p: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <FormLabel htmlFor="outlined-multiline-static">
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <IconNote size={20} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Nội dung ghi chú
                </Typography>
              </Box>
            </FormLabel>

            <TextField
              id="outlined-multiline-static"
              placeholder="Nhập nội dung ghi chú của bạn..."
              multiline
              fullWidth
              rows={8}
              variant="outlined"
              value={noteDetails.title}
              onChange={(e) => dispatch(UpdateNote(noteDetails.id, 'title', e.target.value))}
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
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  lineHeight: 1.6,
                },
              }}
            />

            <Box display="flex" alignItems="center" gap={1} mt={4} mb={2}>
              <IconPalette size={20} />
              <Typography variant="h6" fontWeight={600}>
                Chọn màu ghi chú
              </Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              {colorvariation.map((color1) => (
                <Fab
                  sx={{
                    boxShadow: noteDetails.color === color1.disp
                      ? `0 4px 12px ${color1.lineColor}40`
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: noteDetails.color === color1.disp ? 'scale(1.1)' : 'scale(1)',
                    border: noteDetails.color === color1.disp ? `2px solid ${color1.lineColor}` : '2px solid transparent',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 6px 16px ${color1.lineColor}40`,
                    },
                  }}
                  size="medium"
                  key={color1.id}
                  color={color1?.disp}
                  onClick={() => dispatch(UpdateNote(noteDetails.id, 'color', color1.disp))}
                >
                  {noteDetails.color === color1.disp ? <IconCheck width="20" /> : ''}
                </Fab>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60%',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <IconNote size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant="h5" fontWeight={600} mb={1}>
            Chọn một ghi chú để chỉnh sửa
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7 }}>
            Chọn ghi chú từ danh sách bên trái hoặc tạo ghi chú mới
          </Typography>
        </Box>
      )}
    </Box>
  );
};


export default NoteContent;
