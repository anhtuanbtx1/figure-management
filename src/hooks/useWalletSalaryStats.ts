import { useState, useEffect } from 'react';
import axios from 'axios';

interface SalaryStats {
  category: {
    id: string;
    name: string;
    color: string;
  };
  currentMonth: {
    totalSalary: number;
    transactionCount: number;
    avgSalary: number;
    estimatedProfit: number;
  };
  lastMonth: {
    totalSalary: number;
    transactionCount: number;
    avgSalary: number;
    estimatedProfit: number;
  };
  comparison: {
    salaryChange: number;
    salaryChangePercent: number;
    trend: 'up' | 'down' | 'stable';
  };
  monthlyTrend: Array<{
    month: string;
    totalSalary: number;
    transactionCount: number;
    avgSalary: number;
    estimatedProfit: number;
  }>;
  yearToDate: {
    totalSalary: number;
    monthsWithSalary: number;
    avgMonthlySalary: number;
    totalProfit: number;
    year: number;
    formattedTotal: string;
  };
  recentSalaries: Array<{
    id: string;
    amount: number;
    description: string;
    transactionDate: string;
    status: string;
  }>;
}

interface UseWalletSalaryStatsReturn {
  data: SalaryStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWalletSalaryStats(months: number = 6): UseWalletSalaryStatsReturn {
  const [data, setData] = useState<SalaryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaryStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/wallet/salary-stats?months=${months}`);
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch salary statistics');
      }
    } catch (err) {
      console.error('Error fetching salary statistics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching salary statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryStats();
  }, [months]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSalaryStats
  };
}

// Helper function to format currency in VND
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0 as number,
    maximumFractionDigits: 0 as number
  }).format(amount) + ' VNĐ';
}

// Helper function to get month name in Vietnamese
export function getMonthNameVN(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return monthNames[parseInt(month) - 1] || month;
}

// Helper function to get short month name
export function getShortMonthName(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return monthNames[parseInt(month) - 1] || month;
}
