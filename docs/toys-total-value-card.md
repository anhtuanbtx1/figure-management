# Card BÃ¡o CÃ¡o Thá»‘ng KÃª Tá»•ng GiÃ¡ Trá»‹ Äá»“ ChÆ¡i

## Tá»•ng Quan

Card bÃ¡o cÃ¡o thá»‘ng kÃª tá»•ng giÃ¡ trá»‹ Ä‘á»“ chÆ¡i lÃ  má»™t component má»›i Ä‘Æ°á»£c thÃªm vÃ o dashboard Ä‘á»ƒ hiá»ƒn thá»‹ tá»•ng giÃ¡ trá»‹ cá»§a táº¥t cáº£ Ä‘á»“ chÆ¡i trong há»‡ thá»‘ng. Card nÃ y tÃ­nh tá»•ng (SUM) cá»§a cá»™t Price tá»« báº£ng Toys vÃ  hiá»ƒn thá»‹ thÃ´ng tin má»™t cÃ¡ch trá»±c quan vÃ  dá»… hiá»ƒu.

## TÃ­nh NÄƒng

### 1. Hiá»ƒn Thá»‹ ThÃ´ng Tin
- **Tá»•ng giÃ¡ trá»‹**: Tá»•ng giÃ¡ trá»‹ cá»§a táº¥t cáº£ Ä‘á»“ chÆ¡i (SUM cá»§a Price)
- **Sá»‘ lÆ°á»£ng sáº£n pháº©m**: Tá»•ng sá»‘ Ä‘á»“ chÆ¡i Ä‘Æ°á»£c tÃ­nh
- **GiÃ¡ trung bÃ¬nh**: GiÃ¡ trung bÃ¬nh cá»§a cÃ¡c Ä‘á»“ chÆ¡i
- **Tiáº¿n Ä‘á»™ má»¥c tiÃªu**: Thanh tiáº¿n Ä‘á»™ so vá»›i má»¥c tiÃªu 100 triá»‡u VNÄ

### 2. Format Hiá»ƒn Thá»‹
- Äá»‹nh dáº¡ng tiá»n tá»‡ VND theo chuáº©n Viá»‡t Nam
- Tá»± Ä‘á»™ng chuyá»ƒn Ä‘á»•i Ä‘Æ¡n vá»‹ (VNÄ, K VNÄ, triá»‡u VNÄ, tá»· VNÄ)
- Responsive design phÃ¹ há»£p vá»›i má»i kÃ­ch thÆ°á»›c mÃ n hÃ¬nh

### 3. Tráº¡ng ThÃ¡i
- **Loading**: Hiá»ƒn thá»‹ progress bar khi Ä‘ang táº£i dá»¯ liá»‡u
- **Error**: Hiá»ƒn thá»‹ thÃ´ng bÃ¡o lá»—i vá»›i nÃºt "Thá»­ láº¡i"
- **Success**: Hiá»ƒn thá»‹ Ä‘áº§y Ä‘á»§ thÃ´ng tin thá»‘ng kÃª

## Cáº¥u TrÃºc Ká»¹ Thuáº­t

### 1. Database Layer
**File**: `database/create-toys-total-value-procedure.sql`

Stored procedure `sp_GetToysTotalValueForFrontend` vá»›i cÃ¡c tÃ­nh nÄƒng:
- TÃ­nh SUM(Price) tá»« báº£ng `ManagementStore.dbo.Toys`
- Há»— trá»£ cÃ¡c bá»™ lá»c: search, categoryId, brandName, status, priceRange, ageRange, inStock
- Tráº£ vá»: totalValue, totalCount, averagePrice, minPrice, maxPrice
- Chá»‰ tÃ­nh cÃ¡c record cÃ³ `IsActive = 1` (soft delete aware)

### 2. API Layer
**File**: `src/app/api/toys/total-value/route.ts`

API endpoint `/api/toys/total-value` vá»›i:
- Method: GET
- Query parameters há»— trá»£ filtering
- Response format JSON chuáº©n
- Error handling Ä‘áº§y Ä‘á»§
- Logging chi tiáº¿t

### 3. Hook Layer
**File**: `src/hooks/useToysTotalValue.ts`

