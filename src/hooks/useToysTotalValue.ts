import { useState, useEffect, useCallback } from 'react';

// Interface for the API response data
export interface ToysTotalValueData {
  totalValue: number;
  totalCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

// Interface for the complete API response
export interface ToysTotalValueResponse {
  success: boolean;
  message: string;
  data: ToysTotalValueData;
  filters?: {
    search?: string | null;
    categoryId?: string | null;
    brandName?: string | null;
    status?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    ageRange?: string | null;
    inStock?: boolean | null;
  };
  error?: string;
}

// Interface for filter parameters
export interface ToysTotalValueFilters {
  search?: string;
  categoryId?: string;
  brandName?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  ageRange?: string;
  inStock?: boolean;
}

// Custom hook for fetching toys total value
export function useToysTotalValue(filters?: ToysTotalValueFilters) {
  const [data, setData] = useState<ToysTotalValueData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to build query string from filters
  const buildQueryString = useCallback((filters?: ToysTotalValueFilters): string => {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.brandName) params.append('brandName', filters.brandName);
    if (filters.status) params.append('status', filters.status);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.ageRange) params.append('ageRange', filters.ageRange);
    if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
    
    return params.toString() ? `?${params.toString()}` : '';
  }, []);

  // Function to fetch data
  const fetchTotalValue = useCallback(async (currentFilters?: ToysTotalValueFilters) => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(currentFilters);
      const url = `/api/toys/total-value${queryString}`;
      
      console.log('🔍 Fetching toys total value from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ToysTotalValueResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to fetch toys total value');
      }

      console.log('✅ Toys total value fetched successfully:', result.data);
      setData(result.data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching toys total value:', errorMessage);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchTotalValue(filters);
  }, [fetchTotalValue, filters]);

  // Function to refresh data
  const refresh = useCallback(() => {
    fetchTotalValue(filters);
  }, [fetchTotalValue, filters]);

  return {
    data,
    loading,
    error,
    refresh,
    fetchTotalValue
  };
}

// Helper function to format currency in VND (similar to existing formatVND)
export function formatVND(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ VNĐ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu VNĐ`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K VNĐ`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' VNĐ';
}

// Helper function to format number with Vietnamese locale
export function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN');
}

// Default export
export default useToysTotalValue;
