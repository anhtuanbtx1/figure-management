"use client";
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

// ─── Types ───────────────────────────────────────────────────────────────────

type Formation = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | '5-3-2';

interface Player {
  id: string;
  name: string;
  shortName: string;
  pos: string;
  rating: number;
  jerseyNumber: number;
}

interface SlotDef {
  posLabel: string;
  playerId: string;
  isGK?: boolean;
  /** default position as % of pitch container (0–100) */
  x: number; // left %
  y: number; // top %
}

// ─── Color palette ────────────────────────────────────────────────────────────

const C = {
  background: '#0c1322',
  surface: '#0c1322',
  surfaceContainer: '#191f2f',
  surfaceContainerLow: '#141b2b',
  surfaceContainerHigh: '#232a3a',
  surfaceContainerHighest: '#2e3545',
  surfaceBright: '#323949',
  outlineVariant: '#424843',
  onSurface: '#dce2f7',
  onSurfaceVariant: '#c1c8c2',
  primary: '#4ae176',
  primaryFixed: '#6bff8f',
  primaryContainer: '#003e17',
  onPrimary: '#003915',
  secondary: '#ffc640',
  onSecondary: '#402d00',
  outline: '#8b928c',
};

const glass = (extra: object = {}) => ({
  background: 'rgba(46,53,69,0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  ...extra,
});

// ─── Default players ──────────────────────────────────────────────────────────

const ALL_PLAYERS: Player[] = [
  { id: 'ederson',  name: 'Ederson Moraes',  shortName: 'Ederson',   pos: 'GK',  rating: 88, jerseyNumber: 31 },
  { id: 'walker',   name: 'Kyle Walker',     shortName: 'Walker',    pos: 'RB',  rating: 85, jerseyNumber: 2 },
  { id: 'dias',     name: 'Rúben Dias',      shortName: 'Dias',      pos: 'CB',  rating: 89, jerseyNumber: 3 },
  { id: 'stones',   name: 'John Stones',     shortName: 'Stones',    pos: 'CB',  rating: 86, jerseyNumber: 5 },
  { id: 'ake',      name: 'Nathan Aké',      shortName: 'Ake',       pos: 'LB',  rating: 84, jerseyNumber: 6 },
  { id: 'rodri',    name: 'Rodri',           shortName: 'Rodri',     pos: 'CDM', rating: 90, jerseyNumber: 16 },
  { id: 'debruyne', name: 'Kevin De Bruyne', shortName: 'De Bruyne', pos: 'CM',  rating: 91, jerseyNumber: 17 },
  { id: 'silva',    name: 'Bernardo Silva',  shortName: 'Silva',     pos: 'CM',  rating: 88, jerseyNumber: 20 },
  { id: 'grealish', name: 'Jack Grealish',   shortName: 'Grealish',  pos: 'LW',  rating: 86, jerseyNumber: 10 },
  { id: 'haaland',  name: 'Erling Haaland',  shortName: 'Haaland',   pos: 'ST',  rating: 94, jerseyNumber: 9 },
  { id: 'foden',    name: 'Phil Foden',      shortName: 'Foden',     pos: 'RW',  rating: 88, jerseyNumber: 47 },
  // Bench
  { id: 'alvarez',  name: 'Julián Álvarez',  shortName: 'J. Alvarez', pos: 'ST', rating: 88, jerseyNumber: 19 },
  { id: 'lewis',    name: 'Rico Lewis',      shortName: 'R. Lewis',  pos: 'RB',  rating: 82, jerseyNumber: 82 },
  { id: 'ortega',   name: 'Stefan Ortega',   shortName: 'Ortega',    pos: 'GK',  rating: 80, jerseyNumber: 18 },
  { id: 'kovacic',  name: 'Mateo Kovačić',   shortName: 'Kovacic',   pos: 'CM',  rating: 83, jerseyNumber: 8 },
  { id: 'gundogan', name: 'İlkay Gündoğan', shortName: 'Gundogan',  pos: 'CM',  rating: 85, jerseyNumber: 8 },
];

// ─── Formation slot definitions with default x/y positions (%) ───────────────
//   x: 0 = left edge, 100 = right edge
//   y: 0 = top (attacker end), 100 = bottom (GK end)

