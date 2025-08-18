# Frontend Integration Guide - Toy Management Database

## ✅ Compatibility Confirmation

**Database schema hoàn toàn tương thích với trang `/apps/toy-management`!**

Tất cả các trường, filter, sorting và pagination đều được hỗ trợ đầy đủ.

## Database Schema Mapping

### 1. Toy Object Mapping

| Frontend Field | Database Field | Type | Notes |
|---------------|----------------|------|-------|
| `id` | `Id` | string | Primary key |
| `name` | `Name` | string | Product name |
| `description` | `Description` | string | Product description |
| `image` | `Image` | string | Image URL |
| `category` | `CategoryId` + JOIN | ToyCategory | Object with id, name, slug, etc. |
| `price` | `Price` | number | Current price |
| `originalPrice` | `OriginalPrice` | number | Original price (optional) |
| `stock` | `Stock` | number | Available quantity |
| `status` | `Status` | ToyStatus | active, inactive, out_of_stock, discontinued |
| `ageRange` | `AgeRange` | string | Age recommendation |
| `brand` | `BrandId` + JOIN | string | Brand name |
| `material` | `Material` | string | Material description |
| `dimensions.length` | `DimensionLength` | number | Length in cm |
| `dimensions.width` | `DimensionWidth` | number | Width in cm |
| `dimensions.height` | `DimensionHeight` | number | Height in cm |
| `dimensions.weight` | `Weight` | number | Weight in grams |
| `colors` | `Colors` | string[] | JSON array of colors |
| `tags` | `Tags` | string[] | JSON array of tags |
| `rating` | `Rating` | number | Average rating (0-5) |
| `reviewCount` | `ReviewCount` | number | Number of reviews |
| `createdAt` | `CreatedAt` | Date | Creation timestamp |
| `updatedAt` | `UpdatedAt` | Date | Last update timestamp |
| `isNew` | `IsNew` | boolean | New product flag |
| `isFeatured` | `IsFeatured` | boolean | Featured product flag |
| `discount` | `Discount` | number | Discount percentage |

### 2. Category Object Mapping

| Frontend Field | Database Field | Type |
|---------------|----------------|------|
| `id` | `Id` | string |
| `name` | `Name` | string |
| `slug` | `Slug` | string |
| `description` | `Description` | string |
| `icon` | `Icon` | string |
| `color` | `Color` | string |

### 3. Filter Support

All filters in the frontend are fully supported:

| Filter | Database Support | Implementation |
|--------|------------------|----------------|
| `search` | ✅ | Name, Description, Brand search |
| `category` | ✅ | CategoryId filter |
| `status` | ✅ | Status enum filter |
| `priceRange` | ✅ | Min/Max price filter |
| `brand` | ✅ | Brand name filter |
| `ageRange` | ✅ | AgeRange LIKE filter |
| `inStock` | ✅ | Stock > 0 filter |

## API Integration Examples

### 1. Next.js API Route Example

```typescript
// pages/api/toys/index.ts
import { sql } from '@vercel/postgres';

export default async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const status = searchParams.get('status') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const ageRange = searchParams.get('ageRange') || '';
    const inStock = searchParams.get('inStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    try {
      // Get total count
      const countResult = await sql`
        EXEC sp_GetToysForFrontend 
          @Search = ${search},
          @CategoryId = ${category},
          @BrandName = ${brand},
          @Status = ${status},
          @MinPrice = ${minPrice},
          @MaxPrice = ${maxPrice},
          @AgeRange = ${ageRange},
          @InStock = ${inStock},
          @Page = 1,
          @PageSize = 999999
      `;

      // Get paginated data
      const toysResult = await sql`
        EXEC sp_GetToysForFrontend 
          @Search = ${search},
          @CategoryId = ${category},
          @BrandName = ${brand},
          @Status = ${status},
          @MinPrice = ${minPrice},
          @MaxPrice = ${maxPrice},
          @AgeRange = ${ageRange},
          @InStock = ${inStock},
          @Page = ${page},
          @PageSize = ${pageSize},
          @SortField = ${sortField},
          @SortDirection = ${sortDirection}
      `;

      const totalItems = countResult.rows.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      return Response.json({
        toys: toysResult.rows,
        pagination: {
          page,
          limit: pageSize,
          total: totalItems,
          totalPages
        }
      });
    } catch (error) {
      return Response.json({ error: 'Failed to fetch toys' }, { status: 500 });
    }
  }
}
```

