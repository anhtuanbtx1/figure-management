"use client";

import React, { useState } from 'react';
import { Box, Typography, Slider, Grid } from '@mui/material';

// ─── Types ──────────────────────────────────────────────────────────────────────

type PlayStyle = 'Pressing' | 'Tiki-Taka' | 'Counter Attack' | 'Direct Play' | 'Long Ball' | 'Gegenpressing';
type Mentality = 'Defensive' | 'Balanced' | 'Attacking' | 'Ultra Attacking';

interface TacticSlider {
  label: string;
  icon: string;
  min: number;
  max: number;
  value: number;
  leftLabel: string;
  rightLabel: string;
}

interface PlayStyleCard {
  id: PlayStyle;
  icon: string;
  desc: string;
  color: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const PLAY_STYLES: PlayStyleCard[] = [
  { id: 'Pressing', icon: '🔥', desc: 'Áp lực cao, cướp bóng nhanh', color: '#ff6b35' },
  { id: 'Tiki-Taka', icon: '🎯', desc: 'Kiểm soát bóng, chuyền ngắn', color: '#4ae176' },
  { id: 'Counter Attack', icon: '⚡', desc: 'Phản công tốc độ', color: '#ffcc02' },
  { id: 'Direct Play', icon: '🚀', desc: 'Tấn công trực diện', color: '#ff4d4d' },
  { id: 'Long Ball', icon: '🎯', desc: 'Bóng dài, phá tuyến', color: '#64b5f6' },
  { id: 'Gegenpressing', icon: '💥', desc: 'Phản pressing cường độ cao', color: '#e040fb' },
];

const MENTALITIES: { id: Mentality; icon: string; color: string }[] = [
  { id: 'Defensive', icon: '🛡️', color: '#64b5f6' },
  { id: 'Balanced', icon: '⚖️', color: '#4ae176' },
  { id: 'Attacking', icon: '⚔️', color: '#ffcc02' },
  { id: 'Ultra Attacking', icon: '🔥', color: '#ff4d4d' },
];

// ─── Mini Pitch Arrows Component ────────────────────────────────────────────────

function MiniPitchArrows({ playStyle, mentality, sliders }: { playStyle: PlayStyle; mentality: Mentality; sliders: Record<string, number> }) {
  const width = sliders['Width'] ?? 50;
  const defLine = sliders['Defensive Line'] ?? 50;

  // Movement arrows based on play style
  const getArrows = () => {
    switch (playStyle) {
      case 'Pressing':
        return (
          <>
            {/* High pressing arrows pushing up */}
            <line x1="25" y1="65" x2="25" y2="35" stroke="#ff6b35" strokeWidth="2" markerEnd="url(#arrowOrange)" opacity="0.8" />
            <line x1="50" y1="70" x2="50" y2="30" stroke="#ff6b35" strokeWidth="2" markerEnd="url(#arrowOrange)" opacity="0.8" />
            <line x1="75" y1="65" x2="75" y2="35" stroke="#ff6b35" strokeWidth="2" markerEnd="url(#arrowOrange)" opacity="0.8" />
            {/* Compact lines */}
            <line x1="20" y1="55" x2="80" y2="55" stroke="#ff6b35" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <line x1="20" y1="40" x2="80" y2="40" stroke="#ff6b35" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          </>
        );
      case 'Tiki-Taka':
        return (
          <>
            {/* Triangle passing patterns */}
            <line x1="35" y1="60" x2="50" y2="45" stroke="#4ae176" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowGreen)" opacity="0.7" />
            <line x1="50" y1="45" x2="65" y2="60" stroke="#4ae176" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowGreen)" opacity="0.7" />
            <line x1="65" y1="60" x2="35" y2="60" stroke="#4ae176" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowGreen)" opacity="0.7" />
            {/* Central control zone */}
            <circle cx="50" cy="52" r="12" fill="none" stroke="#4ae176" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
            {/* Forward arrows */}
            <line x1="50" y1="45" x2="50" y2="25" stroke="#4ae176" strokeWidth="2" markerEnd="url(#arrowGreen)" opacity="0.8" />
          </>
        );
      case 'Counter Attack':
        return (
          <>
            {/* Deep defense */}
            <line x1="20" y1="75" x2="80" y2="75" stroke="#64b5f6" strokeWidth="1.5" opacity="0.5" />
            {/* Quick transition arrows */}
            <line x1="30" y1="70" x2="20" y2="30" stroke="#ffcc02" strokeWidth="2" markerEnd="url(#arrowYellow)" opacity="0.8" />
            <line x1="50" y1="65" x2="50" y2="20" stroke="#ffcc02" strokeWidth="2.5" markerEnd="url(#arrowYellow)" opacity="0.9" />
            <line x1="70" y1="70" x2="80" y2="30" stroke="#ffcc02" strokeWidth="2" markerEnd="url(#arrowYellow)" opacity="0.8" />
          </>
        );
      case 'Direct Play':
        return (
          <>
            {/* Direct through arrows */}
            <line x1="50" y1="80" x2="50" y2="15" stroke="#ff4d4d" strokeWidth="2.5" markerEnd="url(#arrowRed)" opacity="0.8" />
            <line x1="25" y1="75" x2="35" y2="25" stroke="#ff4d4d" strokeWidth="2" markerEnd="url(#arrowRed)" opacity="0.6" />
            <line x1="75" y1="75" x2="65" y2="25" stroke="#ff4d4d" strokeWidth="2" markerEnd="url(#arrowRed)" opacity="0.6" />
          </>
        );
      case 'Long Ball':
        return (
          <>
            {/* Curved long balls */}
            <path d="M 30 80 Q 50 30 50 15" fill="none" stroke="#64b5f6" strokeWidth="2" markerEnd="url(#arrowBlue)" opacity="0.8" />
            <path d="M 70 80 Q 50 30 50 15" fill="none" stroke="#64b5f6" strokeWidth="2" markerEnd="url(#arrowBlue)" opacity="0.8" />
            {/* Target zone */}
            <circle cx="50" cy="18" r="8" fill="none" stroke="#64b5f6" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
          </>
        );
      case 'Gegenpressing':
        return (
          <>
            {/* Immediate press arrows (chaotic, intense) */}
            <line x1="20" y1="55" x2="35" y2="40" stroke="#e040fb" strokeWidth="2" markerEnd="url(#arrowPurple)" opacity="0.8" />
            <line x1="40" y1="60" x2="45" y2="38" stroke="#e040fb" strokeWidth="2" markerEnd="url(#arrowPurple)" opacity="0.8" />
            <line x1="60" y1="60" x2="55" y2="38" stroke="#e040fb" strokeWidth="2" markerEnd="url(#arrowPurple)" opacity="0.8" />
            <line x1="80" y1="55" x2="65" y2="40" stroke="#e040fb" strokeWidth="2" markerEnd="url(#arrowPurple)" opacity="0.8" />
            {/* Press trap zone */}
            <rect x="30" y="35" width="40" height="15" rx="4" fill="none" stroke="#e040fb" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
          </>
        );
      default:
        return null;
    }
  };

  // Width indicator lines
  const widthOffset = (width / 100) * 35;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <marker id="arrowGreen" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#4ae176" /></marker>
        <marker id="arrowOrange" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#ff6b35" /></marker>
        <marker id="arrowYellow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#ffcc02" /></marker>
        <marker id="arrowRed" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#ff4d4d" /></marker>
        <marker id="arrowBlue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#64b5f6" /></marker>
        <marker id="arrowPurple" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#e040fb" /></marker>
      </defs>

      {/* Pitch outline */}
      <rect x="5" y="3" width="90" height="94" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" rx="1" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <rect x="25" y="3" width="50" height="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <rect x="25" y="82" width="50" height="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

      {/* Defensive line indicator */}
      <line x1="10" y1={85 - defLine * 0.4} x2="90" y2={85 - defLine * 0.4} stroke="rgba(100,181,246,0.4)" strokeWidth="1" strokeDasharray="5 3" />
      <text x="92" y={85 - defLine * 0.4 + 1} fill="rgba(100,181,246,0.5)" fontSize="3" textAnchor="start">DEF</text>

      {/* Width indicator */}
      <line x1={50 - widthOffset} y1="55" x2={50 - widthOffset} y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1={50 + widthOffset} y1="55" x2={50 + widthOffset} y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />

      {/* Tactical arrows */}
      {getArrows()}

      {/* Player dots */}
      {/* GK */}
      <circle cx="50" cy="90" r="2.5" fill="rgba(255,255,255,0.7)" />
      {/* Defenders */}
      <circle cx="20" cy="75" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="38" cy="78" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="62" cy="78" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="80" cy="75" r="2" fill="rgba(255,255,255,0.5)" />
      {/* Midfielders */}
      <circle cx="30" cy="55" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="50" cy="60" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="70" cy="55" r="2" fill="rgba(255,255,255,0.5)" />
      {/* Forwards */}
      <circle cx="25" cy="30" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="50" cy="20" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="75" cy="30" r="2" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// ─── Glassmorphism helper ────────────────────────────────────────────────────────

