import { Box, Button, Grid, Stack } from "@mui/material";
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";

import GeneralCard from "@/app/components/apps/ecommerce/productEdit/GeneralCard";
import MediaCard from "@/app/components/apps/ecommerce/productEdit/Media";
import VariationCard from "@/app/components/apps/ecommerce/productEdit/VariationCard";
import PricingCard from "@/app/components/apps/ecommerce/productEdit/Pricing";
import Thumbnail from "@/app/components/apps/ecommerce/productEdit/Thumbnail";
import StatusCard from "@/app/components/apps/ecommerce/productEdit/Status";
import ProductDetails from "@/app/components/apps/ecommerce/productEdit/ProductDetails";
import ProductTemplate from "@/app/components/apps/ecommerce/productEdit/ProductTemplate";
import CustomersReviews from "@/app/components/apps/ecommerce/productEdit/CustomersReviews";
import ProductAvgSales from "@/app/components/apps/ecommerce/productEdit/ProductAvgSales";
import BlankCard from "@/app/components/shared/BlankCard";

const BCrumb = [
  {
    to: "/",
    title: "Trang chủ",
  },
  {
    title: "Chỉnh sửa sản phẩm",
  },
];

const EcommerceEditProduct = () => {
  return (
    <PageContainer title="Chỉnh sửa sản phẩm" description="Trang chỉnh sửa sản phẩm">
      {/* breadcrumb */}
      <Breadcrumb title="Chỉnh sửa sản phẩm" items={BCrumb} />
      <form>
        <Grid container spacing={3}>
          <Grid item lg={8}>
            <Stack spacing={3}>
              <BlankCard>
                <GeneralCard />
              </BlankCard>

              <BlankCard>
                <MediaCard />
              </BlankCard>

              <BlankCard>
                <VariationCard />
              </BlankCard>

              <BlankCard>
                <PricingCard />
              </BlankCard>

              <BlankCard>
                <CustomersReviews />
              </BlankCard>
            </Stack>
          </Grid>

          <Grid item lg={4}>
            <Stack spacing={3}>
              <BlankCard>
                <Thumbnail />
              </BlankCard>

              <BlankCard>
                <StatusCard />
              </BlankCard>

              <BlankCard>
                <ProductDetails />
              </BlankCard>

              <BlankCard>
                <ProductAvgSales />
              </BlankCard>

              <BlankCard>
                <ProductTemplate />
              </BlankCard>
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} mt={3}>
          <Button variant="contained" color="primary">
            Lưu thay đổi
          </Button>
          <Button variant="outlined" color="error">
            Hủy bỏ
          </Button>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default EcommerceEditProduct;
