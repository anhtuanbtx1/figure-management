const fs = require('fs');
const file = 'src/app/(DashboardLayout)/apps/football-lineup/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove TEAMS and TeamData interfaces but keep FORMATIONS.
// Instead of removing TEAMS, I will simply ignore it and let it be unused (to avoid regex matching tearing the file apart).
// Just change the initial states inside FootballLineupPage.

let repl1 = `export default function FootballLineupPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('mancity');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>(() => buildSlots('4-3-3', 'mancity'));`;

let repWith1 = `export default function FootballLineupPage() {
  const [dbTeams, setDbTeams] = useState<any[]>([]);
  const [mappedPlayers, setMappedPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [slots, setSlots] = useState<SlotState[]>([]);

  // Fetch Teams
  useEffect(() => {
    fetch('/api/football-lineups').then(r => r.json()).then(data => {
      if (data.teams) {
        setDbTeams(data.teams);
        if (data.teams.length > 0) setSelectedTeamId(data.teams[0].id.toString());
      }
    });
  }, []);

  // Fetch Team Details (Lineups & Players)
  useEffect(() => {
    if (!selectedTeamId) return;
    setIsLoading(true);
    fetch(\`/api/football-lineups?teamId=\${selectedTeamId}\`)
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
                 x: s.loc_x,
                 y: s.loc_y
              })));
              if (data.lineups && data.lineups.length > 0) {
                 setFormation(data.lineups[0].formation);
              }
           } else {
              // Create default slots from formation, picking the first 11 players arbitrarily
              const defSlots = FORMATIONS['4-3-3'].map((s, i) => ({
                 id: String(i),
                 posLabel: s.posLabel,
                 playerId: parsedPlayers[i] ? parsedPlayers[i].id : '',
                 isGK: s.isGK,
                 x: s.x,
                 y: s.y,
              }));
              setSlots(defSlots);
              setFormation('4-3-3');
           }
        }
        setIsLoading(false);
      });
  }, [selectedTeamId]);`;

code = code.replace(repl1, repWith1);

// 2. Fix buildSlots to handle mappedPlayers during swaps/formation changes
let repl2 = `function buildSlots(formation: Formation, teamId: string): SlotState[] {
  const defaultXI = TEAMS[teamId].defaultXI;
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: defaultXI[i] || '',
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}`;
let repWith2 = `function buildSlotsForDb(formation: Formation, fallbackPlayers: Player[]): SlotState[] {
  return FORMATIONS[formation].map((s, i) => ({
    id: String(i),
    posLabel: s.posLabel,
    playerId: fallbackPlayers[i] ? fallbackPlayers[i].id : '',
    isGK: s.isGK,
    x: s.x,
    y: s.y,
  }));
}`;
code = code.replace(repl2, repWith2);

// 3. Update handleReset, handleFormationChange, handleTeamChange to use buildSlotsForDb
let repl3 = `  const handleFormationChange = (f: Formation) => {
    setFormation(f);
    setSlots(buildSlots(f, selectedTeamId));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: \`Đã chuyển sang sơ đồ \${f}\`, type: 'info' });
  };

  const handleReset = () => {
    setFormation('4-3-3');
    setSlots(buildSlots('4-3-3', selectedTeamId));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: 'Đã reset đội hình', type: 'info' });
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setFormation('4-3-3');
    setSlots(buildSlots('4-3-3', teamId));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: \`Đã đổi sang đội \${TEAMS[teamId].name}\`, type: 'info' });
  };`;

let repWith3 = `  const handleFormationChange = (f: Formation) => {
    setFormation(f);
    setSlots(buildSlotsForDb(f, mappedPlayers));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: \`Đã chuyển sang sơ đồ \${f}\`, type: 'info' });
  };

  const handleReset = () => {
    setFormation('4-3-3');
    setSlots(buildSlotsForDb('4-3-3', mappedPlayers));
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
    setSnack({ open: true, msg: 'Đã reset đội hình', type: 'info' });
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedId(null);
    setContextId(null);
    setSwapMode(null);
  };`;
code = code.replace(repl3, repWith3);

// 4. Update Save Backend call
let repl4 = `  const handleSave = () => {
    setSnack({ open: true, msg: '✅ Đã lưu đội hình thành công!', type: 'success' });
  };`;
let repWith4 = `  const handleSave = async () => {
    try {
      const res = await fetch('/api/football-lineups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeamId,
          name: \`Đội hình \${formation}\`,
          formation: formation,
          isDefault: true,
          slots: slots.map(s => ({
            playerId: s.playerId,
            posLabel: s.posLabel,
            isGK: s.isGK,
            x: s.x,
            y: s.y
          }))
        })
      });
      if (res.ok) {
         setSnack({ open: true, msg: '✅ Đã lưu đội hình thành công vào Database!', type: 'success' });
      } else {
         setSnack({ open: true, msg: '❌ Lưu thất bại', type: 'error' });
      }
    } catch(e) {
      console.error(e);
      setSnack({ open: true, msg: '❌ Lỗi hệ thống', type: 'error' });
    }
  };`;
code = code.replace(repl4, repWith4);

// 5. Update playerById, benchPlayers to use mappedPlayers
let repl5 = `  const playerById = useCallback((id: string | null | undefined): Player | null => {
    if (!id) return null;
    return TEAMS[selectedTeamId].players.find(p => p.id === id) ?? null;
  }, [selectedTeamId]);`;
let repWith5 = `  const playerById = useCallback((id: string | null | undefined): Player | null => {
    if (!id) return null;
    return mappedPlayers.find(p => p.id === id) ?? null;
  }, [mappedPlayers]);`;
code = code.replace(repl5, repWith5);

let repl6 = `  const benchPlayers = useMemo(() => {
    return TEAMS[selectedTeamId].players.filter(p => !pitchPlayerIds.has(p.id));
  }, [pitchPlayerIds, selectedTeamId]);`;
let repWith6 = `  const benchPlayers = useMemo(() => {
    return mappedPlayers.filter(p => !pitchPlayerIds.has(p.id));
  }, [pitchPlayerIds, mappedPlayers]);`;
code = code.replace(repl6, repWith6);

// 6. Update Sidebar team info
let repl7 = `              {/* Team Dropdown */}
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
              </Typography>`;
let repWith7 = `              {/* Team Dropdown */}
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
                  {dbTeams.map(t => (
                    <option key={t.id} value={t.id.toString()}>{t.logo_url} {t.name}</option>
                  ))}
                </select>
                <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: C.onSurfaceVariant }}>
                  ▼
                </Box>
              </Box>

              {dbTeams.find(t => t.id.toString() === selectedTeamId) && (() => {
                 const currentTeam = dbTeams.find(t => t.id.toString() === selectedTeamId);
                 return (
                   <>
                     <Box sx={{
                       width: 80, height: 80, borderRadius: '50%',
                       background: C.surfaceContainerHigh,
                       border: \`2px solid \${C.surfaceBright}\`,
                       boxShadow: '0 0 20px rgba(74,225,118,0.1)',
                       display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                     }}>
                       {currentTeam.logo_url}
                     </Box>
                     <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 18, mt: 1, color: C.onSurface }}>
                       {currentTeam.name}
                     </Typography>
                     <Typography sx={{ fontFamily: '"Lexend", sans-serif', fontSize: 13, color: C.onSurfaceVariant }}>
                       {currentTeam.league}
                     </Typography>
                   </>
                 );
              })()}`;              
code = code.replace(repl7, repWith7);

fs.writeFileSync(file, code);
console.log("Refactored layout!");
