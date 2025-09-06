import { EventGuest, GuestCreateRequest, GuestStatus } from '../../../types/apps/eventGuest';
import * as XLSX from 'xlsx';

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
}

interface GuestStats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  totalContribution: number;
  averageContribution: number;
}

// Base API URL
const API_BASE_URL = '/api/wedding-guests';

// Guest Service Class
export class GuestService {
  
  // Get wedding guests with pagination and performance optimization
  static async getAllGuests(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortDirection?: string;
  } = {}): Promise<{
    guests: EventGuest[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    performanceMs: number;
  }> {
    try {
      const startTime = Date.now();
      console.log('🔍 Fetching guests from API with options:', options);

      // Build query parameters
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.pageSize) params.append('pageSize', options.pageSize.toString());
      if (options.search?.trim()) params.append('search', options.search.trim());
      if (options.status?.trim()) params.append('status', options.status.trim());
      if (options.sortField) params.append('sortField', options.sortField);
      if (options.sortDirection) params.append('sortDirection', options.sortDirection);

      const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<EventGuest[]> & {
        pagination: any;
        performanceMs: number;
      } = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch guests');
      }

      const clientTime = Date.now() - startTime;
      console.log(`✅ Successfully fetched ${result.data.length} guests in ${clientTime}ms (server: ${result.performanceMs}ms)`);

      return {
        guests: result.data,
        pagination: result.pagination,
        performanceMs: result.performanceMs,
      };

    } catch (error) {
      console.error('❌ Error fetching guests:', error);
      throw new Error(`Failed to fetch guests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Legacy method for backward compatibility
  static async getAllGuestsLegacy(): Promise<EventGuest[]> {
    const result = await this.getAllGuests({ pageSize: 1000 }); // Get large page for legacy support
    return result.guests;
  }

  // Search wedding guests with server-side filtering
  static async searchGuests(searchTerm: string, status?: string): Promise<EventGuest[]> {
    try {
      console.log('🔍 Searching guests from API...', { searchTerm, status });

      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (status && status.trim()) {
        params.append('status', status.trim());
      }

      const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<EventGuest[]> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to search guests');
      }

      console.log(`✅ Successfully found ${result.data.length} guests matching search`);
      return result.data;

    } catch (error) {
      console.error('❌ Error searching guests:', error);
      throw error;
    }
  }

  // Update existing wedding guest
  static async updateGuest(id: string, guestData: GuestCreateRequest): Promise<void> {
    try {
      console.log('✏️ Updating guest via API...', { id, guestData });

      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...guestData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update guest');
      }

      console.log(`✅ Successfully updated guest: ${guestData.fullName}`);

    } catch (error) {
      console.error('❌ Error updating guest:', error);
      throw error;
    }
  }

  // Get wedding guests statistics
  static async getGuestStatistics(options: {
    search?: string;
    status?: string;
  } = {}): Promise<{
    overview: {
      totalGuests: number;
      totalPeople: number;
      totalContribution: number;
      avgGiftAmount: number;
      maxGiftAmount: number;
      minGiftAmount: number;
    };
    byStatus: {
      confirmed: {
        guests: number;
        people: number;
        contribution: number;
      };
      pending: {
        guests: number;
        people: number;
        contribution: number;
      };
      declined: {
        guests: number;
      };
      maybe: {
        guests: number;
      };
    };
    topUnits: Array<{
      unit: string;
      count: number;
    }>;
    filters: {
      search: string | null;
      status: string | null;
    };
  }> {
    try {
      const startTime = Date.now();
      console.log('📊 Fetching guest statistics...', options);

      // Build query parameters
      const params = new URLSearchParams();
      if (options.search?.trim()) params.append('search', options.search.trim());
      if (options.status?.trim()) params.append('status', options.status.trim());

      const url = params.toString() ? `${API_BASE_URL}/stats?${params.toString()}` : `${API_BASE_URL}/stats`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> & {
        performanceMs: number;
      } = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch statistics');
      }

      const clientTime = Date.now() - startTime;
      console.log(`✅ Successfully fetched statistics in ${clientTime}ms (server: ${result.performanceMs}ms)`);

      return result.data;

    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get guest statistics
  static async getGuestStats(): Promise<GuestStats> {
    try {
      console.log('📊 Fetching guest statistics...');

      const response = await fetch(API_BASE_URL, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<GuestStats> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch statistics');
      }

      // Ensure all values are valid numbers
      const stats = result.data;
      const safeStats: GuestStats = {
        totalGuests: Number(stats.totalGuests) || 0,
        confirmedGuests: Number(stats.confirmedGuests) || 0,
        pendingGuests: Number(stats.pendingGuests) || 0,
        declinedGuests: Number(stats.declinedGuests) || 0,
        totalContribution: Number(stats.totalContribution) || 0,
        averageContribution: Number(stats.averageContribution) || 0,
      };

      console.log('✅ Successfully fetched guest statistics:', safeStats);
      return safeStats;

    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      // Return default stats if API fails
      return {
        totalGuests: 0,
        confirmedGuests: 0,
        pendingGuests: 0,
        declinedGuests: 0,
        totalContribution: 0,
        averageContribution: 0,
      };
    }
  }

  // Add new wedding guest
  static async addGuest(guestData: GuestCreateRequest): Promise<{ id: string; message: string }> {
    try {
      console.log('➕ Adding new guest:', guestData);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ id: string; message: string }> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add guest');
      }

      console.log(`✅ Successfully added guest: ${result.data.message}`);
      return result.data;

    } catch (error) {
      console.error('❌ Error adding guest:', error);
      throw new Error(`Failed to add guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Refresh data (force cache invalidation)
  static async refreshData(): Promise<EventGuest[]> {
    try {
      // Add timestamp to force cache invalidation
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<EventGuest[]> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh data');
      }

      return result.data;

    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      throw error;
    }
  }

  // Export guests to Excel
  static exportToExcel(guests: EventGuest[], filename: string = 'danh-sach-khach-moi') {
    try {
      console.log('📊 Exporting guests to Excel...');
      
      // Map guest status to Vietnamese
      const getStatusText = (status: GuestStatus) => {
        switch (status) {
          case GuestStatus.CONFIRMED:
            return 'Đã xác nhận';
          case GuestStatus.PENDING:
            return 'Chờ phản hồi';
          case GuestStatus.DECLINED:
            return 'Từ chối';
          default:
            return status;
        }
      };

      // Format currency
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
      };

      // Transform data for Excel
      const excelData = guests.map((guest, index) => ({
        'STT': index + 1,
        'Mã khách': guest.id,
        'Họ và tên': guest.fullName,
        'Đơn vị': guest.unit,
        'Số người': guest.numberOfPeople,
        'Trạng thái': getStatusText(guest.status),
        'Số tiền đóng góp (VNĐ)': formatCurrency(guest.contributionAmount || 0),
        'Mối quan hệ': guest.relationship || '',
        'Ghi chú': guest.notes || '',
        'Ngày tạo': guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('vi-VN') : '',
        'Ngày cập nhật': guest.updatedAt ? new Date(guest.updatedAt).toLocaleDateString('vi-VN') : '',
      }));

      // Calculate statistics
      const totalGuests = guests.length;
      const confirmedGuests = guests.filter(g => g.status === GuestStatus.CONFIRMED).length;
      const pendingGuests = guests.filter(g => g.status === GuestStatus.PENDING).length;
      const declinedGuests = guests.filter(g => g.status === GuestStatus.DECLINED).length;
      const totalPeople = guests.reduce((sum, g) => sum + (g.numberOfPeople || 0), 0);
      const totalContribution = guests.reduce((sum, g) => sum + (g.contributionAmount || 0), 0);

      // Add summary rows
      const summaryData = [
        {},
        { 'STT': '', 'Mã khách': 'THỐNG KÊ TỔNG HỢP' },
        { 'STT': '', 'Mã khách': 'Tổng số khách mời:', 'Họ và tên': totalGuests },
        { 'STT': '', 'Mã khách': 'Đã xác nhận:', 'Họ và tên': confirmedGuests },
        { 'STT': '', 'Mã khách': 'Chờ phản hồi:', 'Họ và tên': pendingGuests },
        { 'STT': '', 'Mã khách': 'Từ chối:', 'Họ và tên': declinedGuests },
        { 'STT': '', 'Mã khách': 'Tổng số người:', 'Họ và tên': totalPeople },
        { 'STT': '', 'Mã khách': 'Tổng tiền đóng góp:', 'Họ và tên': formatCurrency(totalContribution) + ' VNĐ' },
      ];

      // Combine data
      const finalData = [...excelData, ...summaryData];

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(finalData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách khách mời');

      // Set column widths
      const columnWidths = [
        { wch: 5 },   // STT
        { wch: 10 },  // Mã khách
        { wch: 25 },  // Họ và tên
        { wch: 20 },  // Đơn vị
        { wch: 10 },  // Số người
        { wch: 15 },  // Trạng thái
        { wch: 20 },  // Số tiền đóng góp
        { wch: 15 },  // Mối quan hệ
        { wch: 30 },  // Ghi chú
        { wch: 12 },  // Ngày tạo
        { wch: 12 },  // Ngày cập nhật
      ];
      worksheet['!cols'] = columnWidths;

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, fullFilename);

      console.log(`✅ Successfully exported ${guests.length} guests to Excel`);
      return fullFilename;

    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      throw new Error(`Failed to export to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper function for backward compatibility
export const getGuestStats = async (guests: EventGuest[]) => {
  // If guests array is provided, calculate stats from it
  if (guests && guests.length > 0) {
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.status === 'CONFIRMED').length;
    const pendingGuests = guests.filter(g => g.status === 'PENDING').length;
    const declinedGuests = guests.filter(g => g.status === 'DECLINED').length;

    // Safely calculate total contribution with null/undefined handling
    const totalContribution = guests.reduce((sum, g) => {
      const amount = g.contributionAmount;
      if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return sum + 0;
      }
      return sum + Number(amount);
    }, 0);

    const averageContribution = totalGuests > 0 ? totalContribution / totalGuests : 0;

    console.log('📊 Frontend stats calculated:', {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalContribution,
      averageContribution
    });

    return {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalContribution,
      averageContribution,
    };
  }

  // Otherwise, fetch from API
  return await GuestService.getGuestStats();
};

export default GuestService;