const FORMATIONS: Record<Formation, SlotDef[]> = {
  '4-3-3': [
    { posLabel: 'GK',  playerId: 'ederson',  isGK: true, x: 50, y: 90 },
    { posLabel: 'LB',  playerId: 'ake',               x: 15, y: 74 },
    { posLabel: 'CB',  playerId: 'dias',               x: 35, y: 76 },
    { posLabel: 'CB',  playerId: 'stones',             x: 65, y: 76 },
    { posLabel: 'RB',  playerId: 'walker',             x: 85, y: 74 },
    { posLabel: 'CM',  playerId: 'silva',              x: 25, y: 55 },
    { posLabel: 'CDM', playerId: 'rodri',              x: 50, y: 58 },
    { posLabel: 'CM',  playerId: 'debruyne',           x: 75, y: 55 },
    { posLabel: 'LW',  playerId: 'grealish',           x: 15, y: 30 },
    { posLabel: 'ST',  playerId: 'haaland',            x: 50, y: 22 },
    { posLabel: 'RW',  playerId: 'foden',              x: 85, y: 30 },
  ],
  '4-2-3-1': [
    { posLabel: 'GK',  playerId: 'ederson',  isGK: true, x: 50, y: 90 },
    { posLabel: 'LB',  playerId: 'ake',               x: 15, y: 76 },
    { posLabel: 'CB',  playerId: 'dias',               x: 35, y: 78 },
    { posLabel: 'CB',  playerId: 'stones',             x: 65, y: 78 },
    { posLabel: 'RB',  playerId: 'walker',             x: 85, y: 76 },
    { posLabel: 'CDM', playerId: 'rodri',              x: 35, y: 62 },
    { posLabel: 'CDM', playerId: 'debruyne',           x: 65, y: 62 },
    { posLabel: 'LW',  playerId: 'grealish',           x: 18, y: 42 },
    { posLabel: 'CAM', playerId: 'silva',              x: 50, y: 44 },
    { posLabel: 'RW',  playerId: 'foden',              x: 82, y: 42 },
    { posLabel: 'ST',  playerId: 'haaland',            x: 50, y: 22 },
  ],
  '3-5-2': [
    { posLabel: 'GK',  playerId: 'ederson',  isGK: true, x: 50, y: 90 },
    { posLabel: 'CB',  playerId: 'ake',               x: 25, y: 76 },
    { posLabel: 'CB',  playerId: 'dias',               x: 50, y: 78 },
    { posLabel: 'CB',  playerId: 'stones',             x: 75, y: 76 },
    { posLabel: 'LWB', playerId: 'grealish',           x: 10, y: 56 },
    { posLabel: 'CM',  playerId: 'silva',              x: 30, y: 56 },
    { posLabel: 'CDM', playerId: 'rodri',              x: 50, y: 58 },
    { posLabel: 'CM',  playerId: 'debruyne',           x: 70, y: 56 },
    { posLabel: 'RWB', playerId: 'walker',             x: 90, y: 56 },
    { posLabel: 'ST',  playerId: 'haaland',            x: 35, y: 24 },
    { posLabel: 'ST',  playerId: 'foden',              x: 65, y: 24 },
  ],
  '4-4-2': [
    { posLabel: 'GK',  playerId: 'ederson',  isGK: true, x: 50, y: 90 },
    { posLabel: 'LB',  playerId: 'ake',               x: 12, y: 76 },
    { posLabel: 'CB',  playerId: 'dias',               x: 35, y: 78 },
    { posLabel: 'CB',  playerId: 'stones',             x: 65, y: 78 },
    { posLabel: 'RB',  playerId: 'walker',             x: 88, y: 76 },
    { posLabel: 'LM',  playerId: 'grealish',           x: 12, y: 56 },
    { posLabel: 'CM',  playerId: 'silva',              x: 35, y: 58 },
    { posLabel: 'CM',  playerId: 'debruyne',           x: 65, y: 58 },
    { posLabel: 'RM',  playerId: 'rodri',              x: 88, y: 56 },
    { posLabel: 'ST',  playerId: 'haaland',            x: 35, y: 24 },
    { posLabel: 'ST',  playerId: 'foden',              x: 65, y: 24 },
  ],
  '5-3-2': [
    { posLabel: 'GK',  playerId: 'ederson',  isGK: true, x: 50, y: 90 },
    { posLabel: 'LWB', playerId: 'grealish',            x: 8,  y: 72 },
    { posLabel: 'CB',  playerId: 'ake',               x: 27, y: 78 },
    { posLabel: 'CB',  playerId: 'dias',               x: 50, y: 80 },
    { posLabel: 'CB',  playerId: 'stones',             x: 73, y: 78 },
    { posLabel: 'RWB', playerId: 'walker',             x: 92, y: 72 },
    { posLabel: 'CM',  playerId: 'silva',              x: 28, y: 56 },
    { posLabel: 'CDM', playerId: 'rodri',              x: 50, y: 58 },
    { posLabel: 'CM',  playerId: 'debruyne',           x: 72, y: 56 },
    { posLabel: 'ST',  playerId: 'haaland',            x: 35, y: 24 },
    { posLabel: 'ST',  playerId: 'foden',              x: 65, y: 24 },
  ],
};

