# Card Báo Cáo Thống Kê Tổng Giá Trị Đồ Chơi

## Tổng Quan

Card báo cáo thống kê tổng giá trị đồ chơi là một component mới được thêm vào dashboard để hiển thị tổng giá trị của tất cả đồ chơi trong hệ thống. Card này tính tổng (SUM) của cột Price từ bảng Toys và hiển thị thông tin một cách trực quan và dễ hiểu.

## Tính Năng

### 1. Hiển Thị Thông Tin
- **Tổng giá trị**: Tổng giá trị của tất cả đồ chơi (SUM của Price)
- **Số lượng sản phẩm**: Tổng số đồ chơi được tính
- **Giá trung bình**: Giá trung bình của các đồ chơi
- **Tiến độ mục tiêu**: Thanh tiến độ so với mục tiêu 100 triệu VNĐ

### 2. Format Hiển Thị
- Định dạng tiền tệ VND theo chuẩn Việt Nam
- Tự động chuyển đổi đơn vị (VNĐ, K VNĐ, triệu VNĐ, tỷ VNĐ)
- Responsive design phù hợp với mọi kích thước màn hình

### 3. Trạng Thái
- **Loading**: Hiển thị progress bar khi đang tải dữ liệu
- **Error**: Hiển thị thông báo lỗi với nút "Thử lại"
- **Success**: Hiển thị đầy đủ thông tin thống kê

## Cấu Trúc Kỹ Thuật

### 1. Database Layer
**File**: `database/create-toys-total-value-procedure.sql`

Stored procedure `sp_GetToysTotalValueForFrontend` với các tính năng:
- Tính SUM(Price) từ bảng `zen50558_ManagementStore.dbo.Toys`
- Hỗ trợ các bộ lọc: search, categoryId, brandName, status, priceRange, ageRange, inStock
- Trả về: totalValue, totalCount, averagePrice, minPrice, maxPrice
- Chỉ tính các record có `IsActive = 1` (soft delete aware)

### 2. API Layer
**File**: `src/app/api/toys/total-value/route.ts`

API endpoint `/api/toys/total-value` với:
- Method: GET
- Query parameters hỗ trợ filtering
- Response format JSON chuẩn
- Error handling đầy đủ
- Logging chi tiết

### 3. Hook Layer
**File**: `src/hooks/useToysTotalValue.ts`

Custom hook `useToysTotalValue` cung cấp:
- State management (data, loading, error)
- Auto-refresh khi filters thay đổi
- Helper functions: formatVND, formatNumber
- TypeScript interfaces đầy đủ

### 4. Component Layer
**File**: `src/app/components/dashboards/modern/ToysTotalValueCard.tsx`

React component với:
- Material-UI design system
- Gradient background với primary theme
- Loading skeleton
- Error state với retry button
- Progress bar cho mục tiêu
- Responsive layout

## Cách Sử Dụng

### 1. Chạy Stored Procedure
```sql
-- Chạy file tạo stored procedure
-- Trong SQL Server Management Studio hoặc Azure Data Studio
-- Mở và execute file: database/create-toys-total-value-procedure.sql

-- Test stored procedure
EXEC sp_GetToysTotalValueForFrontend;

-- Test với filters
EXEC sp_GetToysTotalValueForFrontend @Status = 'active', @MinPrice = 100000;
```

### 2. Test API Endpoint
```bash
# Test API endpoint cơ bản
curl http://localhost:3000/api/toys/total-value

# Test với filters
curl "http://localhost:3000/api/toys/total-value?status=active&minPrice=100000"
```

### 3. Sử Dụng Component
```tsx
import ToysTotalValueCard from '@/app/components/dashboards/modern/ToysTotalValueCard';

// Trong component
<ToysTotalValueCard isLoading={false} />
```

### 4. Sử Dụng Hook
```tsx
import { useToysTotalValue } from '@/hooks/useToysTotalValue';

// Trong component
const { data, loading, error, refresh } = useToysTotalValue({
  status: 'active',
  minPrice: 100000
});
```

## Vị Trí Trong Dashboard

Card được tích hợp vào 2 trang dashboard:

1. **Trang chủ**: `/` - `src/app/(DashboardLayout)/page.tsx`
2. **Dashboard Modern**: `/dashboards/modern` - `src/app/(DashboardLayout)/dashboards/modern/page.tsx`

Vị trí: Grid item `xs={12} lg={4}` - chiếm 1/3 width trên desktop, full width trên mobile.

## Customization

### 1. Thay Đổi Mục Tiêu
Trong file `ToysTotalValueCard.tsx`, thay đổi:
```tsx
const targetValue = 100000000; // 100 million VND
```

### 2. Thay Đổi Theme Color
Card sử dụng `theme.palette.primary` - có thể thay đổi trong theme configuration.

### 3. Thêm Filters
Có thể truyền filters vào hook:
```tsx
const { data } = useToysTotalValue({
  status: 'active',
  categoryId: 'cat-001',
  minPrice: 50000
});
```

## Testing

### 1. Unit Tests
```bash
# Test API endpoint
npm run test -- --testPathPattern=api/toys/total-value

# Test hook
npm run test -- --testPathPattern=hooks/useToysTotalValue

# Test component
npm run test -- --testPathPattern=ToysTotalValueCard
```

### 2. Integration Tests
```bash
# Test full flow
npm run test:integration -- --testPathPattern=toys-total-value
```

### 3. Manual Testing
1. Mở dashboard: `http://localhost:3000`
2. Kiểm tra card hiển thị đúng
3. Test responsive trên mobile
4. Test error handling (disconnect database)
5. Test loading state

## Troubleshooting

### 1. Card Không Hiển Thị
- Kiểm tra stored procedure đã được tạo
- Kiểm tra database connection
- Xem console logs cho errors

### 2. Dữ Liệu Không Chính Xác
- Verify stored procedure logic
- Check database data integrity
- Test API endpoint trực tiếp

### 3. Performance Issues
- Kiểm tra database indexes
- Monitor API response time
- Consider caching strategies

## Maintenance

### 1. Database
- Định kỳ kiểm tra performance của stored procedure
- Update indexes nếu cần
- Monitor query execution time

### 2. API
- Monitor API response times
- Check error rates
- Update caching strategies

### 3. Frontend
- Update dependencies
- Monitor bundle size
- Test cross-browser compatibility
