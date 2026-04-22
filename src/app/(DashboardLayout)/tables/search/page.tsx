import { Alert } from "@mui/material";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Search Table",
  },
];

const SearchTable = () => {
  return (
    <PageContainer title="Search Table" description="this is Search Table">
      {/* breadcrumb */}
      <Breadcrumb title="Search Table" items={BCrumb} />
      {/* end breadcrumb */}
      <Alert severity="info">Bang tim kiem da duoc go bo cung module thuong mai dien tu.</Alert>
    </PageContainer>
  );
};

export default SearchTable;
