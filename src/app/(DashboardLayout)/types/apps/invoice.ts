export interface order {
  itemName: string;
  unitPrice: number;
  units: number;
  unitTotalPrice: number;
}

export interface InvoiceList {
  id: number;
  invoiceNumber: string; // Added this line
  billFrom: string;
  billFromEmail: string;
  billFromAddress: string;
  billFromPhone: number;
  billFromFax: number;
  billTo: string;
  billToEmail: string;
  billToAddress: string;
  billToPhone: number;
  billToFax: number;
  orders: order[];
  orderDate: Date;
  totalCost: number;
  vat: number;
  grandTotal: number;
  status: string;
  completed: boolean;
  isSelected: boolean;
}