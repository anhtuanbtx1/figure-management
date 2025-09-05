"use client";
import React, { useRef } from "react";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import KanbanBoardDB from "@/app/components/apps/kanban/KanbanBoardDB";
import KanbanMetricsChips from "@/app/components/apps/kanban/KanbanMetricsChips";
import { KanbanDataContextProvider } from "@/app/context/kanbancontext/index";
import BlankCard from "@/app/components/shared/BlankCard";
import { CardContent, Box, useTheme, alpha, Stack, Typography, Tooltip, IconButton } from "@mui/material";
import { IconLayoutKanban, IconKeyboard } from "@tabler/icons-react";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Bảng Kanban",
  },
];

function page() {
  const theme = useTheme();
  const metricsRef = useRef<{ refreshStats: () => void } | null>(null);

  const handleMetricsRefresh = () => {
    // This could trigger a refresh of the Kanban board if needed
    console.log('📊 Metrics refreshed');
  };

  const handleKanbanDataChange = () => {
    // Refresh metrics when Kanban data changes
    console.log('📊 Kanban data changed, refreshing metrics...');
    // We'll implement this when we add a ref to the metrics component
  };

  return (
    <KanbanDataContextProvider>
      <PageContainer title="Bảng Kanban" description="Quản lý công việc với bảng Kanban">
        <Box sx={{ mb: 3 }}>
          <Breadcrumb title="Bảng Kanban" items={BCrumb} />

          {/* Enhanced Header */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }}
                >
                  <IconLayoutKanban size={24} />
                </Box>
                <Stack>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    Bảng Kanban
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý và theo dõi tiến độ công việc một cách trực quan
                  </Typography>
                </Stack>
              </Stack>

              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Phím tắt:</Typography>
                    <Typography variant="body2">Ctrl/Cmd + N: Tạo nhiệm vụ mới</Typography>
                    <Typography variant="body2">Esc: Đóng hộp thoại</Typography>
                  </Box>
                }
                arrow
                placement="left"
              >
                <IconButton
                  sx={{
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
                  }}
                >
                  <IconKeyboard size={20} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Real-time Metrics */}
            <Box
              sx={{
                mb: 3,
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.08)}`,
                position: 'relative',
                overflow: 'hidden',
                // Subtle gradient overlay
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  pointerEvents: 'none'
                },
                // Ensure proper container width and alignment
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

        <BlankCard
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.grey[500], 0.08)}`,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
        </BlankCard>
      </PageContainer>
    </KanbanDataContextProvider>
  );
}

export default page;
