import mock from '../mock';
import fs from 'fs';
import path from 'path';

// Load products data from JSON file
const loadProductsData = () => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(fileContents);

    // Convert created dates from string to Date objects
    return products.map((product: any) => ({
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
