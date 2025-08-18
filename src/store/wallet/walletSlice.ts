import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Transaction,
  WalletState,
  TransactionFormData,
  WalletStats,
  PaginationState,
  TimePeriod,
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_TIME_PERIOD,
  calculateTotalPages,
  isTransactionInPeriod
} from '../../types/wallet';

// Initial state
const initialState: WalletState = {
  transactions: [
    // Sample data for testing pagination
    {
      id: '1',
      type: 'income',
      amount: 15000000,
      description: 'Lương tháng 12',
      category: 'Lương',
      date: '2024-12-01',
      status: 'completed',
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2024-12-01T09:00:00Z',
    },
    {
      id: '2',
      type: 'expense',
      amount: 500000,
      description: 'Ăn trưa tại nhà hàng',
      category: 'Ăn uống',
      date: '2024-12-02',
      status: 'completed',
      createdAt: '2024-12-02T12:00:00Z',
      updatedAt: '2024-12-02T12:00:00Z',
    },
    {
      id: '3',
      type: 'expense',
      amount: 2000000,
      description: 'Mua quần áo mùa đông',
      category: 'Mua sắm',
      date: '2024-12-03',
      status: 'completed',
      createdAt: '2024-12-03T15:30:00Z',
      updatedAt: '2024-12-03T15:30:00Z',
    },
    {
      id: '4',
      type: 'transfer',
      amount: 5000000,
      description: 'Chuyển khoản cho mẹ',
      category: 'Chuyển khoản ngân hàng',
      date: '2024-12-04',
      status: 'pending',
      createdAt: '2024-12-04T10:00:00Z',
      updatedAt: '2024-12-04T10:00:00Z',
    },
    {
      id: '5',
      type: 'expense',
      amount: 300000,
      description: 'Xăng xe',
      category: 'Di chuyển',
      date: '2024-12-05',
      status: 'completed',
      createdAt: '2024-12-05T08:00:00Z',
      updatedAt: '2024-12-05T08:00:00Z',
    },
    {
      id: '6',
      type: 'income',
      amount: 2000000,
      description: 'Thưởng dự án',
      category: 'Thưởng',
      date: '2024-12-06',
      status: 'completed',
      createdAt: '2024-12-06T14:00:00Z',
      updatedAt: '2024-12-06T14:00:00Z',
    },
    {
      id: '7',
      type: 'expense',
      amount: 800000,
      description: 'Mua sách',
      category: 'Giáo dục',
      date: '2024-12-07',
      status: 'completed',
      createdAt: '2024-12-07T10:30:00Z',
      updatedAt: '2024-12-07T10:30:00Z',
    },
    {
      id: '8',
      type: 'expense',
      amount: 1200000,
      description: 'Khám bệnh',
      category: 'Y tế',
      date: '2024-12-08',
      status: 'completed',
      createdAt: '2024-12-08T16:00:00Z',
      updatedAt: '2024-12-08T16:00:00Z',
    },
    {
      id: '9',
      type: 'transfer',
      amount: 3000000,
      description: 'Gửi tiết kiệm',
      category: 'Chuyển khoản ngân hàng',
      date: '2024-12-09',
      status: 'completed',
      createdAt: '2024-12-09T11:00:00Z',
      updatedAt: '2024-12-09T11:00:00Z',
    },
    {
      id: '10',
      type: 'expense',
      amount: 600000,
      description: 'Ăn tối với bạn bè',
      category: 'Ăn uống',
      date: '2024-12-10',
      status: 'completed',
      createdAt: '2024-12-10T19:00:00Z',
      updatedAt: '2024-12-10T19:00:00Z',
    },
    {
      id: '11',
      type: 'expense',
      amount: 1500000,
      description: 'Mua giày thể thao',
      category: 'Mua sắm',
      date: '2024-12-11',
      status: 'pending',
      createdAt: '2024-12-11T13:00:00Z',
      updatedAt: '2024-12-11T13:00:00Z',
    },
    {
      id: '12',
      type: 'income',
      amount: 500000,
      description: 'Bán đồ cũ',
      category: 'Khác',
      date: '2024-12-12',
      status: 'completed',
      createdAt: '2024-12-12T15:00:00Z',
      updatedAt: '2024-12-12T15:00:00Z',
    },
    {
      id: '13',
      type: 'expense',
      amount: 200000,
      description: 'Cà phê',
      category: 'Ăn uống',
      date: '2024-12-13',
      status: 'completed',
      createdAt: '2024-12-13T09:30:00Z',
      updatedAt: '2024-12-13T09:30:00Z',
    },
    {
      id: '14',
      type: 'expense',
      amount: 4000000,
      description: 'Tiền điện nước',
      category: 'Hóa đơn',
      date: '2024-12-14',
      status: 'completed',
      createdAt: '2024-12-14T17:00:00Z',
      updatedAt: '2024-12-14T17:00:00Z',
    },
    {
      id: '15',
      type: 'transfer',
      amount: 2500000,
      description: 'Chuyển tiền thuê nhà',
      category: 'Chuyển khoản ngân hàng',
      date: '2024-12-15',
      status: 'pending',
      createdAt: '2024-12-15T12:00:00Z',
      updatedAt: '2024-12-15T12:00:00Z',
    },
    // Add some older transactions for testing time periods
    {
      id: '16',
      type: 'income',
      amount: 14000000,
      description: 'Lương tháng 11',
      category: 'Lương',
      date: '2024-11-01',
      status: 'completed',
      createdAt: '2024-11-01T09:00:00Z',
      updatedAt: '2024-11-01T09:00:00Z',
    },
    {
      id: '17',
      type: 'expense',
      amount: 3000000,
      description: 'Mua laptop',
      category: 'Mua sắm',
      date: '2024-10-15',
      status: 'completed',
      createdAt: '2024-10-15T14:00:00Z',
      updatedAt: '2024-10-15T14:00:00Z',
    },
    {
      id: '18',
      type: 'income',
      amount: 13500000,
      description: 'Lương tháng 10',
      category: 'Lương',
      date: '2024-10-01',
      status: 'completed',
      createdAt: '2024-10-01T09:00:00Z',
      updatedAt: '2024-10-01T09:00:00Z',
    },
    {
      id: '19',
      type: 'expense',
      amount: 5000000,
      description: 'Du lịch Đà Lạt',
      category: 'Giải trí',
      date: '2024-09-20',
      status: 'completed',
      createdAt: '2024-09-20T10:00:00Z',
      updatedAt: '2024-09-20T10:00:00Z',
    },
    {
      id: '20',
      type: 'income',
      amount: 13000000,
      description: 'Lương tháng 9',
      category: 'Lương',
      date: '2024-09-01',
      status: 'completed',
      createdAt: '2024-09-01T09:00:00Z',
      updatedAt: '2024-09-01T09:00:00Z',
    },
  ],
  stats: {
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 0,
  },
  timePeriod: DEFAULT_TIME_PERIOD,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    category: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  },
};

