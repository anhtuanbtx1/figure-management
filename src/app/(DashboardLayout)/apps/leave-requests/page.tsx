"use client";

import React from "react";
import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import LeaveRequestApp from "@/app/components/apps/leave-requests";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Đơn nghỉ phép",
  },
];

const LeaveRequestsDashboard = () => {
  return (
    <PageContainer title="Đơn nghỉ phép" description="Quản lý đơn nghỉ phép">
      <Breadcrumb title="Đơn nghỉ phép" items={BCrumb} />
      <LeaveRequestApp />
    </PageContainer>
  );
};

export default LeaveRequestsDashboard;
