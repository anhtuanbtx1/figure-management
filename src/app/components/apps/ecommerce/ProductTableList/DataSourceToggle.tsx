'use client';
import React from 'react';
import { 
  Box, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Typography,
  Paper
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchProducts, fetchProductsFromJSON } from '@/store/apps/eCommerce/ECommerceSlice';

interface DataSourceToggleProps {
  onSourceChange?: (source: 'api' | 'json') => void;
}

const DataSourceToggle: React.FC<DataSourceToggleProps> = ({ onSourceChange }) => {
  const [dataSource, setDataSource] = React.useState<'api' | 'json'>('api');
  const dispatch = useDispatch<AppDispatch>();

  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSource = event.target.value as 'api' | 'json';
    setDataSource(newSource);
    
    // Fetch data from the selected source
    if (newSource === 'api') {
      dispatch(fetchProducts());
    } else {
      dispatch(fetchProductsFromJSON());
    }
    
    // Notify parent component
    if (onSourceChange) {
      onSourceChange(newSource);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Data Source Configuration
        </Typography>
        <FormControl component="fieldset">
          <FormLabel component="legend">Choose data source:</FormLabel>
          <RadioGroup
            row
            aria-label="data-source"
            name="data-source"
            value={dataSource}
            onChange={handleSourceChange}
          >
            <FormControlLabel 
              value="api" 
              control={<Radio />} 
              label="Load from API (Mock)" 
            />
            <FormControlLabel 
              value="json" 
              control={<Radio />} 
              label="Load from JSON File" 
            />
          </RadioGroup>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {dataSource === 'api' 
            ? 'Loading data from mock API endpoint (/api/data/eCommerce/ProductsData)'
            : 'Loading data directly from JSON file (src/data/products.json)'
          }
        </Typography>
      </Box>
    </Paper>
  );
};

export default DataSourceToggle;
