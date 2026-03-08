import {
    GuppyFish,
    GuppyBreeding,
    GuppyFishCreateRequest,
    GuppyBreedingCreateRequest,
    GuppyStats,
} from '../../../types/apps/guppyFish';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    performanceMs?: number;
    message?: string;
    error?: string;
}

const FISH_API = '/api/guppy-fish';
const BREEDING_API = '/api/guppy-breeding';

// ==========================================
// Guppy Fish Service
// ==========================================
export class GuppyFishService {

    static async getAll(options: {
        page?: number;
        pageSize?: number;
        search?: string;
        gender?: string;
        strain?: string;
        status?: string;
        sortField?: string;
        sortDirection?: string;
    } = {}): Promise<{
        fish: GuppyFish[];
        pagination: ApiResponse<any>['pagination'];
        performanceMs: number;
    }> {
        try {
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page.toString());
            if (options.pageSize) params.append('pageSize', options.pageSize.toString());
            if (options.search?.trim()) params.append('search', options.search.trim());
            if (options.gender?.trim()) params.append('gender', options.gender.trim());
            if (options.strain?.trim()) params.append('strain', options.strain.trim());
            if (options.status?.trim()) params.append('status', options.status.trim());
            if (options.sortField) params.append('sortField', options.sortField);
            if (options.sortDirection) params.append('sortDirection', options.sortDirection);

            const url = params.toString() ? `${FISH_API}?${params.toString()}` : FISH_API;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result: ApiResponse<GuppyFish[]> & { performanceMs: number } = await response.json();

            if (!result.success) throw new Error(result.error || 'Failed to fetch fish');

            return {
                fish: result.data,
                pagination: result.pagination,
                performanceMs: result.performanceMs || 0,
            };
        } catch (error) {
            console.error('❌ Error fetching guppy fish:', error);
            throw error;
        }
    }

    static async add(fishData: GuppyFishCreateRequest): Promise<{ id: string; message: string }> {
        try {
            const response = await fetch(FISH_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fishData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse<{ id: string; message: string }> = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to add fish');
            return result.data;
        } catch (error) {
            console.error('❌ Error adding fish:', error);
            throw error;
        }
    }

    static async update(id: string, fishData: GuppyFishCreateRequest): Promise<void> {
        try {
            const response = await fetch(FISH_API, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...fishData }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse<any> = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to update fish');
        } catch (error) {
            console.error('❌ Error updating fish:', error);
            throw error;
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            const response = await fetch(`${FISH_API}?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result: ApiResponse<any> = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to delete fish');
        } catch (error) {
            console.error('❌ Error deleting fish:', error);
            throw error;
        }
    }

    // Get stats calculated from all fish
    static async getStats(): Promise<GuppyStats> {
        try {
            const result = await this.getAll({ pageSize: 200 });
            const allFish = result.fish;

            const strainMap = new Map<string, number>();
            allFish.forEach(f => {
                if (f.strain) {
                    strainMap.set(f.strain, (strainMap.get(f.strain) || 0) + 1);
                }
            });

            const strainCounts = Array.from(strainMap.entries())
                .map(([strain, count]) => ({ strain, count }))
                .sort((a, b) => b.count - a.count);

            // Get breeding count
            let totalBreedings = 0;
            try {
                const breedingResult = await GuppyBreedingService.getAll({ pageSize: 1 });
                totalBreedings = breedingResult.pagination?.totalCount || 0;
            } catch {
                // ignore
            }

            return {
                totalFish: result.pagination?.totalCount || allFish.length,
                maleFish: allFish.filter(f => f.gender === 'Male').length,
                femaleFish: allFish.filter(f => f.gender === 'Female').length,
                activeFish: allFish.filter(f => f.status === 'Active').length,
                totalBreedings,
                strainCounts,
            };
        } catch (error) {
            console.error('❌ Error calculating stats:', error);
            return {
                totalFish: 0,
                maleFish: 0,
                femaleFish: 0,
                activeFish: 0,
                totalBreedings: 0,
                strainCounts: [],
            };
        }
    }
}

// ==========================================
// Guppy Breeding Service
// ==========================================
export class GuppyBreedingService {

    static async getAll(options: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    } = {}): Promise<{
        breedings: GuppyBreeding[];
        pagination: ApiResponse<any>['pagination'];
        performanceMs: number;
    }> {
        try {
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page.toString());
            if (options.pageSize) params.append('pageSize', options.pageSize.toString());
            if (options.search?.trim()) params.append('search', options.search.trim());
            if (options.status?.trim()) params.append('status', options.status.trim());

            const url = params.toString() ? `${BREEDING_API}?${params.toString()}` : BREEDING_API;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result: ApiResponse<GuppyBreeding[]> & { performanceMs: number } = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to fetch breedings');

            return {
                breedings: result.data,
                pagination: result.pagination,
                performanceMs: result.performanceMs || 0,
            };
        } catch (error) {
            console.error('❌ Error fetching breedings:', error);
            throw error;
        }
    }

    static async add(data: GuppyBreedingCreateRequest): Promise<{ id: string; message: string }> {
        try {
            const response = await fetch(BREEDING_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse<{ id: string; message: string }> = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to add breeding');
            return result.data;
        } catch (error) {
            console.error('❌ Error adding breeding:', error);
            throw error;
        }
    }

    static async update(id: string, data: GuppyBreedingCreateRequest): Promise<void> {
        try {
            const response = await fetch(BREEDING_API, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse<any> = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to update breeding');
        } catch (error) {
            console.error('❌ Error updating breeding:', error);
            throw error;
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            const response = await fetch(`${BREEDING_API}?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result: ApiResponse<any> = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to delete breeding');
        } catch (error) {
            console.error('❌ Error deleting breeding:', error);
            throw error;
        }
    }
}
