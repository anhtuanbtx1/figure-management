import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import AppCard from "@/app/components/shared/AppCard";
import NotesApp from "@/app/components/apps/notes";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Ghi chú",
  },
];

export default function Notes() {
  return (
    <PageContainer title="Ứng dụng Ghi chú" description="Quản lý ghi chú cá nhân">
      <Breadcrumb title="Ghi chú" items={BCrumb} />
      <AppCard>
        <NotesApp />
      </AppCard>
    </PageContainer>
  );
}
