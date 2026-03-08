// ==========================================
// Guppy Fish - Type Definitions
// ==========================================

// === Enums ===
export enum GuppyGender {
    MALE = 'Male',
    FEMALE = 'Female',
}

export enum GuppyStatus {
    ACTIVE = 'Active',
    DEAD = 'Dead',
    SOLD = 'Sold',
    GIVEN = 'Given',
}

// === Interfaces ===
export interface GuppyFish {
    id: string;
    fishCode: string;
    name: string | null;
    gender: GuppyGender;
    birthDate: string | null;
    photoUrl: string | null;

    // Appearance traits
    strain: string | null;
    color: string | null;
    tailType: string | null;
    size: string | null;

    // Metadata
    notes: string | null;
    status: GuppyStatus;
    createdDate: Date;
    updatedDate: Date;
    isActive: boolean;
}

export interface GuppyBreeding {
    id: string;
    maleFishId: string;
    femaleFishId: string;
    pairingDate: string;

    // Result
    birthDate: string | null;
    fryCount: number | null;
    survivalCount: number | null;
    survivalRate: number | null;

    // Metadata
    notes: string | null;
    status: BreedingStatus;
    createdDate: Date;
    updatedDate: Date;
    isActive: boolean;

    // Joined data (for display)
    maleFishCode?: string;
    maleFishName?: string;
    maleStrain?: string;
    femaleFishCode?: string;
    femaleFishName?: string;
    femaleStrain?: string;
}

export enum BreedingStatus {
    PAIRING = 'Pairing',
    PREGNANT = 'Pregnant',
    BORN = 'Born',
    COMPLETED = 'Completed',
    FAILED = 'Failed',
}

// === Request/Response types ===
export interface GuppyFishCreateRequest {
    fishCode: string;
    name?: string | null;
    gender: GuppyGender;
    birthDate?: string | null;
    photoUrl?: string | null;
    strain?: string | null;
    color?: string | null;
    tailType?: string | null;
    size?: string | null;
    notes?: string | null;
    status?: GuppyStatus;
}

export interface GuppyBreedingCreateRequest {
    maleFishId: string;
    femaleFishId: string;
    pairingDate: string;
    birthDate?: string | null;
    fryCount?: number | null;
    survivalCount?: number | null;
    notes?: string | null;
    status?: BreedingStatus;
}

export interface GuppyFilters {
    search: string;
    gender: GuppyGender | '';
    strain: string;
    status: GuppyStatus | '';
}

export interface GuppyStats {
    totalFish: number;
    maleFish: number;
    femaleFish: number;
    activeFish: number;
    totalBreedings: number;
    strainCounts: { strain: string; count: number }[];
}
