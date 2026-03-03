"use client";

import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardActionArea, Stack, LinearProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconHistory, IconRefresh, IconGenderMale, IconGenderFemale, IconFlask } from '@tabler/icons-react';

const ContentContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 4),
    maxWidth: '1600px',
    margin: '0 auto',
    color: theme.palette.text.primary,
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    textTransform: 'none',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    fontWeight: 600,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));

const SectionPanel = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const SelectionCard = styled(Card)<{ selected?: boolean; gender: 'male' | 'female' }>(({ theme, selected, gender }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${selected ? (gender === 'male' ? '#3B82F6' : '#EC4899') : theme.palette.divider}`,
    borderRadius: '12px',
    color: theme.palette.text.primary,
    marginBottom: '16px',
    boxShadow: 'none',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'visible',
    '&:hover': {
        borderColor: gender === 'male' ? '#3B82F6' : '#EC4899',
        transform: 'translateY(-2px)'
    }
}));

const FishBox = styled(Box)(({ theme }) => ({
    height: '120px',
    backgroundColor: theme.palette.action.hover,
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundImage: `linear-gradient(45deg, ${theme.palette.divider} 25%, transparent 25%, transparent 75%, ${theme.palette.divider} 75%, ${theme.palette.divider}), linear-gradient(45deg, ${theme.palette.divider} 25%, transparent 25%, transparent 75%, ${theme.palette.divider} 75%, ${theme.palette.divider})`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
}));

const CheckBoxIndicator = styled(Box)<{ gender: 'male' | 'female' }>(({ theme, gender }) => ({
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: gender === 'male' ? '#3B82F6' : '#EC4899',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    border: `3px solid ${theme.palette.background.paper}`,
    zIndex: 10,
}));

const maleStrains = [
    { id: 'm1', name: 'Blue Mosaic', type: 'Delta Tail', tag: 'Aa Bb' },
    { id: 'm2', name: 'Red Cobra', type: 'Snakeskin Body', tag: 'AA BB' },
    { id: 'm3', name: 'Yellow Cobra', type: 'Delta Tail', tag: 'Aa Bb' },
];

const femaleStrains = [
    { id: 'f1', name: 'Full Platinum', type: 'Round Tail', tag: 'Aa bb' },
    { id: 'f2', name: 'Red Blonde', type: 'Standard Body', tag: 'aa BB' },
    { id: 'f3', name: 'Dragon Head', type: 'Delta Tail', tag: 'AA bb' },
];

export default function BreedingChamber() {
    const [selectedSire, setSelectedSire] = useState<string>('m2');
    const [selectedDam, setSelectedDam] = useState<string>('f1');

    return (
        <ContentContainer>
            {/* Header */}
            <HeaderBox>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: '28px' }}>
                        Breeding Chamber
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '15px' }}>
                        Select parent strains to simulate F1 generation outcomes.
                    </Typography>
                </Box>
                <ActionButtonContainer>
                    <ActionButton startIcon={<IconHistory size={18} />}>History</ActionButton>
                    <ActionButton startIcon={<IconRefresh size={18} />}>Reset Lab</ActionButton>
                </ActionButtonContainer>
            </HeaderBox>

            {/* Main Grid */}
            <Grid container spacing={3}>
                {/* Left Column - Sire Selection */}
                <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconGenderMale size={20} color="#3B82F6" />
                            <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Sire Selection</Typography>
                        </Box>
                        <Typography sx={{ color: '#3B82F6', fontSize: '12px', bgcolor: 'rgba(59, 130, 246, 0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Male</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {maleStrains.map((strain) => (
                            <SelectionCard key={strain.id} selected={selectedSire === strain.id} gender="male">
                                <CardActionArea onClick={() => setSelectedSire(strain.id)}>
                                    {selectedSire === strain.id && (
                                        <CheckBoxIndicator gender="male">✓</CheckBoxIndicator>
                                    )}
                                    <FishBox>
                                        {/* Placeholder for fish image */}
                                        <Typography sx={{ color: 'text.secondary', fontSize: '12px' }}>Fish Image</Typography>
                                        <Typography sx={{ position: 'absolute', top: 8, right: 8, fontSize: '10px', color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', px: 0.5, borderRadius: '4px' }}>{strain.tag}</Typography>
                                    </FishBox>
                                    <Box sx={{ p: 2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>{strain.name}</Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>{strain.type}</Typography>
                                    </Box>
                                </CardActionArea>
                            </SelectionCard>
                        ))}
                    </Box>
                </Grid>

                {/* Center Column - Active Chamber & Projection */}
                <Grid item xs={12} md={6}>
                    <Stack spacing={3} sx={{ height: '100%' }}>

                        {/* Active Chamber */}
                        <SectionPanel>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <IconFlask size={20} color="#10B981" />
                                    <Typography sx={{ fontWeight: 600 }}>Active Chamber</Typography>
                                </Box>
                                <Typography sx={{ color: '#10B981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} /> Simulation Ready
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, gap: 4 }}>
                                {/* Sire Avatar */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ width: 120, height: 120, borderRadius: '50%', border: '4px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', mb: 2, overflow: 'hidden' }}>
                                        <Box component="img" src="/images/profile/user-2.jpg" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 600 }}>Red Cobra</Typography>
                                    <Typography sx={{ color: '#3B82F6', fontSize: '13px' }}>Male (XY)</Typography>
                                </Box>

                                <Typography sx={{ fontSize: '24px', color: 'text.secondary', fontWeight: 300 }}>✕</Typography>

                                {/* Dam Avatar */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ width: 120, height: 120, borderRadius: '50%', border: '4px solid #EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', mb: 2, overflow: 'hidden' }}>
                                        <Box component="img" src="/images/profile/user-3.jpg" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 600 }}>Full Platinum</Typography>
                                    <Typography sx={{ color: '#EC4899', fontSize: '13px' }}>Female (XX)</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<IconFlask size={18} />}
                                    sx={{
                                        bgcolor: '#2563EB',
                                        color: '#fff',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#1D4ED8' }
                                    }}
                                >
                                    Simulate Breeding
                                </Button>
                            </Box>
                        </SectionPanel>

                        {/* Projected Outcomes */}
                        <SectionPanel sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, mb: 3 }}>Projected F1 Outcomes</Typography>

                            <Grid container spacing={4}>
                                {/* Phenotype Prob */}
                                <Grid item xs={12} md={7}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 600, mb: 2, textTransform: 'uppercase' }}>Phenotype Probability</Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                            <Chip label="50%" size="small" sx={{ bgcolor: '#EA580C', color: 'white', fontWeight: 600, borderRadius: '4px', height: '24px' }} />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Red Cobra Mosaic</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={50} sx={{ height: 6, borderRadius: 3, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: '#EA580C' } }} />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                            <Chip label="25%" size="small" sx={{ bgcolor: '#3B82F6', color: 'white', fontWeight: 600, borderRadius: '4px', height: '24px' }} />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Platinum Solid</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={25} sx={{ height: 6, borderRadius: 3, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' } }} />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                            <Chip label="25%" size="small" sx={{ bgcolor: '#3B82F6', color: 'white', fontWeight: 600, borderRadius: '4px', height: '24px' }} />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Wild Type (Grey)</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={25} sx={{ height: 6, borderRadius: 3, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' } }} />
                                    </Box>
                                </Grid>

                                {/* Locus A Breakdown */}
                                <Grid item xs={12} md={5}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '12px', fontWeight: 600, mb: 2, textTransform: 'uppercase' }}>Locus A Breakdown</Typography>
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={6}>
                                            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', textAlign: 'center' }}>
                                                <Typography sx={{ color: '#3B82F6', fontSize: '18px', fontWeight: 600 }}>AA</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Dominant</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', textAlign: 'center' }}>
                                                <Typography sx={{ color: '#A855F7', fontSize: '18px', fontWeight: 600 }}>Aa</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Carrier</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', textAlign: 'center' }}>
                                                <Typography sx={{ color: '#A855F7', fontSize: '18px', fontWeight: 600 }}>Aa</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Carrier</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', textAlign: 'center' }}>
                                                <Typography sx={{ color: '#10B981', fontSize: '18px', fontWeight: 600 }}>aa</Typography>
                                                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Recessive</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </SectionPanel>
                    </Stack>
                </Grid>

                {/* Right Column - Dam Selection */}
                <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconGenderFemale size={20} color="#EC4899" />
                            <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>Dam Selection</Typography>
                        </Box>
                        <Typography sx={{ color: '#EC4899', fontSize: '12px', bgcolor: 'rgba(236, 72, 153, 0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Female</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {femaleStrains.map((strain) => (
                            <SelectionCard key={strain.id} selected={selectedDam === strain.id} gender="female">
                                <CardActionArea onClick={() => setSelectedDam(strain.id)}>
                                    {selectedDam === strain.id && (
                                        <CheckBoxIndicator gender="female">✓</CheckBoxIndicator>
                                    )}
                                    <FishBox>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '12px' }}>Fish Image</Typography>
                                        <Typography sx={{ position: 'absolute', top: 8, right: 8, fontSize: '10px', color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', px: 0.5, borderRadius: '4px' }}>{strain.tag}</Typography>
                                    </FishBox>
                                    <Box sx={{ p: 2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>{strain.name}</Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>{strain.type}</Typography>
                                    </Box>
                                </CardActionArea>
                            </SelectionCard>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </ContentContainer>
    );
}
