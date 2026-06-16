"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

// Server-side search handles Vietnamese accents

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
  const [totalGuests, setTotalGuests] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statistics, setStatistics] = useState<any>(null);
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
  const stateRef = useRef({ currentPage, itemsPerPage, filters });
  stateRef.current = { currentPage, itemsPerPage, filters };

  const loadGuests = useCallback(async (options: {
    page?: number;
    search?: string;
    status?: string;
  } = {}) => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const { currentPage: statePage, itemsPerPage: stateItems, filters: stateFilters } = stateRef.current;

      const result = await GuestService.getAllGuests({
        page: options.page || statePage,
        pageSize: stateItems,
        search: options.search !== undefined ? options.search : stateFilters.search,
        status: options.status !== undefined ? options.status : stateFilters.status,
        sortField: 'createdDate',
        sortDirection: 'DESC',
      });

      setGuests(result.guests);
      setTotalGuests(result.pagination.totalCount);
      setTotalPages(result.pagination.totalPages);

      const loadTime = Date.now() - startTime;
      console.log(`📊 Loaded ${result.guests.length} guests in ${loadTime}ms (server: ${result.performanceMs}ms)`);

      if (result.performanceMs > 1000) {
        console.warn(`⚠️ Slow query detected: ${result.performanceMs}ms`);
      }

    } catch (error) {
      console.error('❌ Failed to load guests:', error);
      setSnackbar(createGuestNotification.error.loadFailed());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatistics = useCallback(async (options: {
    search?: string;
    status?: string;
  } = {}) => {
    try {
      console.log('📊 Loading statistics using multiple API calls...');

      const { filters: stateFilters } = stateRef.current;

      let allGuests: EventGuest[] = [];
      let currentStatsPage = 1;
      let hasMorePages = true;
      const pageSize = 100; // Use max allowed pageSize

      // Keep fetching pages until we get all data
      while (hasMorePages) {
        const result = await GuestService.getAllGuests({
          page: currentStatsPage,
          pageSize: pageSize,
          search: options.search !== undefined ? options.search : stateFilters.search,
          status: options.status !== undefined ? options.status : stateFilters.status,
          sortField: 'createdDate',
          sortDirection: 'DESC',
        });

        allGuests = [...allGuests, ...result.guests];
        hasMorePages = result.pagination.hasNextPage;
        currentStatsPage++;

        console.log(`📄 Loaded page ${currentStatsPage - 1}: ${result.guests.length} guests (total so far: ${allGuests.length})`);

        // Safety check to prevent infinite loop
        if (currentStatsPage > 10) {
          console.warn('⚠️ Stopped loading after 10 pages to prevent infinite loop');
          break;
        }
      }

      console.log(`✅ Loaded all ${allGuests.length} guests for statistics`);

      // Calculate statistics from all guests data
      const totalGuests = allGuests.length;
      const confirmedGuests = allGuests.filter(g => g.status === 'Going').length;
      const pendingGuests = allGuests.filter(g => g.status === 'Pending').length;
      const declinedGuests = allGuests.filter(g => g.status === 'NotGoing').length;

      // Calculate total number of people
      const totalPeople = allGuests.reduce((total, guest) => {
        const people = Number(guest.numberOfPeople) || 0;
        return total + people;
      }, 0);

      // Calculate confirmed people
      const confirmedPeople = allGuests
        .filter(g => g.status === 'Going')
        .reduce((total, guest) => {
          const people = Number(guest.numberOfPeople) || 0;
          return total + people;
        }, 0);

      // Calculate total contribution
      const totalContribution = allGuests.reduce((sum, g) => {
        const amount = g.contributionAmount;
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
          return sum + 0;
        }
        return sum + Number(amount);
      }, 0);

      // Calculate confirmed contribution
      const confirmedContribution = allGuests
        .filter(g => g.status === 'Going')
        .reduce((sum, g) => {
          const amount = g.contributionAmount;
          if (amount === null || amount === undefined || isNaN(Number(amount))) {
            return sum + 0;
          }
          return sum + Number(amount);
        }, 0);

      const averageContribution = totalGuests > 0 ? totalContribution / totalGuests : 0;

      // Create statistics object
      const stats = {
        overview: {
          totalGuests,
          totalPeople,
          totalContribution,
          avgGiftAmount: Math.round(averageContribution),
          maxGiftAmount: Math.max(...allGuests.map(g => g.contributionAmount || 0)),
          minGiftAmount: Math.min(...allGuests.map(g => g.contributionAmount || 0)),
        },
        byStatus: {
          confirmed: {
            guests: confirmedGuests,
            people: confirmedPeople,
            contribution: confirmedContribution,
          },
          pending: {
            guests: pendingGuests,
            people: 0, // Can calculate if needed
            contribution: 0, // Can calculate if needed
          },
          declined: {
            guests: declinedGuests,
          },
          maybe: {
            guests: 0, // Can calculate if needed
          },
        },
        topUnits: [], // Can calculate if needed
        filters: {
          search: options.search !== undefined ? options.search : stateFilters.search,
          status: options.status !== undefined ? options.status : stateFilters.status,
        },
      };

      setStatistics(stats);
      console.log('✅ Statistics calculated from', totalGuests, 'guests:', {
        total: totalGuests,
        confirmed: confirmedGuests,
        totalContribution,
      });

    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      // Don't show error notification for stats, just log it
    }
  }, []);

  useEffect(() => {
    loadGuests();
    loadStatistics();
  }, [loadGuests, loadStatistics]);

  // Reload statistics when status filter changes (not search - search is now manual)
  useEffect(() => {
    loadStatistics();
  }, [filters.status, loadStatistics]);

  // Use statistics from API (all data) instead of calculating from paginated guests
  const stats = useMemo(() => {
    if (!statistics) {
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

    const result = {
      totalGuests: statistics.overview.totalGuests,
      confirmedGuests: statistics.byStatus.confirmed.guests,
      pendingGuests: statistics.byStatus.pending.guests,
      declinedGuests: statistics.byStatus.declined.guests,
      totalContribution: statistics.overview.totalContribution,
      averageContribution: statistics.overview.avgGiftAmount,
      totalPeople: statistics.overview.totalPeople,
    };

    console.log('📊 Stats from API:', result);
    console.log('🔍 Applied filters:', statistics.filters);

    return result;
  }, [statistics]);

  // Server-side filtering and sorting - no need for client-side processing

  // Server-side pagination - no need for client-side slicing

  // Handlers
  const handleFiltersChange = (newFilters: Partial<GuestFilters>) => {
    const prevFilters = filters;
    const updatedFilters = { ...filters, ...newFilters };

    console.log('📝 Filters change:', {
      prevFilters,
      newFilters,
      updatedFilters
    });

    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);

    // Check if search actually changed (manual search) or status changed
    const searchChanged = newFilters.search !== undefined && newFilters.search !== prevFilters.search;
    const statusChanged = newFilters.status !== undefined && newFilters.status !== prevFilters.status;
    const contributionChanged = newFilters.contributionRange !== undefined;

    // Special case: Always allow search (including empty search for reset)
    const isSearchTrigger = newFilters.search !== undefined;

    console.log('🔄 Change detection:', {
      searchChanged,
      statusChanged,
      contributionChanged,
      isSearchTrigger,
      shouldReload: isSearchTrigger || statusChanged || contributionChanged
    });

    if (isSearchTrigger || statusChanged || contributionChanged) {
      console.log('🚀 Reloading data with filters:', updatedFilters);
      loadGuests({
        page: 1,
        search: updatedFilters.search,
        status: updatedFilters.status
      });
      loadStatistics({
        search: updatedFilters.search,
        status: updatedFilters.status
      });
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadGuests({ page: newPage });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    loadGuests({ page: 1 });
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
    setSelectedGuests(selected ? guests.map(guest => guest.id) : []);
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
    const statusText = status === GuestStatus.CONFIRMED ? 'Đã xác nhận' :
      status === GuestStatus.DECLINED ? 'Từ chối' : 'Chờ phản hồi';

    setGuests(prev => prev.map(guest =>
      selectedGuests.includes(guest.id) ? { ...guest, status, updatedAt: new Date() } : guest
    ));
    setSelectedGuests([]);
    setSnackbar(createGuestNotification.success.bulkStatusUpdated(statusText, updatedCount));
  };

  const handleBulkExport = async () => {
    try {
      // Export all guests (not just selected ones)
      const result = await GuestService.getAllGuests({ pageSize: 1000 }); // Get all guests for export
      const filename = GuestService.exportToExcel(result.guests);
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
        // Update existing guest via API
        await GuestService.updateGuest(editGuest.id, guestData);

        // Refresh the guest list to get updated data from database
        await loadGuests();

        // Show detailed success notification for update
        setSnackbar(createGuestNotification.success.updated(guestData.fullName));
      } else {
        // Add new guest via API
        await GuestService.addGuest(guestData);

        // Refresh the guest list to get the new guest from database
        await loadGuests();

        setCurrentPage(1);
        // Show detailed success notification
        setSnackbar(createGuestNotification.success.added(guestData.fullName));
      }

      // Reload statistics to reflect changes
      await loadStatistics();

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
          <Grid item xs={12} sm={6} md={2.4}>
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
          <Grid item xs={12} sm={6} md={2.4}>
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
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ backgroundColor: 'rgba(244, 67, 54, 0.2)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700}>
                  {stats.declinedGuests || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Khách vắng
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
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
          <Grid item xs={12} sm={6} md={2.4}>
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
            loading={loading}
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
            guests={guests}
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
            totalItems={totalGuests}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
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