Custom hook `useToysTotalValue` cung cáº¥p:
- State management (data, loading, error)
- Auto-refresh khi filters thay Ä‘á»•i
- Helper functions: formatVND, formatNumber
- TypeScript interfaces Ä‘áº§y Ä‘á»§

### 4. Component Layer
**File**: `src/app/components/dashboards/modern/ToysTotalValueCard.tsx`

React component vá»›i:
- Material-UI design system
- Gradient background vá»›i primary theme
- Loading skeleton
- Error state vá»›i retry button
- Progress bar cho má»¥c tiÃªu
- Responsive layout

## CÃ¡ch Sá»­ Dá»¥ng

### 1. Cháº¡y Stored Procedure
```sql
-- Cháº¡y file táº¡o stored procedure
-- Trong SQL Server Management Studio hoáº·c Azure Data Studio
-- Má»Ÿ vÃ  execute file: database/create-toys-total-value-procedure.sql

-- Test stored procedure
EXEC sp_GetToysTotalValueForFrontend;

-- Test vá»›i filters
EXEC sp_GetToysTotalValueForFrontend @Status = 'active', @MinPrice = 100000;
```

### 2. Test API Endpoint
```bash
# Test API endpoint cÆ¡ báº£n
curl http://localhost:3000/api/toys/total-value

# Test vá»›i filters
curl "http://localhost:3000/api/toys/total-value?status=active&minPrice=100000"
```

### 3. Sá»­ Dá»¥ng Component
```tsx
import ToysTotalValueCard from '@/app/components/dashboards/modern/ToysTotalValueCard';

// Trong component
<ToysTotalValueCard isLoading={false} />
```

### 4. Sá»­ Dá»¥ng Hook
```tsx
import { useToysTotalValue } from '@/hooks/useToysTotalValue';

// Trong component
const { data, loading, error, refresh } = useToysTotalValue({
  status: 'active',
  minPrice: 100000
});
```

## Vá»‹ TrÃ­ Trong Dashboard

Card Ä‘Æ°á»£c tÃ­ch há»£p vÃ o 2 trang dashboard:

1. **Trang chá»§**: `/` - `src/app/(DashboardLayout)/page.tsx`
2. **Dashboard Modern**: `/dashboards/modern` - `src/app/(DashboardLayout)/dashboards/modern/page.tsx`

Vá»‹ trÃ­: Grid item `xs={12} lg={4}` - chiáº¿m 1/3 width trÃªn desktop, full width trÃªn mobile.

## Customization

### 1. Thay Äá»•i Má»¥c TiÃªu
Trong file `ToysTotalValueCard.tsx`, thay Ä‘á»•i:
```tsx
const targetValue = 100000000; // 100 million VND
```

### 2. Thay Äá»•i Theme Color
Card sá»­ dá»¥ng `theme.palette.primary` - cÃ³ thá»ƒ thay Ä‘á»•i trong theme configuration.

### 3. ThÃªm Filters
CÃ³ thá»ƒ truyá»n filters vÃ o hook:
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
1. Má»Ÿ dashboard: `http://localhost:3000`
2. Kiá»ƒm tra card hiá»ƒn thá»‹ Ä‘Ãºng
3. Test responsive trÃªn mobile
4. Test error handling (disconnect database)
5. Test loading state

## Troubleshooting

### 1. Card KhÃ´ng Hiá»ƒn Thá»‹
- Kiá»ƒm tra stored procedure Ä‘Ã£ Ä‘Æ°á»£c táº¡o
- Kiá»ƒm tra database connection
- Xem console logs cho errors

### 2. Dá»¯ Liá»‡u KhÃ´ng ChÃ­nh XÃ¡c
- Verify stored procedure logic
- Check database data integrity
- Test API endpoint trá»±c tiáº¿p

### 3. Performance Issues
- Kiá»ƒm tra database indexes
- Monitor API response time
- Consider caching strategies

## Maintenance

### 1. Database
- Äá»‹nh ká»³ kiá»ƒm tra performance cá»§a stored procedure
- Update indexes náº¿u cáº§n
- Monitor query execution time

### 2. API
- Monitor API response times
- Check error rates
- Update caching strategies

### 3. Frontend
- Update dependencies
- Monitor bundle size
- Test cross-browser compatibility

