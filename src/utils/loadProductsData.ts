import { ProductType } from '@/app/(DashboardLayout)/types/apps/eCommerce';

// For client-side usage - load from API
export const fetchProductsFromAPI = async (): Promise<ProductType[]> => {
  try {
    const response = await fetch('/api/data/eCommerce/ProductsData');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// For server-side usage - load directly from JSON
export const loadProductsFromJSON = async (): Promise<ProductType[]> => {
  try {
    // Dynamic import for client-side compatibility
    const productsData = await import('@/data/products.json');
    const products = productsData.default;
    
    // Convert created dates from string to Date objects
    return products.map((product: any) => ({
      ...product,
      created: new Date(product.created)
    }));
  } catch (error) {
    console.error('Error loading products from JSON:', error);
    return [];
  }
};

// Utility function to get products data (works both client and server side)
export const getProductsData = async (): Promise<ProductType[]> => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    return loadProductsFromJSON();
  } else {
    return fetchProductsFromAPI();
  }
};
