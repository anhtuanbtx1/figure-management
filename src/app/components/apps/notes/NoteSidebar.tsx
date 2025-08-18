import React from 'react';
import Drawer from '@mui/material/Drawer';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Typography, Divider } from '@mui/material';
import { IconNotes } from '@tabler/icons-react';
import NoteList from './NoteList';

const drawerWidth = 280;

interface NoteType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
}

const NoteSidebar = ({ isMobileSidebarOpen, onSidebarClose }: NoteType) => {
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        zIndex: lgUp ? 0 : 1,
        [`& .MuiDrawer-paper`]: {
          position: 'relative',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        },
      }}
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant={lgUp ? 'persistent' : 'temporary'}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconNotes size={28} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Ghi chú của tôi
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Quản lý ghi chú cá nhân
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Note List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <NoteList />
      </Box>
    </Drawer>
  );
};

export default NoteSidebar;
