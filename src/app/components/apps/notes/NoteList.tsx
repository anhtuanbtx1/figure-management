import React, { useEffect } from "react";
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from "@/store/hooks";
import Scrollbar from "../../custom-scroll/Scrollbar";
import {
  fetchNotes,
  SelectNote,
  DeleteNote,
  SearchNotes,
} from "@/store/apps/notes/NotesSlice";
import { IconTrash, IconSearch, IconFileText } from "@tabler/icons-react";
import { NotesType } from '../../../(DashboardLayout)/types/apps/notes';

const NoteList = () => {
  const dispatch = useDispatch();
  const activeNote = useSelector((state) => state.notesReducer.notesContent);
  const searchTerm = useSelector((state) => state.notesReducer.noteSearch);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const filterNotes = (notes: NotesType[], nSearch: string) => {
    if (nSearch !== "")
      return notes.filter(
        (t: any) =>
          !t.deleted &&
          t.title
            .toLocaleLowerCase()
            .concat(" ")
            .includes(nSearch.toLocaleLowerCase())
      );

    return notes.filter((t) => !t.deleted);
  };

  const notes = useSelector((state) =>
    filterNotes(state.notesReducer.notes, state.notesReducer.noteSearch)
  );
  console.log(notes)
  return (
    <>
      <Box p={3} px={2}>
        <TextField
          id="search"
          value={searchTerm}
          placeholder="Tìm kiếm ghi chú..."
          inputProps={{ "aria-label": "Tìm kiếm ghi chú" }}
          size="small"
          type="search"
          variant="outlined"
          fullWidth
          onChange={(e) => dispatch(SearchNotes(e.target.value))}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
              },
            },
          }}
          InputProps={{
            startAdornment: <IconSearch size={18} style={{ marginRight: 8, opacity: 0.6 }} />,
          }}
        />
        <Box display="flex" alignItems="center" gap={1} mt={3} mb={1} pl={1}>
          <IconFileText size={20} />
          <Typography variant="h6" fontWeight={600}>
            Tất cả ghi chú ({notes.length})
          </Typography>
        </Box>
      </Box>
      <Box>
        <Scrollbar
          sx={{
            height: { lg: "calc(100vh - 300px)", sm: "100vh" },
            maxHeight: "700px",
          }}
        >
          {notes && notes.length ? (
            notes.map((note, index) => (
              <Box key={note.id} px={2}>
                <Box
                  p={2.5}
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    mb: 1.5,
                    borderRadius: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: activeNote === index ? "scale(1)" : "scale(0.98)",
                    backgroundColor: `${note.color}.light`,
                    border: activeNote === index ? `2px solid ${note.color}.main` : '2px solid transparent',
                    boxShadow: activeNote === index
                      ? `0 4px 20px rgba(0,0,0,0.1)`
                      : '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: "scale(1)",
                      boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => dispatch(SelectNote(index))}
                >
                  <Typography
                    variant="subtitle1"
                    noWrap
                    color={note.color + ".main"}
                    fontWeight={600}
                    sx={{ mb: 1 }}
                  >
                    {note.title || 'Ghi chú không có tiêu đề'}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(note.datef).toLocaleDateString('vi-VN')}
                    </Typography>
                    <Tooltip title="Xóa ghi chú">
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(DeleteNote(note.id));
                        }}
                        sx={{
                          opacity: 0.6,
                          '&:hover': {
                            opacity: 1,
                            backgroundColor: 'error.light',
                            color: 'error.main',
                          },
                        }}
                      >
                        <IconTrash width={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            ))
          ) : (
            <Box m={2}>
              <Alert
                severity="info"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                }}
              >
                {searchTerm ? 'Không tìm thấy ghi chú nào!' : 'Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên!'}
              </Alert>
            </Box>
          )}
        </Scrollbar>
      </Box>
    </>
  );
};

export default NoteList;
