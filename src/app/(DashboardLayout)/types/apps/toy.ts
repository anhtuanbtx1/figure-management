export interface Toy {
  id: string;
  name: string;
  description: string;
  image: string;
  category: ToyCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  status: ToyStatus;
  ageRange: string;
  brand: string;
  material: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  colors: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
}

export interface ToyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export enum ToyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

export interface ToyFilters {
  search: string;
  category: string;
  status: ToyStatus | '';
  priceRange: {
    min: number;
    max: number;
  };
  brand: string;
  ageRange: string;
  inStock: boolean;
}

export interface ToyTableState {
  toys: Toy[];
  filteredToys: Toy[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sorting: {
    field: keyof Toy;
    direction: 'asc' | 'desc';
  };
  filters: ToyFilters;
  selectedToys: string[];
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

// Notification types
export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface ToyNotificationMessages {
  create: {
    success: string;
    error: string;
  };
  update: {
    success: string;
    error: string;
  };
  delete: {
    success: string;
    error: string;
  };
}

export interface ToyTableProps {
  toys: Toy[];
  loading: boolean;
  onEdit: (toy: Toy) => void;
  onDelete: (toyId: string) => Promise<void>;
  onView: (toy: Toy) => void;
  onSort: (field: keyof Toy, direction: 'asc' | 'desc') => void;
  sortField?: keyof Toy;
  sortDirection?: 'asc' | 'desc';
  selectedToys: string[];
  onSelectToy: (toyId: string) => void;
  onSelectAll: (selected: boolean) => void;
}

export interface ToyFiltersProps {
  filters: ToyFilters;
  categories: ToyCategory[];
  brands: string[];
  onFiltersChange: (filters: Partial<ToyFilters>) => void;
  onClearFilters: () => void;
}

export interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: ToyStatus) => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
}

// API Response types
export interface ToyListResponse {
  toys: Toy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ToyCreateRequest {
  name: string;
  description: string;
  image: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  stock: number;
  ageRange: string;
  brand: string;
  material: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  colors: string[];
  tags: string[];
}

export interface ToyUpdateRequest extends Partial<ToyCreateRequest> {
  id: string;
  status?: ToyStatus;
}
