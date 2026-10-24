'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Breadcrumbs, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Divider,
  IconButton, InputAdornment, List, ListItemButton, Skeleton, Snackbar,
  Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconChevronRight, IconDeviceFloppy, IconEdit, IconFolder, IconPill, IconPlus,
  IconRefresh, IconSearch, IconStethoscope, IconTrash, IconX,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import type { ConditionMedication, MedicalCondition } from '@/types/apps/medical-catalog';

type Editor = { kind: 'condition' | 'medication'; conditionId?: number; medicationId?: number; name: string; description: string };
type Deletion = { kind: 'condition' | 'medication'; conditionId: number; medicationId?: number; name: string; count?: number };
const endpoint = '/api/medical-conditions';
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi').trim();
const sortByName = <T extends { name: string },>(items: T[]) => [...items].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

async function requestData<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method, cache: 'no-store',
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'Không thể kết nối. Vui lòng thử lại.');
  }
  return result.data as T;
}

export default function MedicalCatalogPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const accent = dark ? '#67ddc4' : '#087f6c';
  const soft = dark ? '#183c36' : '#edf8f4';
  const muted = dark ? '#202b30' : '#f6f8fa';
  const line = dark ? '#35434a' : '#e6ebef';
  const ink = dark ? '#eef4f5' : '#243439';
  const secondary = dark ? '#a9bac0' : '#65767c';
  const mainButton = {
    minHeight: 42, px: 2.25, borderRadius: '8px', fontWeight: 600,
    bgcolor: accent, color: dark ? '#122b25' : '#fff', boxShadow: 'none',
    '&:hover': { bgcolor: dark ? '#8be8d3' : '#066b5b', boxShadow: 'none' },
  };
  const outlineButton = {
    minHeight: 40, borderRadius: '8px', fontWeight: 600, color: accent,
    borderColor: dark ? '#3b6d60' : '#b9d9ce', bgcolor: 'background.paper',
    '&:hover': { bgcolor: soft, borderColor: accent },
  };
  const actionButton = {
    width: 36, height: 36, borderRadius: '6px', color: secondary,
    '&:hover': { bgcolor: soft, color: accent },
  };
  const dialogPaper = {
    borderRadius: '8px', backgroundImage: 'none',
    '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: accent } },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
    '& .MuiButton-root': { borderRadius: '8px', fontWeight: 600, letterSpacing: 0 },
  };
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deletion, setDeletion] = useState<Deletion | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setConditions(await requestData<MedicalCondition[]>(endpoint));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh mục.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const term = normalize(query);
  const filtered = useMemo(() => sortByName(conditions.filter(condition =>
    normalize(condition.name).includes(term) ||
    condition.medications.some(medication => normalize(medication.name).includes(term))
  )), [conditions, term]);
  const selected = !term ? conditions.find(condition => condition.id === selectedId) : undefined;
  const visibleConditions = selected ? [selected] : filtered;
  const medicationCount = conditions.reduce((count, condition) => count + condition.medications.length, 0);

  const openEditor = (value: Editor) => { setDialogError(''); setEditor(value); };
  const openDelete = (value: Deletion) => { setDialogError(''); setDeletion(value); };

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editor || saving) return;
    setSaving(true);
    setDialogError('');
    try {
      if (editor.kind === 'condition') {
        const editing = editor.conditionId !== undefined;
        const result = await requestData<MedicalCondition>(
          editing ? endpoint + '/' + editor.conditionId : endpoint,
          editing ? 'PUT' : 'POST', { name: editor.name.trim() },
        );
        setConditions(previous => editing
          ? previous.map(condition => condition.id === result.id ? { ...condition, name: result.name } : condition)
          : [...previous, result]);
        setSelectedId(result.id);
      } else {
        const editing = editor.medicationId !== undefined;
        const base = endpoint + '/' + editor.conditionId + '/medications';
        const result = await requestData<ConditionMedication>(
          editing ? base + '/' + editor.medicationId : base,
          editing ? 'PUT' : 'POST', { name: editor.name.trim(), description: editor.description.trim() },
        );
        setConditions(previous => previous.map(condition => condition.id === editor.conditionId
          ? { ...condition, medications: editing
            ? condition.medications.map(medication => medication.id === result.id ? result : medication)
            : [...condition.medications, result] }
          : condition));
        setSelectedId(editor.conditionId!);
      }
      setQuery('');
      setEditor(null);
      setNotice('Đã lưu thành công.');
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Không lưu được dữ liệu.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deletion || saving) return;
    setSaving(true);
    setDialogError('');
    try {
      const base = endpoint + '/' + deletion.conditionId;
      await requestData(deletion.kind === 'condition' ? base : base + '/medications/' + deletion.medicationId, 'DELETE');
      setConditions(previous => deletion.kind === 'condition'
        ? previous.filter(condition => condition.id !== deletion.conditionId)
        : previous.map(condition => condition.id === deletion.conditionId
          ? { ...condition, medications: condition.medications.filter(medication => medication.id !== deletion.medicationId) }
          : condition));
      setDeletion(null);
      setNotice('Đã xóa thành công.');
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Không xóa được dữ liệu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer title="Bệnh & thuốc" description="Danh mục bệnh và thuốc">
      <Box sx={{ color: ink, '& *': { letterSpacing: 0 }, '& .MuiBox-root': { borderRadius: 0 }, pb: 3 }}>
        <Breadcrumbs separator={<IconChevronRight size={13} />} sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">Danh mục</Typography>
          <Typography variant="body2" color={accent} fontWeight={600}>Bệnh & thuốc</Typography>
        </Breadcrumbs>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2.5} sx={{ mb: 3.5 }}>
          <Stack direction="row" alignItems="center" gap={1.75}>
            <Box sx={{ bgcolor: accent, color: dark ? '#122b25' : '#fff', borderRadius: '8px !important', width: 52, height: 52, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <IconStethoscope size={28} stroke={1.6} />
            </Box>
            <Box>
              <Typography component="h1" fontSize={26} lineHeight={1.3} fontWeight={700}>Bệnh & thuốc</Typography>
              <Stack direction="row" gap={1.25} alignItems="center" sx={{ mt: 0.75, color: secondary }}>
                <Typography fontSize={13}><strong>{conditions.length}</strong> bệnh</Typography>
                <Divider orientation="vertical" flexItem sx={{ my: 0.4 }} />
                <Typography fontSize={13}><strong>{medicationCount}</strong> thuốc</Typography>
              </Stack>
            </Box>
          </Stack>
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => openEditor({ kind: 'condition', name: '', description: '' })} sx={{ ...mainButton, flexShrink: 0 }}>
            Thêm bệnh
          </Button>
        </Stack>

        <Stack direction="row" gap={1.5} alignItems="center" sx={{ bgcolor: muted, p: { xs: 1.5, sm: 2 }, borderTop: '1px solid ' + line, borderBottom: '1px solid ' + line }}>
          <TextField
            fullWidth size="small" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Tìm tên bệnh hoặc thuốc..." inputProps={{ 'aria-label': 'Tìm theo bệnh hoặc thuốc', maxLength: 200 }}
            sx={{ maxWidth: 580, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: '8px', minHeight: 44, fontSize: 14, '& fieldset': { borderColor: line }, '&.Mui-focused fieldset': { borderColor: accent, borderWidth: 1 } } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><IconSearch size={20} /></InputAdornment>,
              endAdornment: query ? <InputAdornment position="end"><IconButton size="small" aria-label="Xóa tìm kiếm" onClick={() => setQuery('')}><IconX size={16} /></IconButton></InputAdornment> : null,
            }}
          />
          <Stack direction="row" alignItems="center" gap={2} sx={{ ml: 'auto', flexShrink: 0 }}>
            <Typography fontSize={12} color={secondary} sx={{ display: { xs: 'none', lg: 'block' } }}>{term ? filtered.length + ' bệnh phù hợp' : 'Tất cả bệnh'}</Typography>
            <Tooltip title="Tải lại"><span><IconButton aria-label="Tải lại danh mục" sx={{ ...actionButton, width: 42, height: 42, bgcolor: 'background.paper', border: '1px solid ' + line }} disabled={loading || saving} onClick={() => void load()}><IconRefresh size={19} /></IconButton></span></Tooltip>
          </Stack>
        </Stack>
        {loadError && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => void load()}>Thử lại</Button>}>{loadError}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '260px minmax(0, 1fr)', xl: '290px minmax(0, 1fr)' }, borderBottom: '1px solid ' + line, minHeight: 510 }}>
          <Box component="aside" sx={{ borderRight: { md: '1px solid ' + line }, borderBottom: { xs: '1px solid ' + line, md: 0 }, py: 2.5, pr: { md: 2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.25, mb: 2 }}>
              <Typography component="h2" fontSize={12} fontWeight={700} color={secondary}>DANH SÁCH BỆNH</Typography>
              <Typography fontSize={12} fontWeight={600} sx={{ bgcolor: muted, minWidth: 26, textAlign: 'center', borderRadius: '4px', px: 0.75, py: 0.25 }}>{filtered.length}</Typography>
            </Stack>
            {loading ? <Stack spacing={1}>{[0, 1, 2, 3].map(value => <Skeleton key={value} variant="rounded" height={60} />)}</Stack> :
              <List disablePadding aria-label="Danh sách bệnh" sx={{ maxHeight: { xs: 250, md: 620 }, overflowY: 'auto' }}>
                <ListItemButton
                  selected={!selected}
                  onClick={() => { setSelectedId(null); setQuery(''); }}
                  sx={{ borderRadius: '6px', mb: 1.5, px: 1.5, py: 1.5, gap: 1.25, borderLeft: '3px solid transparent', '&.Mui-selected, &.Mui-selected:hover': { bgcolor: soft, color: accent, borderLeftColor: accent } }}>
                  <IconFolder size={20} style={{ flexShrink: 0 }} />
                  <Typography fontSize={14} fontWeight={600}>Tất cả bệnh</Typography>
                </ListItemButton>
                {filtered.map(condition => <ListItemButton
                  key={condition.id} selected={selected?.id === condition.id} onClick={() => { setSelectedId(condition.id); setQuery(''); }}
                  sx={{ borderRadius: '6px', mb: 0.75, px: 1.5, py: 1.5, minHeight: 76, gap: 1.25, alignItems: 'center', borderLeft: '3px solid transparent', '&:hover': { bgcolor: muted }, '&.Mui-selected, &.Mui-selected:hover': { bgcolor: soft, color: accent, borderLeftColor: accent } }}>
                  <Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '6px !important', bgcolor: selected?.id === condition.id ? 'background.paper' : muted, color: selected?.id === condition.id ? accent : secondary, flexShrink: 0 }}>
                    <IconStethoscope size={18} stroke={1.6} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography component="span" title={condition.name} fontSize={14} lineHeight={1.5} fontWeight={selected?.id === condition.id ? 700 : 500} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>{condition.name}</Typography>
                    <Typography component="span" fontSize={12} color={secondary} sx={{ display: 'block', mt: 0.3 }}>{condition.medications.length} thuốc</Typography>
                  </Box>
                  <IconChevronRight size={16} style={{ flexShrink: 0, marginTop: 3 }} />
                </ListItemButton>)}
                {!filtered.length && <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>{query ? 'Không có kết quả phù hợp.' : 'Chưa có bệnh nào.'}</Typography>}
              </List>
            }
          </Box>

          <Box component="section" aria-label="Thuốc theo bệnh" sx={{ px: { xs: 0, md: 3, xl: 4 }, py: 3, minWidth: 0 }}>
            {loading ? <Stack spacing={2}><Skeleton height={42} width="55%" /><Skeleton variant="rounded" height={100} /><Skeleton variant="rounded" height={100} /></Stack> : visibleConditions.length ? <>
              {!selected && <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 3 }}>
                <Typography fontSize={16} fontWeight={700}>{term ? 'Kết quả tìm kiếm' : 'Tất cả bệnh'}</Typography>
                <Typography role="status" fontSize={12} color={secondary}>{visibleConditions.length} bệnh</Typography>
              </Stack>}
              {visibleConditions.map(selected => {
                const medications = sortByName(selected.medications.filter(medication =>
                  normalize(selected.name).includes(term) || normalize(medication.name).includes(term)
                ));
                return <Box component="section" aria-label={'Bệnh: ' + selected.name} key={selected.id}
                  sx={{ '& + &': { mt: 4, pt: 3, borderTop: '1px solid ' + line } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} sx={{ mb: 3 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" alignItems="center" gap={0.75} sx={{ color: accent, mb: 1 }}>
                    <IconFolder size={15} />
                    <Typography fontSize={12} fontWeight={600}>Chi tiết bệnh</Typography>
                  </Stack>
                  <Stack direction="row" gap={1} alignItems="flex-start">
                    <Typography component="h2" fontSize={21} lineHeight={1.45} fontWeight={700} sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>{selected.name}</Typography>
                    <Stack direction="row" sx={{ flexShrink: 0, ml: 'auto' }}>
                      <Tooltip title="Sửa tên bệnh"><IconButton size="small" aria-label="Sửa tên bệnh" sx={actionButton} onClick={() => openEditor({ kind: 'condition', conditionId: selected.id, name: selected.name, description: '' })}><IconEdit size={17} /></IconButton></Tooltip>
                      <Tooltip title="Xóa bệnh"><IconButton size="small" aria-label="Xóa bệnh" sx={{ ...actionButton, '&:hover': { color: 'error.main', bgcolor: 'error.light' } }} onClick={() => openDelete({ kind: 'condition', conditionId: selected.id, name: selected.name, count: selected.medications.length })}><IconTrash size={17} /></IconButton></Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5} sx={{ pb: 2, flexWrap: 'wrap' }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography fontSize={14} fontWeight={600}>Thuốc đi kèm</Typography>
                  <Typography component="span" sx={{ bgcolor: dark ? '#223d50' : '#edf4fc', color: dark ? '#91c5fb' : '#356ca2', borderRadius: '4px', px: 0.9, py: 0.2, fontSize: 12, fontWeight: 700 }}>{medications.length}</Typography>
                </Stack>
                <Button variant="outlined" startIcon={<IconPlus size={17} />} onClick={() => openEditor({ kind: 'medication', conditionId: selected.id, name: '', description: '' })} sx={{ ...outlineButton, flexShrink: 0 }}>Thêm thuốc</Button>
              </Stack>
              {medications.length ? <Box>
                <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: 'minmax(140px, 1fr) minmax(0, 1.6fr) 76px', gap: 2, px: 1.75, py: 1.5, bgcolor: muted, borderTop: '1px solid ' + line, borderBottom: '1px solid ' + line }}>
                  <Typography fontSize={11} fontWeight={700} color={secondary}>TÊN THUỐC</Typography>
                  <Typography fontSize={11} fontWeight={700} color={secondary}>MÔ TẢ CÔNG DỤNG</Typography>
                  <Typography fontSize={11} fontWeight={700} color={secondary} textAlign="right">THAO TÁC</Typography>
                </Box>
                {medications.map((medication, index) => <Box key={medication.id} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) 76px', sm: 'minmax(140px, 1fr) minmax(0, 1.6fr) 76px' }, gap: { xs: 1, sm: 2 }, py: 2.5, px: { xs: 0.5, sm: 1.75 }, borderBottom: '1px solid ' + line, alignItems: 'start', '&:hover': { bgcolor: dark ? '#202b3033' : '#f9fbfc' } }}>
                  <Stack direction="row" gap={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
                    <Box sx={{ color: dark ? '#91c5fb' : '#356ca2', bgcolor: dark ? '#223d50' : '#edf4fc', width: 36, height: 36, borderRadius: '6px !important', display: 'grid', placeItems: 'center', flexShrink: 0 }}><IconPill size={20} stroke={1.6} /></Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography component="p" fontSize={14} fontWeight={600} lineHeight={1.55} sx={{ overflowWrap: 'anywhere' }}>{medication.name}</Typography>
                      <Typography fontSize={11} color={secondary} sx={{ mt: 0.2 }}>{String(index + 1).padStart(2, '0')}</Typography>
                    </Box>
                  </Stack>
                  <Typography fontSize={14} color={secondary} sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', gridColumn: { xs: '1 / -1', sm: 'auto' }, gridRow: { xs: 2, sm: 'auto' }, lineHeight: 1.8, pl: { xs: '46px', sm: 0 } }}>{medication.description}</Typography>
                  <Stack direction="row" sx={{ gridColumn: { xs: 2, sm: 'auto' }, gridRow: { xs: 1, sm: 'auto' } }}>
                    <Tooltip title="Sửa thuốc"><IconButton size="small" sx={actionButton} aria-label={'Sửa thuốc ' + medication.name} onClick={() => openEditor({ kind: 'medication', conditionId: selected.id, medicationId: medication.id, name: medication.name, description: medication.description })}><IconEdit size={18} stroke={1.6} /></IconButton></Tooltip>
                    <Tooltip title="Xóa thuốc"><IconButton size="small" sx={{ ...actionButton, '&:hover': { color: 'error.main', bgcolor: 'error.light' } }} aria-label={'Xóa thuốc ' + medication.name} onClick={() => openDelete({ kind: 'medication', conditionId: selected.id, medicationId: medication.id, name: medication.name })}><IconTrash size={18} stroke={1.6} /></IconButton></Tooltip>
                  </Stack>
                </Box>)}
                <Typography fontSize={12} color={secondary} sx={{ pt: 2, textAlign: 'right' }}>{term ? medications.length + ' thuốc phù hợp' : medications.length + ' thuốc trong danh mục'}</Typography>
              </Box> : <Stack alignItems="center" gap={1.5} sx={{ py: 7, textAlign: 'center', color: 'text.secondary' }}>
                <Box sx={{ width: 64, height: 64, display: 'grid', placeItems: 'center', bgcolor: muted, color: accent, borderRadius: '8px !important' }}><IconPill size={32} stroke={1.3} /></Box>
                <Typography>Chưa có thuốc trong danh mục này.</Typography>
                <Button variant="outlined" sx={outlineButton} startIcon={<IconPlus size={17} />} onClick={() => openEditor({ kind: 'medication', conditionId: selected.id, name: '', description: '' })}>Thêm thuốc đầu tiên</Button>
              </Stack>}
                </Box>;
              })}
            </> : <Stack alignItems="center" justifyContent="center" gap={1.5} sx={{ minHeight: 340, textAlign: 'center', color: 'text.secondary' }}>
              <Box sx={{ width: 72, height: 72, display: 'grid', placeItems: 'center', bgcolor: soft, color: accent, borderRadius: '8px !important', mb: 1 }}>{query ? <IconSearch size={34} stroke={1.4} /> : <IconFolder size={34} stroke={1.4} />}</Box>
              <Typography component="h2" fontSize={18} fontWeight={600} color={ink}>{query ? 'Không tìm thấy bệnh hoặc thuốc' : 'Danh mục bệnh đang trống'}</Typography>
              {query ? <Button variant="outlined" sx={outlineButton} onClick={() => setQuery('')}>Xóa tìm kiếm</Button> : <Button variant="contained" sx={{ ...mainButton, mt: 1 }} startIcon={<IconPlus size={17} />} onClick={() => openEditor({ kind: 'condition', name: '', description: '' })}>Thêm bệnh đầu tiên</Button>}
            </Stack>}
          </Box>
        </Box>
      </Box>

      <Dialog open={!!editor} onClose={() => { if (!saving) setEditor(null); }} fullWidth maxWidth="sm" aria-labelledby="catalog-editor-title" PaperProps={{ sx: dialogPaper }}>
        <Box component="form" onSubmit={save}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 3, py: 2.5, bgcolor: soft }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '8px', bgcolor: 'background.paper', color: accent, flexShrink: 0 }}>{editor?.kind === 'condition' ? <IconStethoscope size={23} /> : <IconPill size={23} />}</Box>
            <DialogTitle id="catalog-editor-title" sx={{ p: 0, flex: 1, fontSize: 19, fontWeight: 700 }}>{editor?.kind === 'condition' ? (editor.conditionId ? 'Sửa tên bệnh' : 'Thêm bệnh') : (editor?.medicationId ? 'Sửa thuốc' : 'Thêm thuốc')}</DialogTitle>
            <Tooltip title="Đóng"><span><IconButton aria-label="Đóng form" disabled={saving} onClick={() => setEditor(null)} sx={actionButton}><IconX size={20} /></IconButton></span></Tooltip>
          </Stack>
          <Divider />
          <DialogContent sx={{ p: 3 }}>
            {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            {editor?.kind === 'medication' && <Stack direction="row" alignItems="flex-start" gap={1} sx={{ mb: 2.5, color: secondary }}>
              <IconFolder size={17} style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography fontSize={13} sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>Bệnh: <Box component="span" sx={{ color: ink, fontWeight: 600 }}>{conditions.find(condition => condition.id === editor.conditionId)?.name}</Box></Typography>
            </Stack>}
            <TextField autoFocus required fullWidth label={editor?.kind === 'condition' ? 'Tên bệnh' : 'Tên thuốc'} value={editor?.name || ''} disabled={saving}
              onChange={event => setEditor(previous => previous && { ...previous, name: event.target.value })}
              inputProps={{ maxLength: 200 }} sx={{ mt: 1 }} />
            {editor?.kind === 'medication' && <TextField required fullWidth multiline minRows={4} maxRows={8} label="Mô tả công dụng" value={editor.description} disabled={saving}
              onChange={event => setEditor(previous => previous && { ...previous, description: event.target.value })}
              inputProps={{ maxLength: 2000 }} helperText={editor.description.length + '/2.000 ký tự'} FormHelperTextProps={{ sx: { textAlign: 'right' } }} sx={{ mt: 3 }} />}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid ' + line, bgcolor: muted, gap: 1 }}>
            <Button disabled={saving} sx={{ color: secondary, bgcolor: 'transparent', px: 2 }} onClick={() => setEditor(null)}>Hủy</Button>
            <Button type="submit" variant="contained" sx={mainButton} disabled={saving || !editor?.name.trim() || (editor.kind === 'medication' && !editor.description.trim())}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}>Lưu</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!deletion} onClose={() => { if (!saving) setDeletion(null); }} fullWidth maxWidth="xs" aria-labelledby="catalog-delete-title" PaperProps={{ sx: dialogPaper }}>
        <DialogTitle id="catalog-delete-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, pt: 3 }}><IconTrash size={24} color={theme.palette.error.main} />{deletion?.kind === 'condition' ? 'Xóa bệnh?' : 'Xóa thuốc?'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <DialogContentText sx={{ overflowWrap: 'anywhere', fontSize: 14, lineHeight: 1.8 }}>Bạn muốn xóa <strong>{deletion?.name}</strong>?
            {deletion?.kind === 'condition' && !!deletion.count && <> Toàn bộ {deletion.count} thuốc thuộc bệnh này cũng sẽ bị xóa.</>}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid ' + line, bgcolor: muted, gap: 1 }}>
          <Button autoFocus disabled={saving} sx={{ color: secondary, bgcolor: 'transparent' }} onClick={() => setDeletion(null)}>Hủy</Button>
          <Button color="error" variant="contained" disabled={saving} onClick={() => void remove()} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconTrash size={17} />}>Xóa</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!notice} autoHideDuration={3500} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setNotice('')} sx={{ bgcolor: '#087f6c', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px #00000018' }}>{notice}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
