import { EventGuest, GuestCreateRequest } from '../../../types/apps/eventGuest';

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
  
  // Get all wedding guests
  static async getAllGuests(): Promise<EventGuest[]> {
    try {
      console.log('🔍 Fetching guests from API...');
      
      const response = await fetch(API_BASE_URL, {
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
        throw new Error(result.error || 'Failed to fetch guests');
      }

      console.log(`✅ Successfully fetched ${result.data.length} guests`);
      return result.data;

    } catch (error) {
      console.error('❌ Error fetching guests:', error);
      throw new Error(`Failed to fetch guests: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
