import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { IconMoon, IconSun } from '@tabler/icons-react';
import GuestFilters from './GuestFilters';
import { GuestFilters as GuestFiltersType, GuestStatus } from '../../../types/apps/eventGuest';

const DarkModeDemo: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [filters, setFilters] = useState<GuestFiltersType>({
    search: '',
    status: '',
    contributionRange: { min: 0, max: 5000000 },
  });

  // Create theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleFiltersChange = (newFilters: Partial<GuestFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      contributionRange: { min: 0, max: 5000000 },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          p: 3,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                Dark Mode Test - Guest Filters
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    icon={<IconSun size={16} />}
                    checkedIcon={<IconMoon size={16} />}
                  />
                }
                label={darkMode ? 'Dark Mode' : 'Light Mode'}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Toggle the switch above to test the search input field styling in both light and dark modes.
              The search field should maintain proper contrast and readability in both modes.
            </Typography>
          </CardContent>
        </Card>

        <GuestFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Filter Values:
            </Typography>
            <Typography variant="body2">
              <strong>Search:</strong> "{filters.search}" <br />
              <strong>Status:</strong> {filters.status || 'All'} <br />
              <strong>Contribution Range:</strong> {filters.contributionRange.min.toLocaleString()} - {filters.contributionRange.max.toLocaleString()} VND
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default DarkModeDemo;
