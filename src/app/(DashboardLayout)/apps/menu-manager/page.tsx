'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  IconGridDots,
  IconEye,
  IconEyeOff,
  IconArrowUp,
  IconArrowDown,
  IconPlus,
  IconTrash,
  IconSettings,
  IconRestore,
  IconDeviceFloppy,
  IconLock,
  IconLogin,
  IconExternalLink,
} from '@tabler/icons-react';
import Menuitems, { IconMap, mapMenuIcons, MenuitemsType } from '../../layout/vertical/sidebar/MenuItems';
import { useDispatch, useSelector } from '@/store/hooks';
import { Chip, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import { IconShield } from '@tabler/icons-react';
import { setMenuItems } from '@/store/apps/menu/menuSlice';
import { AppState } from '@/store/store';


const ALL_ROLES = ['admin', 'user'];
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: '#ef4444' },
  user: { label: 'User', color: '#3b82f6' },
};

function RoleChip({ role }: { role: string }) {
  const info = ROLE_LABELS[role] ?? { label: role, color: '#6366f1' };
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.2, borderRadius: '5px', bgcolor: info.color + '15', border: '1px solid ' + info.color + '40', color: info.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      <IconShield size={10} /> {info.label}
    </Box>
  );
}

function RoleSelectField({ value, onChange, label = 'Phân quyền xem', size = 'small' }: any) {
  const handleChange = (e: any) => {
    const val = e.target.value;
    onChange(typeof val === 'string' ? val.split(',') : val);
  };
  return (
    <FormControl fullWidth size={size}>
      <InputLabel>{label}</InputLabel>
      <Select multiple value={value || []} onChange={handleChange} input={<OutlinedInput label={label} />} renderValue={sel => sel.length === 0 ? <Typography variant="caption" color="text.secondary">Tất cả</Typography> : <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{sel.map((r: string) => <RoleChip key={r} role={r} />)}</Box>}>
        {ALL_ROLES.map(role => (
          <MenuItem key={role} value={role}>
            <Checkbox checked={(value || []).includes(role)} />
            <ListItemText primary={ROLE_LABELS[role]?.label ?? role} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function MenuManagerPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menuItemsState = useSelector((state: AppState) => state.menuReducer.items);

  // Authentication & Loading States
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Menu items list state
  const [items, setItems] = useState<MenuitemsType[]>([]);

  // Form for custom item
  const [newTitle, setNewTitle] = useState('');
  const [newHref, setNewHref] = useState('/apps/');
  const [newIcon, setNewIcon] = useState('IconAperture');
  const [newRoles, setNewRoles] = useState<string[]>([]);

  // Selected item for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHref, setEditHref] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);

  // Notification State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  // Check admin permission from API session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.success && data.user && data.user.role === 'admin') {
          setIsAdminUser(true);
        } else {
          setIsAdminUser(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAdminUser(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Sync state with redux when it loads
  useEffect(() => {
    if (isAdminUser) {
      if (menuItemsState && menuItemsState.length > 0) {
        setItems(JSON.parse(JSON.stringify(menuItemsState)));
      } else {
        // Fallback to default
        setItems(JSON.parse(JSON.stringify(Menuitems)));
      }
    }
  }, [menuItemsState, isAdminUser]);

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, hoverIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(dragIndex) || dragIndex === hoverIndex) return;

    const reordered = [...items];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(hoverIndex, 0, removed);
    setItems(reordered);
  };

  // Move items manually (Up/Down) for accessibility & mobile
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  // Toggle visible show/hide
  const toggleVisibility = (id: string | undefined) => {
    if (!id) return;
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, show: item.show === false ? true : false };
      }
      if (item.children) {
        const updatedChildren = item.children.map(child => {
          if (child.id === id) {
            return { ...child, show: child.show === false ? true : false };
          }
          return child;
        });
        return { ...item, children: updatedChildren };
      }
      return item;
    });
    setItems(updated);
  };

  // Add custom menu item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setToast({ open: true, message: 'Vui lòng điền tiêu đề tính năng', severity: 'warning' });
      return;
    }

    const newItem: MenuitemsType = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      href: newHref,
      iconName: newIcon,
      show: true,
      allowedRoles: newRoles.length > 0 ? newRoles : undefined,
    };

    setItems([...items, newItem]);
    setNewTitle('');
    setNewHref('/apps/');
    setNewRoles([]);
    setToast({ open: true, message: 'Đã thêm tính năng tùy chỉnh vào cuối danh sách', severity: 'success' });
  };

  // Delete custom item
  const handleDeleteItem = (id: string | undefined) => {
    if (!id) return;
    const updated = items.filter(item => item.id !== id).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => child.id !== id),
        };
      }
      return item;
    });
    setItems(updated);
    setToast({ open: true, message: 'Đã xóa tính năng', severity: 'warning' });
  };

  // Edit item inline
  const startEditing = (item: MenuitemsType) => {
    setEditingId(item.id || null);
    setEditTitle(item.title || '');
    setEditHref(item.href || '');
    setEditRoles(item.allowedRoles || []);
  };

  const saveEdit = (id: string | undefined) => {
    if (!id) return;
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, title: editTitle, href: editHref, allowedRoles: editRoles.length > 0 ? editRoles : undefined };
      }
      if (item.children) {
        const updatedChildren = item.children.map(child => {
          if (child.id === id) {
            return { ...child, title: editTitle, href: editHref, allowedRoles: editRoles.length > 0 ? editRoles : undefined };
          }
          return child;
        });
        return { ...item, children: updatedChildren };
      }
      return item;
    });
    setItems(updated);
    setEditingId(null);
    setToast({ open: true, message: 'Cập nhật thông tin tính năng thành công', severity: 'success' });
  };

  // Save changes to API & Redux
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const serializableMenu = items.map(item => {
        // Strip out the React Component icon reference to allow JSON stringification
        const { icon, ...rest } = item;
        if (rest.children) {
          rest.children = rest.children.map(child => {
            const { icon: childIcon, ...childRest } = child;
            return childRest;
          });
        }
        return rest;
      });

      const res = await fetch('/api/menu-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: serializableMenu }),
      });
      const data = await res.json();

      if (data.success) {
        // Update Redux state
        const mapped = mapMenuIcons(items);
        dispatch(setMenuItems(mapped));
        setToast({ open: true, message: 'Đã lưu cấu hình menu thành công và áp dụng cho toàn bộ hệ thống!', severity: 'success' });
      } else {
        setToast({ open: true, message: data.error || 'Có lỗi xảy ra khi lưu cấu hình', severity: 'error' });
      }
    } catch (error) {
      console.error(error);
      setToast({ open: true, message: 'Lỗi kết nối với máy chủ', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Reset to static configuration
  const handleResetToDefault = async () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục menu về cài đặt mặc định ban đầu không?')) {
      setSaving(true);
      try {
        const res = await fetch('/api/menu-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menu: [] }),
        });
        const data = await res.json();
        if (data.success) {
          dispatch(setMenuItems(Menuitems));
          setItems(JSON.parse(JSON.stringify(Menuitems)));
          setToast({ open: true, message: 'Đã khôi phục cài đặt menu mặc định!', severity: 'success' });
        } else {
          setToast({ open: true, message: 'Khôi phục thất bại', severity: 'error' });
        }
      } catch (err) {
        console.error(err);
        setToast({ open: true, message: 'Lỗi kết nối máy chủ', severity: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  // Access Denied Screen (If not Admin)
  if (isAdminUser === false) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', p: 3, textAlign: 'center'
      }}>
        <Paper elevation={3} sx={{
          maxWidth: 450, p: 5, borderRadius: '16px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3, color: '#ef4444'
          }}>
            <IconLock size={40} />
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
            Từ Chối Truy Cập
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 4, lineHeight: 1.6 }}>
            Tính năng cấu hình kéo thả menu chỉ khả dụng đối với quản trị viên (Admin). Vui lòng đăng nhập với tài khoản hợp lệ.
          </Typography>
          <Button
            variant="contained"
            startIcon={<IconLogin />}
            onClick={() => router.push('/login')}
            sx={{
              background: '#6366f1',
              px: 4, py: 1.2,
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              '&:hover': { background: '#4f46e5' }
            }}
          >
            Đến trang đăng nhập
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Title Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            ⚙️ Quản Lý Menu Kéo Thả (Admin Only)
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Sắp xếp thứ tự, ẩn hiện các tính năng trên thanh menu chính bên trái bằng kéo thả trực quan.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<IconRestore />}
            onClick={handleResetToDefault}
            disabled={saving}
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600 }}
          >
            Mặc định
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <IconDeviceFloppy />}
            onClick={handleSaveChanges}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              }
            }}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Drag & Drop List */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', mb: 3 }}>
                Danh Sách Tính Năng
              </Typography>

              {/* Items List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {items.map((item, index) => {
                  const IconComp = item.iconName ? IconMap[item.iconName] : null;
                  const isVisible = item.show !== false;

                  return (
                    <Box key={item.id || index}>
                      {/* Subheaders/Labels */}
                      {item.navlabel && (
                        <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', borderRadius: '8px' }}>
                          <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            🏷️ Phân Mục: {item.subheader}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" disabled={index === 0} onClick={() => moveItem(index, 'up')}>
                              <IconArrowUp size={14} />
                            </IconButton>
                            <IconButton size="small" disabled={index === items.length - 1} onClick={() => moveItem(index, 'down')}>
                              <IconArrowDown size={14} />
                            </IconButton>
                          </Box>
                        </Box>
                      )}

                      {/* Standard Menu Item Card */}
                      {!item.navlabel && (
                        <Paper
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          elevation={0}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: editingId === item.id ? '#6366f1' : '#f1f5f9',
                            background: isVisible ? '#ffffff' : '#f8fafc',
                            opacity: isVisible ? 1 : 0.7,
                            cursor: 'grab',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#cbd5e1',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                              bgcolor: '#fafafa',
                            },
                            '&:active': { cursor: 'grabbing' },
                          }}
                        >
                          {/* Left: Drag dots, Icon, Title */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Tooltip title="Kéo thả để sắp xếp">
                              <Box sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                <IconGridDots size={20} />
                              </Box>
                            </Tooltip>

                            <Box sx={{
                              width: 38, height: 38, borderRadius: '8px',
                              bgcolor: isVisible ? 'rgba(99,102,241,0.08)' : '#e2e8f0',
                              color: isVisible ? '#6366f1' : '#64748b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {IconComp ? React.createElement(IconComp, { size: 20 }) : '🔹'}
                            </Box>

                            {/* Editing Inline Form */}
                            {editingId === item.id ? (
                              <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                <TextField
                                  size="small"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Tiêu đề"
                                  sx={{ flex: 1, minWidth: '120px' }}
                                />
                                <TextField
                                  size="small"
                                  value={editHref}
                                  onChange={(e) => setEditHref(e.target.value)}
                                  placeholder="Liên kết (URL)"
                                  sx={{ flex: 1, minWidth: '120px' }}
                                />
                                <Box sx={{ width: '200px' }}>
                                  <RoleSelectField value={editRoles} onChange={setEditRoles} label="Quyền xem" />
                                </Box>
                                <Button size="small" variant="contained" onClick={() => saveEdit(item.id)} sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>Lưu</Button>
                                <Button size="small" variant="outlined" onClick={() => setEditingId(null)}>Hủy</Button>
                              </Box>
                            ) : (
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                  <Typography variant="body1" fontWeight={600} sx={{ color: '#334155' }}>
                                    {item.title}
                                  </Typography>
                                  {item.allowedRoles && item.allowedRoles.map((r: string) => <RoleChip key={r} role={r} />)}
                                  {(!item.allowedRoles || item.allowedRoles.length === 0) && <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Tất cả role</Typography>}
                                </Box>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {item.href} {item.id?.toString().startsWith('custom-') && <IconExternalLink size={12} />}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Right: Actions */}
                          {editingId !== item.id && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {/* Reorder manual */}
                              <Tooltip title="Lên">
                                <span>
                                  <IconButton size="small" disabled={index === 0} onClick={() => moveItem(index, 'up')}>
                                    <IconArrowUp size={16} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Xuống">
                                <span>
                                  <IconButton size="small" disabled={index === items.length - 1} onClick={() => moveItem(index, 'down')}>
                                    <IconArrowDown size={16} />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              {/* Toggle visibility */}
                              <Tooltip title={isVisible ? 'Ẩn khỏi Menu' : 'Hiện trên Menu'}>
                                <Switch
                                  size="small"
                                  checked={isVisible}
                                  onChange={() => toggleVisibility(item.id)}
                                  color="primary"
                                />
                              </Tooltip>

                              {/* Edit details */}
                              <IconButton size="small" onClick={() => startEditing(item)} sx={{ color: '#64748b' }}>
                                <IconSettings size={16} />
                              </IconButton>

                              {/* Delete if custom */}
                              {item.id?.toString().startsWith('custom-') && (
                                <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                                  <IconTrash size={16} />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </Paper>
                      )}

                      {/* Render Children (Submenus) */}
                      {!item.navlabel && item.children && item.children.length > 0 && (
                        <Box sx={{ pl: 5, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {item.children.map((child, childIdx) => {
                            const ChildIcon = child.iconName ? IconMap[child.iconName] : null;
                            const isChildVisible = child.show !== false;
                            const isChildEditing = editingId === child.id;

                            return (
                              <Paper
                                key={child.id || childIdx}
                                elevation={0}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  borderRadius: '10px',
                                  border: '1px dashed #e2e8f0',
                                  bgcolor: isChildVisible ? '#fafcfd' : '#f8fafc',
                                  opacity: isChildVisible ? 1 : 0.7,
                                  '&:hover': { bgcolor: '#f1f5f9' },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                  <Box sx={{
                                    width: 30, height: 30, borderRadius: '6px',
                                    bgcolor: isChildVisible ? 'rgba(99,102,241,0.06)' : '#e2e8f0',
                                    color: isChildVisible ? '#6366f1' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}>
                                    {ChildIcon ? React.createElement(ChildIcon, { size: 16 }) : '▪️'}
                                  </Box>

                                  {isChildEditing ? (
                                    <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                      <TextField
                                        size="small"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Tiêu đề con"
                                        sx={{ flex: 1, minWidth: '100px' }}
                                      />
                                      <TextField
                                        size="small"
                                        value={editHref}
                                        onChange={(e) => setEditHref(e.target.value)}
                                        placeholder="URL"
                                        sx={{ flex: 1, minWidth: '100px' }}
                                      />
                                      <Box sx={{ width: '180px' }}>
                                        <RoleSelectField value={editRoles} onChange={setEditRoles} label="Quyền" />
                                      </Box>
                                      <Button size="small" variant="contained" onClick={() => saveEdit(child.id)} sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>Lưu</Button>
                                      <Button size="small" variant="outlined" onClick={() => setEditingId(null)}>Hủy</Button>
                                    </Box>
                                  ) : (
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#475569' }}>
                                          {child.title}
                                        </Typography>
                                        {child.allowedRoles && child.allowedRoles.map((r: string) => <RoleChip key={r} role={r} />)}
                                        {(!child.allowedRoles || child.allowedRoles.length === 0) && <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Tất cả role</Typography>}
                                      </Box>
                                      <Typography variant="caption" color="textSecondary">
                                        {child.href}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                {!isChildEditing && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Switch
                                      size="small"
                                      checked={isChildVisible}
                                      onChange={() => toggleVisibility(child.id)}
                                    />
                                    <IconButton size="small" onClick={() => startEditing(child)}>
                                      <IconSettings size={14} />
                                    </IconButton>
                                  </Box>
                                )}
                              </Paper>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Add Custom Item Card */}
              <Box component="form" onSubmit={handleAddCustomItem} sx={{ mt: 4, p: 2.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#334155', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconPlus size={18} /> Thêm Mục Tính Năng Mới
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Tên hiển thị"
                      size="small"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ví dụ: Báo Cáo Doanh Thu"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Đường dẫn (URL)"
                      size="small"
                      value={newHref}
                      onChange={(e) => setNewHref(e.target.value)}
                      placeholder="/apps/revenue"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="icon-select-label">Biểu tượng</InputLabel>
                      <Select
                        labelId="icon-select-label"
                        label="Biểu tượng"
                        value={newIcon}
                        onChange={(e) => setNewIcon(e.target.value as string)}
                      >
                        {Object.keys(IconMap).map((iconName) => (
                          <MenuItem key={iconName} value={iconName}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {React.createElement(IconMap[iconName], { size: 16 })}
                              <Typography variant="body2">{iconName}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <RoleSelectField value={newRoles} onChange={setNewRoles} label="Phân quyền role xem (Để trống = Ai cũng được thấy)" />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="outlined"
                      size="medium"
                      startIcon={<IconPlus size={16} />}
                      sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                      Thêm vào danh sách
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Live Preview Layout */}
        <Grid item xs={12} md={5}>
          <PreviewComponent items={items} />
        </Grid>
      </Grid>

      {/* Snackbar alerts */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


function PreviewComponent({ items }: { items: MenuitemsType[] }) {
  const [selectedRole, setSelectedRole] = React.useState<string>('all');

  const filteredItems = items.filter(item => {
    if (item.show === false) return false;
    if (item.allowedRoles && item.allowedRoles.length > 0 && selectedRole !== 'all') {
      return item.allowedRoles.includes(selectedRole);
    }
    return true;
  });

  return (
    <Card sx={{
      position: 'sticky', top: '90px',
      borderRadius: '16px', border: '1px solid #e2e8f0',
      bgcolor: '#0f172a', color: '#cbd5e1',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          👀 Xem Trước Trực Quan
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', mb: 2, display: 'block' }}>
          Xem trước Sidebar hiển thị dựa trên Role đã chọn.
        </Typography>

        {/* Role Selector Tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {['all', 'admin', 'user'].map((r) => (
            <Button
              key={r}
              size="small"
              variant={selectedRole === r ? 'contained' : 'outlined'}
              onClick={() => setSelectedRole(r)}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                py: 0.3,
                px: 1.5,
                borderRadius: '8px',
                color: selectedRole === r ? 'white' : '#94a3b8',
                borderColor: '#334155',
                bgcolor: selectedRole === r ? '#6366f1' : 'transparent',
                '&:hover': {
                  bgcolor: selectedRole === r ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                  borderColor: '#6366f1',
                }
              }}
            >
              {r === 'all' ? 'Tất cả' : (r === 'admin' ? 'Admin' : 'User')}
            </Button>
          ))}
        </Box>

        {/* Mock Sidebar Wrapper */}
        <Box sx={{
          border: '1px solid #1e293b',
          borderRadius: '12px',
          bgcolor: '#0b0f19',
          p: 2.5,
          minHeight: '400px',
          maxHeight: '550px',
          overflowY: 'auto',
        }}>
          <Box sx={{ mb: 4, px: 2 }}>
            <Typography variant="h5" fontWeight={800} color="#6366f1">
              🏠 DASHBOARD
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
              Hiển thị với Role: <strong style={{ color: '#94a3b8' }}>{selectedRole === 'all' ? 'Tất cả' : (selectedRole === 'admin' ? 'Admin' : 'User')}</strong>
            </Typography>
          </Box>

          {filteredItems.map((item, idx) => {
            const IconComp = item.iconName ? IconMap[item.iconName] : null;

            if (item.navlabel) {
              return (
                <Typography
                  key={idx}
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    display: 'block',
                    px: 2, mt: 3, mb: 1,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {item.subheader}
                </Typography>
              );
            }

            return (
              <Box key={item.id || idx} sx={{ mb: 0.5 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.2,
                  borderRadius: '8px',
                  cursor: 'default',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                }}>
                  <Box sx={{ color: '#6366f1', display: 'flex', alignItems: 'center' }}>
                    {IconComp ? React.createElement(IconComp, { size: 18 }) : '🔹'}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 500, flex: 1 }}>
                    {item.title}
                  </Typography>
                </Box>

                {/* Preview Children */}
                {item.children && item.children.length > 0 && (
                  <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {item.children.filter((child: any) => {
                      if (child.show === false) return false;
                      if (child.allowedRoles && child.allowedRoles.length > 0 && selectedRole !== 'all') {
                        return child.allowedRoles.includes(selectedRole);
                      }
                      return true;
                    }).map((child: any, childIdx: number) => {
                      const ChildIcon = child.iconName ? IconMap[child.iconName] : null;
                      return (
                        <Box
                          key={child.id || childIdx}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.2,
                            px: 2, py: 0.8,
                            borderRadius: '6px',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                          }}
                        >
                          <Box sx={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
                            {ChildIcon ? React.createElement(ChildIcon, { size: 12 }) : '▪️'}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            {child.title}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
