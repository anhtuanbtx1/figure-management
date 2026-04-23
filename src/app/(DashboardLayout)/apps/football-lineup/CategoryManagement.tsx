'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Avatar,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconX, IconDeviceFloppy } from '@tabler/icons-react';

interface Team {
  id: number;
  name: string;
  league: string;
  logo_url: string;
}

const emptyForm = (): Omit<Team, 'id'> & { id?: number } => ({
  name: '', league: '', logo_url: '',
});

export default function CategoryManagement({ C, onRefresh }: { C: any; onRefresh?: () => void }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Team, 'id'> & { id?: number }>(emptyForm());

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/football-lineups/categories');
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setTeams(data.categories || []);
    } catch (e: any) {
      setError('Không thể tải danh sách đội: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (t: Team) => { setForm({ ...t }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/football-lineups/categories', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDialogOpen(false);
      load();
      onRefresh?.();
    } catch (e: any) {
      setError(e.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/football-lineups/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDeleteTarget(null);
      load();
      onRefresh?.();
    } catch (e: any) {
      setError(e.message || 'Lỗi khi xóa');
    } finally {
      setSaving(false);
    }
  };

  const inputSx = {
    mb: 2,
    '& .MuiInputBase-input': { color: C.onSurface },
    '& .MuiInputLabel-root': { color: C.onSurfaceVariant },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: C.onSurface }}>
            🏆 Quản lý đội bóng
          </Typography>
          <Typography variant="body2" sx={{ color: C.onSurfaceVariant, mt: 0.5 }}>
            Thêm, sửa, xóa các đội bóng trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={openCreate}
          sx={{
            background: C.primary, color: C.onPrimary, fontWeight: 700,
            borderRadius: 2, textTransform: 'none',
            '&:hover': { background: C.primaryFixed },
          }}
        >
          Thêm đội mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      {/* Table */}
      <Box sx={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <CircularProgress sx={{ color: C.primary }} />
          </Box>
        ) : teams.length === 0 ? (
          <Box textAlign="center" p={6}>
            <Typography sx={{ color: C.onSurfaceVariant, fontSize: 15 }}>
              Chưa có đội nào. Nhấn <strong>Thêm đội mới</strong> để bắt đầu.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'rgba(255,255,255,0.04)' }}>
                {['#', 'Logo', 'Tên đội', 'Giải đấu', 'Hành động'].map(h => (
                  <TableCell key={h} sx={{ color: C.onSurfaceVariant, fontWeight: 700, borderColor: 'rgba(255,255,255,0.06)', fontSize: 12, textTransform: 'uppercase' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team, i) => (
                <TableRow key={team.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell sx={{ color: C.onSurfaceVariant, borderColor: 'rgba(255,255,255,0.06)', width: 50 }}>
                    {i + 1}
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)', width: 60 }}>
                    <Avatar
                      src={team.logo_url}
                      alt={team.name}
                      sx={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: C.onSurface, fontWeight: 600, borderColor: 'rgba(255,255,255,0.06)' }}>
                    {team.name}
                  </TableCell>
                  <TableCell sx={{ color: C.onSurfaceVariant, borderColor: 'rgba(255,255,255,0.06)' }}>
                    {team.league || '—'}
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <IconButton size="small" onClick={() => openEdit(team)} sx={{ color: C.primary, mr: 0.5 }}>
                      <IconEdit size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(team)} sx={{ color: '#f87171' }}>
                      <IconTrash size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#1a2020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.onSurface }}>
          {form.id ? '✏️ Chỉnh sửa đội bóng' : '➕ Thêm đội bóng mới'}
          <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ color: C.onSurfaceVariant }}>
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Tên đội *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} sx={inputSx} />
          <TextField fullWidth label="Giải đấu" value={form.league}
            onChange={e => setForm(f => ({ ...f, league: e.target.value }))} sx={inputSx} />
          <TextField fullWidth label="URL Logo" value={form.logo_url}
            onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
            placeholder="https://..." sx={inputSx} />
          {form.logo_url && (
            <Box display="flex" alignItems="center" gap={2} mt={-1} mb={2}>
              <Avatar src={form.logo_url} sx={{ width: 48, height: 48 }} />
              <Typography variant="caption" sx={{ color: C.onSurfaceVariant }}>Preview logo</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: C.onSurfaceVariant, textTransform: 'none' }}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : <IconDeviceFloppy size={18} />}
            sx={{ background: C.primary, color: C.onPrimary, textTransform: 'none', fontWeight: 700, '&:hover': { background: C.primaryFixed } }}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { background: '#1a2020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: C.onSurface }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.onSurfaceVariant }}>
            Bạn có chắc muốn xóa đội <strong style={{ color: C.onSurface }}>{deleteTarget?.name}</strong>?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: C.onSurfaceVariant, textTransform: 'none' }}>Hủy</Button>
          <Button variant="contained" onClick={handleDelete} disabled={saving}
            sx={{ background: '#f87171', color: 'white', textTransform: 'none', fontWeight: 700, '&:hover': { background: '#ef4444' } }}>
            {saving ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
