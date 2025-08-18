'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { WalletService } from '@/app/(DashboardLayout)/apps/wallet/services/walletService';
import { WalletCategory } from '../../../../../types/apps/wallet';

const CategoryDebug: React.FC = () => {
  const [categories, setCategories] = useState<WalletCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 CategoryDebug: Loading categories...');
        
        const categoriesData = await WalletService.fetchCategories();
        
        console.log('🔍 CategoryDebug: Raw API response:', categoriesData);
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('🔍 CategoryDebug: Error loading categories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Loading categories...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Error loading categories: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Category Debug Info
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          Total categories: {categories.length}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Categories by Type:
          </Typography>
          
          {['Thu nhập', 'Chi tiêu', 'Chuyển khoản'].map(type => {
            const filtered = categories.filter(cat => cat.type === type);
            return (
              <Box key={type} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{type}:</strong> {filtered.length} categories
                </Typography>
                {filtered.map(cat => (
                  <Typography key={cat.id} variant="caption" display="block" sx={{ ml: 2 }}>
                    • {cat.name} ({cat.id}) - {cat.color}
                  </Typography>
                ))}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Raw Data:
          </Typography>
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 1, 
            borderRadius: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            maxHeight: 200,
            overflow: 'auto'
          }}>
            {JSON.stringify(categories, null, 2)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CategoryDebug;
