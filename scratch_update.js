const fs = require('fs');
let code = fs.readFileSync('src/app/(DashboardLayout)/apps/football-lineup/page.tsx', 'utf-8');

// 1. Replace SlotDef
const t1 = code.indexOf('interface SlotDef {');
const t2 = code.indexOf('// ─── Color palette', t1);

if (t1 !== -1 && t2 !== -1) {
  code = code.slice(0, t1) + `interface SlotDef {
  posLabel: string;
  isGK?: boolean;
  /** default position as % of pitch container (0–100) */
  x: number; // left %
  y: number; // top %
}\n\n` + code.slice(t2);
} else { throw new Error('Could not find SlotDef'); }

const p1 = code.indexOf('// ─── Default players');
const p2 = code.indexOf('// ─── Formation slot', p1);

if (p1 !== -1 && p2 !== -1) {
  code = code.slice(0, p1) + `// ─── Teams & Players ──────────────────────────────────────────────────────────

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
};\n\n` + code.slice(p2);
} else { throw new Error('Could not find Default players'); }

// Remove playerId: '...' from FORMATIONS
code = code.replace(/playerId:\s*'[^']+',\s*/g, '');

const b1 = code.indexOf('function buildSlots(formation: Formation): SlotState[]');
const b2 = code.indexOf('// ─── Player Node');

if (b1 !== -1 && b2 !== -1) {
  code = code.slice(0, b1) + `function buildSlots(formation: Formation, teamId: string): SlotState[] {
  const defaultXI = TEAMS[teamId].defaultXI;
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: defaultXI[i] || '',
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}\n\n` + code.slice(b2);
} else { throw new Error('Could not find buildSlots'); }

// Update state and hook refs to buildSlots
code = code.replace(/const \[formation, setFormation\] = useState<Formation>\('4-3-3'\);\n  const \[slots, setSlots\] = useState<SlotState\[\]>\(\(\) => buildSlots\('4-3-3'\)\);/, 
  `const [selectedTeamId, setSelectedTeamId] = useState<string>('mancity');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>(() => buildSlots('4-3-3', 'mancity'));`);

code = code.replace(/return ALL_PLAYERS.find\(p => p.id === id\) \?\? null;/, `return TEAMS[selectedTeamId].players.find(p => p.id === id) ?? null;`);
code = code.replace(/return ALL_PLAYERS.filter\(p => !pitchPlayerIds.has\(p.id\)\);/, `return TEAMS[selectedTeamId].players.filter(p => !pitchPlayerIds.has(p.id));`);

code = code.replace(/setSlots\(buildSlots\(f\)\);/g, `setSlots(buildSlots(f, selectedTeamId));`);
code = code.replace(/setSlots\(buildSlots\('4-3-3'\)\);/g, `setSlots(buildSlots('4-3-3', selectedTeamId));`);

const handleResetIdx = code.indexOf('const handleReset');
if (handleResetIdx !== -1) {
  const addText = `\n  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setFormation('4-3-3');
    setSlots(buildSlots('4-3-3', teamId));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: \`Đã đổi sang đội \${TEAMS[teamId].name}\`, type: 'info' });
  };\n\n`;
  code = code.slice(0, handleResetIdx) + addText + code.slice(handleResetIdx);
} else { throw new Error('Could not find handleReset'); }


const teamInfoStart = code.indexOf('{/* Team info */}');
const teamInfoEnd = code.indexOf('{/* Nav tabs */}');

if (teamInfoStart !== -1 && teamInfoEnd !== -1) {
  code = code.slice(0, teamInfoStart) + `{/* Team info */}
            <Box sx={{
              px: 3, py: 3,
              borderBottom: \`1px solid \${C.surfaceContainer}\`,
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
                    border: \`1px solid \${C.outlineVariant}\`,
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
                border: \`2px solid \${C.surfaceBright}\`,
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
                border: \`1px solid rgba(66,72,67,0.3)\`,
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

            ` + code.slice(teamInfoEnd);

} else { throw new Error('Could not find Team info box'); }

fs.writeFileSync('src/app/(DashboardLayout)/apps/football-lineup/page.tsx', code, 'utf-8');
console.log('Successfully completed script replacer!');
