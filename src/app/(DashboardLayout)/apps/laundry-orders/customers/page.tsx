import React from "react";
import PageContainer from "@/app/components/container/PageContainer";
import BlankCard from "@/app/components/shared/BlankCard";
import { CardContent } from "@mui/material";
import LaundryCustomerList from "@/app/components/apps/laundry-orders/LaundryCustomer-list/index";

const LaundryCustomersPage = () => {
  return (
    <PageContainer title="Quản lý khách hàng giặt ủi" description="Danh sách khách hàng giặt ủi">
      <BlankCard>
        <CardContent>
          <LaundryCustomerList />
        </CardContent>
      </BlankCard>
    </PageContainer>
  );
}
export default LaundryCustomersPage;
