import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import BlogListing from '@/app/components/apps/blog/BlogListing';

const Blog = () => {
  return (
    <PageContainer title="Quản lý nhân vật" description="this is Blog">
      <Breadcrumb title="Quản lý nhân vật" subtitle="Danh sách bài viết" />
      <BlogListing />
    </PageContainer>
  );
};

export default Blog;
