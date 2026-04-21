"use client";
import React, { useState, useCallback } from 'react';
import { Box, Typography, Avatar, Tooltip, Chip } from '@mui/material';
import { IconInfoCircle, IconArrowsExchange } from '@tabler/icons-react';
import { Player, LineupSlot } from '../types';

interface PlayerCardProps {
  slot: LineupSlot;
  player: Player | null;
  onPlayerClick: (slot: LineupSlot, player: Player | null) => void;
  isSelected: boolean;
  isSwapMode: boolean;
}

const RATING_COLOR = (r: number) => {
  if (r >= 90) return '#4ae54a';
  if (r >= 85) return '#6fd66f';
  if (r >= 80) return '#a0e050';
  if (r >= 75) return '#e0c850';
  return '#e07050';
};

const PlayerCard: React.FC<PlayerCardProps> = ({ slot, player, onPlayerClick, isSelected, isSwapMode }) => {
  const isEmpty = !player;
  const ratingColor = player ? RATING_COLOR(player.rating) : '#888';

  return (
    <Box
      onClick={() => onPlayerClick(slot, player)}
      sx={{
        position: 'absolute',
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        cursor: 'pointer',
        zIndex: 10,
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'translate(-50%, -50%) scale(1.08)' },
      }}
    >
      {/* Avatar circle */}
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '14px',
          border: isSelected
            ? '2.5px solid #00e5ff'
            : isEmpty
            ? '2.5px dashed rgba(255,255,255,0.3)'
            : '2.5px solid rgba(255,255,255,0.15)',
          background: isEmpty
            ? 'rgba(255,255,255,0.04)'
            : isSwapMode && isSelected
            ? 'rgba(0,229,255,0.12)'
            : 'rgba(20,30,20,0.7)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isSelected
            ? '0 0 0 3px rgba(0,229,255,0.4), 0 6px 20px rgba(0,0,0,0.5)'
            : '0 4px 16px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isEmpty ? (
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 0.5 }}>
            {slot.label}
          </Typography>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: player!.avatar 
                ? 'transparent' 
                : `linear-gradient(135deg, hsl(${(parseInt(player!.id.replace('p', '')) * 37) % 360}, 60%, 25%), hsl(${(parseInt(player!.id.replace('p', '')) * 37 + 30) % 360}, 70%, 15%))`,
            }}
          >
            {player!.avatar ? (
              <img 
                src={player!.avatar} 
                alt={player!.shortName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
                {player!.shortName.charAt(0)}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Name + Rating */}
      {!isEmpty && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              maxWidth: 70,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            {player!.shortName}
          </Typography>
          <Typography
            sx={{
              fontSize: 9,
              fontWeight: 600,
              color: ratingColor,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              lineHeight: 1,
            }}
          >
            {slot.label} • {player!.rating}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PlayerCard;
