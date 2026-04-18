"use client";
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import { Player, LineupSlot } from '../types';

interface TeamRatingsPanelProps {
  slots: LineupSlot[];
  players: Player[];
}

const TeamRatingsPanel: React.FC<TeamRatingsPanelProps> = ({ slots, players }) => {
  const getPlayerById = (id: string | null) => players.find(p => p.id === id);

  const filledSlots = slots.filter(s => s.playerId !== null);

  // Attack slots: LW, RW, ST, CF, CAM
  const attackPositions = ['LW', 'RW', 'ST', 'CF', 'CAM', 'LM', 'RM'];
  const midfieldPositions = ['CM', 'CDM', 'CAM', 'LM', 'RM'];
  const defensePositions = ['GK', 'LB', 'CB', 'RB', 'LWB', 'RWB'];

  const avg = (positions: string[]) => {
    const relevant = filledSlots.filter(s => positions.includes(s.position));
    if (relevant.length === 0) return 0;
    const total = relevant.reduce((sum, s) => {
      const p = getPlayerById(s.playerId);
      return sum + (p?.rating ?? 0);
    }, 0);
    return Math.round(total / relevant.length);
  };

  const attack = avg(attackPositions);
  const midfield = avg(midfieldPositions);
  const defense = avg(defensePositions);

  const getRatingColor = (r: number) => {
    if (r >= 90) return '#4ae54a';
    if (r >= 85) return '#7ee57e';
    if (r >= 80) return '#b8e050';
    if (r >= 75) return '#e0c800';
    return '#e06000';
  };

  const stats = [
    { label: 'Attack', value: attack },
    { label: 'Midfield', value: midfield },
    { label: 'Defense', value: defense },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 12,
        width: 200,
        background: 'rgba(10,18,10,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2.5,
        p: 2,
        zIndex: 20,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <IconChartBar size={14} color="#4ae54a" />
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Team Ratings
        </Typography>
      </Box>

      {stats.map(stat => (
        <Box key={stat.label} mb={1.2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.4}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
              {stat.label}
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: getRatingColor(stat.value) }}>
              {stat.value || '—'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stat.value}
            sx={{
              height: 5,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${getRatingColor(stat.value)}88, ${getRatingColor(stat.value)})`,
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default TeamRatingsPanel;
