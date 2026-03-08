"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Grid,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Tabs, Tab, Tooltip, Alert, Snackbar,
    Skeleton, Avatar, InputAdornment, Fade, Zoom,
    SelectChangeEvent,
} from '@mui/material';
import {
    IconFish, IconPlus, IconRefresh, IconSearch, IconEdit, IconTrash,
    IconGenderMale, IconGenderFemale, IconHeart, IconEye,
    IconX, IconCheck, IconFilter, IconFlask, IconWand,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';

import {
    GuppyFish, GuppyBreeding, GuppyFishCreateRequest, GuppyBreedingCreateRequest,
    GuppyGender, GuppyStatus, BreedingStatus, GuppyStats,
} from '../../types/apps/guppyFish';
import { GuppyFishService, GuppyBreedingService } from './services/guppyService';

// ==========================================
// Tab Panel
// ==========================================
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// ==========================================
// Main Page
// ==========================================
const GuppyBreedingPage = () => {
    // Tab state
    const [tabValue, setTabValue] = useState(0);

    // Fish state
    const [fishList, setFishList] = useState<GuppyFish[]>([]);
    const [fishLoading, setFishLoading] = useState(true);
    const [fishSearch, setFishSearch] = useState('');
    const [fishGenderFilter, setFishGenderFilter] = useState('');
    const [fishStatusFilter, setFishStatusFilter] = useState('');
    const [fishPage, setFishPage] = useState(1);
    const [fishTotalPages, setFishTotalPages] = useState(0);
    const [fishTotal, setFishTotal] = useState(0);
    const [stats, setStats] = useState<GuppyStats | null>(null);

    // Breeding state
    const [breedingList, setBreedingList] = useState<GuppyBreeding[]>([]);
    const [breedingLoading, setBreedingLoading] = useState(true);
    const [breedingSearch, setBreedingSearch] = useState('');
    const [breedingStatusFilter, setBreedingStatusFilter] = useState('');
    const [breedingPage, setBreedingPage] = useState(1);

    // Simulation state
    const [simMaleId, setSimMaleId] = useState('');
    const [simFemaleId, setSimFemaleId] = useState('');
    const [simResults, setSimResults] = useState<any[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Dialog state
    const [fishDialogOpen, setFishDialogOpen] = useState(false);
    const [breedingDialogOpen, setBreedingDialogOpen] = useState(false);
    const [editFish, setEditFish] = useState<GuppyFish | null>(null);
    const [editBreeding, setEditBreeding] = useState<GuppyBreeding | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'fish' | 'breeding'; id: string; name: string } | null>(null);

    // Notification
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false, message: '', severity: 'success',
    });

    // Form state - Fish
    const [fishForm, setFishForm] = useState<GuppyFishCreateRequest>({
        fishCode: '', gender: GuppyGender.MALE, name: '', birthDate: '',
        strain: '', color: '', tailType: '', size: '', notes: '', photoUrl: '',
    });

    // Form state - Breeding
    const [breedingForm, setBreedingForm] = useState<GuppyBreedingCreateRequest>({
        maleFishId: '', femaleFishId: '', pairingDate: '',
        birthDate: '', fryCount: null, survivalCount: null, notes: '', status: BreedingStatus.PAIRING,
    });

    // All fish for breeding selection dropdowns
    const [allFishForSelect, setAllFishForSelect] = useState<GuppyFish[]>([]);

    // ==========================================
    // Load Data
    // ==========================================
    useEffect(() => {
        loadFish();
        loadBreedings();
        loadStats();
        loadAllFishForSelect();
    }, []);

    const loadFish = async (options?: { page?: number; search?: string; gender?: string; status?: string }) => {
        try {
            setFishLoading(true);
            const result = await GuppyFishService.getAll({
                page: options?.page || fishPage,
                pageSize: 20,
                search: options?.search ?? fishSearch,
                gender: options?.gender ?? fishGenderFilter,
                status: options?.status ?? fishStatusFilter,
                sortField: 'createdDate',
                sortDirection: 'DESC',
            });
            setFishList(result.fish);
            setFishTotalPages(result.pagination?.totalPages || 0);
            setFishTotal(result.pagination?.totalCount || 0);
        } catch (error) {
            console.error('Error loading fish:', error);
            showNotification('Lỗi tải danh sách cá', 'error');
        } finally {
            setFishLoading(false);
        }
    };

    const loadBreedings = async (options?: { page?: number; search?: string; status?: string }) => {
        try {
            setBreedingLoading(true);
            const result = await GuppyBreedingService.getAll({
                page: options?.page || breedingPage,
                pageSize: 20,
                search: options?.search ?? breedingSearch,
                status: options?.status ?? breedingStatusFilter,
            });
            setBreedingList(result.breedings);
        } catch (error) {
            console.error('Error loading breedings:', error);
            showNotification('Lỗi tải danh sách phối giống', 'error');
        } finally {
            setBreedingLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const s = await GuppyFishService.getStats();
            setStats(s);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadAllFishForSelect = async () => {
        try {
            const result = await GuppyFishService.getAll({ pageSize: 200, status: 'Active' });
            setAllFishForSelect(result.fish);
        } catch {
            // ignore
        }
    };

    // ==========================================
    // Helpers
    // ==========================================
    const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const maleFish = useMemo(() => allFishForSelect.filter(f => f.gender === 'Male'), [allFishForSelect]);
    const femaleFish = useMemo(() => allFishForSelect.filter(f => f.gender === 'Female'), [allFishForSelect]);

    // ==========================================
    // Fish CRUD Handlers
    // ==========================================
    const handleOpenFishDialog = (fish?: GuppyFish) => {
        if (fish) {
            setEditFish(fish);
            setFishForm({
                fishCode: fish.fishCode,
                name: fish.name || '',
                gender: fish.gender as GuppyGender,
                birthDate: fish.birthDate || '',
                photoUrl: fish.photoUrl || '',
                strain: fish.strain || '',
                color: fish.color || '',
                tailType: fish.tailType || '',
                size: fish.size || '',
                notes: fish.notes || '',
                status: fish.status as GuppyStatus,
            });
        } else {
            setEditFish(null);
            setFishForm({
                fishCode: '', gender: GuppyGender.MALE, name: '', birthDate: '',
                strain: '', color: '', tailType: '', size: '', notes: '', photoUrl: '',
            });
        }
        setFishDialogOpen(true);
    };

    const handleSaveFish = async () => {
        try {
            if (!fishForm.fishCode || !fishForm.gender) {
                showNotification('Vui lòng nhập mã cá và giới tính', 'error');
                return;
            }
            if (editFish) {
                await GuppyFishService.update(editFish.id, fishForm);
                showNotification(`Đã cập nhật cá "${fishForm.fishCode}"`, 'success');
            } else {
                await GuppyFishService.add(fishForm);
                showNotification(`Đã thêm cá "${fishForm.fishCode}"`, 'success');
            }
            setFishDialogOpen(false);
            loadFish();
            loadStats();
        } catch (error) {
            showNotification(`Lỗi: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
        }
    };

    const handleDeleteFish = async (id: string, fishCode: string) => {
        setDeleteTarget({ type: 'fish', id, name: fishCode });
        setDeleteConfirmOpen(true);
    };

    // ==========================================
    // Breeding CRUD Handlers
    // ==========================================
    const handleOpenBreedingDialog = (breeding?: GuppyBreeding) => {
        loadAllFishForSelect();
        if (breeding) {
            setEditBreeding(breeding);
            setBreedingForm({
                maleFishId: breeding.maleFishId,
                femaleFishId: breeding.femaleFishId,
                pairingDate: breeding.pairingDate,
                birthDate: breeding.birthDate || '',
                fryCount: breeding.fryCount,
                survivalCount: breeding.survivalCount,
                notes: breeding.notes || '',
                status: breeding.status as BreedingStatus,
            });
        } else {
            setEditBreeding(null);
            setBreedingForm({
                maleFishId: '', femaleFishId: '', pairingDate: new Date().toISOString().split('T')[0],
                birthDate: '', fryCount: null, survivalCount: null, notes: '', status: BreedingStatus.PAIRING,
            });
        }
        setBreedingDialogOpen(true);
    };

    const handleSaveBreeding = async () => {
        try {
            if (!breedingForm.maleFishId || !breedingForm.femaleFishId || !breedingForm.pairingDate) {
                showNotification('Vui lòng chọn cá đực, cá cái và ngày ghép', 'error');
                return;
            }
            if (editBreeding) {
                await GuppyBreedingService.update(editBreeding.id, breedingForm);
                showNotification('Đã cập nhật phối giống', 'success');
            } else {
                await GuppyBreedingService.add(breedingForm);
                showNotification('Đã thêm phối giống mới', 'success');
            }
            setBreedingDialogOpen(false);
            loadBreedings();
            loadStats();
        } catch (error) {
            showNotification(`Lỗi: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
        }
    };

    const handleDeleteBreeding = async (id: string) => {
        setDeleteTarget({ type: 'breeding', id, name: `#${id}` });
        setDeleteConfirmOpen(true);
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === 'fish') {
                await GuppyFishService.delete(deleteTarget.id);
                showNotification(`Đã xóa cá "${deleteTarget.name}"`, 'success');
                loadFish();
            } else {
                await GuppyBreedingService.delete(deleteTarget.id);
                showNotification(`Đã xóa phối giống ${deleteTarget.name}`, 'success');
                loadBreedings();
            }
            loadStats();
        } catch (error) {
            showNotification(`Lỗi xóa: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
        } finally {
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    };

    // ==========================================
    // Search Handlers
    // ==========================================
    const handleFishSearch = () => {
        setFishPage(1);
        loadFish({ page: 1, search: fishSearch, gender: fishGenderFilter, status: fishStatusFilter });
    };

    const handleBreedingSearch = () => {
        setBreedingPage(1);
        loadBreedings({ page: 1, search: breedingSearch, status: breedingStatusFilter });
    };

    // ==========================================
    // Simulation Handler
    // ==========================================
    const handleSimulate = () => {
        if (!simMaleId || !simFemaleId) {
            showNotification('Vui lòng chọn cá đực và cá cái để mô phỏng', 'error');
            return;
        }
        setIsSimulating(true);
        setSimResults([]);

        setTimeout(() => {
            const male = maleFish.find(f => f.id === simMaleId);
            const female = femaleFish.find(f => f.id === simFemaleId);

            if (!male || !female) {
                setIsSimulating(false);
                return;
            }

            // Generate 10 to 30 fry
            const fryCount = Math.floor(Math.random() * 21) + 10;
            const results = [];

            for (let i = 0; i < fryCount; i++) {
                const isMale = Math.random() > 0.5;

                // Genetics for Strain/Color
                const strainRoll = Math.random();
                let strain = '';
                let color = '';
                if (strainRoll < 0.4) {
                    strain = male.strain || 'Unknown';
                    color = male.color || 'Unknown';
                } else if (strainRoll < 0.8) {
                    strain = female.strain || 'Unknown';
                    color = female.color || 'Unknown';
                } else {
                    strain = `${male.strain || 'Wild'} x ${female.strain || 'Wild'}`;
                    color = 'Mixed';
                }

                // Genetics for Tail
                const tailRoll = Math.random();
                let tailType = '';
                if (tailRoll < 0.45) {
                    tailType = male.tailType || 'Unknown';
                } else if (tailRoll < 0.9) {
                    tailType = female.tailType || 'Unknown';
                } else {
                    tailType = 'Wild/Short';
                }

                results.push({
                    id: `sim-${i}`,
                    gender: isMale ? 'Male' : 'Female',
                    strain,
                    color,
                    tailType,
                    size: 'Fry',
                });
            }

            setSimResults(results);
            setIsSimulating(false);
            showNotification(`Mô phỏng thành công: Sinh ra ${fryCount} cá con!`, 'success');
        }, 1500); // 1.5s delay for calculation effect
    };

    // ==========================================
    // Render Helpers
    // ==========================================
    const getGenderChip = (gender: string) => (
        <Chip
            icon={gender === 'Male' ? <IconGenderMale size={14} /> : <IconGenderFemale size={14} />}
            label={gender === 'Male' ? 'Đực' : 'Cái'}
            size="small"
            sx={{
                backgroundColor: gender === 'Male' ? 'rgba(33, 150, 243, 0.12)' : 'rgba(233, 30, 99, 0.12)',
                color: gender === 'Male' ? '#1976d2' : '#c2185b',
                fontWeight: 600,
            }}
        />
    );

    const getStatusChip = (status: string) => {
        const config: Record<string, { color: string; bg: string }> = {
            Active: { color: '#2e7d32', bg: 'rgba(76, 175, 80, 0.12)' },
            Dead: { color: '#d32f2f', bg: 'rgba(244, 67, 54, 0.12)' },
            Sold: { color: '#ed6c02', bg: 'rgba(255, 152, 0, 0.12)' },
            Given: { color: '#0288d1', bg: 'rgba(3, 169, 244, 0.12)' },
        };
        const statusLabels: Record<string, string> = {
            Active: 'Đang nuôi', Dead: 'Đã chết', Sold: 'Đã bán', Given: 'Tặng',
        };
        const c = config[status] || config.Active;
        return <Chip label={statusLabels[status] || status} size="small" sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600 }} />;
    };

    const getBreedingStatusChip = (status: string) => {
        const config: Record<string, { color: string; bg: string; label: string }> = {
            Pairing: { color: '#1976d2', bg: 'rgba(33, 150, 243, 0.12)', label: 'Đang ghép' },
            Pregnant: { color: '#7b1fa2', bg: 'rgba(156, 39, 176, 0.12)', label: 'Mang thai' },
            Born: { color: '#2e7d32', bg: 'rgba(76, 175, 80, 0.12)', label: 'Đã sinh' },
            Completed: { color: '#0288d1', bg: 'rgba(3, 169, 244, 0.12)', label: 'Hoàn thành' },
            Failed: { color: '#d32f2f', bg: 'rgba(244, 67, 54, 0.12)', label: 'Thất bại' },
        };
        const c = config[status] || config.Pairing;
        return <Chip label={c.label} size="small" sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600 }} />;
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <PageContainer title="Guppy Breeding Lab" description="Quản lý đàn cá Guppy và phối giống">
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 50%, #023e8a 100%)',
                    color: 'white',
                    p: 4,
                    borderRadius: 3,
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0, 119, 182, 0.35)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -80,
                        left: -40,
                        width: 250,
                        height: 250,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                    },
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                            p: 1.5, borderRadius: 2,
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <IconFish size={32} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.5px' }}>
                                🐠 Guppy Breeding Lab
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Quản lý đàn cá Guppy và theo dõi phối giống
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={1.5}>
                        <Button
                            variant="contained"
                            startIcon={<IconRefresh size={18} />}
                            onClick={() => { loadFish(); loadBreedings(); loadStats(); }}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 2,
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
                            }}
                        >
                            Làm mới
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<IconPlus size={18} />}
                            onClick={() => {
                                if (tabValue === 0) handleOpenFishDialog();
                                else if (tabValue === 1) handleOpenBreedingDialog();
                                else setTabValue(1); // switch from sim to breeding
                            }}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {tabValue === 0 ? 'Thêm cá' : tabValue === 1 ? 'Thêm phối giống' : 'Tạo phối giống thực tế'}
                        </Button>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
                    {[
                        { label: 'Tổng cá', value: stats?.totalFish || 0, icon: '🐠' },
                        { label: 'Cá đực', value: stats?.maleFish || 0, icon: '♂️' },
                        { label: 'Cá cái', value: stats?.femaleFish || 0, icon: '♀️' },
                        { label: 'Đang nuôi', value: stats?.activeFish || 0, icon: '🏠' },
                        { label: 'Phối giống', value: stats?.totalBreedings || 0, icon: '💕' },
                    ].map((item, index) => (
                        <Grid item xs={6} sm={4} md={2.4} key={index}>
                            <Zoom in style={{ transitionDelay: `${index * 80}ms` }}>
                                <Card sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.18)',
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    },
                                }}>
                                    <CardContent sx={{ textAlign: 'center', py: 2, px: 1 }}>
                                        <Typography variant="h6" sx={{ mb: 0.5 }}>{item.icon}</Typography>
                                        <Typography variant="h3" fontWeight={700}>{item.value}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.85 }}>{item.label}</Typography>
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Tabs */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        px: 2,
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            minHeight: 56,
                        },
                    }}
                >
                    <Tab icon={<IconFish size={20} />} iconPosition="start" label="Danh sách cá" />
                    <Tab icon={<IconHeart size={20} />} iconPosition="start" label="Phối giống" />
                    <Tab icon={<IconFlask size={20} />} iconPosition="start" label="Mô phỏng lai tạo" />
                </Tabs>

                {/* ==================== TAB 0: Fish List ==================== */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        {/* Search & Filters */}
                        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                            <TextField
                                size="small"
                                placeholder="Tìm kiếm mã cá, tên, dòng, màu..."
                                value={fishSearch}
                                onChange={(e) => setFishSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFishSearch()}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>,
                                }}
                                sx={{ minWidth: 300, flex: 1 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    value={fishGenderFilter}
                                    label="Giới tính"
                                    onChange={(e: SelectChangeEvent) => {
                                        setFishGenderFilter(e.target.value);
                                        loadFish({ page: 1, gender: e.target.value });
                                    }}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="Male">Đực</MenuItem>
                                    <MenuItem value="Female">Cái</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={fishStatusFilter}
                                    label="Trạng thái"
                                    onChange={(e: SelectChangeEvent) => {
                                        setFishStatusFilter(e.target.value);
                                        loadFish({ page: 1, status: e.target.value });
                                    }}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="Active">Đang nuôi</MenuItem>
                                    <MenuItem value="Dead">Đã chết</MenuItem>
                                    <MenuItem value="Sold">Đã bán</MenuItem>
                                    <MenuItem value="Given">Tặng</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="outlined" onClick={handleFishSearch} sx={{ textTransform: 'none' }}>
                                Tìm kiếm
                            </Button>
                        </Box>

                        {/* Fish Table */}
                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Mã cá</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Giới tính</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Dòng (Strain)</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Màu sắc</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Kiểu đuôi</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Kích thước</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ngày sinh</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fishLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <TableRow key={i}>
                                                {[...Array(10)].map((_, j) => (
                                                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : fishList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">🐠 Chưa có dữ liệu cá nào</Typography>
                                                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={() => handleOpenFishDialog()}
                                                    sx={{ mt: 2, textTransform: 'none' }}>
                                                    Thêm cá đầu tiên
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fishList.map((fish) => (
                                            <TableRow key={fish.id} hover sx={{
                                                '&:hover': { backgroundColor: 'rgba(0, 180, 216, 0.04)' },
                                                transition: 'background-color 0.2s',
                                            }}>
                                                <TableCell>
                                                    <Typography fontWeight={600} color="primary">{fish.fishCode}</Typography>
                                                </TableCell>
                                                <TableCell>{fish.name || '—'}</TableCell>
                                                <TableCell>{getGenderChip(fish.gender)}</TableCell>
                                                <TableCell>
                                                    {fish.strain && (
                                                        <Chip label={fish.strain} size="small" variant="outlined"
                                                            sx={{ borderColor: 'primary.main', color: 'primary.main' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell>{fish.color || '—'}</TableCell>
                                                <TableCell>{fish.tailType || '—'}</TableCell>
                                                <TableCell>{fish.size || '—'}</TableCell>
                                                <TableCell>
                                                    {fish.birthDate ? new Date(fish.birthDate).toLocaleDateString('vi-VN') : '—'}
                                                </TableCell>
                                                <TableCell>{getStatusChip(fish.status)}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Sửa">
                                                        <IconButton size="small" onClick={() => handleOpenFishDialog(fish)} color="primary">
                                                            <IconEdit size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa">
                                                        <IconButton size="small" onClick={() => handleDeleteFish(fish.id, fish.fishCode)} color="error">
                                                            <IconTrash size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                {/* ==================== TAB 1: Breeding ==================== */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        {/* Search */}
                        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                            <TextField
                                size="small"
                                placeholder="Tìm kiếm theo mã cá, tên, dòng..."
                                value={breedingSearch}
                                onChange={(e) => setBreedingSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBreedingSearch()}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment>,
                                }}
                                sx={{ minWidth: 300, flex: 1 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={breedingStatusFilter}
                                    label="Trạng thái"
                                    onChange={(e: SelectChangeEvent) => {
                                        setBreedingStatusFilter(e.target.value);
                                        loadBreedings({ page: 1, status: e.target.value });
                                    }}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="Pairing">Đang ghép</MenuItem>
                                    <MenuItem value="Pregnant">Mang thai</MenuItem>
                                    <MenuItem value="Born">Đã sinh</MenuItem>
                                    <MenuItem value="Completed">Hoàn thành</MenuItem>
                                    <MenuItem value="Failed">Thất bại</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="outlined" onClick={handleBreedingSearch} sx={{ textTransform: 'none' }}>
                                Tìm kiếm
                            </Button>
                        </Box>

                        {/* Breeding Table */}
                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Cá đực</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Cá cái</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ngày ghép</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ngày sinh</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Số con</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Sống sót</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Tỷ lệ %</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {breedingLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                {[...Array(10)].map((_, j) => (
                                                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : breedingList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">💕 Chưa có dữ liệu phối giống nào</Typography>
                                                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={() => handleOpenBreedingDialog()}
                                                    sx={{ mt: 2, textTransform: 'none' }}>
                                                    Thêm phối giống đầu tiên
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        breedingList.map((breeding) => (
                                            <TableRow key={breeding.id} hover sx={{
                                                '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.04)' },
                                                transition: 'background-color 0.2s',
                                            }}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography fontWeight={600} color="primary" variant="body2">
                                                            {breeding.maleFishCode}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {breeding.maleStrain}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography fontWeight={600} color="secondary" variant="body2">
                                                            {breeding.femaleFishCode}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {breeding.femaleStrain}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{new Date(breeding.pairingDate).toLocaleDateString('vi-VN')}</TableCell>
                                                <TableCell>
                                                    {breeding.birthDate ? new Date(breeding.birthDate).toLocaleDateString('vi-VN') : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{breeding.fryCount ?? '—'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{breeding.survivalCount ?? '—'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {breeding.survivalRate !== null ? (
                                                        <Chip
                                                            label={`${breeding.survivalRate}%`}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                backgroundColor: breeding.survivalRate >= 80 ? 'rgba(76,175,80,0.12)' :
                                                                    breeding.survivalRate >= 50 ? 'rgba(255,152,0,0.12)' : 'rgba(244,67,54,0.12)',
                                                                color: breeding.survivalRate >= 80 ? '#2e7d32' :
                                                                    breeding.survivalRate >= 50 ? '#ed6c02' : '#d32f2f',
                                                            }}
                                                        />
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell>{getBreedingStatusChip(breeding.status)}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {breeding.notes || '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Sửa">
                                                        <IconButton size="small" onClick={() => handleOpenBreedingDialog(breeding)} color="primary">
                                                            <IconEdit size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa">
                                                        <IconButton size="small" onClick={() => handleDeleteBreeding(breeding.id)} color="error">
                                                            <IconTrash size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                {/* ==================== TAB 2: Genetics Simulation ==================== */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ px: 3, pb: 4 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>
                            🧬 Phòng Lab Mô Phỏng Di Truyền
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Chọn một cặp cá đực và cá cái để xem trước kết quả lai tạo dựa trên xác suất di truyền căn bản.
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={5}>
                                <Card sx={{ p: 3, height: '100%', border: '1px dashed', borderColor: 'divider', boxShadow: 'none', backgroundColor: 'rgba(33, 150, 243, 0.02)' }}>
                                    <Typography variant="h6" sx={{ mb: 3 }} display="flex" alignItems="center" gap={1}>
                                        <IconGenderMale size={24} color="#1976d2" /> Cá Đực
                                    </Typography>
                                    <FormControl fullWidth size="medium">
                                        <InputLabel>Chọn cá đực</InputLabel>
                                        <Select value={simMaleId} label="Chọn cá đực"
                                            onChange={(e: SelectChangeEvent) => setSimMaleId(e.target.value)}>
                                            {maleFish.map(f => (
                                                <MenuItem key={f.id} value={f.id}>
                                                    {f.fishCode} {f.name ? `(${f.name})` : ''} — {f.strain || 'N/A'}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {simMaleId && (() => {
                                        const m = maleFish.find(f => f.id === simMaleId);
                                        return m ? (
                                            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                                                <Typography variant="body2"><strong>Dòng:</strong> {m.strain || '—'}</Typography>
                                                <Typography variant="body2"><strong>Màu:</strong> {m.color || '—'}</Typography>
                                                <Typography variant="body2"><strong>Đuôi:</strong> {m.tailType || '—'}</Typography>
                                            </Box>
                                        ) : null;
                                    })()}
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={2} display="flex" alignItems="center" justifyContent="center">
                                <IconHeart size={48} color="#e91e63" style={{ opacity: 0.2 }} />
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Card sx={{ p: 3, height: '100%', border: '1px dashed', borderColor: 'divider', boxShadow: 'none', backgroundColor: 'rgba(233, 30, 99, 0.02)' }}>
                                    <Typography variant="h6" sx={{ mb: 3 }} display="flex" alignItems="center" gap={1}>
                                        <IconGenderFemale size={24} color="#c2185b" /> Cá Cái
                                    </Typography>
                                    <FormControl fullWidth size="medium">
                                        <InputLabel>Chọn cá cái</InputLabel>
                                        <Select value={simFemaleId} label="Chọn cá cái"
                                            onChange={(e: SelectChangeEvent) => setSimFemaleId(e.target.value)}>
                                            {femaleFish.map(f => (
                                                <MenuItem key={f.id} value={f.id}>
                                                    {f.fishCode} {f.name ? `(${f.name})` : ''} — {f.strain || 'N/A'}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {simFemaleId && (() => {
                                        const f = femaleFish.find(fish => fish.id === simFemaleId);
                                        return f ? (
                                            <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                                                <Typography variant="body2"><strong>Dòng:</strong> {f.strain || '—'}</Typography>
                                                <Typography variant="body2"><strong>Màu:</strong> {f.color || '—'}</Typography>
                                                <Typography variant="body2"><strong>Đuôi:</strong> {f.tailType || '—'}</Typography>
                                            </Box>
                                        ) : null;
                                    })()}
                                </Card>
                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSimulate}
                                disabled={isSimulating}
                                startIcon={isSimulating ? <IconRefresh style={{ animation: 'spin 1.5s linear infinite' }} /> : <IconWand />}
                                sx={{
                                    py: 1.5, px: 4, borderRadius: 8, fontSize: '1.1rem',
                                    background: 'linear-gradient(45deg, #FF8E53 0%, #FE6B8B 100%)',
                                    boxShadow: '0 4px 20px rgba(254, 107, 139, 0.4)',
                                    color: 'white',
                                    '&:hover': {
                                        boxShadow: '0 6px 25px rgba(254, 107, 139, 0.6)',
                                        transform: 'scale(1.02)'
                                    },
                                    transition: 'all 0.2s',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' },
                                    }
                                }}
                            >
                                {isSimulating ? 'Đang phân tích bộ gen...' : 'Lai tạo ngẫu nhiên'}
                            </Button>
                        </Box>

                        {/* Rendering Results */}
                        {simResults.length > 0 && (
                            <Fade in>
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Kết Quả Ước Tính ({simResults.length} cá con)</Typography>
                                    <Grid container spacing={2}>
                                        {simResults.map(fry => (
                                            <Grid item xs={6} sm={4} md={3} lg={2} key={fry.id}>
                                                <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                                                    {getGenderChip(fry.gender)}
                                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>{fry.strain}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">Màu: {fry.color}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">Đuôi: {fry.tailType}</Typography>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </TabPanel>
            </Card>

            {/* ==================== Fish Dialog ==================== */}
            <Dialog open={fishDialogOpen} onClose={() => setFishDialogOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🐠 {editFish ? 'Cập nhật cá' : 'Thêm cá mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Mã cá *" value={fishForm.fishCode}
                                onChange={(e) => setFishForm(f => ({ ...f, fishCode: e.target.value }))}
                                placeholder="VD: M001" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Tên gọi" value={fishForm.name || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="VD: Đỏ Lửa" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Giới tính *</InputLabel>
                                <Select value={fishForm.gender} label="Giới tính *"
                                    onChange={(e: SelectChangeEvent) => setFishForm(f => ({ ...f, gender: e.target.value as GuppyGender }))}>
                                    <MenuItem value="Male">♂ Đực</MenuItem>
                                    <MenuItem value="Female">♀ Cái</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Dòng (Strain)" value={fishForm.strain || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, strain: e.target.value }))}
                                placeholder="VD: Full Red, Blue Moscow" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Màu sắc" value={fishForm.color || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, color: e.target.value }))}
                                placeholder="VD: Đỏ, Xanh dương" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Kiểu đuôi" value={fishForm.tailType || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, tailType: e.target.value }))}
                                placeholder="VD: Delta, Halfmoon" size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Kích thước</InputLabel>
                                <Select value={fishForm.size || ''} label="Kích thước"
                                    onChange={(e: SelectChangeEvent) => setFishForm(f => ({ ...f, size: e.target.value }))}>
                                    <MenuItem value="">Chưa xác định</MenuItem>
                                    <MenuItem value="Small">Nhỏ</MenuItem>
                                    <MenuItem value="Medium">Trung bình</MenuItem>
                                    <MenuItem value="Large">Lớn</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Ngày sinh" type="date" value={fishForm.birthDate || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, birthDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Trạng thái</InputLabel>
                                <Select value={fishForm.status || 'Active'} label="Trạng thái"
                                    onChange={(e: SelectChangeEvent) => setFishForm(f => ({ ...f, status: e.target.value as GuppyStatus }))}>
                                    <MenuItem value="Active">🟢 Đang nuôi</MenuItem>
                                    <MenuItem value="Dead">🔴 Đã chết</MenuItem>
                                    <MenuItem value="Sold">🟠 Đã bán</MenuItem>
                                    <MenuItem value="Given">🔵 Tặng</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="URL ảnh" value={fishForm.photoUrl || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, photoUrl: e.target.value }))}
                                placeholder="https://..." size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Ghi chú" value={fishForm.notes || ''}
                                onChange={(e) => setFishForm(f => ({ ...f, notes: e.target.value }))}
                                size="small" multiline rows={1} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setFishDialogOpen(false)} sx={{ textTransform: 'none' }}>Hủy</Button>
                    <Button onClick={handleSaveFish} variant="contained" startIcon={<IconCheck size={18} />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}>
                        {editFish ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== Breeding Dialog ==================== */}
            <Dialog open={breedingDialogOpen} onClose={() => setBreedingDialogOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    💕 {editBreeding ? 'Cập nhật phối giống' : 'Thêm phối giống mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Cá đực *</InputLabel>
                                <Select value={breedingForm.maleFishId} label="Cá đực *"
                                    onChange={(e: SelectChangeEvent) => setBreedingForm(f => ({ ...f, maleFishId: e.target.value }))}>
                                    {maleFish.map(f => (
                                        <MenuItem key={f.id} value={f.id}>
                                            ♂ {f.fishCode} {f.name ? `(${f.name})` : ''} — {f.strain || 'N/A'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Cá cái *</InputLabel>
                                <Select value={breedingForm.femaleFishId} label="Cá cái *"
                                    onChange={(e: SelectChangeEvent) => setBreedingForm(f => ({ ...f, femaleFishId: e.target.value }))}>
                                    {femaleFish.map(f => (
                                        <MenuItem key={f.id} value={f.id}>
                                            ♀ {f.fishCode} {f.name ? `(${f.name})` : ''} — {f.strain || 'N/A'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Ngày ghép cặp *" type="date" value={breedingForm.pairingDate}
                                onChange={(e) => setBreedingForm(f => ({ ...f, pairingDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Ngày sinh" type="date" value={breedingForm.birthDate || ''}
                                onChange={(e) => setBreedingForm(f => ({ ...f, birthDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Trạng thái</InputLabel>
                                <Select value={breedingForm.status || 'Pairing'} label="Trạng thái"
                                    onChange={(e: SelectChangeEvent) => setBreedingForm(f => ({ ...f, status: e.target.value as BreedingStatus }))}>
                                    <MenuItem value="Pairing">🔵 Đang ghép</MenuItem>
                                    <MenuItem value="Pregnant">🟣 Mang thai</MenuItem>
                                    <MenuItem value="Born">🟢 Đã sinh</MenuItem>
                                    <MenuItem value="Completed">✅ Hoàn thành</MenuItem>
                                    <MenuItem value="Failed">🔴 Thất bại</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Số con sinh ra" type="number" value={breedingForm.fryCount ?? ''}
                                onChange={(e) => setBreedingForm(f => ({ ...f, fryCount: e.target.value ? Number(e.target.value) : null }))}
                                size="small" inputProps={{ min: 0 }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Số con sống sót" type="number" value={breedingForm.survivalCount ?? ''}
                                onChange={(e) => setBreedingForm(f => ({ ...f, survivalCount: e.target.value ? Number(e.target.value) : null }))}
                                size="small" inputProps={{ min: 0 }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Ghi chú" value={breedingForm.notes || ''}
                                onChange={(e) => setBreedingForm(f => ({ ...f, notes: e.target.value }))}
                                size="small" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setBreedingDialogOpen(false)} sx={{ textTransform: 'none' }}>Hủy</Button>
                    <Button onClick={handleSaveBreeding} variant="contained" startIcon={<IconCheck size={18} />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}>
                        {editBreeding ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== Delete Confirm Dialog ==================== */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>⚠️ Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa <strong>{deleteTarget?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Dữ liệu sẽ được ẩn (soft delete) và có thể khôi phục.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none' }}>Hủy</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error"
                        startIcon={<IconTrash size={18} />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== Snackbar ==================== */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2, fontWeight: 500 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default GuppyBreedingPage;
