"use client";
import React, { useRef } from "react";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import KanbanBoardDB from "@/app/components/apps/kanban/KanbanBoardDB";
import KanbanMetricsChips from "@/app/components/apps/kanban/KanbanMetricsChips";
import { KanbanDataContextProvider } from "@/app/context/kanbancontext/index";
import { CardContent, Box, useTheme, alpha, Stack, Typography, Tooltip, IconButton, Paper } from "@mui/material";
import { IconLayoutKanban, IconKeyboard } from "@tabler/icons-react";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Kanban Workspace",
  },
];

function Page() {
  const theme = useTheme();
  const metricsRef = useRef<{ refreshStats: () => void } | null>(null);

  const handleMetricsRefresh = () => {
    console.log('📊 Metrics refreshed');
  };

  const handleKanbanDataChange = () => {
    console.log('📊 Kanban data changed, refreshing metrics...');
  };

  return (
    <KanbanDataContextProvider>
      <PageContainer title="Kanban Workspace" description="Quản lý công việc với bảng Kanban">
        <Box sx={{ mb: 3 }}>
          <Breadcrumb title="KANBAN WORKSPACE" items={BCrumb} />

          {/* Enhanced Header - Industrial Aesthetic */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                pl: 2
              }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <IconLayoutKanban size={24} stroke={1.5} />
                </Box>
                <Stack>
                  <Typography variant="h4" fontWeight={800} color="text.primary" sx={{
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace"
                  }}>
                    SYSTEM.KANBAN
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.02em' }}>
                    // COMMAND & CONTROL CENTER
                  </Typography>
                </Stack>
              </Stack>

              <Tooltip
                title={
                  <Box sx={{ p: 1, fontFamily: 'monospace' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>KEYBINDINGS</Typography>
                    <Typography variant="body2">Ctrl/Cmd + N: NEW_TASK</Typography>
                    <Typography variant="body2">Esc: CLOSE_MODAL</Typography>
                  </Box>
                }
                arrow
                placement="left"
              >
                <IconButton
                  sx={{
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                  }}
                >
                  <IconKeyboard size={20} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Real-time Metrics - Cyberpunk / Glassmorphism mix */}
            <Box
              sx={{
                mb: 3,
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? alpha('#000000', 0.4) : alpha('#ffffff', 0.4),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                backdropFilter: 'blur(24px)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1
              }}
            >
              <Box sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%', md: '95%', lg: '90%' },
                position: 'relative',
                zIndex: 2
              }}>
                <KanbanMetricsChips
                  boardId="board-1"
                  onRefresh={handleMetricsRefresh}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha('#000000', 0.2)} 100%)`
              : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            // Utility accent line top
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: theme.palette.text.primary,
            }
          }}
        >
          <CardContent sx={{
            p: { xs: 2, sm: 3 },
            pt: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <KanbanBoardDB onDataChange={handleKanbanDataChange} />
          </CardContent>
        </Paper>
      </PageContainer>
    </KanbanDataContextProvider>
  );
}

export default Page;
