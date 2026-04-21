"use client";
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Divider, Avatar, Chip,
  IconButton,
} from '@mui/material';
import { IconX, IconArrowsExchange, IconInfoCircle } from '@tabler/icons-react';
import { Player, LineupSlot } from '../types';

interface PlayerInfoDialogProps {
  open: boolean;
  slot: LineupSlot | null;
  player: Player | null;
  allPlayers: Player[];
  onClose: () => void;
  onSwap: (slot: LineupSlot, targetPlayer: Player) => void;
  onRemove: (slot: LineupSlot) => void;
}

const RATING_COLOR = (r: number) => {
  if (r >= 90) return '#4ae54a';
  if (r >= 85) return '#6fd66f';
  if (r >= 80) return '#a0e050';
  if (r >= 75) return '#e0c850';
  return '#e07050';
};

const PlayerInfoDialog: React.FC<PlayerInfoDialogProps> = ({
  open, slot, player, allPlayers, onClose, onSwap, onRemove
}) => {
  const [swapMode, setSwapMode] = React.useState(false);

  React.useEffect(() => {
    if (!open) setSwapMode(false);
  }, [open]);

  // Players not currently on the pitch (bench / unassigned)
  const availableForSwap = allPlayers.filter(p =>
    p.id !== player?.id &&
    p.position === (slot?.position ?? '') ||
    // Also show same-category positions
    true
  ).filter(p => p.id !== player?.id);

  if (!slot) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #0f1a0f, #162316)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          color: 'white',
          overflow: 'hidden',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2,
              background: player
                ? (player.avatar ? 'transparent' : `linear-gradient(135deg, hsl(${(parseInt(player.id.replace('p', '')) * 37) % 360}, 60%, 30%), hsl(${(parseInt(player.id.replace('p', '')) * 37 + 30) % 360}, 70%, 18%))`)
                : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
              overflow: 'hidden',
            }}
          >
            {player?.avatar ? (
               <img src={player.avatar} alt={player.shortName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
                {player ? player.shortName.charAt(0) : slot.label}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>
              {player ? player.name : `Trống — ${slot.label}`}
            </Typography>
            {player && (
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                #{player.jerseyNumber} · {player.nationality} · {player.age} tuổi
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          <IconX size={18} />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <DialogContent sx={{ p: 2.5 }}>
        {player && (
          <Box display="flex" gap={1.5} mb={2}>
            <Chip
              label={`${slot.label}`}
              size="small"
              sx={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            />
            <Chip
              label={`OVR ${player.rating}`}
              size="small"
              sx={{ background: `${RATING_COLOR(player.rating)}22`, color: RATING_COLOR(player.rating), fontSize: 11, fontWeight: 700 }}
            />
          </Box>
        )}

        {!swapMode ? (
          <Box display="flex" flexDirection="column" gap={1}>
            {player && (
              <Button
                fullWidth
                startIcon={<IconArrowsExchange size={16} />}
                onClick={() => setSwapMode(true)}
                sx={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.8)',
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  '&:hover': { background: 'rgba(255,255,255,0.12)' },
                }}
              >
                Đổi cầu thủ
              </Button>
            )}
            {player && (
              <Button
                fullWidth
                onClick={() => { onRemove(slot); onClose(); }}
                sx={{
                  background: 'rgba(255,60,60,0.1)',
                  color: 'rgba(255,120,120,0.9)',
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1,
                  '&:hover': { background: 'rgba(255,60,60,0.2)' },
                }}
              >
                Rút khỏi đội hình
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Chọn cầu thủ thay thế
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} maxHeight={280} overflow="auto"
              sx={{ '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}
            >
              {availableForSwap.map(p => (
                <Box
                  key={p.id}
                  onClick={() => { onSwap(slot, p); setSwapMode(false); onClose(); }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2,
                    borderRadius: 1.5, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                    '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: 1,
                      background: p.avatar ? 'transparent' : `linear-gradient(135deg, hsl(${(parseInt(p.id.replace('p', '')) * 37) % 360}, 60%, 30%), hsl(${(parseInt(p.id.replace('p', '')) * 37 + 30) % 360}, 70%, 18%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {p.avatar ? (
                       <img src={p.avatar} alt={p.shortName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                       <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{p.shortName.charAt(0)}</Typography>
                    )}
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1 }}>{p.shortName}</Typography>
                    <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{p.position}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: RATING_COLOR(p.rating) }}>{p.rating}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerInfoDialog;
