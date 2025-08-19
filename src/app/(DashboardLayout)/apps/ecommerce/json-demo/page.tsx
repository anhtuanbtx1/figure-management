'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import { ProductType } from '@/app/(DashboardLayout)/types/apps/eCommerce';
import { getProductsData } from '@/utils/loadProductsData';
import Image from 'next/image';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/apps/ecommerce/list',
    title: 'Ecommerce',
  },
  {
    title: 'JSON Demo',
  },
];

const JsonDemoPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductsData();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products from JSON');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRefresh = () => {
    loadProducts();
  };

  if (loading) {
    return (
      <PageContainer title="JSON Demo" description="Loading products from JSON">
        <Breadcrumb title="JSON Demo" items={BCrumb} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="JSON Demo" description="Products loaded from JSON file">
      <Breadcrumb title="JSON Demo" items={BCrumb} />
      
      <Box mb={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          This page demonstrates loading product data directly from the JSON file located at 
          <code style={{ margin: '0 4px' }}>src/data/products.json</code>
        </Alert>
        
        <Button variant="outlined" onClick={handleRefresh} disabled={loading}>
          Refresh Data
        </Button>
      </Box>

      <>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'relative', height: 200 }}>
                <Image
                  src={product.photo}
                  alt={product.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {product.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                    {product.discount > 0 && (
                      <Typography 
                        component="span" 
                        variant="body2" 
                        sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                      >
                        ${product.salesPrice}
                      </Typography>
                    )}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  {product.category.map((cat) => (
                    <Chip 
                      key={cat} 
                      label={cat} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip 
                    label={product.gender} 
                    color="secondary" 
                    size="small"
                  />
                  <Chip 
                    label={product.stock ? 'In Stock' : 'Out of Stock'} 
                    color={product.stock ? 'success' : 'error'} 
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && !loading ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
        </Box>
      ) : (
        <></>
      )}
    </PageContainer>
  );
};

export default JsonDemoPage;
