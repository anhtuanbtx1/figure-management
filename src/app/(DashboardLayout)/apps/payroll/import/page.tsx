import React from "react";
import { CardContent } from "@mui/material";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import PayrollImportForm from "@/app/components/apps/payroll-import/PayrollImportForm";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Bảng lương",
  },
];

const PayrollImportPage = () => {
  return (
    <PageContainer
      title="Bảng lương"
      description="Màn hình import file Excel bảng lương và nhập mã mở khóa"
    >
      <Breadcrumb
        title="Bảng lương"
        subtitle="Import file Excel và nhập mã để mở khóa trước khi xử lý dữ liệu bảng lương"
        items={BCrumb}
      />

      <BlankCard>
        <CardContent>
          <PayrollImportForm />
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
};

export default PayrollImportPage;
