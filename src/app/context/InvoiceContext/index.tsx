'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { InvoiceList, order } from '@/app/(DashboardLayout)/types/apps/invoice';
import InvoiceService, { InvoiceHeader } from '@/app/(DashboardLayout)/apps/invoice/services/invoiceService';
import axios from '@/utils/axios';

interface InvoiceContextType {
    invoices: InvoiceList[];
    loading: boolean;
    error: Error | null;
    deleteEmail: () => {},
    addInvoice: (newInvoice: InvoiceList) => void;
    updateInvoice: (updatedInvoice: InvoiceList) => void;
}

export const InvoiceContext = createContext<InvoiceContextType | any>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [invoices, setInvoices] = useState<InvoiceList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await InvoiceService.fetchInvoices({ page: 1, pageSize: 50, sortField: 'CreatedAt', sortDirection: 'DESC' });
                // Map backend data to InvoiceList type minimally used by UI
                const mapped: InvoiceList[] = (res.data || []).map((inv: any) => ({
                    id: inv.Id || inv.id,
                    billFrom: inv.BillFrom || '',
                    billFromEmail: inv.BillFromEmail || '',
                    billFromAddress: inv.BillFromAddress || '',
                    billFromPhone: inv.BillFromPhone ? Number(inv.BillFromPhone) : 0,
                    billFromFax: inv.BillFromFax ? Number(inv.BillFromFax) : 0,
                    billTo: inv.BillTo || '',
                    billToEmail: inv.BillToEmail || '',
                    billToAddress: inv.BillToAddress || '',
                    billToPhone: inv.BillToPhone ? Number(inv.BillToPhone) : 0,
                    billToFax: inv.BillToFax ? Number(inv.BillToFax) : 0,
                    orders: [],
                    orderDate: inv.OrderDate ? new Date(inv.OrderDate) : new Date(),
                    totalCost: inv.GrandTotal ?? inv.SubTotal ?? 0,
                    vat: inv.VAT ?? 0,
                    grandTotal: inv.GrandTotal ?? 0,
                    status: inv.Status || 'Pending',
                    completed: inv.Status === 'Delivered',
                    isSelected: false,
                }));
                setInvoices(mapped);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching invoices', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to delete an invoice
    const deleteInvoice = async (id: number) => {
        try {
            // Our DB id is NVARCHAR string; UI uses number in mock. Cast to string.
            await InvoiceService.deleteInvoice(String(id));
            setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== id));
        } catch (error) {
            console.error('Error deleting invoice:', error);

        }
    };

    const addInvoice = async (newInvoice: InvoiceList) => {
        try {
            // Build payload for header create
            const header = {
                // Generate a unique, non-colliding invoice number
                invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                billFrom: newInvoice.billFrom,
                billFromEmail: newInvoice.billFromEmail,
                billFromAddress: newInvoice.billFromAddress,
                billFromPhone: String(newInvoice.billFromPhone || ''),
                billFromFax: String(newInvoice.billFromFax || ''),
                billTo: newInvoice.billTo,
                billToEmail: newInvoice.billToEmail,
                billToAddress: newInvoice.billToAddress,
                billToPhone: String(newInvoice.billToPhone || ''),
                billToFax: String(newInvoice.billToFax || ''),
                orderDate: newInvoice.orderDate?.toISOString?.() || new Date().toISOString(),
                status: newInvoice.status || 'Pending',
                notes: '',
            };

            const items = (newInvoice.orders || []).map((o: any) => ({
                itemName: o.itemName,
                unitPrice: Number(o.unitPrice) || 0,
                units: Number(o.units) || 0,
            }));

            const res = await axios.post('/api/invoices/create-with-items', {
                invoiceHeader: header,
                items,
            });
            const inv: any = res.data?.data || res.data;
            const mapped: InvoiceList = {
                id: inv.Id,
                billFrom: inv.BillFrom,
                billFromEmail: inv.BillFromEmail || '',
                billFromAddress: inv.BillFromAddress || '',
                billFromPhone: inv.BillFromPhone ? Number(inv.BillFromPhone) : 0,
                billFromFax: inv.BillFromFax ? Number(inv.BillFromFax) : 0,
                billTo: inv.BillTo,
                billToEmail: inv.BillToEmail || '',
                billToAddress: inv.BillToAddress || '',
                billToPhone: inv.BillToPhone ? Number(inv.BillToPhone) : 0,
                billToFax: inv.BillToFax ? Number(inv.BillToFax) : 0,
                orders: [],
                orderDate: inv.OrderDate ? new Date(inv.OrderDate) : new Date(),
                totalCost: inv.GrandTotal ?? 0,
                vat: inv.VAT ?? 0,
                grandTotal: inv.GrandTotal ?? 0,
                status: inv.Status || 'Pending',
                completed: inv.Status === 'Delivered',
                isSelected: false,
            };
            setInvoices((prevInvoices) => [...prevInvoices, mapped]);
        } catch (error) {
            console.error('Error adding invoice:', error);
        }
    };

    //  Function to update an invoice
    const updateInvoice = async (updatedInvoice: InvoiceList) => {
        try {
            const payload = {
                invoiceNumber: String(updatedInvoice.id),
                billFrom: updatedInvoice.billFrom,
                billFromEmail: updatedInvoice.billFromEmail,
                billFromAddress: updatedInvoice.billFromAddress,
                billFromPhone: String(updatedInvoice.billFromPhone || ''),
                billFromFax: String(updatedInvoice.billFromFax || ''),
                billTo: updatedInvoice.billTo,
                billToEmail: updatedInvoice.billToEmail,
                billToAddress: updatedInvoice.billToAddress,
                billToPhone: String(updatedInvoice.billToPhone || ''),
                billToFax: String(updatedInvoice.billToFax || ''),
                orderDate: updatedInvoice.orderDate?.toISOString?.() || new Date().toISOString(),
                subTotal: updatedInvoice.totalCost ?? 0,
                vat: updatedInvoice.vat || 0,
                grandTotal: updatedInvoice.grandTotal ?? ((updatedInvoice.totalCost || 0) + (updatedInvoice.vat || 0)),
                status: updatedInvoice.status,
                notes: '',
            };
            const res = await InvoiceService.updateInvoice(String(updatedInvoice.id), payload);
            const updated: any = res.data;
            const mapped: InvoiceList = {
                id: (updated as any).Id ?? (updated as any).id,
                billFrom: (updated as any).BillFrom ?? (updated as any).billFrom,
                billFromEmail: (updated as any).BillFromEmail ?? (updated as any).billFromEmail ?? '',
                billFromAddress: (updated as any).BillFromAddress ?? (updated as any).billFromAddress ?? '',
                billFromPhone: Number((updated as any).BillFromPhone ?? (updated as any).billFromPhone ?? 0),
                billFromFax: Number((updated as any).BillFromFax ?? (updated as any).billFromFax ?? 0),
                billTo: (updated as any).BillTo ?? (updated as any).billTo,
                billToEmail: (updated as any).BillToEmail ?? (updated as any).billToEmail ?? '',
                billToAddress: (updated as any).BillToAddress ?? (updated as any).billToAddress ?? '',
                billToPhone: Number((updated as any).BillToPhone ?? (updated as any).billToPhone ?? 0),
                billToFax: Number((updated as any).BillToFax ?? (updated as any).billToFax ?? 0),
                orders: [],
                orderDate: (updated as any).OrderDate ? new Date((updated as any).OrderDate) : new Date(),
                totalCost: (updated as any).GrandTotal ?? (updated as any).grandTotal ?? 0,
                vat: (updated as any).VAT ?? (updated as any).vat ?? 0,
                grandTotal: (updated as any).GrandTotal ?? (updated as any).grandTotal ?? 0,
                status: (updated as any).Status ?? (updated as any).status ?? 'Pending',
                completed: ((updated as any).Status ?? (updated as any).status) === 'Delivered',
                isSelected: false,
            };
            setInvoices((prevInvoices) =>
                prevInvoices.map((invoice) => (invoice.id === mapped.id ? mapped : invoice))
            );
        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };

    return (
        <InvoiceContext.Provider value={{ invoices, loading, error, deleteInvoice, addInvoice, updateInvoice }}>
            {children}
        </InvoiceContext.Provider>
    );
};
