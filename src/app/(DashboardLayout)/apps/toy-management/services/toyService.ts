import { Toy, ToyCategory, ToyFilters, ToyCreateRequest, ToyUpdateRequest, ToyListResponse, ToyStatus } from '../../../types/apps/toy';

// Base API URL
const API_BASE = '/api/toys';

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}

interface ToysApiResponse {
  success: boolean;
  toys: Toy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

// Helper function to build query parameters
function buildQueryParams(filters: ToyFilters, page: number, pageSize: number, sortField: string, sortDirection: string): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.status) params.append('status', filters.status);
  if (filters.priceRange.min > 0) params.append('minPrice', filters.priceRange.min.toString());
  if (filters.priceRange.max < 5000000) params.append('maxPrice', filters.priceRange.max.toString());
  if (filters.ageRange) params.append('ageRange', filters.ageRange);
  if (filters.inStock) params.append('inStock', 'true');
  
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  params.append('sortField', sortField);
  params.append('sortDirection', sortDirection);
  
  return params;
}

// Helper function to handle API errors
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  
  return data;
}

// Toy Service Class
export class ToyService {

  /**
   * Health check to verify API readiness
   */
  static async checkHealth(): Promise<any> {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Fetch toys with filtering, sorting, and pagination
   */
  static async fetchToys(
    filters: ToyFilters,
    page: number = 1,
    pageSize: number = 20,
    sortField: string = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<ToyListResponse> {
    try {
      const params = buildQueryParams(filters, page, pageSize, sortField, sortDirection);
      const response = await fetch(`${API_BASE}?${params}`);
      const data = await handleApiResponse<ToysApiResponse>(response);
      
      return {
        toys: data.toys,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error fetching toys:', error);
      throw error;
    }
  }

  /**
   * Fetch single toy by ID
   */
  static async fetchToyById(id: string): Promise<Toy> {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      const data = await handleApiResponse<ApiResponse<Toy>>(response);
      return data.data;
    } catch (error) {
      console.error(`Error fetching toy ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new toy
   */
  static async createToy(toyData: ToyCreateRequest): Promise<Toy> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toyData),
      });
      
      const data = await handleApiResponse<ApiResponse<Toy>>(response);
      return data.data;
    } catch (error) {
      console.error('Error creating toy:', error);
      throw error;
    }
  }

  /**
   * Update existing toy
   */
  static async updateToy(id: string, toyData: ToyUpdateRequest): Promise<Toy> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toyData),
      });
      
      const data = await handleApiResponse<ApiResponse<Toy>>(response);
      return data.data;
    } catch (error) {
      console.error(`Error updating toy ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete toy (soft delete)
   */
  static async deleteToy(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      
      await handleApiResponse<ApiResponse<void>>(response);
    } catch (error) {
      console.error(`Error deleting toy ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all categories
   */
  static async fetchCategories(): Promise<ToyCategory[]> {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await handleApiResponse<ApiResponse<ToyCategory[]>>(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Fetch all brands
   */
  static async fetchBrands(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/brands`);
      const data = await handleApiResponse<ApiResponse<string[]>>(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Bulk delete toys
   */
  static async bulkDeleteToys(ids: string[]): Promise<void> {
    try {
      const deletePromises = ids.map(id => this.deleteToy(id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error bulk deleting toys:', error);
      throw error;
    }
  }

  /**
   * Bulk update toy status
   */
  static async bulkUpdateToyStatus(ids: string[], status: string): Promise<void> {
    try {
      const updatePromises = ids.map(id => this.updateToy(id, { status } as ToyUpdateRequest));
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error bulk updating toy status:', error);
      throw error;
    }
  }

  /**
   * Search toys by query
   */
  static async searchToys(query: string, limit: number = 10): Promise<Toy[]> {
    try {
      const filters: ToyFilters = {
        search: query,
        category: '',
        status: '',
        priceRange: { min: 0, max: 5000000 },
        brand: '',
        ageRange: '',
        inStock: false,
      };
      
      const result = await this.fetchToys(filters, 1, limit);
      return result.toys;
    } catch (error) {
      console.error('Error searching toys:', error);
      throw error;
    }
  }

  /**
   * Get featured toys
   */
  static async getFeaturedToys(limit: number = 10): Promise<Toy[]> {
    try {
      // This would require a specific API endpoint or filter
      // For now, we'll fetch toys and filter on frontend
      const filters: ToyFilters = {
        search: '',
        category: '',
        status: ToyStatus.ACTIVE,
        priceRange: { min: 0, max: 5000000 },
        brand: '',
        ageRange: '',
        inStock: false,
      };
      
      const result = await this.fetchToys(filters, 1, limit, 'rating', 'desc');
      return result.toys.filter(toy => toy.isFeatured);
    } catch (error) {
      console.error('Error fetching featured toys:', error);
      throw error;
    }
  }

  /**
   * Get new toys
   */
  static async getNewToys(limit: number = 10): Promise<Toy[]> {
    try {
      const filters: ToyFilters = {
        search: '',
        category: '',
        status: ToyStatus.ACTIVE,
        priceRange: { min: 0, max: 5000000 },
        brand: '',
        ageRange: '',
        inStock: false,
      };
      
      const result = await this.fetchToys(filters, 1, limit, 'createdAt', 'desc');
      return result.toys.filter(toy => toy.isNew);
    } catch (error) {
      console.error('Error fetching new toys:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const fetchToys = ToyService.fetchToys.bind(ToyService);
export const fetchToyById = ToyService.fetchToyById.bind(ToyService);
export const createToy = ToyService.createToy.bind(ToyService);
export const updateToy = ToyService.updateToy.bind(ToyService);
export const deleteToy = ToyService.deleteToy.bind(ToyService);
export const fetchCategories = ToyService.fetchCategories.bind(ToyService);
export const fetchBrands = ToyService.fetchBrands.bind(ToyService);

// Default export
export default ToyService;
