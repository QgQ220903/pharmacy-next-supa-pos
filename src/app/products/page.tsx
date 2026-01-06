import { Suspense } from "react";
import {
  getProducts,
  getProductCategories,
  getProductStats,
} from "@/app/actions/products";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductFilters } from "@/components/products/ProductFilter";
import { StatsCards } from "@/components/products/StatsCards";
import { ProductActions } from "@/components/products/ProductActions";
import { PaginationControl } from "@/components/products/PaginationControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Filter } from "lucide-react";
import ProductsLoading from "./loading";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    is_active?: string;
    low_stock?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

const PAGE_SIZE = 10;

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;

  const filters = {
    search: params.search || "",
    category: params.category || "",
    is_active:
      params.is_active === "true"
        ? true
        : params.is_active === "false"
        ? false
        : undefined,
    low_stock: params.low_stock === "true",
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
  };

  const [{ products, totalCount }, categories, stats] = await Promise.all([
    getProducts(filters, currentPage, PAGE_SIZE),
    getProductCategories(),
    getProductStats(),
  ]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header & Nút Thêm mới/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý kho thuốc
          </h1>
          <p className="text-muted-foreground mt-1">
            Tra cứu thông tin, quản lý tồn kho và danh mục dược phẩm.
          </p>
        </div>
        <ProductActions />
      </div>

      {/* Khu vực Thống kê nhanh */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cột trái: Bộ lọc */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Bộ lọc tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ProductFilters
                categories={categories}
                initialFilters={filters}
                productCount={totalCount}
              />
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Danh sách sản phẩm */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm border-none bg-transparent">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-foreground" />
                Danh sách sản phẩm
              </h2>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                Tổng cộng: {totalCount}
              </span>
            </div>

            <div className="space-y-4">
              {/* Bảng dữ liệu */}
              <ProductsTable products={products} />

              {/* Điều khiển phân trang */}
              <PaginationControl totalCount={totalCount} pageSize={PAGE_SIZE} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent {...props} />
    </Suspense>
  );
}
