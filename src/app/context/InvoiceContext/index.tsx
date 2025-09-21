'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { InvoiceList, order } from '@/app/(DashboardLayout)/types/apps/invoice';
import InvoiceService, { InvoiceHeader } from '@/app/(DashboardLayout)/apps/invoice/services/invoiceService';
import axios from '@/utils/axios';

interface InvoiceContextType {
    invoices: InvoiceList[];
    loading: boolean;
    error: Error | null;
    deleteEmail: () => { },
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
                    invoiceNumber: inv.InvoiceNumber || '', // <-- Ensure invoiceNumber is mapped
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
                // The API now generates the invoice number, so we can remove it from here.
                // invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
                invoiceNumber: inv.InvoiceNumber, // <-- Add invoiceNumber from the API response
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
            setInvoices((prevInvoices) => [mapped, ...prevInvoices]); // Add to the top of the list
        } catch (error) {
            console.error('Error adding invoice:', error);
        }
    };

    //  Function to update an invoice
    const updateInvoice = async (updatedInvoice: InvoiceList) => {
        try {
            const payload = {
                invoiceNumber: updatedInvoice.invoiceNumber, // Pass the correct invoice number
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
            // Use the numeric ID for the API endpoint
            const res = await InvoiceService.updateInvoice(String(updatedInvoice.id), payload);
            const updated: any = res.data?.data || res.data;
            const mapped: InvoiceList = {
                id: updated.Id ?? updated.id,
                invoiceNumber: updated.InvoiceNumber ?? updated.invoiceNumber, // <-- Ensure invoiceNumber is mapped
                billFrom: updated.BillFrom ?? updated.billFrom,
                billFromEmail: updated.BillFromEmail ?? updated.billFromEmail ?? '',
                billFromAddress: updated.BillFromAddress ?? updated.billFromAddress ?? '',
                billFromPhone: Number(updated.BillFromPhone ?? updated.billFromPhone ?? 0),
                billFromFax: Number(updated.BillFromFax ?? updated.billFromFax ?? 0),
                billTo: updated.BillTo ?? updated.billTo,
                billToEmail: updated.BillToEmail ?? updated.billToEmail ?? '',
                billToAddress: updated.BillToAddress ?? updated.billToAddress ?? '',
                billToPhone: Number(updated.BillToPhone ?? updated.billToPhone ?? 0),
                billToFax: Number(updated.BillToFax ?? updated.billToFax ?? 0),
                orders: [],
                orderDate: updated.OrderDate ? new Date(updated.OrderDate) : new Date(),
                totalCost: updated.GrandTotal ?? updated.grandTotal ?? 0,
                vat: updated.VAT ?? updated.vat ?? 0,
                grandTotal: updated.GrandTotal ?? updated.grandTotal ?? 0,
                status: updated.Status ?? updated.status ?? 'Pending',
                completed: (updated.Status ?? updated.status) === 'Delivered',
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