const AVAILABLE_FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '5-3-2'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const avatarBg = (id: string) => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const h1 = (hash * 37) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1},55%,28%), hsl(${h2},65%,16%))`;
};

const ratingColor = (r: number) => {
  if (r >= 90) return C.primary;
  if (r >= 85) return '#6fd66f';
  if (r >= 80) return '#a0e050';
  return C.secondary;
};

// ─── Slot state ───────────────────────────────────────────────────────────────

interface SlotState {
  id: string; // unique slot id e.g. "0", "1" ...
  posLabel: string;
  playerId: string;
  isGK?: boolean;
  x: number; // % from left of pitch
  y: number; // % from top of pitch
}

function buildSlots(formation: Formation): SlotState[] {
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: s.playerId,
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}

// ─── Player Node Component ────────────────────────────────────────────────────

interface PlayerNodeProps {
  player: Player | null;
  posLabel: string;
  isGK?: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isSwapTarget: boolean;
  showContext: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onInfo: () => void;
  onSwap: () => void;
}

const PlayerNode: React.FC<PlayerNodeProps> = ({
  player, posLabel, isGK, isSelected, isDragging, isSwapTarget,
  showContext, onMouseDown, onClick, onInfo, onSwap,
}) => {
  const initial = player ? player.shortName.charAt(0).toUpperCase() : posLabel.charAt(0);
  const accent = isGK ? C.secondary : C.primary;
  const borderColor = isSelected ? accent : isSwapTarget ? `${C.primary}88` : 'rgba(255,255,255,0.15)';
  const glowColor = isGK ? 'rgba(255,198,64,0.25)' : 'rgba(74,225,118,0.25)';

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        position: 'relative', cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.55 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s',
        // Animate bounce-in when not dragging
        animation: isDragging ? 'none' : undefined,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Glow ring when selected */}
      {(isSelected || isSwapTarget) && (
        <Box sx={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 64, height: 64, borderRadius: '50%',
          background: isSwapTarget ? `${C.primary}20` : `${accent}30`,
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Avatar circle */}
      <Box sx={{
        width: 60, height: 60, borderRadius: '50%',
        background: player ? avatarBg(player.id) : 'rgba(46,53,69,0.5)',
        border: `${isSelected ? 2.5 : 1.5}px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: isSelected
          ? `0 10px 30px ${glowColor}, 0 0 0 4px ${accent}20`
          : isSwapTarget
          ? `0 0 0 2px ${C.primary}55, 0 6px 20px rgba(7,14,29,0.5)`
          : '0 10px 20px rgba(7,14,29,0.6)',
        transition: 'all 0.2s ease',
        position: 'relative', zIndex: 1,
        '&:hover': {
          borderColor: accent,
          transform: 'scale(1.06)',
          boxShadow: `0 14px 28px rgba(7,14,29,0.7), 0 0 0 2px ${accent}40`,
        },
      }}>
        {player ? (
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: '"Space Grotesk", sans-serif', userSelect: 'none' }}>
            {initial}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>
            {posLabel}
          </Typography>
        )}
      </Box>

      {/* Name badge */}
      {player && (
        isSelected ? (
          <Box sx={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
            px: 1.5, py: 0.5, borderRadius: '6px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(74,225,118,0.25)',
            pointerEvents: 'none',
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.onPrimary, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              {player.shortName}
            </Typography>
            <Typography sx={{ fontSize: 10, color: `${C.onPrimary}cc`, fontFamily: '"Lexend", sans-serif', lineHeight: 1 }}>
              {posLabel} • {player.rating}
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            ...glass({ borderRadius: '6px', border: `1px solid rgba(66,72,67,0.4)` }),
            px: 1.5, py: 0.4,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.onSurface, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              {player.shortName}
            </Typography>
            <Typography sx={{ fontSize: 10, color: isGK ? C.secondary : C.primary, fontFamily: '"Lexend", sans-serif', lineHeight: 1 }}>
              {posLabel} • {player.rating}
            </Typography>
          </Box>
        )
      )}

      {/* Context menu */}
      {showContext && (
        <Box sx={{
          position: 'absolute', top: 66, left: '50%', transform: 'translateX(-10%)',
          zIndex: 200,
          ...glass({ borderRadius: '12px', border: `1px solid rgba(66,72,67,0.4)`, p: '8px' }),
          boxShadow: '0 20px 40px rgba(7,14,29,0.8)',
          display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 120,
        }}
          onClick={e => e.stopPropagation()}
        >
          <Box onClick={onInfo} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 1.5, py: 1, borderRadius: '6px', cursor: 'pointer',
            fontSize: 12, color: C.onSurface, fontFamily: '"Manrope", sans-serif',
            '&:hover': { background: C.surfaceContainerHigh },
            transition: 'background 0.15s',
          }}>
            <span>Info</span>
            <span style={{ fontSize: 14 }}>ℹ️</span>
          </Box>
          <Box onClick={onSwap} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 1.5, py: 1, borderRadius: '6px', cursor: 'pointer',
            fontSize: 12, color: C.secondary, fontFamily: '"Manrope", sans-serif',
            '&:hover': { background: C.surfaceContainerHigh },
            transition: 'background 0.15s',
          }}>
            <span>Swap</span>
            <span style={{ fontSize: 14 }}>🔄</span>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FootballLineupPage() {
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>(() => buildSlots('4-3-3'));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  const [swapMode, setSwapMode] = useState<{ slotId: string; playerId: string } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'firstxi' | 'bench' | 'reserves' | 'analysis'>('firstxi');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; type: 'success' | 'info' | 'warning' }>({ open: false, msg: '', type: 'success' });

  // Drag state (refs to avoid re-renders)
  const pitchRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef<{
    slotId: string;
    startMouseX: number;
    startMouseY: number;
    startX: number; // % position at drag start
    startY: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  // Ghost node position
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

  const playerById = useCallback((id: string | null | undefined): Player | null => {
    if (!id) return null;
    return ALL_PLAYERS.find(p => p.id === id) ?? null;
  }, []);

  const pitchPlayerIds = useMemo(() => {
    return new Set(slots.map(s => s.playerId).filter(Boolean));
  }, [slots]);

  const benchPlayers = useMemo(() => {
    return ALL_PLAYERS.filter(p => !pitchPlayerIds.has(p.id));
  }, [pitchPlayerIds]);

  // Team ratings
  const teamRatings = useMemo(() => {
    const attackPos = ['ST', 'CF', 'LW', 'RW', 'CAM'];
    const midPos = ['CM', 'CDM', 'CAM', 'LM', 'RM', 'LWB', 'RWB'];
    const defPos = ['GK', 'LB', 'CB', 'RB'];
    const avg = (positions: string[]) => {
      const relevant = slots.filter(s => positions.includes(s.posLabel)).map(s => playerById(s.playerId)).filter(Boolean) as Player[];
      if (!relevant.length) return 0;
      return Math.round(relevant.reduce((acc, p) => acc + p.rating, 0) / relevant.length);
    };
    return { attack: avg(attackPos), midfield: avg(midPos), defense: avg(defPos) };
  }, [slots, playerById]);

  const filledCount = slots.filter(s => s.playerId).length;

  // ─── Formation change ─────────────────────────────────────────────────────

  const handleFormationChange = (f: Formation) => {
    setFormation(f);
    setSlots(buildSlots(f));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: `Đã chuyển sang sơ đồ ${f}`, type: 'info' });
  };

  const handleReset = () => {
    setFormation('4-3-3');
    setSlots(buildSlots('4-3-3'));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: 'Đã reset đội hình', type: 'info' });
  };

  const handleSave = () => {
    setSnack({ open: true, msg: '✅ Đã lưu đội hình thành công!', type: 'success' });
  };

  // ─── Click logic ──────────────────────────────────────────────────────────

  const handleNodeClick = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (swapMode) {
      if (swapMode.slotId !== slotId) {
        setSlots(prev => {
          const next = [...prev];
          const ai = next.findIndex(s => s.id === swapMode.slotId);
          const bi = next.findIndex(s => s.id === slotId);
          const aId = next[ai].playerId;
          const bId = next[bi].playerId;
          next[ai] = { ...next[ai], playerId: bId };
          next[bi] = { ...next[bi], playerId: aId };
          return next;
        });
        setSnack({ open: true, msg: 'Đã hoán đổi vị trí thành công!', type: 'success' });
      }
      setSwapMode(null);
      setSelectedId(null);
      setContextId(null);
      return;
    }
    if (selectedId === slotId) {
      setContextId(contextId === slotId ? null : slotId);
    } else {
      setSelectedId(slotId);
      setContextId(null);
    }
  };

  // ─── Drag logic ───────────────────────────────────────────────────────────

  const handleMouseDown = (slotId: string, e: React.MouseEvent) => {
    // Only left button
    if (e.button !== 0) return;
    // Don't start drag immediately – we allow click to still work
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    dragging.current = {
      slotId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: slot.x,
      startY: slot.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !pitchRef.current) return;
      const { slotId, startMouseX, startMouseY, startX, startY } = dragging.current;

      const rect = pitchRef.current.getBoundingClientRect();
      const dx = ((e.clientX - startMouseX) / rect.width) * 100;
      const dy = ((e.clientY - startMouseY) / rect.height) * 100;

      const DIST_THRESH = 1.5; // % threshold before drag starts
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < DIST_THRESH && !draggingId) return;

      if (!draggingId) setDraggingId(slotId);

      // Calculate new position, clamped to pitch bounds (with margin)
      const newX = Math.max(5, Math.min(95, startX + dx));
      const newY = Math.max(4, Math.min(96, startY + dy));

      setGhostPos({ x: newX, y: newY });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { slotId, startMouseX, startMouseY, startX, startY } = dragging.current;

      if (draggingId && pitchRef.current) {
        // commit position
        const rect = pitchRef.current.getBoundingClientRect();
        const dx = ((e.clientX - startMouseX) / rect.width) * 100;
        const dy = ((e.clientY - startMouseY) / rect.height) * 100;
        const newX = Math.max(5, Math.min(95, startX + dx));
        const newY = Math.max(4, Math.min(96, startY + dy));

        setSlots(prev =>
          prev.map(s => s.id === slotId ? { ...s, x: newX, y: newY } : s)
        );
      }

      dragging.current = null;
      setDraggingId(null);
      setGhostPos(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingId]);

  // ─── Add from bench ───────────────────────────────────────────────────────

  const handleAddBench = (player: Player) => {
    const emptySlot = slots.find(s => !s.playerId);
    if (!emptySlot) {
      setSnack({ open: true, msg: 'Không còn vị trí trống trên sân', type: 'warning' });
      return;
    }
    setSlots(prev => prev.map(s => s.id === emptySlot.id ? { ...s, playerId: player.id } : s));
    setSnack({ open: true, msg: `Đã thêm ${player.shortName} vào đội hình`, type: 'success' });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  // Ghost slot (the one currently being dragged — shown at original position, dimmed)
  const draggingSlot = draggingId ? slots.find(s => s.id === draggingId) : null;
  const draggingPlayer = draggingSlot ? playerById(draggingSlot.playerId) : null;

  return (
    <PageContainer title="Football Lineup Builder" description="Tactical Lens - Quản lý đội hình bóng đá">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@200..800&family=Lexend:wght@100..900&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn  { from { transform: translate(-50%,-50%) scale(0.8); opacity:0; } to { transform: translate(-50%,-50%) scale(1); opacity:1; } }
        .tl-fadein { animation: fadeIn 0.35s ease; }
      `}</style>

      <Box
        className="tl-fadein"
        sx={{
          height: 'calc(100vh - 80px)',
          maxHeight: 'calc(100vh - 80px)',
          background: C.background,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Manrope", sans-serif',
        }}
        onClick={() => { setContextId(null); }}
      >
        {/* ── TOP NAVBAR ── */}
        <Box sx={{
          background: C.background,
          borderBottom: `1px solid rgba(66,72,67,0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 4, height: 64, flexShrink: 0, zIndex: 50,
        }}>
          <Box display="flex" alignItems="center" gap={6}>
            <Typography sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900, fontStyle: 'italic',
              fontSize: 22, letterSpacing: '-0.5px',
              color: C.primary,
            }}>
              TACTICAL LENS
            </Typography>
            <Box display="flex" gap={0}>
              {(['Lineup', 'Tactics', 'Team'] as const).map((tab, i) => (
                <Box key={tab} sx={{
                  px: 2, py: 1,
                  fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                  fontFamily: '"Space Grotesk", sans-serif',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  color: i === 0 ? C.primary : C.onSurfaceVariant,
                  borderBottom: i === 0 ? `2px solid ${C.primary}` : '2px solid transparent',
                  '&:hover': { color: C.onSurface, background: C.surfaceContainerLow },
                  transition: 'all 0.15s',
                }}>
                  {tab}
                </Box>
              ))}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {['notifications', 'settings'].map(icon => (
              <Box key={icon} sx={{
                color: C.onSurfaceVariant, cursor: 'pointer',
                '&:hover': { color: C.onSurface },
                transition: 'color 0.15s', fontSize: 22,
              }}>
                {icon === 'notifications' ? '🔔' : '⚙️'}
              </Box>
            ))}
            <Box onClick={handleSave} sx={{
              background: C.primary, color: C.onPrimary,
              fontWeight: 700, fontSize: 14,
              fontFamily: '"Space Grotesk", sans-serif',
              px: 3, py: 1, borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(74,225,118,0.2)',
              '&:hover': { background: C.primaryFixed },
              transition: 'all 0.15s', userSelect: 'none',
            }}>
              Lưu đội hình
            </Box>
            <Box sx={{
              width: 40, height: 40, borderRadius: '50%',
              background: C.surfaceContainer,
              border: `1px solid rgba(66,72,67,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer',
            }}>
              👤
            </Box>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* ── SIDEBAR ── */}
          <Box sx={{
            width: 280, flexShrink: 0,
            background: C.surfaceContainerLow,
            boxShadow: '20px 0 40px rgba(7,14,29,0.4)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            minHeight: 0,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
          }}>
            {/* Team info */}
            <Box sx={{
              px: 3, py: 3,
              borderBottom: `1px solid ${C.surfaceContainer}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                background: C.surfaceContainerHigh,
                border: `2px solid ${C.surfaceBright}`,
                boxShadow: '0 0 20px rgba(74,225,118,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              }}>
                🛡️
              </Box>
              <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18, color: C.onSurface }}>
                Manchester City
              </Typography>
              <Typography sx={{ fontFamily: '"Lexend", sans-serif', fontSize: 13, color: C.onSurfaceVariant }}>
                Premier League
              </Typography>
              <Box sx={{
                mt: 1, width: '100%', py: 1.2,
                background: C.surfaceContainerHigh,
                border: `1px solid rgba(66,72,67,0.3)`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                cursor: 'pointer',
                '&:hover': { background: C.surfaceBright },
                transition: 'background 0.15s',
              }}>
                <Typography sx={{ color: C.primary, fontSize: 18, lineHeight: 1 }}>+</Typography>
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontSize: 14, color: C.onSurface, fontWeight: 500 }}>
                  Thêm cầu thủ
                </Typography>
              </Box>
            </Box>

            {/* Nav tabs */}
            <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {([
                { key: 'firstxi',  label: 'Đội hình chính', emoji: '👥' },
                { key: 'bench',    label: 'Dự bị',           emoji: '🪑' },
                { key: 'reserves', label: 'Dự phòng',        emoji: '🔁' },
                { key: 'analysis', label: 'Phân tích',        emoji: '📊' },
              ] as const).map(tab => {
                const active = sidebarTab === tab.key;
                return (
                  <Box key={tab.key} onClick={() => setSidebarTab(tab.key)} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.5, borderRadius: '4px',
                    borderLeft: active ? `4px solid ${C.primary}` : '4px solid transparent',
                    background: active ? `linear-gradient(90deg, ${C.primaryContainer}, transparent)` : 'transparent',
                    color: active ? C.primary : C.onSurfaceVariant,
                    cursor: 'pointer',
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: active ? 700 : 500,
                    fontSize: 14,
                    '&:hover': { color: active ? C.primary : C.onSurface, background: active ? undefined : C.surfaceContainerHigh },
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 18 }}>{tab.emoji}</span>
                    {tab.label}
                  </Box>
                );
              })}
            </Box>

            {/* Available players header */}
            <Box sx={{ px: 3, pt: 2, pb: 1 }}>
              <Typography sx={{
                fontFamily: '"Lexend", sans-serif', fontSize: 11, fontWeight: 600,
                letterSpacing: 2, textTransform: 'uppercase', color: C.onSurfaceVariant,
              }}>
                Cầu thủ khả dụng ({benchPlayers.length})
              </Typography>
            </Box>

            {/* Bench list */}
            <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1, pb: 3 }}>
              {benchPlayers.map(p => (
                <Box key={p.id} onClick={() => handleAddBench(p)} sx={{
                  background: C.surfaceContainer,
                  border: `1px solid transparent`,
                  borderRadius: '12px', p: 1.5,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  cursor: 'pointer',
                  '&:hover': {
                    background: C.surfaceContainerHigh,
                    borderColor: 'rgba(66,72,67,0.3)',
                    transform: 'translateX(3px)',
                  },
                  transition: 'all 0.15s',
                }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: avatarBg(p.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    flexShrink: 0,
                  }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: '"Space Grotesk", sans-serif' }}>
                      {p.shortName.charAt(0)}
                    </Typography>
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 13, fontWeight: 600, color: C.onSurface, lineHeight: 1.2 }}>
                      {p.shortName}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Lexend", sans-serif', fontSize: 11, color: C.onSurfaceVariant }}>
                      {p.pos} • {p.rating} OVR
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: C.surfaceContainerHighest,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 12, fontWeight: 700, color: ratingColor(p.rating) }}>
                      {p.jerseyNumber}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Bottom nav */}
            <Box sx={{ mt: 'auto', borderTop: `1px solid ${C.surfaceContainer}`, p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {[{ icon: '📅', label: 'Lịch sử' }, { icon: '⚙️', label: 'Cài đặt' }].map(item => (
                <Box key={item.label} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1,
                  borderRadius: '8px', cursor: 'pointer',
                  color: C.onSurfaceVariant, fontSize: 13, fontFamily: '"Manrope", sans-serif',
                  '&:hover': { color: C.onSurface, background: C.surfaceContainerHigh },
                  transition: 'all 0.15s',
                }}>
                  <span>{item.icon}</span>{item.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── MAIN PITCH CANVAS ── */}
          <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'stretch', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>

            {/* Pitch background */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Box sx={{
                position: 'absolute', inset: 0,
                background: `
                  repeating-linear-gradient(
                    180deg,
                    rgba(0,0,0,0) 0px, rgba(0,0,0,0) 48px,
                    rgba(0,0,0,0.07) 48px, rgba(0,0,0,0.07) 96px
                  ),
                  linear-gradient(178deg, #183618 0%, #1e4a1e 20%, #22562a 50%, #1e4a1e 80%, #183618 100%)
                `,
                opacity: 0.85,
              }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(12,19,34,0.35)' }} />

              {/* SVG pitch markings */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <rect x="4" y="2" width="92" height="96" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="0.35" />
                <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(255,255,255,0.17)" strokeWidth="0.35" />
                <circle cx="50" cy="50" r="10.5" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="0.35" />
                <circle cx="50" cy="50" r="0.7" fill="rgba(255,255,255,0.35)" />
                <rect x="24" y="2" width="52" height="16" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="0.3" />
                <rect x="37" y="2" width="26" height="6.5" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="0.3" />
                <circle cx="50" cy="12" r="0.5" fill="rgba(255,255,255,0.25)" />
                <path d="M38,18 A13,13 0 0 1 62,18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
                <rect x="24" y="82" width="52" height="16" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="0.3" />
                <rect x="37" y="90.5" width="26" height="7.5" fill="none" stroke="rgba(255,255,255,0.17)" strokeWidth="0.3" />
                <circle cx="50" cy="88" r="0.5" fill="rgba(255,255,255,0.25)" />
                <path d="M38,82 A13,13 0 0 0 62,82" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
                <path d="M4,4 A2,2 0 0 1 6,2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
                <path d="M96,4 A2,2 0 0 0 94,2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
                <path d="M4,96 A2,2 0 0 0 6,98" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
                <path d="M96,96 A2,2 0 0 1 94,98" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
              </svg>
            </Box>

            {/* Formation selector - top right */}
            <Box sx={{
              position: 'absolute', top: 20, right: 24, zIndex: 30,
              display: 'flex', gap: 1.5, alignItems: 'center',
            }}>
              <Box sx={{
                ...glass({ borderRadius: '12px', border: `1px solid rgba(66,72,67,0.25)`, p: '4px' }),
                display: 'flex', alignItems: 'center', gap: 0.5,
              }}>
                {AVAILABLE_FORMATIONS.map(f => (
                  <Box key={f} onClick={() => handleFormationChange(f)} sx={{
                    px: 2, py: 1, borderRadius: '8px',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: formation === f ? 700 : 400,
                    fontSize: 13,
                    color: formation === f ? C.onSurface : C.onSurfaceVariant,
                    background: formation === f ? C.surfaceContainerHigh : 'transparent',
                    boxShadow: formation === f ? '0 2px 8px rgba(7,14,29,0.3)' : 'none',
                    cursor: 'pointer',
                    '&:hover': { color: C.onSurface },
                    transition: 'all 0.15s',
                  }}>
                    {f}
                  </Box>
                ))}
              </Box>
              <Box onClick={handleReset} sx={{
                ...glass({ borderRadius: '12px', border: `1px solid rgba(66,72,67,0.25)`, px: 2, py: 1.2 }),
                display: 'flex', alignItems: 'center', gap: 1,
                fontFamily: '"Lexend", sans-serif', fontSize: 13,
                color: C.onSurface, cursor: 'pointer',
                '&:hover': { background: C.surfaceContainer },
                transition: 'all 0.15s',
              }}>
                <span>↺</span> Reset
              </Box>
            </Box>

            {/* Drag hint */}
            <Box sx={{
              position: 'absolute', top: 20, left: 24, zIndex: 30,
              ...glass({ borderRadius: '10px', border: `1px solid rgba(66,72,67,0.2)`, px: 2, py: 1 }),
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <span style={{ fontSize: 14 }}>✋</span>
              <Typography sx={{ fontSize: 11, color: C.onSurfaceVariant, fontFamily: '"Lexend", sans-serif' }}>
                Kéo thả vị trí tự do
              </Typography>
            </Box>

            {/* ── FREE-POSITIONED PITCH (absolute %) ── */}
            <Box
              ref={pitchRef}
              sx={{
                position: 'absolute', inset: 0, zIndex: 10,
                cursor: draggingId ? 'grabbing' : 'default',
              }}
            >
              {slots.map(slot => {
                const player = playerById(slot.playerId);
                const isDraggingThis = draggingId === slot.id;
                const isSelected = selectedId === slot.id;
                const showCtx = contextId === slot.id;
                const isSwapTarget = !!swapMode && swapMode.slotId !== slot.id;

                return (
                  <Box
                    key={slot.id}
                    sx={{
                      position: 'absolute',
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDraggingThis ? 5 : isSelected ? 4 : 2,
                      transition: isDraggingThis ? 'none' : 'left 0.25s cubic-bezier(0.34,1.56,0.64,1), top 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                  >
                    <PlayerNode
                      player={player}
                      posLabel={slot.posLabel}
                      isGK={slot.isGK}
                      isSelected={isSelected}
                      isDragging={isDraggingThis}
                      isSwapTarget={isSwapTarget}
                      showContext={showCtx}
                      onMouseDown={(e) => handleMouseDown(slot.id, e)}
                      onClick={(e) => handleNodeClick(slot.id, e)}
                      onInfo={() => setContextId(null)}
                      onSwap={() => {
                        if (player) setSwapMode({ slotId: slot.id, playerId: player.id });
                        setContextId(null);
                        setSnack({ open: true, msg: 'Hãy click vào vị trí muốn hoán đổi', type: 'info' });
                      }}
                    />
                  </Box>
                );
              })}

              {/* Ghost node – follows mouse while dragging */}
              {draggingId && ghostPos && draggingSlot && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${ghostPos.x}%`,
                    top: `${ghostPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100,
                    pointerEvents: 'none',
                    animation: 'none',
                  }}
                >
                  {/* Simplified ghost avatar */}
                  <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}>
                    <Box sx={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: draggingPlayer ? avatarBg(draggingPlayer.id) : 'rgba(46,53,69,0.8)',
                      border: `2.5px solid ${draggingSlot.isGK ? C.secondary : C.primary}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 12px 30px rgba(7,14,29,0.8), 0 0 0 4px ${draggingSlot.isGK ? C.secondary : C.primary}33`,
                      opacity: 0.95,
                    }}>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: '"Space Grotesk", sans-serif', userSelect: 'none' }}>
                        {draggingPlayer ? draggingPlayer.shortName.charAt(0) : draggingSlot.posLabel.charAt(0)}
                      </Typography>
                    </Box>
                    {draggingPlayer && (
                      <Box sx={{
                        background: `${draggingSlot.isGK ? C.secondary : C.primary}22`,
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${draggingSlot.isGK ? C.secondary : C.primary}55`,
                        px: 1.5, py: 0.4, borderRadius: '6px',
                      }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.onSurface, fontFamily: '"Space Grotesk", sans-serif', whiteSpace: 'nowrap' }}>
                          {draggingPlayer.shortName}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* ── TEAM RATINGS PANEL (bottom right) ── */}
            <Box sx={{
              position: 'absolute', bottom: 24, right: 24, zIndex: 30,
              width: 240,
              ...glass({ borderRadius: '16px', border: `1px solid rgba(66,72,67,0.25)`, p: '16px' }),
              boxShadow: '0 20px 40px rgba(7,14,29,0.5)',
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <span style={{ fontSize: 14 }}>📊</span>
                <Typography sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  textTransform: 'uppercase', color: C.onSurfaceVariant,
                }}>
                  Team Ratings
                </Typography>
              </Box>
              {[
                { label: 'Attack',   value: teamRatings.attack,   color: C.primary },
                { label: 'Midfield', value: teamRatings.midfield, color: C.primary },
                { label: 'Defense',  value: teamRatings.defense,  color: C.secondary },
              ].map(stat => (
                <Box key={stat.label} mb={1.5}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography sx={{ fontFamily: '"Lexend", sans-serif', fontSize: 11, color: C.onSurface }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Lexend", sans-serif', fontSize: 11, fontWeight: 700, color: stat.color }}>
                      {stat.value || '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, width: '100%', background: C.surfaceContainerHighest, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%',
                      width: `${stat.value}%`,
                      background: stat.color,
                      borderRadius: 3,
                      transition: 'width 0.6s ease',
                    }} />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Swap mode banner */}
            {swapMode && (
              <Box sx={{
                position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                zIndex: 40,
                ...glass({ borderRadius: '12px', border: `1px solid ${C.primary}44`, px: 3, py: 1.5 }),
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <span>🔄</span>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: '"Manrope", sans-serif' }}>
                  Chọn vị trí cần hoán đổi…
                </Typography>
                <Box onClick={() => setSwapMode(null)} sx={{
                  ml: 1, px: 1.5, py: 0.5, borderRadius: '6px',
                  background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
                  fontSize: 12, color: C.onSurfaceVariant,
                  '&:hover': { color: C.onSurface },
                }}>
                  Huỷ
                </Box>
              </Box>
            )}

            {/* Quick stats - bottom left */}
            <Box sx={{
              position: 'absolute', bottom: 24, left: 24, zIndex: 30,
              display: 'flex', gap: 1,
            }}>
              <Box sx={{
                ...glass({ borderRadius: '8px', border: `1px solid rgba(74,225,118,0.2)`, px: 1.5, py: 0.8 }),
                display: 'flex', alignItems: 'center', gap: 0.8,
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.primary, fontFamily: '"Lexend", sans-serif' }}>
                  {filledCount}/11
                </Typography>
              </Box>
              <Box sx={{
                ...glass({ borderRadius: '8px', border: `1px solid rgba(66,72,67,0.25)`, px: 1.5, py: 0.8 }),
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.onSurfaceVariant, fontFamily: '"Lexend", sans-serif' }}>
                  {formation}
                </Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
