"use client";

import React from "react";
import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import DatabaseManager from "@/app/components/apps/db-manager";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Quản lý Database",
  },
];

const DatabaseManagerPage = () => {
  return (
    <PageContainer
      title="Quản lý Database"
      description="Quản lý và xem dữ liệu các bảng trong database"
    >
      <Breadcrumb title="Quản lý Database" items={BCrumb} />
      <DatabaseManager />
    </PageContainer>
  );
};

export default DatabaseManagerPage;
