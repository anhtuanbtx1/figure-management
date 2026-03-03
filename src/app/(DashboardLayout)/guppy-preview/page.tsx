"use client";

import React from 'react';
import Box from '@mui/material/Box';
import BreedingChamber from '@/app/components/guppy/BreedingChamber';

export default function GuppyLabPreviewPage() {
    return (
        <Box sx={{
            minHeight: 'calc(100vh - 120px)'
        }}>
            {/* Main Content Preview Area */}
            <BreedingChamber />
        </Box>
    );
}
