import React from "react";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import EditInvoicePage from "@/app/components/apps/invoice/Edit-invoice/index";
import { InvoiceProvider } from "@/app/context/InvoiceContext/index";
import BlankCard from "@/app/components/shared/BlankCard";
import { CardContent } from "@mui/material";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Chỉnh sửa hóa đơn",
  },
];

const InvoiceEdit = () => {
  return (
    <InvoiceProvider>
      <PageContainer title="Chỉnh sửa hóa đơn" description="Trang chỉnh sửa hóa đơn">
        <Breadcrumb title="Chỉnh sửa hóa đơn" items={BCrumb} />
        <BlankCard>
          <CardContent>
            <EditInvoicePage />
          </CardContent>
        </BlankCard>
      </PageContainer>
    </InvoiceProvider>
  );
};

export default InvoiceEdit;
