# Toy Management API Documentation

## Overview

This API provides complete CRUD operations for the toy management system, fully integrated with SQL Server database and compatible with the `/apps/toy-management` frontend page.

## Base URL
```
/api/toys
```

## Authentication
Currently no authentication required. Add authentication middleware as needed.

## API Endpoints

### 1. Get Toys (with filtering, sorting, pagination)

**GET** `/api/toys`

#### Query Parameters:
- `search` (string, optional): Search in name, description, brand
- `category` (string, optional): Filter by category ID
- `brand` (string, optional): Filter by brand name
- `status` (string, optional): Filter by status (active, inactive, out_of_stock, discontinued)
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `ageRange` (string, optional): Filter by age range
- `inStock` (boolean, optional): Filter only items in stock
- `page` (number, default: 1): Page number for pagination
- `pageSize` (number, default: 20): Items per page
- `sortField` (string, default: 'createdAt'): Field to sort by
- `sortDirection` (string, default: 'desc'): Sort direction (asc/desc)

#### Example Request:
```
GET /api/toys?search=lego&category=cat-002&page=1&pageSize=10&sortField=price&sortDirection=asc
```

#### Response:
```json
{
  "success": true,
  "toys": [
    {
      "id": "toy-001",
      "name": "Bộ Lego Creator 3-in-1",
      "description": "Bộ đồ chơi xây dựng...",
      "image": "/images/toys/lego-creator-001.jpg",
      "category": {
        "id": "cat-002",
        "name": "Đồ chơi xây dựng",
        "slug": "building-toys"
      },
      "price": 1299000,
      "originalPrice": 1499000,
      "stock": 25,
      "status": "active",
      "ageRange": "6-12 tuổi",
      "brand": "LEGO",
      "material": "Nhựa ABS",
      "dimensions": {
        "length": 35,
        "width": 25,
        "height": 15,
        "weight": 800
      },
      "colors": ["Đỏ", "Xanh", "Vàng"],
      "tags": ["Lego", "Xây dựng", "Sáng tạo"],
      "rating": 4.5,
      "reviewCount": 128,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z",
      "isNew": false,
      "isFeatured": true,
      "discount": 13.33
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Successfully retrieved 10 toys"
}
```

### 2. Get Single Toy

**GET** `/api/toys/{id}`

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "toy-001",
    "name": "Bộ Lego Creator 3-in-1",
    // ... full toy object
  },
  "message": "Successfully retrieved toy"
}
```

### 3. Create New Toy

**POST** `/api/toys`

#### Request Body:
```json
{
  "name": "Tên đồ chơi mới",
  "description": "Mô tả chi tiết",
  "image": "/images/toys/new-toy.jpg",
  "categoryId": "cat-001",
  "price": 999000,
  "originalPrice": 1199000,
  "stock": 50,
  "ageRange": "3-8 tuổi",
  "brand": "Brand Name",
  "material": "Nhựa ABS",
  "dimensions": {
    "length": 30,
    "width": 25,
    "height": 15,
    "weight": 1000
  },
  "colors": ["Đỏ", "Xanh", "Vàng"],
  "tags": ["Mới", "Giáo dục", "Sáng tạo"]
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "toy-new-001",
    // ... created toy object
  },
  "message": "Successfully created toy"
}
```

### 4. Update Toy

**PUT** `/api/toys/{id}`

#### Request Body (partial update):
```json
{
  "name": "Tên đã cập nhật",
  "price": 899000,
  "stock": 45,
  "status": "active"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    // ... updated toy object
  },
  "message": "Successfully updated toy"
}
```

### 5. Delete Toy (Soft Delete)

**DELETE** `/api/toys/{id}`

#### Response:
```json
{
  "success": true,
  "message": "Successfully deleted toy"
}
```

### 6. Get Categories

**GET** `/api/toys/categories`

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-001",
      "name": "Đồ chơi giáo dục",
      "slug": "educational-toys",
      "description": "Đồ chơi phát triển trí tuệ",
      "icon": "school",
      "color": "#4CAF50"
    }
  ],
  "count": 8,
  "message": "Successfully retrieved categories"
}
```

### 7. Get Brands

**GET** `/api/toys/brands`

#### Response:
```json
{
  "success": true,
  "data": [
    "LEGO",
    "Mattel",
    "Hasbro",
    "Fisher-Price"
  ],
  "count": 10,
  "message": "Successfully retrieved brands"
}
```

### 8. Test API

**GET** `/api/toys/test`

Tests database connection and API functionality.

## Frontend Integration

### Using ToyService

```typescript
import ToyService from '@/app/(DashboardLayout)/apps/toy-management/services/toyService';

// Fetch toys with filters
const filters = {
  search: 'lego',
  category: 'cat-002',
  status: 'active',
  priceRange: { min: 0, max: 2000000 },
  brand: '',
  ageRange: '',
  inStock: false,
};

const result = await ToyService.fetchToys(filters, 1, 20, 'createdAt', 'desc');

// Create new toy
const newToy = await ToyService.createToy({
  name: 'New Toy',
  description: 'Description',
  categoryId: 'cat-001',
  price: 999000,
  stock: 50,
  brand: 'Brand',
  // ... other fields
});

// Update toy
const updatedToy = await ToyService.updateToy('toy-001', {
  price: 899000,
  stock: 45,
});

// Delete toy
await ToyService.deleteToy('toy-001');

// Get categories and brands
const categories = await ToyService.fetchCategories();
const brands = await ToyService.fetchBrands();
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## Database Requirements

1. Execute `database/toy-management-schema.sql` to create tables
2. Execute `database/toy-management-api-mapping.sql` to create stored procedures
3. Ensure database connection is configured in `src/lib/database.ts`

## Testing

Run the test endpoint to verify everything is working:

```bash
curl http://localhost:3000/api/toys/test
```

## Performance Notes

- Uses stored procedures for optimal performance
- Implements pagination to handle large datasets
- Uses connection pooling for database connections
- JSON fields are properly parsed for colors and tags

## Security Considerations

- Add authentication middleware as needed
- Validate and sanitize all input data
- Use parameterized queries to prevent SQL injection
- Implement rate limiting for production use
