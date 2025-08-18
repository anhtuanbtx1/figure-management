import { 
  WalletTransaction, 
  WalletCategory, 
  WalletFilters, 
  WalletListResponse,
  WalletCategoriesResponse,
  WalletCreateRequest,
  WalletUpdateRequest
} from '../../../../../types/apps/wallet';

const API_BASE = '/api/wallet';

export class WalletService {
  
  /**
   * Fetch wallet categories for dropdown
   */
  static async fetchCategories(): Promise<WalletCategory[]> {
    try {
      console.log('📂 Fetching wallet categories...');
      
      const response = await fetch(`${API_BASE}/categories`);
      const data: WalletCategoriesResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch categories');
      }
      
      console.log(`✅ Fetched ${data.count} categories`);
      return data.data;
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Fetch wallet transactions with filtering, sorting, and pagination
   */
  static async fetchTransactions(
    filters: WalletFilters,
    page: number = 1,
    pageSize: number = 20,
    sortField: string = 'transactionDate',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<WalletListResponse> {
    
    try {
      console.log('💳 Fetching wallet transactions...');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortDirection
      });
      
      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const response = await fetch(`${API_BASE}/transactions?${params}`);
      const data: WalletListResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
      
      console.log(`✅ Fetched ${data.transactions.length}/${data.pagination.total} transactions`);
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Create new transaction
   */
  static async createTransaction(data: WalletCreateRequest): Promise<WalletTransaction> {
    try {
      console.log('💳 Creating new transaction...');
      
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create transaction');
      }
      
      console.log(`✅ Created transaction: ${result.data.description}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction
   */
  static async updateTransaction(id: string, data: WalletUpdateRequest): Promise<WalletTransaction> {
    try {
      console.log(`💳 Updating transaction: ${id}`);
      
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update transaction');
      }
      
      console.log(`✅ Updated transaction: ${result.data.description}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Delete transaction with fallback handling
   */
  static async deleteTransaction(id: string): Promise<void> {
    try {
      console.log(`💳 Deleting transaction: ${id}`);

      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));

        // If we get HTML response, it might be a Next.js error page
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('Server compilation error. Please refresh the page and try again.');
        }

        throw new Error('Server returned non-JSON response. Please check server logs.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to delete transaction (${response.status})`);
      }

      console.log(`✅ Deleted transaction: ${id}`);

    } catch (error) {
      console.error('❌ Error deleting transaction:', error);

      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new Error('Server returned invalid response. This might be a temporary issue. Please refresh the page and try again.');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      throw error;
    }
  }

  /**
   * Get single transaction
   */
  static async getTransaction(id: string): Promise<WalletTransaction> {
    try {
      console.log(`💳 Fetching transaction: ${id}`);
      
      const response = await fetch(`${API_BASE}/transactions/${id}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch transaction');
      }
      
      console.log(`✅ Fetched transaction: ${result.data.description}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard statistics with filtering
   */
  static async getDashboard(
    dateFrom?: string,
    dateTo?: string,
    additionalFilters?: {
      categoryId?: string;
      type?: string;
      status?: string;
      dateRangeType?: string;
      yearMonth?: string;
      year?: string;
    }
  ): Promise<any> {
    try {
      console.log('📊 Fetching comprehensive dashboard statistics...');

      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      // Add additional filter parameters
      if (additionalFilters) {
        if (additionalFilters.categoryId) params.append('categoryId', additionalFilters.categoryId);
        if (additionalFilters.type) params.append('type', additionalFilters.type);
        if (additionalFilters.status) params.append('status', additionalFilters.status);
        if (additionalFilters.dateRangeType) params.append('dateRangeType', additionalFilters.dateRangeType);
        if (additionalFilters.yearMonth) params.append('yearMonth', additionalFilters.yearMonth);
        if (additionalFilters.year) params.append('year', additionalFilters.year);
      }

      const response = await fetch(`${API_BASE}/dashboard?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      console.log('✅ Fetched comprehensive dashboard statistics');
      return result.data;

    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const fetchCategories = WalletService.fetchCategories.bind(WalletService);
export const fetchTransactions = WalletService.fetchTransactions.bind(WalletService);
export const createTransaction = WalletService.createTransaction.bind(WalletService);
export const updateTransaction = WalletService.updateTransaction.bind(WalletService);
export const deleteTransaction = WalletService.deleteTransaction.bind(WalletService);
export const getTransaction = WalletService.getTransaction.bind(WalletService);
export const getDashboard = WalletService.getDashboard.bind(WalletService);

// Default export
export default WalletService;
