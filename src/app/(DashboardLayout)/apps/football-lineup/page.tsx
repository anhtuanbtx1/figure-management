"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Box, Typography, Snackbar, Alert, Grid } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import TeamManagement from './TeamManagement';
import CategoryManagement from './CategoryManagement';
import TacticsBoard from './TacticsBoard';

// ─── Constants & Types ────────────────────────────────────────────────────────

const C = {
  background: '#0a0f0d',
  surfaceContainerLow: 'rgba(28,34,29,0.5)',
  surfaceContainer: 'rgba(38,44,39,0.7)',
  surfaceContainerHigh: 'rgba(48,54,49,0.85)',
  surfaceContainerHighest: 'rgba(66,72,67,1)',
  surfaceBright: 'rgba(80,88,82,1)',
  primary: '#4ae176', // vibrant green
  primaryContainer: '#0b4a22',
  onPrimary: '#00210b',
  primaryFixed: '#7cf69d',
  secondary: '#a1d3a5',
  onSurface: '#e1e3de',
  onSurfaceVariant: '#c1c9c2',
  outlineVariant: 'rgba(255,255,255,0.15)',
};

function glass(override: any = {}) {
  return {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    ...override
  };
}

export type Formation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1';

export interface Player {
  id: string;
  name: string;
  shortName: string;
  pos: string;
  rating: number;
  jerseyNumber: number;
  avatar?: string;
}

export interface SlotState {
  id: string;
  posLabel: string;
  playerId: string; // empty string means unassigned
  isGK: boolean;
  x: number;
  y: number;
}

const FORMATIONS: Record<Formation, { posLabel: string; isGK: boolean; x: number; y: number }[]> = {
  '4-3-3': [
    { posLabel: 'GK', isGK: true, x: 50, y: 92 },
    { posLabel: 'LB', isGK: false, x: 15, y: 75 },
    { posLabel: 'CB', isGK: false, x: 35, y: 80 },
    { posLabel: 'CB', isGK: false, x: 65, y: 80 },
    { posLabel: 'RB', isGK: false, x: 85, y: 75 },
    { posLabel: 'CM', isGK: false, x: 30, y: 55 },
    { posLabel: 'CDM', isGK: false, x: 50, y: 65 },
    { posLabel: 'CM', isGK: false, x: 70, y: 55 },
    { posLabel: 'LW', isGK: false, x: 20, y: 25 },
    { posLabel: 'ST', isGK: false, x: 50, y: 15 },
    { posLabel: 'RW', isGK: false, x: 80, y: 25 },
  ],
  '4-4-2': [
    { posLabel: 'GK', isGK: true, x: 50, y: 92 },
    { posLabel: 'LB', isGK: false, x: 15, y: 75 },
    { posLabel: 'CB', isGK: false, x: 35, y: 80 },
    { posLabel: 'CB', isGK: false, x: 65, y: 80 },
    { posLabel: 'RB', isGK: false, x: 85, y: 75 },
    { posLabel: 'LM', isGK: false, x: 15, y: 50 },
    { posLabel: 'CM', isGK: false, x: 35, y: 55 },
    { posLabel: 'CM', isGK: false, x: 65, y: 55 },
    { posLabel: 'RM', isGK: false, x: 85, y: 50 },
    { posLabel: 'ST', isGK: false, x: 35, y: 20 },
    { posLabel: 'ST', isGK: false, x: 65, y: 20 },
  ],
  '3-5-2': [
    { posLabel: 'GK', isGK: true, x: 50, y: 92 },
    { posLabel: 'CB', isGK: false, x: 25, y: 80 },
    { posLabel: 'CB', isGK: false, x: 50, y: 82 },
    { posLabel: 'CB', isGK: false, x: 75, y: 80 },
    { posLabel: 'LM', isGK: false, x: 15, y: 45 },
    { posLabel: 'CDM', isGK: false, x: 35, y: 60 },
    { posLabel: 'CAM', isGK: false, x: 50, y: 40 },
    { posLabel: 'CDM', isGK: false, x: 65, y: 60 },
    { posLabel: 'RM', isGK: false, x: 85, y: 45 },
    { posLabel: 'ST', isGK: false, x: 35, y: 15 },
    { posLabel: 'ST', isGK: false, x: 65, y: 15 },
  ],
  '4-2-3-1': [
    { posLabel: 'GK', isGK: true, x: 50, y: 92 },
    { posLabel: 'LB', isGK: false, x: 15, y: 75 },
    { posLabel: 'CB', isGK: false, x: 35, y: 80 },
    { posLabel: 'CB', isGK: false, x: 65, y: 80 },
    { posLabel: 'RB', isGK: false, x: 85, y: 75 },
    { posLabel: 'CDM', isGK: false, x: 35, y: 60 },
    { posLabel: 'CDM', isGK: false, x: 65, y: 60 },
    { posLabel: 'LAM', isGK: false, x: 20, y: 40 },
    { posLabel: 'CAM', isGK: false, x: 50, y: 35 },
    { posLabel: 'RAM', isGK: false, x: 80, y: 40 },
    { posLabel: 'ST', isGK: false, x: 50, y: 15 },
  ]
};

