USE zen50558_ManagementStore;
GO

-- Ensure Id is not the one being set to inv-... externally in create-with-items SP
-- Our SP already generates @NewId using NEWID(), so the error is likely due to InvoiceNumber unique key.
-- We'll add a unique constraint on InvoiceNumber if not existing and keep it collision-free.

-- Show existing constraints (debug):
-- SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME='Invoices';

-- No structural change needed for Id; fix FE to always send unique invoiceNumber.

