'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UsePaginationProps {
  data: any[];
  defaultItemsPerPage?: number;
  searchTerm?: string;
  filterFn?: (item: any, searchTerm: string) => boolean;
}

interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  paginatedData: any[];
  startIndex: number;
  endIndex: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export const usePagination = ({
  data,
  defaultItemsPerPage = 10,
  searchTerm = '',
  filterFn
}: UsePaginationProps): UsePaginationReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial values from URL params
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialItemsPerPage = parseInt(searchParams.get('limit') || defaultItemsPerPage.toString());
  
  const [currentPage, setCurrentPageState] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    if (filterFn) {
      return data.filter(item => filterFn(item, searchTerm));
    }
    return data;
  }, [data, searchTerm, filterFn]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPageState(1);
      updateURL(1, itemsPerPage);
    }
  }, [searchTerm]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPageState(totalPages);
      updateURL(totalPages, itemsPerPage);
    }
  }, [totalPages, currentPage, itemsPerPage]);

  // Update URL with current pagination state
  const updateURL = (page: number, limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const setCurrentPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPageState(validPage);
    updateURL(validPage, itemsPerPage);
  };

  const setItemsPerPage = (items: number) => {
    setItemsPerPageState(items);
    setCurrentPageState(1);
    updateURL(1, items);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate pagination data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    setCurrentPage,
    setItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious
  };
};
