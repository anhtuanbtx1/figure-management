import React from "react";
import { CardContent } from "@mui/material";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import PayrollEmployeeStatistics from "@/app/components/apps/payroll-import/PayrollEmployeeStatistics";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Thống kê lương nhân viên",
  },
];

const PayrollStatisticsPage = () => {
  return (
    <PageContainer
      title="Thống kê lương nhân viên"
      description="Dashboard lương theo tháng của nhân viên theo mã nhân viên"
    >
      <Breadcrumb
        title="Thống kê lương nhân viên"
        subtitle="Nhập mã nhân viên để xem dashboard lương theo tháng và lịch sử biến động lương"
        items={BCrumb}
      />

      <BlankCard>
        <CardContent>
          <PayrollEmployeeStatistics />
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
};

export default PayrollStatisticsPage;
