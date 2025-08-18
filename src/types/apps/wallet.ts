// Wallet Management Types (Ultra Simple - Matches Database Schema)

export interface WalletCategory {
  id: string;
  name: string;
  type: string; // 'Thu nhập', 'Chi tiêu', 'Chuyển khoản'
  color: string;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  type: string; // 'Thu nhập', 'Chi tiêu', 'Chuyển khoản'
  amount: number;
  description: string;
  categoryId: string;
  categoryName?: string;
  categoryType?: string;
  categoryColor?: string;
  transactionDate: string;
  status: string; // 'Hoàn thành', 'Đang chờ'
  createdAt: string;
  isActive: boolean;
}

export interface WalletFilters {
  search: string;
  type: string; // 'Thu nhập', 'Chi tiêu', 'Chuyển khoản'
  categoryId: string;
  status: string; // 'Hoàn thành', 'Đang chờ'
  dateFrom: string;
  dateTo: string;
}

// Dashboard specific filters
export interface WalletDashboardFilters {
  dateFrom: string;
  dateTo: string;
  categoryId: string;
  type: string;
  status: string;
  dateRangeType: 'custom' | 'week' | 'month' | 'year' | 'yearMonth';
  yearMonth: string; // Format: YYYY-MM
  year: string; // Format: YYYY
}

// Dashboard statistics interfaces
export interface WalletDashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
}

export interface WalletTypeStats {
  type: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
  completedCount: number;
  pendingCount: number;
  completedAmount: number;
}

export interface WalletCategoryStats {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  categoryColor: string;
  transactionCount: number;
  totalAmount: number;
  avgAmount: number;
  completedCount: number;
  pendingCount: number;
  completedAmount: number;
}

export interface WalletMonthlyTrend {
  month: string;
  income: number;
  expense: number;
  transactionCount: number;
  net: number;
}

export interface WalletDateRangeComparison {
  weekly: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
  monthly: {
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  yearly: {
    thisYear: number;
    lastYear: number;
    change: number;
  };
}

export interface WalletDashboardData {
  summary: WalletDashboardSummary;
  filters: WalletDashboardFilters;
  typeStats: WalletTypeStats[];
  topCategories: WalletCategoryStats[];
  recentTransactions: WalletTransaction[];
  monthlyTrend: WalletMonthlyTrend[];
  dateRangeComparison: WalletDateRangeComparison;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface WalletListResponse {
  success: boolean;
  message: string;
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletCategoriesResponse {
  success: boolean;
  message: string;
  data: WalletCategory[];
  count: number;
}

export interface WalletCreateRequest {
  type: string; // 'Thu nhập', 'Chi tiêu', 'Chuyển khoản'
  amount: number;
  description: string;
  categoryId: string;
  transactionDate: string;
  status: string; // 'Hoàn thành', 'Đang chờ'
}

export interface WalletUpdateRequest extends WalletCreateRequest {
  id: string;
}

// Notification state for wallet operations
export interface WalletNotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Form validation
export interface WalletFormErrors {
  type?: string;
  amount?: string;
  description?: string;
  categoryId?: string;
  transactionDate?: string;
  status?: string;
}
