import axios from '@/utils/axios';

export interface InvoiceFilters {
  search?: string;
  status?: string;
  dateFrom?: string; // ISO date
  dateTo?: string;   // ISO date
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface InvoiceHeader {
  id?: string;
  invoiceNumber: string;
  billFrom: string;
  billFromEmail?: string;
  billFromAddress?: string;
  billFromPhone?: string;
  billFromFax?: string;
  billTo: string;
  billToEmail?: string;
  billToAddress?: string;
  billToPhone?: string;
  billToFax?: string;
  orderDate?: string; // ISO date
  subTotal?: number;
  vat?: number;
  grandTotal?: number;
  status?: string; // Pending, Shipped, Delivered, Cancelled
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceListResponse {
  success: boolean;
  data: InvoiceHeader[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
  filters: any;
}

const InvoiceService = {
  async fetchInvoices(filters: InvoiceFilters = {}): Promise<InvoiceListResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    if (filters.sortField) params.append('sortField', filters.sortField);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

    const res = await axios.get(`/api/invoices${params.toString() ? `?${params.toString()}` : ''}`);
    return res.data;
  },

  async createInvoice(payload: InvoiceHeader & { subTotal?: number; grandTotal?: number }): Promise<{ success: boolean; data: InvoiceHeader }>{
    const res = await axios.post('/api/invoices', payload);
    return res.data;
  },

  async updateInvoice(id: string, payload: InvoiceHeader): Promise<{ success: boolean; data: InvoiceHeader }>{
    const res = await axios.put(`/api/invoices/${id}`, payload);
    return res.data;
  },

  async deleteInvoice(id: string): Promise<{ success: boolean; data: any }>{
    const res = await axios.delete(`/api/invoices/${id}`);
    return res.data;
  }
};

export default InvoiceService;
