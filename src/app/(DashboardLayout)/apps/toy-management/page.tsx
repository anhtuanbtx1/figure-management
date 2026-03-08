"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Fade,
  Zoom,
  Chip,
  Grow,
} from '@mui/material';
import { IconPlus, IconBox, IconRefresh, IconPackage, IconShoppingCart, IconTags } from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import BlankCard from '@/app/components/shared/BlankCard';

// Import types and services
import { Toy, ToyFilters, ToyStatus, ToyCreateRequest, ToyUpdateRequest, ToyCategory, NotificationState } from '../../types/apps/toy';
import ToyService from './services/toyService';

// Import components (will create these next)
import ToyTable from './components/ToyTable';
import ToyFiltersComponent from './components/ToyFilters';
import ToyPagination from './components/ToyPagination';
import BrandStatsCards from './components/BrandStatsCards';
import ToyForm from './components/ToyForm';
import ModernNotification from '@/app/components/shared/ModernNotification';
import BulkActions from './components/BulkActions';

const BCrumb = [
  {
    to: '/',
    title: 'Trang chủ',
  },
  {
    title: 'Quản lý đồ chơi',
  },
];

const ToyManagementPage = () => {
  // State management
  const [toys, setToys] = useState<Toy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToys, setSelectedToys] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null);

  // Loading states for race condition handling
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Categories and brands state
  const [categories, setCategories] = useState<ToyCategory[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting state
  const [sortField, setSortField] = useState<keyof Toy>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filters state
  const [filters, setFilters] = useState<ToyFilters>({
    search: '',
    category: '',
    status: '',
    priceRange: { min: 0, max: 5000000 },
    brand: '',
    ageRange: '',
    inStock: false,
  });

  // Enhanced toys loading with retry logic
  const loadToys = async (currentRetryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000;

    try {
      setLoading(true);
      console.log(`🧸 Loading toys (attempt ${currentRetryCount + 1}/${maxRetries + 1})...`);

      // Add delay on first load to ensure API readiness
      if (currentRetryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const result = await ToyService.fetchToys(
        filters,
        currentPage,
        itemsPerPage,
        sortField,
        sortDirection
      );

      setToys(result.toys);
      setTotalItems(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      setLoading(false); // Set loading to false on success
      console.log(`✅ Toys loaded successfully (${result.toys.length} toys, ${result.pagination.total} total)`);

    } catch (error) {
      console.error(`❌ Error loading toys (attempt ${currentRetryCount + 1}):`, error);
      console.error('Error details:', error);

      // Retry logic for race condition
      if (currentRetryCount < maxRetries) {
        console.log(`🔄 Retrying toys load in ${retryDelay}ms... (${currentRetryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          loadToys(currentRetryCount + 1);
        }, retryDelay);
        return; // Don't set loading to false yet
      } else {
        // Final failure after all retries
        setLoading(false);
        console.error('❌ Failed to load toys after all retries');
        showNotification(
          `❌ Lỗi khi tải dữ liệu đồ chơi sau ${maxRetries + 1} lần thử: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
          'error'
        );
      }
    }
  };

  // Enhanced loading with retry logic for race condition prevention
  const loadCategoriesAndBrands = async (currentRetryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second delay between retries

    try {
      setCategoriesLoading(true);
      setBrandsLoading(true);
      setHasLoadingError(false);
      setRetryCount(currentRetryCount);
      console.log(`🔄 Loading categories and brands (attempt ${currentRetryCount + 1}/${maxRetries + 1})...`);

      // Add small delay on first load to ensure API is ready
      if (currentRetryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const [categoriesData, brandsData] = await Promise.all([
        ToyService.fetchCategories(),
        ToyService.fetchBrands()
      ]);

      setCategories(categoriesData);
      setBrands(brandsData);
      setCategoriesLoading(false);
      setBrandsLoading(false);
      setHasLoadingError(false);
      console.log(`✅ Categories and brands loaded successfully (${categoriesData.length} categories, ${brandsData.length} brands)`);

    } catch (error) {
      console.error(`❌ Error loading categories and brands (attempt ${currentRetryCount + 1}):`, error);

      // Retry logic for race condition
      if (currentRetryCount < maxRetries) {
        console.log(`🔄 Retrying in ${retryDelay}ms... (${currentRetryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          loadCategoriesAndBrands(currentRetryCount + 1);
        }, retryDelay);
      } else {
        // Final failure after all retries
        setCategoriesLoading(false);
        setBrandsLoading(false);
        setHasLoadingError(true);
        console.error('❌ Failed to load categories and brands after all retries');
        showNotification(
          `❌ Lỗi khi tải danh mục và thương hiệu sau ${maxRetries + 1} lần thử.`,
          'error'
        );
      }
    }
  };

  // Retry handler for manual retry
  const handleRetry = () => {
    setRetryCount(0);
    loadCategoriesAndBrands(0);
  };

  // Initialize with health check and then load data
  useEffect(() => {
    console.log('🚀 Component mounted, checking API health...');

    const initializeApp = async () => {
      try {
        // Check API health first
        const healthResult = await ToyService.checkHealth();
        console.log('🏥 Health check result:', healthResult);

        if (healthResult.success) {
          console.log('✅ API is healthy, loading data...');
          loadCategoriesAndBrands();
        } else {
          console.log('⚠️ API has issues, but attempting to load data anyway...');
          // Still try to load data even if health check shows warnings
          loadCategoriesAndBrands();
        }
      } catch (healthError) {
        console.log('❌ Health check failed, but attempting to load data anyway...');
        console.error('Health check error:', healthError);
        // Still try to load data even if health check fails
        loadCategoriesAndBrands();
      }
    };

    initializeApp();
  }, []);

  // Load toys only after categories and brands are loaded or when dependencies change
  useEffect(() => {
    // Only load toys if categories and brands are loaded
    if (!categoriesLoading && !brandsLoading) {
      console.log('📦 Loading toys...');
      loadToys();
      setInitialLoadComplete(true);
    }
  }, [filters, currentPage, itemsPerPage, sortField, sortDirection, categoriesLoading, brandsLoading]);

  // Fallback: Load toys after a delay even if categories/brands fail
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!initialLoadComplete) {
        console.log('⏰ Fallback: Loading toys after timeout...');
        loadToys();
        setInitialLoadComplete(true);
      }
    }, 5000); // 5 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [initialLoadComplete]);

  // Handlers
  const handleFiltersChange = (newFilters: Partial<ToyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      priceRange: { min: 0, max: 5000000 },
      brand: '',
      ageRange: '',
      inStock: false,
    });
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Toy, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Notification helper
  const showNotification = (message: string, severity: NotificationState['severity'] = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Form handlers
  const handleAddToy = () => {
    setFormMode('create');
    setSelectedToy(null);
    setShowForm(true);
  };

  const handleEditToy = (toy: Toy) => {
    setFormMode('edit');
    setSelectedToy(toy);
    setShowForm(true);
  };

  const handleViewToy = (toy: Toy) => {
    // For now, just show toy details in console
    console.log('View toy:', toy);
    showNotification(`Xem chi tiết: ${toy.name}`, 'info');
  };

  const handleDeleteToy = async (toyId: string) => {
    try {
      const toyToDelete = toys.find(t => t.id === toyId);
      const toyName = toyToDelete?.name || 'đồ chơi';

      await ToyService.deleteToy(toyId);

      showNotification(`✅ Đã xóa "${toyName}" thành công!`, 'success');

      // Reload toys list
      loadToys();
    } catch (error) {
      console.error('Error deleting toy:', error);
      showNotification(
        `❌ Lỗi khi xóa đồ chơi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    }
  };

  const handleFormSubmit = async (toyData: ToyCreateRequest | ToyUpdateRequest) => {
    try {
      if (formMode === 'create') {
        await ToyService.createToy(toyData as ToyCreateRequest);
        showNotification(`🎉 Đã thêm "${toyData.name}" thành công!`, 'success');
      } else if (formMode === 'edit' && selectedToy) {
        const updateData = { ...toyData, id: selectedToy.id } as ToyUpdateRequest;
        await ToyService.updateToy(selectedToy.id, updateData);
        showNotification(`✅ Đã cập nhật "${toyData.name}" thành công!`, 'success');
      }

      // Reload toys list
      loadToys();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving toy:', error);
      const action = formMode === 'create' ? 'thêm' : 'cập nhật';
      showNotification(
        `❌ Lỗi khi ${action} đồ chơi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
      throw error; // Re-throw to let form handle it
    }
  };

  const handleSelectToy = (toyId: string) => {
    setSelectedToys(prev =>
      prev.includes(toyId)
        ? prev.filter(id => id !== toyId)
        : [...prev, toyId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedToys(selected ? toys.map(toy => toy.id) : []);
  };



  const handleBulkDelete = async () => {
    try {
      await ToyService.bulkDeleteToys(selectedToys);
      setSelectedToys([]);
      showNotification(`✅ Đã xóa ${selectedToys.length} đồ chơi thành công`, 'success');
      // Reload toys to reflect changes
      loadToys();
    } catch (error) {
      console.error('Error bulk deleting toys:', error);
      showNotification(
        `❌ Lỗi khi xóa hàng loạt: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    }
  };

  const handleBulkStatusChange = async (status: ToyStatus) => {
    try {
      await ToyService.bulkUpdateToyStatus(selectedToys, status);
      setSelectedToys([]);
      showNotification(`✅ Đã cập nhật trạng thái ${selectedToys.length} đồ chơi thành công`, 'success');
      // Reload toys to reflect changes
      loadToys();
    } catch (error) {
      console.error('Error bulk updating toy status:', error);
      showNotification(
        `❌ Lỗi khi cập nhật trạng thái: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    }
  };



  return (
    <PageContainer title="Quản lý đồ chơi" description="Danh sách đồ chơi">
      {/* <Breadcrumb title="Quản lý đồ chơi" items={BCrumb} /> */}


      {/* Keyframes for floating animation */}
      <style>{`
        @keyframes toyFloat1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes toyFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes toyFloat3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          50% { box-shadow: 0 0 20px 8px rgba(255,255,255,0.15); }
        }
      `}</style>

      {/* Header */}
      <Fade in timeout={600}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #FFA843 60%, #FFCD38 100%)',
            color: 'white',
            p: 4,
            borderRadius: 4,
            mb: 3,
            boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -60,
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -100,
              left: -50,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          {/* Floating decorations */}
          <Box sx={{ position: 'absolute', top: 20, right: 80, fontSize: 32, opacity: 0.15, animation: 'toyFloat1 4s ease-in-out infinite', zIndex: 0 }}>🎲</Box>
          <Box sx={{ position: 'absolute', top: 60, right: 200, fontSize: 24, opacity: 0.1, animation: 'toyFloat2 5s ease-in-out infinite 0.5s', zIndex: 0 }}>🧩</Box>
          <Box sx={{ position: 'absolute', bottom: 15, right: 120, fontSize: 28, opacity: 0.12, animation: 'toyFloat3 3.5s ease-in-out infinite 1s', zIndex: 0 }}>🎪</Box>
          <Box sx={{ position: 'absolute', top: 30, right: 350, fontSize: 20, opacity: 0.08, animation: 'toyFloat1 6s ease-in-out infinite 1.5s', zIndex: 0 }}>🎯</Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" gap={2.5}>
              <Box sx={{
                p: 2, borderRadius: 3,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                animation: 'pulseGlow 3s ease-in-out infinite',
              }}>
                <IconBox size={36} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  🧸 Quản lý Đồ chơi
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Kho tàng niềm vui — quản lý danh sách, số lượng và các bộ sưu tập
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1.5}>
              <Button
                variant="contained"
                startIcon={<IconRefresh size={18} />}
                onClick={() => loadToys()}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Làm mới
              </Button>
              <Button
                variant="contained"
                startIcon={<IconPlus size={20} />}
                onClick={handleAddToy}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    transform: 'translateY(-3px) scale(1.03)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Thêm đồ chơi mới
              </Button>
            </Box>
          </Box>

          {/* Quick Stats Chips */}
          <Box display="flex" gap={2} mt={3} position="relative" zIndex={1} flexWrap="wrap">
            {[
              { icon: <IconPackage size={16} />, label: `${totalItems} sản phẩm`, delay: 0 },
              { icon: <IconTags size={16} />, label: `${categories.length} danh mục`, delay: 100 },
              { icon: <IconShoppingCart size={16} />, label: `${brands.length} thương hiệu`, delay: 200 },
            ].map((item, i) => (
              <Zoom in key={i} style={{ transitionDelay: `${item.delay}ms` }}>
                <Chip
                  icon={item.icon}
                  label={item.label}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    '& .MuiChip-icon': { color: 'white' },
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.28)',
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              </Zoom>
            ))}
          </Box>
        </Box>
      </Fade>

      {/* Main Content */}
      <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
        <Box>
          {/* Brand Stats */}
          <BrandStatsCards />
        </Box>
      </Fade>

      <Fade in timeout={800} style={{ transitionDelay: '400ms' }}>
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Filters */}
            <ToyFiltersComponent
              filters={filters}
              categories={categories}
              brands={brands}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />

            {/* Bulk Actions */}
            {selectedToys.length > 0 && (
              <Grow in>
                <Box>
                  <BulkActions
                    selectedCount={selectedToys.length}
                    onBulkDelete={handleBulkDelete}
                    onBulkStatusChange={handleBulkStatusChange}
                    onBulkExport={() => console.log('Export')}
                    onClearSelection={() => setSelectedToys([])}
                  />
                </Box>
              </Grow>
            )}

            {/* Table */}
            <ToyTable
              toys={toys}
              loading={loading}
              onEdit={handleEditToy}
              onDelete={handleDeleteToy}
              onView={handleViewToy}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              selectedToys={selectedToys}
              onSelectToy={handleSelectToy}
              onSelectAll={handleSelectAll}
            />

            {/* Pagination */}
            <ToyPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(limit) => {
                setItemsPerPage(limit);
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>
      </Fade>

      {/* Toy Form Dialog */}
      <ToyForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        toy={selectedToy}
        categories={categories}
        brands={brands}
        mode={formMode}
      />

      {/* Modern unified notification (reused from event-guests) */}
      <ModernNotification
        notification={notification}
        onClose={closeNotification}
      />
    </PageContainer>
  );
};

export default ToyManagementPage;
