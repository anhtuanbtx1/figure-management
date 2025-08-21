"use client";
import React, { useEffect, useState } from 'react';
import { Box, LinearProgress, CircularProgress } from '@mui/material';

// Page-level loading UI for (DashboardLayout) segment
// - Shows a thin top progress bar after 200ms to avoid flash on fast navigations
// - If loading lasts >1200ms, also show a subtle centered spinner overlay
export default function Loading() {
  const [showTopBar, setShowTopBar] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTopBar(true), 200);
    const t2 = setTimeout(() => setShowOverlay(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      {showTopBar && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 13000 }}>
          <LinearProgress color="primary" sx={{ height: 3 }} />
        </Box>
      )}
      {showOverlay && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(1px)',
            zIndex: 12999,
          }}
        >
          <CircularProgress size={28} thickness={5} />
        </Box>
      )}
    </>
  );
}
