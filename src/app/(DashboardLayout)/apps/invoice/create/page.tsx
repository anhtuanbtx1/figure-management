import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import React from "react";
import CreateInvoiceApp from "@/app/components/apps/invoice/Add-invoice";
import BlankCard from "@/app/components/shared/BlankCard";
import { CardContent } from "@mui/material";
import { InvoiceProvider } from "@/app/context/InvoiceContext";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Tạo hóa đơn",
  },
];

const CreateInvoice = () => {
  return (
    <InvoiceProvider>
      <PageContainer
        title="Tạo hóa đơn"
        description="Trang tạo hóa đơn mới"
      >
        <Breadcrumb title="Tạo hóa đơn" items={BCrumb} />

        <BlankCard>
          <CardContent>
            <CreateInvoiceApp />
          </CardContent>
        </BlankCard>
      </PageContainer>
    </InvoiceProvider>
  );
};
export default CreateInvoice;