const AVAILABLE_FORMATIONS: Formation[] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'];

function ratingColor(val: number) {
  if (val > 90) return '#ff4d4d'; // Red for legends
  if (val < 80) return '#f4ee86'; // Yellow for low tier
  return '#4ae176'; // Green for standard
}

function avatarBg(id: string) {
  const c = parseInt(id) || 1;
  const colors = [
    'linear-gradient(135deg, #102e1c, #0a1f13)',
    'linear-gradient(135deg, #153a42, #0d252b)',
    'linear-gradient(135deg, #3d2314, #24140b)',
    'linear-gradient(135deg, #2b1736, #180d1f)',
  ];
  return colors[c % colors.length];
}

function buildSlotsForDb(formation: Formation, fallbackPlayers: Player[]): SlotState[] {
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: fallbackPlayers[i] ? fallbackPlayers[i].id : '',
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}

// ─── Player Node Component ────────────────────────────────────────────────────

const PlayerNode = ({
  player, posLabel, isGK,
  isSelected, isDragging, isSwapTarget, showContext,
  onMouseDown, onClick, onSwap, onInfo
}: any) => {
  return (
    <Box
      onMouseDown={onMouseDown}
      onClick={onClick}
      sx={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
        cursor: isDragging ? 'grabbing' : 'pointer',
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <Box sx={{
        width: 56, height: 56, borderRadius: '50%',
        background: player ? avatarBg(player.id) : 'rgba(46,53,69,0.8)',
        border: `2px solid ${isGK ? C.secondary : C.primary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 24px rgba(7,14,29,0.7), inset 0 0 10px rgba(255,255,255,0.1)`,
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        transform: isSelected ? 'scale(1.15) translateY(-4px)' : 'scale(1)',
        borderColor: isSwapTarget ? '#fff' : isSelected ? '#fff' : (isGK ? C.secondary : C.primary),
        overflow: 'hidden'
      }}>
        {player ? (
            <img 
              src={player.avatar || `https://i.pravatar.cc/150?u=${player.id}`}
              alt={player.shortName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', pointerEvents: 'none' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
        ) : (
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: '"Space Grotesk", sans-serif', userSelect: 'none' }}>
            {posLabel}
          </Typography>
        )}
      </Box>
      <Box sx={{
        background: `${isGK ? C.secondary : C.primary}11`,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${isGK ? C.secondary : C.primary}33`,
        px: 1, py: 0.2, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: 60
      }}>
        {player ? (
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: C.onSurface, fontFamily: '"Space Grotesk", sans-serif', whiteSpace: 'nowrap', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {player.shortName} <Box component="span" sx={{ color: ratingColor(player.rating), fontSize: 11 }}>{player.rating}</Box>
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: C.onSurfaceVariant, fontFamily: '"Space Grotesk", sans-serif', userSelect: 'none' }}>
            Trống
          </Typography>
        )}
      </Box>

      {/* Context Menu Popup */}
      {showContext && (
        <Box sx={{
          position: 'absolute', top: '100%', mt: 1, zIndex: 50,
          ...glass({ borderRadius: '12px', border: `1px solid rgba(255,255,255,0.1)`, p: '4px' }),
          display: 'flex', flexDirection: 'column', minWidth: 140,
        }}>
          {player && (
            <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: C.primary, fontFamily: '"Space Grotesk", sans-serif' }}>
                {player.rating} OVR
              </Typography>
              <Typography sx={{ fontSize: 11, color: C.onSurfaceVariant }}>
                Hiệu suất thi đấu
              </Typography>
            </Box>
          )}
          <Box onClick={onSwap} sx={{
            px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
            fontSize: 12, color: C.onSurface, fontWeight: 600, fontFamily: '"Space Grotesk", sans-serif',
            '&:hover': { background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }
          }}>
            <span>🔄</span> Đổi vị trí
          </Box>
          {player && (
             <Box onClick={onInfo} sx={{
              px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
              fontSize: 12, color: C.onSurface, fontWeight: 600, fontFamily: '"Space Grotesk", sans-serif',
              '&:hover': { background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }
            }}>
              <span>ℹ️</span> Chi tiết
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FootballLineupPage() {
  const [activeTab, setActiveTab] = useState<'Lineup'|'Tactics'|'Team'|'Danh mục'>('Lineup');
  const [dbTeams, setDbTeams] = useState<any[]>([]);
  const [mappedPlayers, setMappedPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>([]);

  // Selection & UI states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  const [swapMode, setSwapMode] = useState<{ slotId: string; playerId: string } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'firstxi' | 'bench' | 'reserves' | 'analysis'>('firstxi');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; type: 'success' | 'info' | 'warning' | 'error' }>({ open: false, msg: '', type: 'success' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag states
  const pitchRef = useRef<HTMLDivElement | null>(null);
  const draggingId = useRef<string | null>(null);
  const [renderGhost, setRenderGhost] = useState<{ id: string, x: number; y: number } | null>(null);
  const dragging = useRef<{ slotId: string; startMouseX: number; startMouseY: number; startX: number; startY: number; } | null>(null);

  useEffect(() => {
    fetch('/api/football-lineups').then(r => r.json()).then(data => {
      if (data.teams) {
        setDbTeams(data.teams);
        if (data.teams.length > 0) setSelectedTeamId(data.teams[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;
    setIsLoading(true);
    fetch(`/api/football-lineups?teamId=${selectedTeamId}&formation=${formation}`)
      .then(r => r.json())
      .then(data => {
        if (data.players) {
           const parsedPlayers = data.players.map((p: any) => ({
             id: p.id.toString(),
             name: p.full_name,
             shortName: p.short_name,
             pos: p.position,
             rating: p.rating,
             jerseyNumber: p.jersey_number,
             avatar: p.avatar_url
           }));
           setMappedPlayers(parsedPlayers);

           if (data.slots && data.slots.length > 0) {
              setSlots(data.slots.map((s: any) => ({
                 id: s.id.toString(),
                 posLabel: s.pos_label,
                 playerId: s.player_id?.toString() || '',
                 isGK: s.is_gk,
                 x: Number(s.loc_x),
                 y: Number(s.loc_y)
              })));
           } else {
              setSlots(buildSlotsForDb(formation, parsedPlayers));
           }
        }
        setIsLoading(false);
      });
  }, [selectedTeamId, formation, refreshKey]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const playerById = useCallback((id: string | null | undefined): Player | null => {
    if (!id) return null;
    return mappedPlayers.find(p => p.id === id) ?? null;
  }, [mappedPlayers]);

  const pitchPlayerIds = useMemo(() => new Set(slots.map(s => s.playerId).filter(Boolean)), [slots]);
  const benchPlayers = useMemo(() => mappedPlayers.filter(p => !pitchPlayerIds.has(p.id)), [pitchPlayerIds, mappedPlayers]);

  // Team ratings logic
  const teamRatings = useMemo(() => {
    const attackPos = ['ST', 'CF', 'LW', 'RW'];
    const midPos = ['CM', 'CDM', 'CAM', 'LM', 'RM'];
    const defPos = ['CB', 'LB', 'RB', 'LWB', 'RWB'];
    const gkPos = ['GK'];

    const getAvg = (positions: string[]) => {
      const relevant = slots.filter(s => positions.includes(s.posLabel)).map(s => playerById(s.playerId)).filter(Boolean) as Player[];
      if (!relevant.length) return 0;
      return Math.round(relevant.reduce((acc, p) => acc + p.rating, 0) / relevant.length);
    };

    const allOnPitch = slots.map(s => playerById(s.playerId)).filter(Boolean) as Player[];
    const overallAvg = allOnPitch.length ? Math.round(allOnPitch.reduce((acc, p) => acc + p.rating, 0) / allOnPitch.length) : 0;

    return { 
      attack: getAvg(attackPos), 
      midfield: getAvg(midPos), 
      defense: getAvg(defPos),
      goalkeeper: getAvg(gkPos),
      average: overallAvg
    };
  }, [slots, playerById]);

  const filledCount = slots.filter(s => s.playerId).length;

  const handleFormationChange = (f: Formation) => {
    if (isLoading) return;
    setFormation(f);
    setSlots(buildSlotsForDb(f, mappedPlayers));
    setSelectedId(null); setContextId(null); setSwapMode(null);
    setSnack({ open: true, msg: `Đã chuyển sang sơ đồ ${f}`, type: 'info' });
  };

  const handleReset = () => {
    if (isLoading) return;
    setFormation('4-3-3');
    setSlots(buildSlotsForDb('4-3-3', mappedPlayers));
    setSelectedId(null); setContextId(null); setSwapMode(null);
    setSnack({ open: true, msg: 'Đã reset đội hình', type: 'info' });
  };

  const handleTeamChange = (teamId: string) => {
    if (isLoading) return;
    setSelectedTeamId(teamId);
    setSelectedId(null); setContextId(null); setSwapMode(null);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/football-lineups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeamId, name: `Đội hình ${formation}`, formation: formation, isDefault: true,
          slots: slots.map(s => ({ playerId: s.playerId, posLabel: s.posLabel, isGK: s.isGK, x: s.x, y: s.y }))
        })
      });
      if (res.ok) setSnack({ open: true, msg: '✅ Đã lưu đội hình thành công vào Database!', type: 'success' });
      else setSnack({ open: true, msg: '❌ Lưu thất bại', type: 'error' });
    } catch(e) {
      setSnack({ open: true, msg: '❌ Lỗi hệ thống', type: 'error' });
    }
  };

  // Drag logic
  const handleMouseDown = (slotId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    dragging.current = { slotId, startMouseX: e.clientX, startMouseY: e.clientY, startX: slot.x, startY: slot.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !pitchRef.current) return;
      const { slotId, startMouseX, startMouseY, startX, startY } = dragging.current;
      const rect = pitchRef.current.getBoundingClientRect();
      const dx = ((e.clientX - startMouseX) / rect.width) * 100;
      const dy = ((e.clientY - startMouseY) / rect.height) * 100;
      
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        draggingId.current = slotId;
        setRenderGhost({ id: slotId, x: Math.max(5, Math.min(95, startX + dx)), y: Math.max(4, Math.min(96, startY + dy)) });
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { slotId, startMouseX, startMouseY, startX, startY } = dragging.current;
      if (draggingId.current && pitchRef.current) {
        const rect = pitchRef.current.getBoundingClientRect();
        const dx = ((e.clientX - startMouseX) / rect.width) * 100;
        const dy = ((e.clientY - startMouseY) / rect.height) * 100;
        setSlots(prev => prev.map(s => s.id === slotId ? { ...s, x: Math.max(5, Math.min(95, startX + dx)), y: Math.max(4, Math.min(96, startY + dy)) } : s));
      }
      dragging.current = null;
      draggingId.current = null;
      setRenderGhost(null);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []);

  const handleNodeClick = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (swapMode) {
      if (swapMode.slotId !== slotId) {
        setSlots(prev => {
          const next = [...prev];
          const ai = next.findIndex(s => s.id === swapMode.slotId);
          const bi = next.findIndex(s => s.id === slotId);
          const temp = next[ai].playerId;
          next[ai] = { ...next[ai], playerId: next[bi].playerId };
          next[bi] = { ...next[bi], playerId: temp };
          return next;
        });
        setSnack({ open: true, msg: 'Đã hoán đổi vị trí thành công!', type: 'success' });
      }
      setSwapMode(null); setSelectedId(null); setContextId(null);
      return;
    }
    if (selectedId === slotId) setContextId(contextId === slotId ? null : slotId);
    else { setSelectedId(slotId); setContextId(null); }
  };

  const handleAddBench = (player: Player) => {
    // Trường hợp 1: Đang trong chế độ Swap (đã bấm nút "Đổi vị trí")
    if (swapMode) {
      setSlots(prev => prev.map(s => s.id === swapMode.slotId ? { ...s, playerId: player.id } : s));
      setSwapMode(null); setSelectedId(null); setContextId(null);
      setSnack({ open: true, msg: `🔄 Đã thay ${player.shortName} vào sân!`, type: 'success' });
      return;
    }

    // Trường hợp 2: Sân đầy nhưng đang chọn (Active) 1 cầu thủ nào đó -> Thay thế luôn
    const emptySlot = slots.find(s => !s.playerId);
    if (!emptySlot && selectedId) {
      setSlots(prev => prev.map(s => s.id === selectedId ? { ...s, playerId: player.id } : s));
      setSelectedId(null);
      setSnack({ open: true, msg: `🔄 Đã thay bằng ${player.shortName}!`, type: 'success' });
      return;
    }

    // Trường hợp 3: Còn chỗ trống -> Thêm vào chỗ trống đầu tiên
    if (emptySlot) {
      setSlots(prev => prev.map(s => s.id === emptySlot.id ? { ...s, playerId: player.id } : s));
      setSnack({ open: true, msg: `Đã thêm ${player.shortName} vào sân`, type: 'success' });
      return;
    }

    // Trường hợp 4: Hết chỗ và không chọn ai
    setSnack({ open: true, msg: 'Sân đã kín người! Hãy chọn 1 cầu thủ trên sân để thay ra.', type: 'warning' });
  };

  return (
    <PageContainer title="Tactical Lens" description="Quản lý đội hình bóng đá">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@200..800&family=Lexend:wght@100..900&display=swap');
      `}</style>
      <Box
        ref={containerRef}
        sx={{
          height: isFullscreen ? '100vh' : 'calc(100vh - 80px)',
          background: C.background, borderRadius: 2, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', fontFamily: '"Manrope", sans-serif',
        }}
        onClick={() => setContextId(null)}
      >
        {/* TOP NAVBAR */}
        <Box sx={{
          background: C.background, borderBottom: `1px solid rgba(66,72,67,0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, height: 64, flexShrink: 0
        }}>
          <Box display="flex" alignItems="center" gap={6}>
            <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: C.primary }}>
              TACTICAL LENS
            </Typography>
            <Box display="flex">
              {(['Lineup', 'Tactics', 'Team', 'Danh mục'] as const).map(tab => (
                <Box key={tab} onClick={() => setActiveTab(tab)} sx={{
                  px: 2, py: 1, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer',
                  color: activeTab === tab ? C.primary : C.onSurfaceVariant,
                  borderBottom: activeTab === tab ? `2px solid ${C.primary}` : '2px solid transparent',
                  '&:hover': { color: C.onSurface }
                }}>
                  {tab}
                </Box>
              ))}
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Box onClick={toggleFullscreen} sx={{ color: C.onSurfaceVariant, cursor: 'pointer', fontSize: 22 }}>
              {isFullscreen ? '🗗' : '⛶'}
            </Box>
            <Box onClick={handleSave} sx={{
              background: C.primary, color: C.onPrimary, fontWeight: 700, fontSize: 14, px: 3, py: 1, borderRadius: '12px', cursor: 'pointer',
              '&:hover': { background: C.primaryFixed }
            }}>Lưu đội hình</Box>
          </Box>
        </Box>

        {/* BODY */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {activeTab === 'Team' && (
            <TeamManagement teamId={selectedTeamId} players={mappedPlayers} onRefresh={() => setRefreshKey(k=>k+1)} C={C} />
          )}

          {activeTab === 'Danh mục' && (
            <CategoryManagement C={C} onRefresh={() => setRefreshKey(k=>k+1)} />
          )}

          {activeTab === 'Tactics' && (
            <TacticsBoard />
          )}

          {activeTab === 'Lineup' && (
            <>
              {/* SIDEBAR */}
              <Box sx={{ width: 280, background: C.surfaceContainerLow, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <Box sx={{ px: 3, py: 3, borderBottom: `1px solid ${C.surfaceContainer}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <select value={selectedTeamId} onChange={e => handleTeamChange(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: C.surfaceContainer, color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', outline: 'none' }}>
                    {dbTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                      {dbTeams.find(t => t.id.toString() === selectedTeamId) && (() => {
                         const t = dbTeams.find(t => t.id.toString() === selectedTeamId);
                         return (
                           <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             {t.logo_url ? (
                               <img 
                                 src={t.logo_url} 
                                 alt={t.name} 
                                 style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: '8px' }} 
                                 onError={(e) => { e.currentTarget.style.display = 'none'; }}
                               />
                             ) : (
                               <Typography sx={{ fontSize: 30 }}>⚽</Typography>
                             )}
                             <Typography sx={{ color: 'white', fontWeight: 700 }}>{t.name}</Typography>
                           </Box>
                         );
                      })()}
                </Box>

                {/* --- TEAM ANALYTICS CARD --- */}
                <Box sx={{ p: 2, borderBottom: `1px solid ${C.surfaceContainer}` }}>
                   <Box sx={{ 
                     ...glass({ borderRadius: '16px', p: 2, border: '1px solid rgba(74,225,118,0.1)' }),
                     background: 'rgba(74,225,118,0.03)'
                   }}>
                      <Typography sx={{ color: C.primary, fontSize: 11, fontWeight: 800, letterSpacing: '1px', mb: 2, textTransform: 'uppercase' }}>
                         Thống kê sức mạnh
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Tiền đạo', val: teamRatings.attack, icon: '⚽' },
                          { label: 'Tiền vệ', val: teamRatings.midfield, icon: '🛡️' },
                          { label: 'Hậu vệ', val: teamRatings.defense, icon: '🧱' },
                          { label: 'Thủ môn', val: teamRatings.goalkeeper, icon: '🧤' }
                        ].map((item, idx) => (
                          <Grid item xs={6} key={idx}>
                             <Box>
                                <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{item.icon} {item.label}</Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: '"Space Grotesk", sans-serif' }}>{item.val || '--'}</Typography>
                                <Box sx={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, mt: 0.5, overflow: 'hidden' }}>
                                   <Box sx={{ width: `${item.val}%`, height: '100%', background: C.primary, boxShadow: `0 0 10px ${C.primary}` }} />
                                </Box>
                             </Box>
                          </Grid>
                        ))}
                      </Grid>
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Typography sx={{ fontSize: 12, color: 'white', fontWeight: 700 }}>Trung bình (AVG)</Typography>
                         <Typography sx={{ fontSize: 22, color: C.primary, fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif' }}>
                            {teamRatings.average || '--'}
                         </Typography>
                      </Box>
                   </Box>
                </Box>
                {/* ---------------------------- */}

                <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ p: 2, color: C.primary, fontWeight: 700, background: `linear-gradient(90deg, ${C.primaryContainer}, transparent)`, borderLeft: `4px solid ${C.primary}`}}>👥 Đội hình chính</Box>
                </Box>
                <Box sx={{ px: 3, py: 1, color: C.onSurfaceVariant, fontSize: 11, fontWeight: 700 }}>DỰ BỊ ({benchPlayers.length})</Box>
                <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1, pb: 3 }}>
                  {benchPlayers.map(p => (
                    <Box key={p.id} onClick={() => handleAddBench(p)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: C.surfaceContainer, borderRadius: '12px', cursor: 'pointer', '&:hover': { background: C.surfaceContainerHigh }}}>
                      <img src={p.avatar || `https://i.pravatar.cc/150?u=${p.id}`} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                      <Box flex={1}>
                        <Typography sx={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{p.shortName}</Typography>
                        <Typography sx={{ color: C.onSurfaceVariant, fontSize: 11 }}>{p.pos} • {p.rating} OVR</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* PITCH */}
              <Box sx={{ flex: 1, position: 'relative', background: `linear-gradient(178deg, #183618 0%, #1e4a1e 20%, #22562a 50%, #1e4a1e 80%, #183618 100%)` }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
                  <rect x="4" y="2" width="92" height="96" fill="none" stroke="white" strokeWidth="0.3" />
                  <line x1="4" y1="50" x2="96" y2="50" stroke="white" strokeWidth="0.3" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.3" />
                  <rect x="24" y="2" width="52" height="16" fill="none" stroke="white" strokeWidth="0.3" />
                  <rect x="24" y="82" width="52" height="16" fill="none" stroke="white" strokeWidth="0.3" />
                </svg>

                {/* Top overlays */}
                <Box sx={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 1, zIndex: 10 }}>
                  <Box sx={{ ...glass({ borderRadius: '12px', p: '4px' }), display: 'flex' }}>
                    {AVAILABLE_FORMATIONS.map(f => (
                      <Box key={f} onClick={() => handleFormationChange(f)} sx={{ px: 2, py: 1, borderRadius: '8px', cursor: 'pointer', background: formation === f ? C.surfaceContainerHigh : 'transparent', color: formation === f ? 'white' : C.onSurfaceVariant }}>{f}</Box>
                    ))}
                  </Box>
                  <Box onClick={handleReset} sx={{ ...glass({ borderRadius: '12px', px: 2, py: 1 }), display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>↺ Reset</Box>
                </Box>

                {/* Nodes */}
                <Box ref={pitchRef} sx={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                  {slots.map(slot => (
                    <Box key={slot.id} sx={{ position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)', zIndex: renderGhost?.id === slot.id ? 2 : 5 }}>
                      <PlayerNode
                        player={playerById(slot.playerId)} posLabel={slot.posLabel} isGK={slot.isGK}
                        isSelected={selectedId === slot.id} isDragging={renderGhost?.id === slot.id} showContext={contextId === slot.id}
                        isSwapTarget={swapMode && swapMode.slotId !== slot.id}
                        onMouseDown={(e: any) => handleMouseDown(slot.id, e)} onClick={(e: any) => handleNodeClick(slot.id, e)}
                        onSwap={() => { if(slot.playerId) setSwapMode({ slotId: slot.id, playerId: slot.playerId }); setContextId(null); }}
                      />
                    </Box>
                  ))}
                  {renderGhost && (() => {
                    const slot = slots.find(s=>s.id === renderGhost.id)!;
                    return (
                      <Box sx={{ position: 'absolute', left: `${renderGhost.x}%`, top: `${renderGhost.y}%`, transform: 'translate(-50%, -50%)', zIndex: 50, pointerEvents: 'none' }}>
                        <PlayerNode player={playerById(slot.playerId)} posLabel={slot.posLabel} isGK={slot.isGK} />
                      </Box>
                    );
                  })()}
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
                      Chọn cầu thủ trên sân hoặc ghế dự bị để hoán đổi...
                    </Typography>
                    <Box onClick={() => setSwapMode(null)} sx={{
                      ml: 1, px: 1.5, py: 0.5, borderRadius: '6px',
                      background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
                      fontSize: 12, color: C.onSurfaceVariant,
                      '&:hover': { color: C.onSurface, background: 'rgba(255,255,255,0.15)' },
                    }}>
                      Huỷ bỏ
                    </Box>
                  </Box>
                )}

              </Box>
            </>
          )}

        </Box>
      </Box>
      <Snackbar 
        open={snack.open} 
        autoHideDuration={3000} 
        onClose={() => setSnack(s => ({...s, open: false}))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snack.type as any} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
