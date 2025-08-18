import React from 'react';
import {
  Snackbar,
  Alert,
  useTheme,
  Slide,
  SlideProps,
} from '@mui/material';
import { NotificationConfig } from '../utils/notifications';

interface ModernNotificationProps {
  notification: NotificationConfig;
  onClose: () => void;
}

// Custom slide transition
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

const ModernNotification: React.FC<ModernNotificationProps> = ({
  notification,
  onClose,
}) => {
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
        return 'linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #1565c0 100%)';
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
        return 'rgba(33, 150, 243, 0.1)';
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
        }
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
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
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

          // Message text styling
          '& .MuiAlert-message': {
            fontSize: '15px',
            fontWeight: 600,
            lineHeight: 1.6,
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.01em',
          },

          // Close button styling
          '& .MuiAlert-action': {
            marginLeft: '16px',
            '& .MuiIconButton-root': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '18px',
              }
            }
          },

          // Hover effects for entire notification
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: `
              0 24px 48px rgba(0, 0, 0, 0.2),
              0 12px 32px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.15)
            `,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },

          // Animation keyframes
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' }
          },

          '@keyframes fadeInScale': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.8) translateY(20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            }
          },

          '@keyframes iconBounce': {
            '0%': {
              transform: 'scale(0.3)',
            },
            '50%': {
              transform: 'scale(1.1)',
            },
            '100%': {
              transform: 'scale(1)',
            }
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
            }
          },

          // Dark mode adjustments
          [theme.palette.mode === 'dark' ? '@media (prefers-color-scheme: dark)' : '@media (max-width: 0px)']: {
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.3),
              0 8px 24px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.05)
            `,
            border: `1px solid rgba(255, 255, 255, 0.05)`,
          }
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default ModernNotification;
