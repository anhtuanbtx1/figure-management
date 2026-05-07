"use client";
import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Avatar, CircularProgress, Grid, InputAdornment, Tooltip, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import NumbersIcon from '@mui/icons-material/Numbers';
import StarsIcon from '@mui/icons-material/Stars';
import PlaceIcon from '@mui/icons-material/Place';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

interface Player {
  id: string;
  name: string;
  shortName: string;
  pos: string;
  rating: number;
  jerseyNumber: number;
  avatar?: string;
}

interface TeamManagementProps {
  teamId: string;
  players: Player[];
  onRefresh: () => void;
  C: any; // Theme constants
}

export default function TeamManagement({ teamId, players, onRefresh, C }: TeamManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  const handleOpenDialog = (player?: Player) => {
    if (player) setEditingPlayer({ ...player });
    else setEditingPlayer({ name: '', shortName: '', pos: 'CM', rating: 70, jerseyNumber: 10, avatar: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlayer(null);
  };

  const handleChange = (field: keyof Player, value: any) => {
    setEditingPlayer(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!editingPlayer || !teamId) return;
    setIsSaving(true);
    try {
      const isEdit = !!editingPlayer.id;
      const url = '/api/football-lineups/players';
      const method = isEdit ? 'PUT' : 'POST';
      const body = {
        id: editingPlayer.id,
        team_id: teamId,
        full_name: editingPlayer.name,
        short_name: editingPlayer.shortName,
        position: editingPlayer.pos,
        rating: editingPlayer.rating,
        jersey_number: editingPlayer.jerseyNumber,
        avatar_url: editingPlayer.avatar
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        onRefresh();
        handleCloseDialog();
      } else {
        alert('Có lỗi xảy ra khi lưu');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá cầu thủ này khỏi đội bóng?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/football-lineups/players?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      } else {
        alert('Có lỗi xảy ra khi xoá');
      }
    } catch (e) {
      console.error(e);
    }
    setIsDeleting(null);
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      color: 'white',
      fontFamily: '"Manrope", sans-serif',
      transition: 'all 0.2s ease',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: C.primary },
      '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: '1px' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', fontFamily: '"Space Grotesk", sans-serif' },
    '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
    mb: 2.5
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchQuery);
    setPage(0);
  };

  const filteredPlayers = players.filter(p => {
    if (!activeSearchTerm) return true;
    const term = activeSearchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || 
           p.shortName.toLowerCase().includes(term) ||
           p.jerseyNumber.toString() === term ||
           p.rating.toString() === term;
  });

  const displayedPlayers = filteredPlayers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto', background: C.background, position: 'relative' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography sx={{ color: 'white', fontFamily: '"Space Grotesk", sans-serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>
            DANH SÁCH CẦU THỦ
          </Typography>
          <Typography sx={{ color: C.onSurfaceVariant, fontSize: 13, fontWeight: 400, opacity: 0.7 }}>
            Quản lý và điều chỉnh thông tin nhân sự của đội bóng
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            variant="outlined"
            placeholder="Tên, số áo, chỉ số..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                height: '44px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: C.primary },
                '&.Mui-focused fieldset': { borderColor: C.primary },
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={handleSearch}
            sx={{
              color: C.primary,
              borderColor: C.primary,
              borderRadius: '12px',
              height: '44px',
              px: 3,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              '&:hover': { background: `${C.primary}11`, borderColor: C.primary }
            }}
          >
            TÌM KIẾM
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          sx={{ 
            background: C.primary, color: C.onPrimary, fontWeight: 800, borderRadius: '14px', px: 4, py: 1.5,
            fontFamily: '"Space Grotesk", sans-serif',
            boxShadow: `0 8px 20px ${C.primary}33`,
            '&:hover': { background: C.primaryFixed, transform: 'translateY(-2px)' },
            transition: 'all 0.2s'
          }}
        >
          THÊM CẦU THỦ
        </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ 
        background: 'rgba(255,255,255,0.02)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '24px', 
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        mb: 2
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: `1px solid rgba(255,255,255,0.08)`, color: 'rgba(255,255,255,0.4)', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}}>
              <TableCell sx={{ pl: 4 }}>THÔNG TIN CẦU THỦ</TableCell>
              <TableCell>VỊ TRÍ</TableCell>
              <TableCell align="center">CHỈ SỐ</TableCell>
              <TableCell align="center">SỐ ÁO</TableCell>
              <TableCell align="right" sx={{ pr: 4 }}>THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedPlayers.map((p) => (
              <TableRow key={p.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' }, '& td': { borderBottom: `1px solid rgba(255,255,255,0.03)`, color: 'white', fontFamily: '"Manrope", sans-serif', py: 2.5 }}}>
                <TableCell sx={{ pl: 4 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar 
                      src={p.avatar || `https://i.pravatar.cc/150?u=${p.id}`} 
                      sx={{ width: 48, height: 48, border: `2px solid rgba(255,255,255,0.05)`, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} 
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.shortName}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    background: 'rgba(255,255,255,0.05)', display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: '6px', 
                    fontSize: 11, fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', color: C.secondary
                  }}>
                    {p.pos}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="800" sx={{ 
                    color: p.rating >= 85 ? C.primary : 'white', 
                    fontSize: 18, fontFamily: '"Space Grotesk", sans-serif' 
                  }}>
                    {p.rating}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ fontSize: 16, fontWeight: 500, opacity: 0.8 }}>#{p.jerseyNumber}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ pr: 4 }}>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton onClick={() => handleOpenDialog(p)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: C.primary, background: `${C.primary}11` } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton onClick={() => handleDelete(p.id)} sx={{ color: 'rgba(255,255,255,0.3)', ml: 1, '&:hover': { color: '#ff4d4d', background: '#ff4d4d11' } }} disabled={isDeleting === p.id}>
                      {isDeleting === p.id ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredPlayers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Không tìm thấy cầu thủ nào phù hợp</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <Box sx={{ borderTop: `1px solid rgba(255,255,255,0.08)`, p: 1 }}>
          <TablePagination
            component="div"
            count={filteredPlayers.length}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
            labelRowsPerPage="Số dòng mỗi trang:"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              '& .MuiTablePagination-selectIcon': { color: 'rgba(255,255,255,0.6)' },
              '& .MuiTablePagination-actions': { color: C.primary },
              '& .MuiTablePagination-select': { fontFamily: '"Manrope", sans-serif' },
              '& .MuiTablePagination-displayedRows': { fontFamily: '"Manrope", sans-serif' }
            }}
          />
        </Box>
      </TableContainer>

      {/* Modern Modal */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            background: '#121815', 
            color: 'white', 
            borderRadius: '28px', 
            border: `1px solid rgba(255,255,255,0.08)`,
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            backgroundImage: 'radial-gradient(circle at top left, rgba(74,225,118,0.03), transparent)',
            overflow: 'hidden'
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 4, pt: 4, pb: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 800, fontSize: 24 }}>
              {editingPlayer?.id ? 'HIỆU CHỈNH CẦU THỦ' : 'TẠO MỚI CẦU THỦ'}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Cập nhật các thông số kỹ thuật và hồ sơ cá nhân
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: 'white' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 4, py: 3 }}>
          <Grid container spacing={4}>
            {/* Left Column: Form Inputs */}
            <Grid item xs={12} md={7}>
              <TextField 
                label="Họ và tên đầy đủ" fullWidth variant="outlined" 
                value={editingPlayer?.name || ''} 
                onChange={(e) => handleChange('name', e.target.value)}
                sx={inputStyle}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>
                }}
              />
              <TextField 
                label="Tên hiển thị (Short Name)" fullWidth variant="outlined" 
                value={editingPlayer?.shortName || ''} 
                onChange={(e) => handleChange('shortName', e.target.value)}
                sx={inputStyle}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><NumbersIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>
                }}
              />
              <Box display="flex" gap={2}>
                <TextField 
                  select label="Vị trí" fullWidth variant="outlined" 
                  value={editingPlayer?.pos || 'CM'} 
                  onChange={(e) => handleChange('pos', e.target.value)}
                  sx={inputStyle}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><PlaceIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>
                  }}
                  SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#1a221e', color: 'white', borderRadius: '12px' } } } }}
                >
                  {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'].map(pos => (
                    <MenuItem key={pos} value={pos} sx={{ '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>{pos}</MenuItem>
                  ))}
                </TextField>
                <TextField 
                  label="Số áo" fullWidth variant="outlined" type="number"
                  value={editingPlayer?.jerseyNumber || ''} 
                  onChange={(e) => handleChange('jerseyNumber', e.target.value)}
                  sx={inputStyle}
                />
                <TextField 
                  label="Chỉ số (OVR)" fullWidth variant="outlined" type="number"
                  value={editingPlayer?.rating || ''} 
                  onChange={(e) => handleChange('rating', e.target.value)}
                  sx={inputStyle}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><StarsIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>
                  }}
                />
              </Box>
              <TextField 
                label="URL Ảnh đại diện" fullWidth variant="outlined" 
                value={editingPlayer?.avatar || ''} 
                onChange={(e) => handleChange('avatar', e.target.value)}
                sx={inputStyle}
                placeholder="https://i.pravatar.cc/150..."
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><ImageIcon sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} /></InputAdornment>
                }}
              />
            </Grid>

            {/* Right Column: Live Preview */}
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                height: '100%', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '20px', 
                border: '1px dashed rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                p: 3
              }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, mb: 3, letterSpacing: '1px' }}>
                  PREVIEW CARD
                </Typography>
                
                {/* FIFA Style Card Preview */}
                <Box sx={{
                  width: 180, height: 260,
                  background: `linear-gradient(135deg, ${C.primary}33, #121815)`,
                  borderRadius: '16px', border: `2px solid ${C.primary}55`,
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4
                }}>
                  <Avatar 
                    src={editingPlayer?.avatar || `https://i.pravatar.cc/150?u=${editingPlayer?.id || 'new'}`} 
                    sx={{ width: 100, height: 100, border: `3px solid ${C.primary}` }} 
                  />
                  <Typography sx={{ mt: 2, fontWeight: 800, fontSize: 18, fontFamily: '"Space Grotesk", sans-serif' }}>
                    {editingPlayer?.shortName || 'PLAYER'}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Typography sx={{ fontSize: 24, fontWeight: 900, color: C.primary }}>{editingPlayer?.rating || 70}</Typography>
                    <Box sx={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: 20, my: 'auto' }} />
                    <Typography sx={{ fontSize: 14, my: 'auto', fontWeight: 700, opacity: 0.6 }}>{editingPlayer?.pos || 'CM'}</Typography>
                  </Box>
                  <Typography sx={{ position: 'absolute', top: 15, right: 15, fontWeight: 900, fontSize: 20, opacity: 0.1 }}>
                    #{editingPlayer?.jerseyNumber || 10}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Trong suốt</Button>
          <Box flex={1} />
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={isSaving}
            sx={{ 
              background: C.primary, color: C.onPrimary, fontWeight: 800, px: 5, py: 1.2, borderRadius: '12px',
              fontFamily: '"Space Grotesk", sans-serif',
              '&:hover': { background: C.primaryFixed }
            }}
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : editingPlayer?.id ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN TẠO'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