// Calculate stats helper function
const calculateStats = (transactions: Transaction[], timePeriod: TimePeriod = 'allTime'): WalletStats => {
  // Filter by time period first
  const periodTransactions = transactions.filter(t => isTransactionInPeriod(t, timePeriod));
  const completedTransactions = periodTransactions.filter(t => t.status === 'completed');

  const totalIncome = completedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = completedTransactions
    .filter(t => t.type === 'expense' || t.type === 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    transactionCount: periodTransactions.length,
  };
};

// Helper function to update pagination
const updatePagination = (state: WalletState, filteredCount?: number) => {
  const totalItems = filteredCount !== undefined ? filteredCount : state.transactions.length;
  const totalPages = calculateTotalPages(totalItems, state.pagination.itemsPerPage);

  state.pagination.totalItems = totalItems;
  state.pagination.totalPages = totalPages;

  // Reset to page 1 if current page is invalid
  if (state.pagination.currentPage > totalPages && totalPages > 0) {
    state.pagination.currentPage = 1;
  }
};

// Initialize stats and pagination
initialState.stats = calculateStats(initialState.transactions, initialState.timePeriod);
updatePagination(initialState);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Add new transaction
    addTransaction: (state, action: PayloadAction<TransactionFormData>) => {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...action.payload,
        amount: parseFloat(action.payload.amount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.transactions.unshift(newTransaction);
      state.stats = calculateStats(state.transactions, state.timePeriod);
      updatePagination(state);
    },

    // Update existing transaction
    updateTransaction: (state, action: PayloadAction<{ id: string; data: Partial<TransactionFormData> }>) => {
      const { id, data } = action.payload;
      const index = state.transactions.findIndex(t => t.id === id);

      if (index !== -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          ...data,
          amount: data.amount ? parseFloat(data.amount) : state.transactions[index].amount,
          updatedAt: new Date().toISOString(),
        };
        state.stats = calculateStats(state.transactions, state.timePeriod);
        updatePagination(state);
      }
    },

    // Delete transaction
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      state.stats = calculateStats(state.transactions, state.timePeriod);
      updatePagination(state);
    },

    // Update transaction status
    updateTransactionStatus: (state, action: PayloadAction<{ id: string; status: Transaction['status'] }>) => {
      const { id, status } = action.payload;
      const index = state.transactions.findIndex(t => t.id === id);

      if (index !== -1) {
        state.transactions[index].status = status;
        state.transactions[index].updatedAt = new Date().toISOString();
        state.stats = calculateStats(state.transactions, state.timePeriod);
        updatePagination(state);
      }
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<WalletState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.pagination.currentPage = 1;
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        category: '',
        status: 'all',
        dateFrom: '',
        dateTo: '',
        searchTerm: '',
      };
      // Reset to page 1 when filters are cleared
      state.pagination.currentPage = 1;
    },

    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      const page = action.payload;
      if (page >= 1 && page <= state.pagination.totalPages) {
        state.pagination.currentPage = page;
      }
    },

    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.totalPages = calculateTotalPages(state.pagination.totalItems, action.payload);
      // Reset to page 1 when items per page changes
      state.pagination.currentPage = 1;
    },

    updatePaginationForFiltered: (state, action: PayloadAction<number>) => {
      updatePagination(state, action.payload);
    },

    // Time Period actions
    setTimePeriod: (state, action: PayloadAction<TimePeriod>) => {
      state.timePeriod = action.payload;
      // Recalculate stats with new time period
      state.stats = calculateStats(state.transactions, state.timePeriod);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  updateTransactionStatus,
  setFilters,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  updatePaginationForFiltered,
  setTimePeriod,
  setLoading,
  setError,
  clearError,
} = walletSlice.actions;

export default walletSlice.reducer;
