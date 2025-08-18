import { Theme } from '@mui/material/styles';

// Dark mode aware TextField styling utility
export const getDarkModeTextFieldStyles = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease-in-out',
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.08)' 
        : 'rgba(0,0,0,0.04)',
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.1)' 
        : 'rgba(255,255,255,0.9)',
      boxShadow: theme.palette.mode === 'dark'
        ? `0 0 0 2px ${theme.palette.primary.main}40`
        : `0 0 0 2px ${theme.palette.primary.main}20`,
    },
    
    // Input text color
    '& input': {
      color: theme.palette.text.primary,
    },
    
    // Textarea color for multiline
    '& textarea': {
      color: theme.palette.text.primary,
    },
    
    // Placeholder color
    '& input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    
    '& textarea::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    
    // Border color
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.12)' 
        : 'rgba(0,0,0,0.12)',
    },
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.2)' 
        : 'rgba(0,0,0,0.2)',
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  
  // Icon color in InputAdornment
  '& .MuiInputAdornment-root': {
    color: theme.palette.text.secondary,
  },
  
  // Label color
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    }
  },
});

// Dark mode aware Select styling utility
export const getDarkModeSelectStyles = (theme: Theme) => ({
  borderRadius: 2,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.05)' 
    : 'rgba(0,0,0,0.02)',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.08)' 
      : 'rgba(0,0,0,0.04)',
  },
  
  '&.Mui-focused': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(255,255,255,0.9)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 0 0 2px ${theme.palette.primary.main}40`
      : `0 0 0 2px ${theme.palette.primary.main}20`,
  },
  
  // Border color
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.12)' 
      : 'rgba(0,0,0,0.12)',
  },
  
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(0,0,0,0.2)',
  },
  
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
  
  // Select text color
  '& .MuiSelect-select': {
    color: theme.palette.text.primary,
  },
  
  // Select icon color
  '& .MuiSelect-icon': {
    color: theme.palette.text.secondary,
  },
});

// Dark mode aware InputLabel styling utility
export const getDarkModeInputLabelStyles = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  }
});

// Dark mode aware Autocomplete styling utility
export const getDarkModeAutocompleteStyles = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease-in-out',
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.08)' 
        : 'rgba(0,0,0,0.04)',
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.1)' 
        : 'rgba(255,255,255,0.9)',
      boxShadow: theme.palette.mode === 'dark'
        ? `0 0 0 2px ${theme.palette.primary.main}40`
        : `0 0 0 2px ${theme.palette.primary.main}20`,
    },
    
    // Input text color
    '& input': {
      color: theme.palette.text.primary,
    },
    
    // Placeholder color
    '& input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    
    // Border color
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.12)' 
        : 'rgba(0,0,0,0.12)',
    },
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.2)' 
        : 'rgba(0,0,0,0.2)',
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  
  // Autocomplete popup styling
  '& .MuiAutocomplete-popper': {
    '& .MuiPaper-root': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.grey[800] 
        : theme.palette.background.paper,
      color: theme.palette.text.primary,
    }
  }
});

export default {
  getDarkModeTextFieldStyles,
  getDarkModeSelectStyles,
  getDarkModeInputLabelStyles,
  getDarkModeAutocompleteStyles,
};