### 2. Get Categories API

```typescript
// pages/api/toys/categories.ts
export default async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT * FROM vw_CategoriesForFrontend ORDER BY name`;
      return Response.json(result.rows);
    } catch (error) {
      return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
  }
}
```

### 3. Get Brands API

```typescript
// pages/api/toys/brands.ts
export default async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT brand FROM vw_BrandsForFrontend`;
      return Response.json(result.rows.map(row => row.brand));
    } catch (error) {
      return Response.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
  }
}
```

### 4. Create Toy API

```typescript
// pages/api/toys/create.ts
export default async function handler(req: NextRequest) {
  if (req.method === 'POST') {
    const toyData = await req.json();
    
    try {
      const result = await sql`
        EXEC sp_CreateToyFromFrontend
          @Name = ${toyData.name},
          @Description = ${toyData.description},
          @Image = ${toyData.image},
          @CategoryId = ${toyData.categoryId},
          @Price = ${toyData.price},
          @OriginalPrice = ${toyData.originalPrice},
          @Stock = ${toyData.stock},
          @AgeRange = ${toyData.ageRange},
          @Brand = ${toyData.brand},
          @Material = ${toyData.material},
          @DimensionLength = ${toyData.dimensions.length},
          @DimensionWidth = ${toyData.dimensions.width},
          @DimensionHeight = ${toyData.dimensions.height},
          @Weight = ${toyData.dimensions.weight},
          @Colors = ${JSON.stringify(toyData.colors)},
          @Tags = ${JSON.stringify(toyData.tags)}
      `;
      
      return Response.json(result.rows[0]);
    } catch (error) {
      return Response.json({ error: 'Failed to create toy' }, { status: 500 });
    }
  }
}
```

## Frontend Data Service

### Update toyData.ts to use API

```typescript
// src/app/(DashboardLayout)/apps/toy-management/data/toyData.ts

// Replace mock data with API calls
export const fetchToys = async (filters: ToyFilters, page: number, pageSize: number, sortField: string, sortDirection: string) => {
  const params = new URLSearchParams({
    search: filters.search,
    category: filters.category,
    brand: filters.brand,
    status: filters.status,
    minPrice: filters.priceRange.min.toString(),
    maxPrice: filters.priceRange.max.toString(),
    ageRange: filters.ageRange,
    inStock: filters.inStock.toString(),
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortField,
    sortDirection
  });

  const response = await fetch(`/api/toys?${params}`);
  return response.json();
};

export const fetchCategories = async (): Promise<ToyCategory[]> => {
  const response = await fetch('/api/toys/categories');
  return response.json();
};

export const fetchBrands = async (): Promise<string[]> => {
  const response = await fetch('/api/toys/brands');
  return response.json();
};

export const createToy = async (toyData: ToyCreateRequest): Promise<Toy> => {
  const response = await fetch('/api/toys/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toyData)
  });
  return response.json();
};
```

## Database Setup Steps

1. **Execute the main schema:**
   ```bash
   sqlcmd -S your-server -d your-database -i toy-management-schema.sql
   ```

2. **Execute the API mapping:**
   ```bash
   sqlcmd -S your-server -d your-database -i toy-management-api-mapping.sql
   ```

3. **Test the procedures:**
   ```sql
   -- Test getting toys
   EXEC sp_GetToysForFrontend @Page = 1, @PageSize = 10;
   
   -- Test getting categories
   SELECT * FROM vw_CategoriesForFrontend;
   
   -- Test getting brands
   SELECT * FROM vw_BrandsForFrontend;
   ```

## Status Enum Mapping

```typescript
// Make sure ToyStatus enum matches database values
export enum ToyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive', 
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}
```

## Summary

✅ **Database schema hoàn toàn tương thích với frontend**
✅ **Tất cả filters, sorting, pagination được hỗ trợ**
✅ **Stored procedures trả về đúng format frontend mong đợi**
✅ **JSON fields cho colors và tags**
✅ **Category object với đầy đủ thông tin**
✅ **Dimensions object với length, width, height, weight**
✅ **Audit fields cho createdAt, updatedAt**
✅ **Boolean flags cho isNew, isFeatured**

Bạn có thể sử dụng ngay database schema này với trang toy management hiện tại!
