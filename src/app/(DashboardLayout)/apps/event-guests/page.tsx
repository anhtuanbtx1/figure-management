"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { IconPlus, IconUsers, IconDownload, IconRefresh } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import BlankCard from '@/app/components/shared/BlankCard';

// Import types and services
import { EventGuest, GuestFilters, GuestStatus, GuestCreateRequest } from '../../types/apps/eventGuest';
import { GuestService, getGuestStats } from './services/guestService';

// Import components
import GuestTable from './components/GuestTable';
import GuestFiltersComponent from './components/GuestFilters';
import GuestPagination from './components/GuestPagination';
import BulkGuestActions from './components/BulkGuestActions';
import AddGuestModal from './components/AddGuestModal';
import ModernNotification from './components/ModernNotification';

// Import notification utilities
import createGuestNotification, { NotificationConfig } from './utils/notifications';

// Utility function to remove Vietnamese accents for better search
const removeVietnameseAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const BCrumb = [
  {
    to: '/',
    title: 'Trang chủ',
  },
  {
    title: 'Quản lý khách mời sự kiện',
  },
];

const EventGuestsPage = () => {
  // State management
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<NotificationConfig>({ open: false, message: '', severity: 'success' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuest, setEditGuest] = useState<EventGuest | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<keyof EventGuest>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filters state
  const [filters, setFilters] = useState<GuestFilters>({
    search: '',
    status: '',
    contributionRange: { min: 0, max: 5000000 },
  });

  // Load data from API
  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const guestsData = await GuestService.getAllGuests();
      setGuests(guestsData);
      console.log(`✅ Loaded ${guestsData.length} guests from database`);
    } catch (error) {
      console.error('❌ Failed to load guests:', error);
      setSnackbar(createGuestNotification.error.loadFailed());
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats synchronously from guests data
  const stats = useMemo(() => {
    if (!guests || guests.length === 0) {
      return {
        totalGuests: 0,
        confirmedGuests: 0,
        pendingGuests: 0,
        declinedGuests: 0,
        totalContribution: 0,
        averageContribution: 0,
        totalPeople: 0,
      };
    }

    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.status === 'CONFIRMED').length;
    const pendingGuests = guests.filter(g => g.status === 'PENDING').length;
    const declinedGuests = guests.filter(g => g.status === 'DECLINED').length;

    // Calculate total number of people (sum of numberOfPeople)
    const totalPeople = guests.reduce((total, guest) => {
      const people = Number(guest.numberOfPeople) || 0;
      return total + people;
    }, 0);

    // Safely calculate total contribution with null/undefined handling
    const totalContribution = guests.reduce((sum, g) => {
      const amount = g.contributionAmount;
      if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return sum + 0;
      }
      return sum + Number(amount);
    }, 0);

    const averageContribution = totalGuests > 0 ? totalContribution / totalGuests : 0;

    const result = {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalContribution,
      averageContribution,
      totalPeople,
    };

    console.log('🔢 Stats calculation result:', result);
    console.log('💰 Individual contributions:', guests.map(g => ({ name: g.fullName, amount: g.contributionAmount })));

    return result;
  }, [guests]);

  // Filter and sort guests
  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter(guest => {
      // Enhanced search functionality - search across multiple fields with Vietnamese accent support
      const matchesSearch = !filters.search || (() => {
        const searchTerm = filters.search.toLowerCase().trim();
        if (!searchTerm) return true;

        // Normalize search term (remove accents)
        const normalizedSearchTerm = removeVietnameseAccents(searchTerm);

        // Search in multiple fields using LIKE-style matching
        const searchableFields = [
          guest.fullName?.toLowerCase() || '',
          guest.unit?.toLowerCase() || '',
          guest.relationship?.toLowerCase() || '',
          guest.notes?.toLowerCase() || '',
          guest.status?.toLowerCase() || '',
          // Also search in formatted contribution amount
          guest.contributionAmount?.toLocaleString('vi-VN') || '',
          // Search in number of people
          guest.numberOfPeople?.toString() || ''
        ];

        // Check if search term matches any field (LIKE behavior)
        // Support both original and accent-removed search
        return searchableFields.some(field => {
          const normalizedField = removeVietnameseAccents(field);
          return field.includes(searchTerm) || normalizedField.includes(normalizedSearchTerm);
        });
      })();

      const matchesStatus = !filters.status || guest.status === filters.status;
      const matchesContribution = guest.contributionAmount >= filters.contributionRange.min &&
                                 guest.contributionAmount <= filters.contributionRange.max;

      return matchesSearch && matchesStatus && matchesContribution;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [guests, filters, sortField, sortDirection]);

  // Paginated guests
  const paginatedGuests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedGuests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedGuests, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredAndSortedGuests.length / itemsPerPage);

  // Handlers
  const handleFiltersChange = (newFilters: Partial<GuestFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      contributionRange: { min: 0, max: 5000000 },
    });
    setCurrentPage(1);
  };

  const handleSort = (field: keyof EventGuest, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleSelectGuest = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedGuests(selected ? paginatedGuests.map(guest => guest.id) : []);
  };

  const handleEdit = (guest: EventGuest) => {
    setEditGuest(guest);
    setShowAddModal(true);
  };

  const handleDelete = (guestId: string) => {
    const deletedGuest = guests.find(guest => guest.id === guestId);
    setGuests(prev => prev.filter(guest => guest.id !== guestId));
    setSnackbar(createGuestNotification.success.deleted(deletedGuest?.fullName || 'N/A'));
  };

  const handleView = (guest: EventGuest) => {
    console.log('View guest:', guest);
  };

  const handleBulkDelete = () => {
    const deletedCount = selectedGuests.length;
    setGuests(prev => prev.filter(guest => !selectedGuests.includes(guest.id)));
    setSelectedGuests([]);
    setSnackbar(createGuestNotification.success.bulkDeleted(deletedCount));
  };

  const handleBulkStatusChange = (status: GuestStatus) => {
    const updatedCount = selectedGuests.length;
    const statusText = status === 'CONFIRMED' ? 'Đã xác nhận' :
                      status === 'DECLINED' ? 'Từ chối' : 'Chờ phản hồi';

    setGuests(prev => prev.map(guest =>
      selectedGuests.includes(guest.id) ? { ...guest, status, updatedAt: new Date() } : guest
    ));
    setSelectedGuests([]);
    setSnackbar(createGuestNotification.success.bulkStatusUpdated(statusText, updatedCount));
  };

  const handleBulkExport = async () => {
    try {
      // Export all guests (not just selected ones)
      const allGuests = await GuestService.getAllGuests();
      const filename = GuestService.exportToExcel(allGuests);
      setSnackbar({ open: true, message: `Đã xuất file Excel: ${filename}`, severity: 'success' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setSnackbar({ open: true, message: 'Lỗi khi xuất file Excel', severity: 'error' });
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await loadGuests();
      setSnackbar(createGuestNotification.success.dataRefreshed());
    } catch (error) {
      setSnackbar(createGuestNotification.error.refreshFailed());
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditGuest(null);
    setShowAddModal(true);
  };

  const handleAddGuest = async (guestData: GuestCreateRequest) => {
    try {
      setLoading(true);

      if (editGuest) {
        // TODO: Implement update API
        setGuests(prev => prev.map(guest =>
          guest.id === editGuest.id
            ? { ...guest, ...guestData, updatedAt: new Date() }
            : guest
        ));
        // Show detailed success notification for update
        setSnackbar(createGuestNotification.success.updated(guestData.fullName));
      } else {
        // Add new guest via API
        const result = await GuestService.addGuest(guestData);

        // Refresh the guest list to get the new guest from database
        await loadGuests();

        setCurrentPage(1);
        // Show detailed success notification
        setSnackbar(createGuestNotification.success.added(guestData.fullName));
      }

      setShowAddModal(false);
      setEditGuest(null);
    } catch (error) {
      console.error('Error saving guest:', error);
      const errorMessage = error instanceof Error ? error.message : undefined;
      setSnackbar(createGuestNotification.error.addFailed(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    // Handle null/undefined/NaN values
    const safeAmount = Number(amount) || 0;

    if (isNaN(safeAmount)) {
      return '0 ₫';
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(safeAmount);
  };

  return (
    <PageContainer title="Quản lý khách mời sự kiện" description="Quản lý danh sách khách mời và đóng góp sự kiện">
      {/* <Breadcrumb title="Quản lý khách mời sự kiện" items={BCrumb} /> */}

      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 3,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <IconUsers size={32} />
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                Quản lý khách mời sự kiện
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Quản lý danh sách khách mời và theo dõi đóng góp sự kiện
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<IconRefresh size={20} />}
              onClick={handleRefresh}
              disabled={loading}
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
                },
              }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<IconDownload size={20} />}
              onClick={handleBulkExport}
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
                },
              }}
            >
              Xuất Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={handleAddNew}
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
              Thêm khách mời
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700}>
                  {stats.totalGuests}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng khách mời
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700}>
                  {stats.confirmedGuests}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Đã xác nhận
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 193, 7, 0.2)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700}>
                  {stats.totalPeople || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng số lượng
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 87, 34, 0.2)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700}>
                  {formatCurrency(stats.totalContribution).replace('₫', '')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng đóng góp (VND)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <BlankCard>
        <CardContent sx={{ p: 0 }}>
          {/* Filters */}
          <GuestFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          {/* Bulk Actions */}
          {selectedGuests.length > 0 && (
            <BulkGuestActions
              selectedCount={selectedGuests.length}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkExport={handleBulkExport}
              onClearSelection={() => setSelectedGuests([])}
            />
          )}

          {/* Table */}
          <GuestTable
            guests={paginatedGuests}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            selectedGuests={selectedGuests}
            onSelectGuest={handleSelectGuest}
            onSelectAll={handleSelectAll}
          />

          {/* Pagination */}
          <GuestPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedGuests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </BlankCard>

      {/* Add/Edit Guest Modal */}
      <AddGuestModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditGuest(null);
        }}
        onSubmit={handleAddGuest}
        editGuest={editGuest}
      />

      {/* Modern Enhanced Notification Toast */}
      <ModernNotification
        notification={snackbar}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </PageContainer>
  );
};

export default EventGuestsPage;
