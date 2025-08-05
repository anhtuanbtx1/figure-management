# Products Data Management

Thư mục này chứa dữ liệu sản phẩm dưới dạng JSON để sử dụng trong ứng dụng eCommerce.

## Cấu trúc file

### `products.json`
File chính chứa danh sách tất cả sản phẩm với cấu trúc sau:

```json
{
  "title": "Tên sản phẩm",
  "price": 275,
  "discount": 25,
  "related": false,
  "salesPrice": 350,
  "category": ["books"],
  "gender": "Men",
  "rating": 3,
  "stock": true,
  "qty": 1,
  "colors": ["#1890FF"],
  "photo": "/images/products/s1.jpg",
  "id": 1,
  "created": "2024-07-28T17:39:40.000Z",
  "description": "Mô tả sản phẩm..."
}
```

## Cách sử dụng

### 1. Load dữ liệu từ JSON (Client-side)
```typescript
import { getProductsData } from '@/utils/loadProductsData';

const products = await getProductsData();
```

### 2. Load dữ liệu từ JSON (Server-side)
```typescript
import { loadProductsFromJSON } from '@/utils/loadProductsData';

const products = await loadProductsFromJSON();
```

### 3. Sử dụng với Redux Store
```typescript
import { fetchProductsFromJSON } from '@/store/apps/eCommerce/ECommerceSlice';

// Dispatch action để load từ JSON
dispatch(fetchProductsFromJSON());
```

## Các trang demo

### `/apps/ecommerce/list`
- Trang danh sách sản phẩm chính
- Có toggle để chuyển đổi giữa API và JSON
- Sử dụng Redux store để quản lý state

### `/apps/ecommerce/json-demo`
- Trang demo riêng để hiển thị dữ liệu từ JSON
- Load trực tiếp từ file JSON
- Hiển thị dưới dạng grid cards

## Lợi ích của việc sử dụng JSON

1. **Dễ quản lý**: Dữ liệu được tổ chức trong file JSON dễ đọc và chỉnh sửa
2. **Performance**: Load nhanh hơn so với API calls
3. **Offline**: Hoạt động được khi không có kết nối mạng
4. **Version control**: Dễ dàng track changes trong Git
5. **Flexibility**: Có thể chuyển đổi giữa JSON và API một cách linh hoạt

## Cách thêm sản phẩm mới

1. Mở file `products.json`
2. Thêm object sản phẩm mới vào array với cấu trúc tương tự
3. Đảm bảo `id` là unique
4. Cập nhật `created` date theo format ISO string
5. Save file và refresh ứng dụng

## Cách chỉnh sửa sản phẩm

1. Tìm sản phẩm theo `id` trong file `products.json`
2. Chỉnh sửa các thuộc tính cần thiết
3. Save file và refresh ứng dụng

## Backup và Migration

- File JSON có thể dễ dàng backup bằng cách copy
- Có thể migrate sang database bằng cách import JSON data
- Có thể export từ database ra JSON format để sử dụng

## Troubleshooting

### Lỗi "Cannot find module"
- Đảm bảo file `products.json` tồn tại trong thư mục `src/data/`
- Check đường dẫn import trong code

### Dữ liệu không hiển thị
- Check console để xem có lỗi parsing JSON không
- Verify cấu trúc JSON đúng format
- Đảm bảo tất cả required fields có đầy đủ

### Performance issues
- Nếu file JSON quá lớn, consider pagination
- Có thể split thành nhiều file nhỏ theo category
- Implement lazy loading cho images
