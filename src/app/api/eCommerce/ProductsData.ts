import mock from '../mock';
import productsJson from '../../../data/products.json';

// Load products data from JSON file and convert dates
const loadProductsData = () => {
  try {
    // Convert created dates from string to Date objects
    return productsJson.map((product: any) => ({
      ...product,
      created: new Date(product.created)
    }));
  } catch (error) {
    console.error('Error loading products data:', error);
    return [];
  }
};

const ProductsData = loadProductsData();

mock.onGet('/api/data/eCommerce/ProductsData').reply(() => {
  return [200, ProductsData];
});

export default ProductsData;
