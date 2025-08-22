'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  TextField,
  MenuItem,
  Grid,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import ModernNotification from '@/app/components/shared/ModernNotification';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material';
import { WalletService } from '@/app/(DashboardLayout)/apps/wallet/services/walletService';
import {
  WalletTransaction,
  WalletCategory,
  WalletFilters,
  WalletUpdateRequest,
  WalletNotificationState,
  WalletFormErrors
} from '../../../../../types/apps/wallet';
import WalletDeleteConfirmDialog from './WalletDeleteConfirmDialog';

const WalletTransactionList: React.FC = () => {
  // Data states
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [categories, setCategories] = useState<WalletCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<WalletFilters>({
    search: '',
    type: '',
    categoryId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;
  const partiallySelected = selectedIds.length > 0 && selectedIds.length < transactions.length;

  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);


  // Edit form states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);

  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<WalletTransaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<WalletUpdateRequest>({
    id: '',
    type: '',
    amount: 0,
    description: '',
    categoryId: '',
    transactionDate: '',
    status: ''
  });
  const [editFormErrors, setEditFormErrors] = useState<WalletFormErrors>({});

  // Notification state
  const [notification, setNotification] = useState<WalletNotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('💳 Loading wallet transactions...');

      const result = await WalletService.fetchTransactions(
        filters,
        currentPage,
        itemsPerPage,
        'transactionDate',
        'desc'
      );

      setTransactions(result.transactions);
      setTotalItems(result.pagination.total);
      console.log(`✅ Loaded ${result.transactions.length} transactions`);

    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      showNotification(
        `❌ Lỗi khi tải giao dịch: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      console.log('📂 Loading wallet categories...');
      const categoriesData = await WalletService.fetchCategories();
      setCategories(categoriesData);
      console.log(`✅ Loaded ${categoriesData.length} categories`);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      showNotification(
        `❌ Lỗi khi tải danh mục: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters, currentPage, itemsPerPage]);

  // Listen for transaction created event
  useEffect(() => {
    const handleTransactionCreated = () => {
      console.log('🔄 Transaction created, refreshing list...');
      loadTransactions();
    };

    window.addEventListener('walletTransactionCreated', handleTransactionCreated);
    return () => {
      window.removeEventListener('walletTransactionCreated', handleTransactionCreated);
    };
  }, [filters, currentPage, itemsPerPage]);

  // Bulk selection handlers
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(transactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter(x => x !== id));
  };

  const openBulkDelete = () => setShowBulkDeleteDialog(true);
  const closeBulkDelete = () => setShowBulkDeleteDialog(false);

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkDeleting(true);
      // Use bulk API for efficiency
      await WalletService.bulkDeleteTransactions(selectedIds);
      showNotification(`Đã xóa ${selectedIds.length} giao dịch thành công!`, 'success');
      setSelectedIds([]);
      closeBulkDelete();
      loadTransactions();
    } catch (error) {
      console.error('❌ Error bulk deleting transactions:', error);
      showNotification('❌ Lỗi khi xóa hàng loạt giao dịch', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Handle page change
  const handlePageChange = (_: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (field: keyof WalletFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      categoryId: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  // Open edit dialog
  const openEditDialog = (transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setEditFormData({
      id: transaction.id,
      type: transaction.type,
      amount: Math.abs(transaction.amount), // Always show positive in form
      description: transaction.description,
      categoryId: transaction.categoryId,
      transactionDate: transaction.transactionDate.split('T')[0],
      status: transaction.status
    });
    setEditFormErrors({});
    setShowEditDialog(true);
  };

  // Close edit dialog
  const closeEditDialog = () => {
    setShowEditDialog(false);
    setSelectedTransaction(null);
    setEditFormData({
      id: '',
      type: '',
      amount: 0,
      description: '',
      categoryId: '',
      transactionDate: '',
      status: ''
    });
    setEditFormErrors({});
  };

  // Validate edit form
  const validateEditForm = (): boolean => {
    const errors: WalletFormErrors = {};

    if (!editFormData.type) errors.type = 'Vui lòng chọn loại giao dịch';
    if (!editFormData.amount || editFormData.amount <= 0) errors.amount = 'Vui lòng nhập số tiền hợp lệ';
    if (!editFormData.description.trim()) errors.description = 'Vui lòng nhập mô tả';
    if (!editFormData.categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
    if (!editFormData.transactionDate) errors.transactionDate = 'Vui lòng chọn ngày';
    if (!editFormData.status) errors.status = 'Vui lòng chọn trạng thái';

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit form submit
  const handleEditSubmit = async () => {
    if (!validateEditForm() || !selectedTransaction) return;

    try {
      setLoading(true);

      // Prepare data for API
      const apiData = {
        ...editFormData,
        // Convert amount based on transaction type
        amount: editFormData.type === 'Chi tiêu' ? -Math.abs(editFormData.amount) : Math.abs(editFormData.amount)
      };

      await WalletService.updateTransaction(selectedTransaction.id, apiData);
      showNotification('Cập nhật giao dịch thành công!');
      closeEditDialog();
      loadTransactions();

    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      showNotification(
        `❌ Lỗi khi cập nhật giao dịch: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle delete - show confirmation dialog
  const handleDelete = (transaction: WalletTransaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      setDeleteLoading(true);
      console.log(`🗑️ Attempting to delete transaction: ${transactionToDelete.id}`);

      await WalletService.deleteTransaction(transactionToDelete.id);

      console.log(`✅ Successfully deleted transaction: ${transactionToDelete.id}`);
      showNotification('✅ Xóa giao dịch thành công!');

      // Close dialog
      setShowDeleteDialog(false);
      setTransactionToDelete(null);

      // Refresh data
      loadTransactions();

      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('walletTransactionDeleted', {
        detail: { transactionId: transactionToDelete.id }
      }));

    } catch (error) {
      console.error('❌ Error deleting transaction:', error);

      let errorMessage = 'Lỗi không xác định';
      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error cases
        if (error.message.includes('JSON') || error.message.includes('<!DOCTYPE')) {
          errorMessage = 'Lỗi server compilation. Vui lòng refresh trang và thử lại.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Lỗi server nội bộ. Vui lòng thử lại sau.';
        } else if (error.message.includes('compilation error')) {
          errorMessage = 'Server đang restart. Vui lòng refresh trang và thử lại sau 10 giây.';
        }
      }

      showNotification(`❌ Lỗi khi xóa giao dịch: ${errorMessage}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setTransactionToDelete(null);
    setDeleteLoading(false);
  };

  // Get transaction type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Thu nhập':
        return <IncomeIcon sx={{ color: '#4CAF50', fontSize: 18 }} />;
      case 'Chi tiêu':
        return <ExpenseIcon sx={{ color: '#F44336', fontSize: 18 }} />;
      case 'Chuyển khoản':
        return <TransferIcon sx={{ color: '#2196F3', fontSize: 18 }} />;
      default:
        return null;
    }
  };

  // Format amount with color
  const formatAmount = (amount: number, type: string) => {
    const color = type === 'Thu nhập' ? '#4CAF50' : type === 'Chi tiêu' ? '#F44336' : '#2196F3';
    const prefix = type === 'Thu nhập' ? '+' : '';
    return (
      <Typography sx={{ color, fontWeight: 600, fontSize: '0.875rem' }}>
        {prefix}{amount.toLocaleString('vi-VN')} VND
      </Typography>
    );
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách giao dịch
          </Typography>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm giao dịch..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Type Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại</InputLabel>
                <Select
                  value={filters.type}
                  label="Loại"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="Thu nhập">Thu nhập</MenuItem>
                  <MenuItem value="Chi tiêu">Chi tiêu</MenuItem>
                  <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filters.categoryId}
                  label="Danh mục"
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  label="Trạng thái"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                  <MenuItem value="Đang chờ">Đang chờ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Reset Button */}
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={resetFilters}
                size="small"
                fullWidth
              >
                Reset
              </Button>
            </Grid>
          </Grid>

          {/* Bulk actions bar */}
          {selectedIds.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Đã chọn {selectedIds.length} giao dịch</Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={bulkDeleting}
              >
                {bulkDeleting ? 'Đang xóa...' : 'Xóa đã chọn'}
              </Button>
            </Box>
          )}

          {/* Transactions Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
          {/* Bulk Delete Confirmation Dialog */}
          <Dialog open={showBulkDeleteDialog} onClose={closeBulkDelete} maxWidth="xs" fullWidth>
            <DialogTitle>Xóa {selectedIds.length} giao dịch?</DialogTitle>
            <DialogContent>
              <Typography>Bạn có chắc chắn muốn xóa {selectedIds.length} giao dịch đã chọn? Hành động này không thể hoàn tác.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeBulkDelete}>Hủy</Button>
              <Button onClick={handleBulkDeleteConfirm} color="error" variant="contained" disabled={bulkDeleting}>
                {bulkDeleting ? 'Đang xóa...' : 'Xóa' }
              </Button>
            </DialogActions>
          </Dialog>

              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={partiallySelected}
                      checked={allSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      inputProps={{ 'aria-label': 'Select all transactions' }}
                    />
                  </TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>Đang tải...</Typography>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>Không có giao dịch nào</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onChange={(e) => toggleSelectOne(transaction.id, e.target.checked)}
                          inputProps={{ 'aria-label': `Select ${transaction.description}` }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(transaction.type)}
                          <Typography variant="body2">{transaction.type}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {transaction.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.categoryName}
                          size="small"
                          sx={{
                            backgroundColor: transaction.categoryColor + '20',
                            color: transaction.categoryColor,
                            border: `1px solid ${transaction.categoryColor}40`,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={transaction.status === 'Hoàn thành' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(transaction)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(transaction)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage - 1}
            onPageChange={handlePageChange}
            rowsPerPage={itemsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditDialog} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {/* Transaction Type */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!editFormErrors.type}>
                  <InputLabel>Loại giao dịch *</InputLabel>
                  <Select
                    value={editFormData.type}
                    label="Loại giao dịch *"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="Thu nhập">Thu nhập</MenuItem>
                    <MenuItem value="Chi tiêu">Chi tiêu</MenuItem>
                    <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
                  </Select>
                  {editFormErrors.type && (
                    <Typography variant="caption" color="error">
                      {editFormErrors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số tiền (VND) *"
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  error={!!editFormErrors.amount}
                  helperText={editFormErrors.amount}
                  InputProps={{
                    inputProps: { min: 0, step: 1000 }
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả *"
                  multiline
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  error={!!editFormErrors.description}
                  helperText={editFormErrors.description}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!editFormErrors.categoryId}>
                  <InputLabel>Danh mục *</InputLabel>
                  <Select
                    value={editFormData.categoryId}
                    label="Danh mục *"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    {categories
                      .filter(cat => !editFormData.type || cat.type === editFormData.type)
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {editFormErrors.categoryId && (
                    <Typography variant="caption" color="error">
                      {editFormErrors.categoryId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Transaction Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ngày giao dịch *"
                  type="date"
                  value={editFormData.transactionDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                  error={!!editFormErrors.transactionDate}
                  helperText={editFormErrors.transactionDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!editFormErrors.status}>
                  <InputLabel>Trạng thái *</InputLabel>
                  <Select
                    value={editFormData.status}
                    label="Trạng thái *"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                    <MenuItem value="Đang chờ">Đang chờ</MenuItem>
                  </Select>
                  {editFormErrors.status && (
                    <Typography variant="caption" color="error">
                      {editFormErrors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Hủy</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <WalletDeleteConfirmDialog
        open={showDeleteDialog}
        transaction={transactionToDelete}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Modern unified notification (reused from event-guests) */}
      <ModernNotification
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default WalletTransactionList;
