// Wallet Types and Interfaces

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export type TimePeriod = 'thisMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'last12Months' | 'allTime';

export interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  description: string;
}

export interface WalletState {
  transactions: Transaction[];
  stats: WalletStats;
  pagination: PaginationState;
  timePeriod: TimePeriod;
  loading: boolean;
  error: string | null;
  filters: {
    type: TransactionType | 'all';
    category: string;
    status: TransactionStatus | 'all';
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
  };
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  description: string;
  category: string;
  date: string;
  status: TransactionStatus;
}

// Categories for different transaction types
export const INCOME_CATEGORIES = [
  'Lương',
  'Thưởng',
  'Đầu tư',
  'Kinh doanh',
  'Freelance',
  'Quà tặng',
  'Khác'
];

export const EXPENSE_CATEGORIES = [
  'Ăn uống',
  'Di chuyển',
  'Mua sắm',
  'Giải trí',
  'Y tế',
  'Giáo dục',
  'Hóa đơn',
  'Nhà ở',
  'Khác'
];

export const TRANSFER_CATEGORIES = [
  'Chuyển khoản ngân hàng',
  'Nạp tiền',
  'Rút tiền',
  'Chuyển ví',
  'Khác'
];

// Transaction status options
export const TRANSACTION_STATUSES = [
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'cancelled', label: 'Đã hủy' }
] as const;

// Transaction type options
export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Thu nhập', color: 'success' },
  { value: 'expense', label: 'Chi tiêu', color: 'error' },
  { value: 'transfer', label: 'Chuyển khoản', color: 'info' }
] as const;

// Pagination options
export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 5, label: '5 mục' },
  { value: 10, label: '10 mục' },
  { value: 25, label: '25 mục' },
  { value: 50, label: '50 mục' },
  { value: 100, label: '100 mục' }
] as const;

export const DEFAULT_ITEMS_PER_PAGE = 5;

// Time Period options
export const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  {
    value: 'thisMonth',
    label: 'Tháng này',
    description: 'Từ đầu tháng đến hiện tại'
  },
  {
    value: 'last3Months',
    label: '3 tháng gần nhất',
    description: '90 ngày gần nhất'
  },
  {
    value: 'last6Months',
    label: '6 tháng gần nhất',
    description: '180 ngày gần nhất'
  },
  {
    value: 'thisYear',
    label: 'Năm nay',
    description: 'Từ đầu năm đến hiện tại'
  },
  {
    value: 'last12Months',
    label: '12 tháng gần nhất',
    description: '365 ngày gần nhất'
  },
  {
    value: 'allTime',
    label: 'Tất cả thời gian',
    description: 'Toàn bộ giao dịch'
  }
];

export const DEFAULT_TIME_PERIOD: TimePeriod = 'thisMonth';

// Utility functions
export const getTransactionTypeLabel = (type: TransactionType): string => {
  const typeObj = TRANSACTION_TYPES.find(t => t.value === type);
  return typeObj?.label || type;
};

export const getTransactionStatusLabel = (status: TransactionStatus): string => {
  const statusObj = TRANSACTION_STATUSES.find(s => s.value === status);
  return statusObj?.label || status;
};

export const getCategoriesByType = (type: TransactionType): string[] => {
  switch (type) {
    case 'income':
      return INCOME_CATEGORIES;
    case 'expense':
      return EXPENSE_CATEGORIES;
    case 'transfer':
      return TRANSFER_CATEGORIES;
    default:
      return [];
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + ' VNĐ';
};

// Pagination utility functions
export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

export const getPageItems = <T>(items: T[], currentPage: number, itemsPerPage: number): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

export const getPaginationInfo = (currentPage: number, itemsPerPage: number, totalItems: number) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  return { startItem, endItem };
};

export const isValidPage = (page: number, totalPages: number): boolean => {
  return page >= 1 && page <= totalPages && totalPages > 0;
};

// Time Period utility functions
export const getDateRangeForPeriod = (period: TimePeriod): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;

  switch (period) {
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last3Months':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'last6Months':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 180);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last12Months':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 365);
      break;
    case 'allTime':
    default:
      startDate = new Date(0); // Beginning of time
      break;
  }

  return { startDate, endDate };
};

export const isTransactionInPeriod = (transaction: Transaction, period: TimePeriod): boolean => {
  if (period === 'allTime') return true;

  const { startDate, endDate } = getDateRangeForPeriod(period);
  const transactionDate = new Date(transaction.date);

  return transactionDate >= startDate && transactionDate <= endDate;
};

export const getTimePeriodLabel = (period: TimePeriod): string => {
  const option = TIME_PERIOD_OPTIONS.find(opt => opt.value === period);
  return option?.label || period;
};

export const getTimePeriodDescription = (period: TimePeriod): string => {
  const option = TIME_PERIOD_OPTIONS.find(opt => opt.value === period);
  return option?.description || '';
};
