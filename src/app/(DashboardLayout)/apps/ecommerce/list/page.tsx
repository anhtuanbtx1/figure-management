import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import ProductTableList from '@/app/components/apps/ecommerce/ProductTableList/ProductTableList';
import DataSourceToggle from '@/app/components/apps/ecommerce/ProductTableList/DataSourceToggle';
import BlankCard from '@/app/components/shared/BlankCard';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Shop',
  },
];

const EcomProductList = () => {
  return (
    <PageContainer title="eCommerce Product List" description="this is eCommerce Product List">
      {/* breadcrumb */}
      <Breadcrumb title="Ecom-Shop" items={BCrumb} />

      {/* Data Source Toggle */}
      <DataSourceToggle />

      <BlankCard>
        {/* ------------------------------------------- */}
        {/* Left part */}
        {/* ------------------------------------------- */}
        <ProductTableList />
      </BlankCard>
    </PageContainer>
  );
};

export default EcomProductList;
