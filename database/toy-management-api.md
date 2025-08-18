# Toy Management API Documentation

## Database Schema Overview

### Tables Created:
- **ToyCategories** - Product categories (8 sample categories)
- **ToyBrands** - Toy brands (10 sample brands)  
- **Toys** - Main products table (10 sample toys)
- **ToyImages** - Multiple images per toy
- **ToyReviews** - Customer reviews and ratings

### Key Features:
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **Advanced Filtering** - Search, category, brand, price range
- ✅ **Pagination Support** - Efficient data loading
- ✅ **Rating System** - Auto-calculated from reviews
- ✅ **Stock Management** - Inventory tracking
- ✅ **Audit Trail** - Created/Updated timestamps
- ✅ **Soft Delete** - Data preservation

## API Endpoints

### 1. Get Toys (with filtering)
```sql
EXEC sp_GetToys 
    @Search = 'lego',
    @CategoryId = 'cat-002',
    @BrandId = 'brand-001',
    @Status = 'active',
    @MinPrice = 500000,
    @MaxPrice = 2000000,
    @InStock = 1,
    @Page = 1,
    @PageSize = 20,
    @SortField = 'CreatedAt',
    @SortDirection = 'DESC';
```

### 2. Get Single Toy
```sql
SELECT t.*, c.Name as CategoryName, b.Name as BrandName
FROM Toys t
INNER JOIN ToyCategories c ON t.CategoryId = c.Id
INNER JOIN ToyBrands b ON t.BrandId = b.Id
WHERE t.Id = 'toy-001' AND t.IsActive = 1;
```

### 3. Create New Toy
```sql
INSERT INTO Toys (
    Id, Name, Description, Image, CategoryId, BrandId, 
    Price, OriginalPrice, Stock, Status, AgeRange, Material,
    DimensionLength, DimensionWidth, DimensionHeight, Weight,
    Colors, Tags, IsNew, IsFeatured, Discount
) VALUES (
    NEWID(), 
    N'Tên đồ chơi', 
    N'Mô tả chi tiết',
    '/images/toys/new-toy.jpg',
    'cat-001', 'brand-001',
    999000, 1199000, 50, 'active',
    '3-8 tuổi', 'Nhựa ABS',
    30.0, 25.0, 15.0, 1.0,
    '["Đỏ", "Xanh"]', '["Tag1", "Tag2"]',
    1, 0, 16.68
);
```

### 4. Update Toy
```sql
UPDATE Toys 
SET 
    Name = N'Tên cập nhật',
    Price = 899000,
    Stock = 45,
    UpdatedAt = GETDATE()
WHERE Id = 'toy-001';
```

### 5. Delete Toy (Soft Delete)
```sql
UPDATE Toys 
SET IsActive = 0, UpdatedAt = GETDATE()
WHERE Id = 'toy-001';
```

## Sample Data Included

### Categories (8 items):
1. **Đồ chơi giáo dục** - Educational toys
2. **Đồ chơi xây dựng** - Building toys (Lego, blocks)
3. **Búp bê & Nhân vật** - Dolls & Figures
4. **Xe đồ chơi** - Toy vehicles
5. **Đồ chơi thể thao** - Sports toys
6. **Đồ chơi điện tử** - Electronic toys
7. **Đồ chơi nghệ thuật** - Art & Craft
8. **Đồ chơi âm nhạc** - Musical toys

### Brands (10 items):
- LEGO, Mattel, Hasbro, Fisher-Price, Playmobil
- VTech, Melissa & Doug, Bandai, Disney, Nerf

### Sample Toys (10 items):
1. **Bộ Lego Creator 3-in-1** - ₫1,299,000 (was ₫1,499,000)
2. **Búp bê Barbie Dreamhouse** - ₫2,899,000 (was ₫3,299,000)
3. **Robot Transformer Optimus Prime** - ₫899,000
4. **Xe điều khiển từ xa Racing Car** - ₫1,599,000
5. **Bộ đồ chơi bác sĩ Fisher-Price** - ₫699,000
6. **Đàn Piano điện tử VTech** - ₫1,199,000
7. **Bộ xếp hình gỗ Melissa & Doug** - ₫899,000
8. **Mô hình Gundam Bandai RG** - ₫1,899,000
9. **Búp bê Elsa Frozen Disney** - ₫599,000
10. **Súng Nerf Elite 2.0** - ₫799,000

## Database Connection

### Connection String:
```
Server=zen50558.mssql.somee.com;
Database=zen50558_ManagementStore;
User Id=zen50558_ManagementStore;
Password=[your_password];
```

## Usage Instructions

### 1. Run Schema Script:
```bash
# Execute the main schema file
sqlcmd -S zen50558.mssql.somee.com -d zen50558_ManagementStore -i toy-management-schema.sql
```

### 2. Test with Sample Queries:
```bash
# Run sample queries
sqlcmd -S zen50558.mssql.somee.com -d zen50558_ManagementStore -i toy-management-queries.sql
```

### 3. Integration with Next.js:
```typescript
// Example API route: /api/toys
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  const result = await sql`
    EXEC sp_GetToys 
      @Search = ${search},
      @CategoryId = ${category},
      @Page = ${page},
      @PageSize = 20
  `;
  
  return Response.json(result.rows);
}
```

## Key Features Implemented

### ✅ Advanced Filtering:
- Text search (name, description)
- Category filtering
- Brand filtering  
- Price range filtering
- Stock availability
- Status filtering (active, inactive, etc.)

### ✅ Sorting & Pagination:
- Sort by any field (name, price, rating, date)
- Ascending/Descending order
- Page-based pagination
- Configurable page sizes

### ✅ Data Integrity:
- Foreign key constraints
- Check constraints for valid data
- Automatic timestamp updates
- Soft delete functionality

### ✅ Performance Optimization:
- Strategic indexes on key fields
- Efficient stored procedures
- Optimized queries for large datasets

### ✅ Business Logic:
- Automatic rating calculation from reviews
- Stock level tracking
- Discount calculations
- Featured/New product flags

## Ready to Use!

The database schema is now ready for integration with your Toy Management application. All tables, sample data, stored procedures, and triggers are in place.

### Next Steps:
1. ✅ Execute the schema script
2. ✅ Test with sample queries  
3. ✅ Integrate with your Next.js API routes
4. ✅ Connect to your React components
5. ✅ Add authentication and authorization as needed

The system supports all the features shown in your toy-management page including filtering, sorting, pagination, and CRUD operations.