function glass(override: any = {}) {
  return {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    ...override,
  };
}

// ─── Theme colors (matching page.tsx) ────────────────────────────────────────────

const C = {
  background: '#0a0f0d',
  surfaceContainerLow: 'rgba(28,34,29,0.5)',
  surfaceContainer: 'rgba(38,44,39,0.7)',
  surfaceContainerHigh: 'rgba(48,54,49,0.85)',
  surfaceContainerHighest: 'rgba(66,72,67,1)',
  surfaceBright: 'rgba(80,88,82,1)',
  primary: '#4ae176',
  primaryContainer: '#0b4a22',
  onPrimary: '#00210b',
  primaryFixed: '#7cf69d',
  secondary: '#a1d3a5',
  onSurface: '#e1e3de',
  onSurfaceVariant: '#c1c9c2',
  outlineVariant: 'rgba(255,255,255,0.15)',
};

// ─── Main TacticsBoard Component ─────────────────────────────────────────────────

export default function TacticsBoard() {
  const [playStyle, setPlayStyle] = useState<PlayStyle>('Tiki-Taka');
  const [mentality, setMentality] = useState<Mentality>('Balanced');
  const [sliders, setSliders] = useState<Record<string, number>>({
    'Tempo': 55,
    'Width': 60,
    'Pressing': 65,
    'Defensive Line': 50,
  });

  const handleSliderChange = (key: string) => (_: Event, val: number | number[]) => {
    setSliders(prev => ({ ...prev, [key]: val as number }));
  };

  const sliderConfigs: TacticSlider[] = [
    { label: 'Tempo', icon: '⏱️', min: 0, max: 100, value: sliders['Tempo'], leftLabel: 'Chậm', rightLabel: 'Nhanh' },
    { label: 'Width', icon: '↔️', min: 0, max: 100, value: sliders['Width'], leftLabel: 'Hẹp', rightLabel: 'Rộng' },
    { label: 'Pressing', icon: '💪', min: 0, max: 100, value: sliders['Pressing'], leftLabel: 'Thấp', rightLabel: 'Cao' },
    { label: 'Defensive Line', icon: '🛡️', min: 0, max: 100, value: sliders['Defensive Line'], leftLabel: 'Sâu', rightLabel: 'Cao' },
  ];

  // Tổng hợp chiến thuật
  const getSummary = () => {
    const tempo = sliders['Tempo'] > 60 ? 'nhanh' : sliders['Tempo'] > 40 ? 'trung bình' : 'chậm';
    const press = sliders['Pressing'] > 70 ? 'áp lực cao' : sliders['Pressing'] > 40 ? 'trung bình' : 'thấp';
    const def = sliders['Defensive Line'] > 60 ? 'cao' : sliders['Defensive Line'] > 40 ? 'trung bình' : 'sâu';
    return `Phong cách ${playStyle} • Tâm lý ${mentality} • Tempo ${tempo} • Pressing ${press} • Phòng tuyến ${def}`;
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

      {/* ─── LEFT: Mini Pitch ──────────────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: `linear-gradient(178deg, #183618 0%, #1e4a1e 20%, #22562a 50%, #1e4a1e 80%, #183618 100%)`,
        p: 4,
      }}>
        {/* Title overlay */}
        <Box sx={{
          position: 'absolute', top: 20, left: 24,
          display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 10,
        }}>
          <Typography sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 800, fontSize: 14, color: C.primary,
            textTransform: 'uppercase', letterSpacing: '2px',
          }}>
            ⚙️ Tactical View
          </Typography>
        </Box>

        {/* Play style badge */}
        <Box sx={{
          position: 'absolute', top: 20, right: 24,
          ...glass({ borderRadius: '12px', px: 2, py: 1, border: `1px solid ${PLAY_STYLES.find(p => p.id === playStyle)?.color}33` }),
          display: 'flex', alignItems: 'center', gap: 1, zIndex: 10,
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: PLAY_STYLES.find(p => p.id === playStyle)?.color }}>
            {PLAY_STYLES.find(p => p.id === playStyle)?.icon} {playStyle}
          </Typography>
        </Box>

        {/* Mini pitch with arrows */}
        <Box sx={{
          width: '80%',
          maxWidth: 420,
          aspectRatio: '1 / 1.2',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <MiniPitchArrows playStyle={playStyle} mentality={mentality} sliders={sliders} />
        </Box>

        {/* Mentality bar at bottom */}
        <Box sx={{
          position: 'absolute', bottom: 20, left: 24, right: 24,
          ...glass({ borderRadius: '14px', p: 1.5 }),
          display: 'flex', gap: 1, zIndex: 10,
        }}>
          {MENTALITIES.map(m => (
            <Box
              key={m.id}
              onClick={() => setMentality(m.id)}
              sx={{
                flex: 1, textAlign: 'center', py: 1, borderRadius: '10px', cursor: 'pointer',
                background: mentality === m.id ? `${m.color}22` : 'transparent',
                border: mentality === m.id ? `1px solid ${m.color}55` : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { background: `${m.color}11` },
              }}
            >
              <Typography sx={{ fontSize: 16 }}>{m.icon}</Typography>
              <Typography sx={{
                fontSize: 9, fontWeight: 700, color: mentality === m.id ? m.color : C.onSurfaceVariant,
                textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.3,
              }}>
                {m.id}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── RIGHT: Settings Panel ─────────────────────────────────────── */}
      <Box sx={{
        width: 340,
        background: C.surfaceContainerLow,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
      }}>

        {/* Play Style Section */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 800, color: C.primary,
            textTransform: 'uppercase', letterSpacing: '1.5px', mb: 2,
          }}>
            🎮 Phong cách thi đấu
          </Typography>
          <Grid container spacing={1}>
            {PLAY_STYLES.map(ps => (
              <Grid item xs={6} key={ps.id}>
                <Box
                  onClick={() => setPlayStyle(ps.id)}
                  sx={{
                    p: 1.5, borderRadius: '12px', cursor: 'pointer',
                    background: playStyle === ps.id ? `${ps.color}15` : 'rgba(255,255,255,0.02)',
                    border: playStyle === ps.id ? `1.5px solid ${ps.color}66` : '1.5px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.25s',
                    '&:hover': {
                      background: `${ps.color}10`,
                      border: `1.5px solid ${ps.color}33`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, mb: 0.3 }}>{ps.icon}</Typography>
                  <Typography sx={{
                    fontSize: 11, fontWeight: 800, color: playStyle === ps.id ? ps.color : C.onSurface,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}>
                    {ps.id}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: C.onSurfaceVariant, mt: 0.3, lineHeight: 1.3 }}>
                    {ps.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Instructions (Sliders) */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 800, color: C.primary,
            textTransform: 'uppercase', letterSpacing: '1.5px', mb: 2,
          }}>
            📋 Chỉ thị đội bóng
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {sliderConfigs.map(sc => (
              <Box key={sc.label}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.onSurface }}>
                    {sc.icon} {sc.label}
                  </Typography>
                  <Typography sx={{
                    fontSize: 13, fontWeight: 800, color: C.primary,
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}>
                    {sc.value}
                  </Typography>
                </Box>
                <Slider
                  value={sc.value}
                  min={sc.min}
                  max={sc.max}
                  onChange={handleSliderChange(sc.label)}
                  sx={{
                    color: C.primary,
                    height: 6,
                    '& .MuiSlider-thumb': {
                      width: 16, height: 16,
                      backgroundColor: C.primary,
                      boxShadow: `0 0 10px ${C.primary}66`,
                      '&:hover': { boxShadow: `0 0 16px ${C.primary}88` },
                    },
                    '& .MuiSlider-track': {
                      background: `linear-gradient(90deg, ${C.primaryContainer}, ${C.primary})`,
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      background: 'rgba(255,255,255,0.08)',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 9, color: C.onSurfaceVariant }}>{sc.leftLabel}</Typography>
                  <Typography sx={{ fontSize: 9, color: C.onSurfaceVariant }}>{sc.rightLabel}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tactical Summary */}
        <Box sx={{ p: 2.5 }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 800, color: C.primary,
            textTransform: 'uppercase', letterSpacing: '1.5px', mb: 2,
          }}>
            📊 Tổng hợp chiến thuật
          </Typography>

          {/* Radar-like stat bars */}
          <Box sx={{
            ...glass({ borderRadius: '16px', p: 2, border: `1px solid rgba(74,225,118,0.1)` }),
            background: 'rgba(74,225,118,0.03)',
          }}>
            {[
              { label: 'Tấn công', value: Math.round((sliders['Tempo'] + (mentality === 'Ultra Attacking' ? 30 : mentality === 'Attacking' ? 15 : 0)) * 0.8), color: '#ff4d4d' },
              { label: 'Kiểm soát', value: Math.round((100 - sliders['Tempo'] + sliders['Width']) * 0.5), color: '#4ae176' },
              { label: 'Phòng thủ', value: Math.round((100 - sliders['Defensive Line'] + sliders['Pressing']) * 0.5 + (mentality === 'Defensive' ? 15 : 0)), color: '#64b5f6' },
              { label: 'Tốc độ', value: Math.round(sliders['Tempo'] * 0.9), color: '#ffcc02' },
              { label: 'Áp lực', value: sliders['Pressing'], color: '#e040fb' },
            ].map((stat, i) => (
              <Box key={i} sx={{ mb: i < 4 ? 1.5 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography sx={{ fontSize: 11, color: C.onSurfaceVariant, fontWeight: 600 }}>{stat.label}</Typography>
                  <Typography sx={{ fontSize: 11, color: stat.color, fontWeight: 800, fontFamily: '"Space Grotesk", sans-serif' }}>
                    {Math.min(99, stat.value)}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${Math.min(99, stat.value)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})`,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${stat.color}44`,
                    transition: 'width 0.4s ease',
                  }} />
                </Box>
              </Box>
            ))}
          </Box>

          {/* Summary text */}
          <Box sx={{
            mt: 2,
            ...glass({ borderRadius: '12px', p: 2, border: '1px solid rgba(255,255,255,0.06)' }),
          }}>
            <Typography sx={{
              fontSize: 11, color: C.onSurfaceVariant, lineHeight: 1.6,
              fontFamily: '"Manrope", sans-serif',
            }}>
              💡 {getSummary()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
