const fs = require('fs');
const file = 'src/app/(DashboardLayout)/apps/football-lineup/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add import TeamManagement
if (!code.includes('import TeamManagement')) {
  code = code.replace(
    "import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';",
    "import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';\nimport TeamManagement from './TeamManagement';"
  );
}

// 2. Add activeTab and refreshKey states
let r1 = `  const [selectedTeamId, setSelectedTeamId] = useState<string>('');`;
let rep1 = `  const [activeTab, setActiveTab] = useState<'Lineup' | 'Tactics' | 'Team'>('Lineup');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');`;
code = code.replace(r1, rep1);

// 3. Add refreshKey to dependency array of the second useEffect
let r2 = `  }, [selectedTeamId]);`;
let rep2 = `  }, [selectedTeamId, refreshKey]);`;
code = code.replace(r2, rep2);

// 4. Update the Top Navbar Tabs onClick
let r3 = `              {(['Lineup', 'Tactics', 'Team'] as const).map((tab, i) => (
                <Box key={tab} sx={{
                  px: 2, py: 1,
                  fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                  fontFamily: '"Space Grotesk", sans-serif',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  color: i === 0 ? C.primary : C.onSurfaceVariant,
                  borderBottom: i === 0 ? \`2px solid \${C.primary}\` : '2px solid transparent',`;
let rep3 = `              {(['Lineup', 'Tactics', 'Team'] as const).map((tab, i) => (
                <Box key={tab} onClick={() => setActiveTab(tab)} sx={{
                  px: 2, py: 1,
                  fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                  fontFamily: '"Space Grotesk", sans-serif',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  color: activeTab === tab ? C.primary : C.onSurfaceVariant,
                  borderBottom: activeTab === tab ? \`2px solid \${C.primary}\` : '2px solid transparent',`;
code = code.replace(r3, rep3);

// 5. Wrap the Body in activeTab condition
let r4 = `        {/* ── BODY ── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>`;
let rep4 = `        {/* ── BODY ── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {activeTab === 'Team' && (
            <TeamManagement 
              teamId={selectedTeamId} 
              players={mappedPlayers} 
              onRefresh={() => setRefreshKey(k => k + 1)} 
              C={C} 
            />
          )}
          {activeTab === 'Lineup' && (
            <>`;
code = code.replace(r4, rep4);

// 6. Close the condition at the end of the Body
let r5 = `            {/* ── MAIN PITCH CANVAS ── */}`;
let rep5 = `            {/* ── MAIN PITCH CANVAS ── */}`;
// we need to wrap the whole sidebar + pitch.
// Wait, the block `<Box sx={{ flex: 1, position: 'relative', display: 'flex'...` is the pitch container. At the end of pitch container, we close `<Box sx={{ display: 'flex', flex: 1, overflow: 'hidden'...`.
// Let's match the closing tag before `    </PageContainer>`.
let r6 = `            </Box>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}`;
let rep6 = `            </Box>
          </>)}
        </Box>
      </Box>
    </PageContainer>
  );
}`;
code = code.replace(r6, rep6);

fs.writeFileSync(file, code);
console.log("Team Tab Integrated!");
