import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import TicketListing from '@/app/components/apps/tickets/TicketListing';
import TicketFilter from '@/app/components/apps/tickets/TicketFilter';
import ChildCard from '@/app/components/shared/ChildCard';

const BCrumb = [
  {
    to: '/',
    title: 'Trang chủ',
  },
  {
    title: 'Phiếu hỗ trợ',
  },
];

const TicketList = () => {
  return (
    <PageContainer title="Ứng dụng phiếu hỗ trợ" description="Ứng dụng quản lý phiếu hỗ trợ">
      <Breadcrumb title="Ứng dụng phiếu hỗ trợ" items={BCrumb} />
      <ChildCard>
        <TicketFilter />
        <TicketListing />
      </ChildCard>
    </PageContainer>
  );
};

export default TicketList;
