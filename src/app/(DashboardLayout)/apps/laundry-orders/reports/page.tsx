"use client";
import React from "react";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import LaundryRevenueReports from "@/app/components/apps/laundry-orders/LaundryRevenue-reports";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Báo cáo thống kê",
  },
];

const LaundryReportsPage = () => {
  return (
    <PageContainer title="Báo cáo thống kê" description="Báo cáo doanh thu đơn hàng giặt ủi">
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <LaundryRevenueReports />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default LaundryReportsPage;
