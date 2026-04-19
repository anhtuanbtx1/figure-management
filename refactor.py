import re

with open('src/app/(DashboardLayout)/apps/football-lineup/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fullscreen Feature Additions
# At imports
text = text.replace("import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';", 
                    "import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';") # no change

# At state declarations
t1 = """  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);"""
t1_new = """  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

  // Fullscreen state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };"""
text = text.replace(t1, t1_new)

# At main container
t2 = """      <Box
        className="tl-fadein"
        sx={{
          height: 'calc(100vh - 80px)',
          maxHeight: 'calc(100vh - 80px)',"""
t2_new = """      <Box
        ref={containerRef}
        className="tl-fadein"
        sx={{
          height: isFullscreen ? '100vh' : 'calc(100vh - 80px)',
          maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 80px)',"""
text = text.replace(t2, t2_new)

# At top navbar button
t3 = """          <Box display="flex" alignItems="center" gap={2}>
            {['notifications', 'settings'].map(icon => ("""
t3_new = """          <Box display="flex" alignItems="center" gap={2}>
            <Box onClick={toggleFullscreen} sx={{
              color: C.onSurfaceVariant, cursor: 'pointer',
              '&:hover': { color: C.onSurface },
              transition: 'color 0.15s', fontSize: 22,
              display: 'flex', alignItems: 'center'
            }}>
              {isFullscreen ? '🗗' : '⛶'}
            </Box>
            {['notifications', 'settings'].map(icon => ("""
text = text.replace(t3, t3_new)

print("Added fullscreen!")

# 2. Multi-team Refactor
# Replace SlotDef
t4 = """interface SlotDef {
  posLabel: string;
  playerId: string;
  isGK?: boolean;
  /** default position as % of pitch container (0–100) */
  x: number; // left %
  y: number; // top %
}"""
t4_new = """interface SlotDef {
  posLabel: string;
  isGK?: boolean;
  /** default position as % of pitch container (0–100) */
  x: number; // left %
  y: number; // top %
}"""
text = text.replace(t4, t4_new)

# Replace ALL_PLAYERS definition with TEAMS
t5 = """// ─── Default players ──────────────────────────────────────────────────────────

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
];"""

t5_new = """// ─── Teams & Players ──────────────────────────────────────────────────────────

interface TeamData {
  id: string;
  name: string;
  league: string;
  logo: string;
  defaultXI: string[];
  players: Player[];
}

const TEAMS: Record<string, TeamData> = {
  mancity: {
    id: 'mancity',
    name: 'Manchester City',
    league: 'Premier League',
    logo: '🛡️',
    defaultXI: ['ederson', 'ake', 'dias', 'stones', 'walker', 'silva', 'rodri', 'debruyne', 'grealish', 'haaland', 'foden'],
    players: [
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
      { id: 'alvarez',  name: 'Julián Álvarez',  shortName: 'J. Alvarez', pos: 'ST', rating: 88, jerseyNumber: 19 },
      { id: 'lewis',    name: 'Rico Lewis',      shortName: 'R. Lewis',  pos: 'RB',  rating: 82, jerseyNumber: 82 },
      { id: 'ortega',   name: 'Stefan Ortega',   shortName: 'Ortega',    pos: 'GK',  rating: 80, jerseyNumber: 18 },
      { id: 'kovacic',  name: 'Mateo Kovačić',   shortName: 'Kovacic',   pos: 'CM',  rating: 83, jerseyNumber: 8 },
      { id: 'gundogan', name: 'İlkay Gündoğan', shortName: 'Gundogan',  pos: 'CM',  rating: 85, jerseyNumber: 8 },
    ]
  },
  realmadrid: {
    id: 'realmadrid',
    name: 'Real Madrid',
    league: 'La Liga',
    logo: '👑',
    defaultXI: ['courtois', 'mendy', 'rudiger', 'militao', 'carvajal', 'bellingham', 'tchouameni', 'valverde', 'vini', 'mbappe', 'rodrygo'],
    players: [
      { id: 'courtois', name: 'Thibaut Courtois', shortName: 'Courtois', pos: 'GK', rating: 90, jerseyNumber: 1 },
      { id: 'carvajal', name: 'Dani Carvajal', shortName: 'Carvajal', pos: 'RB', rating: 85, jerseyNumber: 2 },
      { id: 'militao', name: 'Éder Militão', shortName: 'Militão', pos: 'CB', rating: 86, jerseyNumber: 3 },
      { id: 'rudiger', name: 'Antonio Rüdiger', shortName: 'Rüdiger', pos: 'CB', rating: 87, jerseyNumber: 22 },
      { id: 'mendy', name: 'Ferland Mendy', shortName: 'Mendy', pos: 'LB', rating: 82, jerseyNumber: 23 },
      { id: 'tchouameni', name: 'Aurélien Tchouaméni', shortName: 'Tchouaméni', pos: 'CDM', rating: 84, jerseyNumber: 18 },
      { id: 'valverde', name: 'Federico Valverde', shortName: 'Valverde', pos: 'CM', rating: 88, jerseyNumber: 15 },
      { id: 'bellingham', name: 'Jude Bellingham', shortName: 'Bellingham', pos: 'CAM', rating: 90, jerseyNumber: 5 },
      { id: 'vini', name: 'Vinícius Júnior', shortName: 'Vinícius Jr', pos: 'LW', rating: 89, jerseyNumber: 7 },
      { id: 'rodrygo', name: 'Rodrygo', shortName: 'Rodrygo', pos: 'RW', rating: 85, jerseyNumber: 11 },
      { id: 'mbappe', name: 'Kylian Mbappé', shortName: 'Mbappé', pos: 'ST', rating: 91, jerseyNumber: 9 },
      { id: 'modric', name: 'Luka Modrić', shortName: 'Modrić', pos: 'CM', rating: 87, jerseyNumber: 10 },
      { id: 'camavinga', name: 'Eduardo Camavinga', shortName: 'Camavinga', pos: 'CM', rating: 83, jerseyNumber: 12 },
      { id: 'alaba', name: 'David Alaba', shortName: 'Alaba', pos: 'CB', rating: 85, jerseyNumber: 4 },
      { id: 'kepa', name: 'Kepa Arrizabalaga', shortName: 'Kepa', pos: 'GK', rating: 81, jerseyNumber: 25 },
      { id: 'brahim', name: 'Brahim Díaz', shortName: 'Brahim', pos: 'CAM', rating: 82, jerseyNumber: 21 },
    ]
  }
};"""
text = text.replace(t5, t5_new)

# Remove playerIds from FORMATIONS using regex
text = re.sub(r"\s*playerId:\s*'[^']+',", "", text)

# update buildSlots
b1 = """function buildSlots(formation: Formation): SlotState[] {
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: s.playerId,
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}"""
b1_new = """function buildSlots(formation: Formation, teamId: string): SlotState[] {
  const defaultXI = TEAMS[teamId].defaultXI;
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: defaultXI[i] || '',
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}"""
text = text.replace(b1, b1_new)

# update state declarations
s1 = """  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>(() => buildSlots('4-3-3'));"""
s1_new = """  const [selectedTeamId, setSelectedTeamId] = useState<string>('mancity');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>(() => buildSlots('4-3-3', 'mancity'));"""
text = text.replace(s1, s1_new)

# update helpers
pbl = """return ALL_PLAYERS.find(p => p.id === id) ?? null;"""
pbl_new = """return TEAMS[selectedTeamId].players.find(p => p.id === id) ?? null;"""
text = text.replace(pbl, pbl_new)

bp = """return ALL_PLAYERS.filter(p => !pitchPlayerIds.has(p.id));"""
bp_new = """return TEAMS[selectedTeamId].players.filter(p => !pitchPlayerIds.has(p.id));"""
text = text.replace(bp, bp_new)

# update handle changes
text = text.replace('setSlots(buildSlots(f));', 'setSlots(buildSlots(f, selectedTeamId));')
text = text.replace("setSlots(buildSlots('4-3-3'));", "setSlots(buildSlots('4-3-3', selectedTeamId));")

# add handleTeamChange
hr = """  const handleReset = () => {
    setFormation('4-3-3');
    setSlots(buildSlots('4-3-3', selectedTeamId));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: 'Đã reset đội hình', type: 'info' });
  };"""

hr_new = hr + """

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setFormation('4-3-3');
    setSlots(buildSlots('4-3-3', teamId));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: `Đã đổi sang đội ${TEAMS[teamId].name}`, type: 'info' });
  };"""
text = text.replace(hr, hr_new)

# replace sidebar team info
ui1 = """            {/* Team info */}
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
            </Box>"""

ui1_new = """            {/* Team info */}
            <Box sx={{
              px: 3, py: 3,
              borderBottom: `1px solid ${C.surfaceContainer}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
            }}>
              {/* Team Dropdown */}
              <Box sx={{ position: 'relative', width: '100%', mb: 1 }}>
                <select
                  value={selectedTeamId}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: C.surfaceContainer,
                    color: C.onSurface,
                    border: `1px solid ${C.outlineVariant}`,
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  {Object.keys(TEAMS).map(k => (
                    <option key={k} value={k}>{TEAMS[k].logo} {TEAMS[k].name}</option>
                  ))}
                </select>
                <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: C.onSurfaceVariant }}>
                  ▼
                </Box>
              </Box>

              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                background: C.surfaceContainerHigh,
                border: `2px solid ${C.surfaceBright}`,
                boxShadow: '0 0 20px rgba(74,225,118,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              }}>
                {TEAMS[selectedTeamId].logo}
              </Box>
              <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18, color: C.onSurface }}>
                {TEAMS[selectedTeamId].name}
              </Typography>
              <Typography sx={{ fontFamily: '"Lexend", sans-serif', fontSize: 13, color: C.onSurfaceVariant }}>
                {TEAMS[selectedTeamId].league}
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
            </Box>"""
text = text.replace(ui1, ui1_new)

with open('src/app/(DashboardLayout)/apps/football-lineup/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Formatting applied successfully!")
