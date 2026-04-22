import React from "react";
import { CardContent } from "@mui/material";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import PayrollImportList from "@/app/components/apps/payroll-import/PayrollImportList";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Danh sách bảng lương",
  },
];

const PayrollListPage = () => {
  return (
    <PageContainer
      title="Danh sách bảng lương"
      description="Tra cứu danh sách lương nhân sự theo mã, tên và mức lương"
    >
      <Breadcrumb
        title="Danh sách bảng lương"
        subtitle="Tra cứu nhanh mã nhân viên, tên nhân viên và mức lương từ dữ liệu bảng lương"
        items={BCrumb}
      />

      <BlankCard>
        <CardContent>
          <PayrollImportList />
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
};

export default PayrollListPage;
