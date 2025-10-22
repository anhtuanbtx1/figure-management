import React from "react";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import { CardContent } from "@mui/material";
import LaundryOrderList from "@/app/components/apps/laundry-orders/LaundryOrder-list/index";

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Đơn hàng giặt ủi",
  },
];

const LaundryOrderListing = () => {
  return (
    <PageContainer title="Quản lý đơn hàng giặt ủi" description="this is Laundry Order List">
      {/* <Breadcrumb title="Quản lý đơn hàng giặt ủi" items={BCrumb} /> */}
      <BlankCard>
        <CardContent>
          <LaundryOrderList />
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
}
export default LaundryOrderListing;
