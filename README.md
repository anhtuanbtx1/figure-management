# Figure Management - Modernize Next.js Admin Dashboard

A modern, feature-rich admin dashboard built with Next.js, TypeScript, and Material-UI. This project includes a comprehensive eCommerce product management system with JSON data integration.

## 🚀 Features

### Core Features
- **Modern UI/UX**: Built with Material-UI components and responsive design
- **TypeScript**: Full TypeScript support for better development experience
- **Next.js 14**: Latest Next.js features including App Router
- **Redux Toolkit**: State management with Redux Toolkit
- **Multiple Layouts**: Vertical and horizontal layout options
- **Dark/Light Theme**: Theme customization support
- **RTL Support**: Right-to-left language support

### eCommerce Features
- **Product Management**: Complete CRUD operations for products
- **JSON Data Integration**: Load product data from JSON files
- **Data Source Toggle**: Switch between API and JSON data sources
- **Product List View**: Table and grid view options
- **Product Details**: Detailed product information pages
- **Shopping Cart**: Add to cart functionality
- **Checkout Process**: Multi-step checkout workflow

### New JSON Data Management System
- **Flexible Data Loading**: Support for both API and JSON file data sources
- **Easy Data Management**: Simple JSON file editing for product data
- **Performance Optimized**: Fast loading from local JSON files
- **Version Control Friendly**: Track data changes in Git
- **Demo Pages**: Dedicated pages to showcase JSON data loading

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/anhtuanbtx1/figure-management.git
cd figure-management
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 JSON Data Management

### Quick Start
1. **View Products**: Go to `/apps/ecommerce/list`
2. **Toggle Data Source**: Use the radio buttons to switch between API and JSON
3. **JSON Demo**: Visit `/apps/ecommerce/json-demo` for a dedicated JSON showcase
4. **Edit Data**: Modify `src/data/products.json` to update product information

### Data Structure
```json
{
  "title": "Product Name",
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
  "description": "Product description..."
}
```

### Usage Examples

**Load from JSON (Client-side)**
```typescript
import { getProductsData } from '@/utils/loadProductsData';

const products = await getProductsData();
```

**Load from JSON (Server-side)**
```typescript
import { loadProductsFromJSON } from '@/utils/loadProductsData';

const products = await loadProductsFromJSON();
```

**Redux Integration**
```typescript
import { fetchProductsFromJSON } from '@/store/apps/eCommerce/ECommerceSlice';

dispatch(fetchProductsFromJSON());
```

## 🎯 Key Pages

- **Dashboard**: `/` - Main dashboard with analytics
- **eCommerce List**: `/apps/ecommerce/list` - Product management with data source toggle
- **JSON Demo**: `/apps/ecommerce/json-demo` - Dedicated JSON data showcase
- **Product Shop**: `/apps/ecommerce/shop` - Product grid view
- **Product Details**: `/apps/ecommerce/detail/[id]` - Individual product pages

## 🔧 Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Styling**: Emotion, CSS-in-JS
- **Icons**: Tabler Icons
- **Date Handling**: date-fns
- **Development**: ESLint, Prettier

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Material-UI](https://mui.com/) for the beautiful component library
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [Tabler Icons](https://tabler-icons.io/) for the icon set

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Happy Coding! 🚀**
