export enum GuestStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
}

export interface EventGuest {
  id: string;
  fullName: string;
  unit: string;
  numberOfPeople: number;
  contributionAmount: number;
  status: GuestStatus;
  relationship: string | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
  isActive: boolean;
}

export interface GuestFilters {
  search: string;
  status: GuestStatus | '';
  contributionRange: {
    min: number;
    max: number;
  };
}

export interface GuestCreateRequest {
  fullName: string;
  unit: string;
  numberOfPeople: number;
  contributionAmount: number;
  status: GuestStatus;
  relationship?: string | null;
  notes: string;
}

export interface GuestTableProps {
  guests: EventGuest[];
  loading: boolean;
  onEdit: (guest: EventGuest) => void;
  onDelete: (guestId: string) => void;
  onView: (guest: EventGuest) => void;
  onSort: (field: keyof EventGuest, direction: 'asc' | 'desc') => void;
  sortField: keyof EventGuest;
  sortDirection: 'asc' | 'desc';
  selectedGuests: string[];
  onSelectGuest: (guestId: string) => void;
  onSelectAll: (selected: boolean) => void;
}

export interface GuestFiltersProps {
  filters: GuestFilters;
  onFiltersChange: (filters: Partial<GuestFilters>) => void;
  onClearFilters: () => void;
}

export interface GuestPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

export interface AddGuestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (guestData: GuestCreateRequest) => void;
  editGuest?: EventGuest | null;
}

export interface BulkGuestActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: GuestStatus) => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
}

export interface GuestStats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  totalContribution: number;
  averageContribution: number;
  totalPeople?: number;
}
