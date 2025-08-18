import React from "react";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import TaskManager from "@/app/components/apps/kanban/TaskManager";
import { KanbanDataContextProvider } from "@/app/context/kanbancontext/index";
import BlankCard from "@/app/components/shared/BlankCard";
import { CardContent } from "@mui/material";

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
  return (
    <KanbanDataContextProvider>
      <PageContainer title="Bảng Kanban" description="Quản lý công việc với bảng Kanban">
        <Breadcrumb title="Bảng Kanban" items={BCrumb} />
        <BlankCard
          sx={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            borderRadius: 3,
            border: 'none',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <TaskManager />
          </CardContent>
        </BlankCard>
      </PageContainer>
    </KanbanDataContextProvider>
  );
}

export default page;
