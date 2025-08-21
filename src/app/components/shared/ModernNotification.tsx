import React from 'react';
import {
  Snackbar,
  Alert,
  useTheme,
  Slide,
  SlideProps,
} from '@mui/material';

// Shared notification config shape (structural typing compatible across modules)
export interface SharedNotificationConfig {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface ModernNotificationProps {
  notification: SharedNotificationConfig;
  onClose: () => void;
}

// Custom slide transition
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

const ModernNotification: React.FC<ModernNotificationProps> = ({ notification, onClose }) => {
  const theme = useTheme();

  const getSeverityGradient = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #388e3c 100%)';
      case 'error':
        return 'linear-gradient(135deg, #f44336 0%, #e53935 50%, #d32f2f 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #ff9800 0%, #f57c00 50%, #ef6c00 100%)';
      case 'info':
      default:
        return 'linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #1565c0 100%)';
    }
  };

  const getSeverityAccent = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'rgba(76, 175, 80, 0.1)';
      case 'error':
        return 'rgba(244, 67, 54, 0.1)';
      case 'warning':
        return 'rgba(255, 152, 0, 0.1)';
      case 'info':
      default:
        return 'rgba(33, 150, 243, 0.1)';
    }
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={notification.severity === 'success' ? 4500 : 6500}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        mt: 10,
        mr: 3,
        zIndex: theme.zIndex.snackbar + 1,
        '& .MuiSnackbar-root': {
          position: 'fixed',
        },
      }}
    >
      <Alert
        severity={notification.severity}
        onClose={onClose}
        variant="filled"
        sx={{
          minWidth: { xs: '300px', sm: '380px', md: '420px' },
          maxWidth: '480px',
          borderRadius: '20px',
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: 'blur(16px)',
          padding: '18px 24px',
          fontSize: '15px',
          fontWeight: 600,
          lineHeight: 1.6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          background: getSeverityGradient(notification.severity),
          border: `1px solid ${getSeverityAccent(notification.severity)}`,

          // Animated background shimmer effect
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            animation: 'shimmer 3s infinite',
            pointerEvents: 'none',
          },

          // Subtle pulse animation
          animation: 'fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

          // Icon styling
          '& .MuiAlert-icon': {
            fontSize: '26px',
            marginRight: '16px',
            color: 'white',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
            animation: 'iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          },

          // Message styling
          '& .MuiAlert-message': {
            fontWeight: 700,
            letterSpacing: '0.15px',
          },

          // Close button styling
          '& .MuiAlert-action .MuiIconButton-root': {
            color: 'white',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              opacity: 0.9,
            },
          },

          // Keyframes
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '50%': { left: '100%' },
            '100%': { left: '100%' },
          },
          '@keyframes fadeInScale': {
            '0%': { opacity: 0, transform: 'scale(0.98)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
          '@keyframes iconBounce': {
            '0%': { transform: 'translateY(-8px)', opacity: 0 },
            '50%': { transform: 'translateY(3px)', opacity: 1 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },

          // Responsive adjustments
          [theme.breakpoints.down('sm')]: {
            minWidth: '280px',
            fontSize: '14px',
            padding: '16px 20px',
            borderRadius: '16px',
            '& .MuiAlert-icon': {
              fontSize: '22px',
              marginRight: '12px',
            },
            '& .MuiAlert-message': {
              fontSize: '14px',
              lineHeight: 1.5,
            },
            '& .MuiAlert-action .MuiIconButton-root': {
              padding: '6px',
              borderRadius: '10px',
            },
          },

          // Dark mode adjustments
          [theme.palette.mode === 'dark'
            ? '@media (prefers-color-scheme: dark)'
            : '@media (max-width: 0px)']:
            {
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.3),
                0 8px 24px rgba(0, 0, 0, 0.2),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
              border: `1px solid rgba(255, 255, 255, 0.05)`,
            },
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default ModernNotification;

