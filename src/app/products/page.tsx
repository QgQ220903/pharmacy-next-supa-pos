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
import ProductsLoading from "./loading";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    is_active?: string;
    low_stock?: string;
  }>;
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 10;

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
  };

  // Gọi API với phân trang
  const [{ products, totalCount }, categories, stats] = await Promise.all([
    getProducts(filters, currentPage, pageSize),
    getProductCategories(),
    getProductStats(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Quản lý kho thuốc
            </h1>
            <p className="text-muted-foreground text-sm">
              Tra cứu và quản lý tồn kho dược phẩm
            </p>
          </div>
          <ProductActions />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-2">
        <StatsCards stats={stats} />
      </div>

      {/* Filters Section */}
      <div className="mb-4">
        <ProductFilters
          categories={categories}
          initialFilters={filters}
          productCount={totalCount}
        />
      </div>

      {/* Products Table Section */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                Danh sách sản phẩm
              </h2>
              <p className="text-sm text-muted-foreground">
                Tổng cộng {totalCount} sản phẩm • Trang {currentPage}
              </p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden">
          <ProductsTable products={products} />
        </div>

        {/* Pagination Footer */}
        {totalCount > pageSize && (
          <div className="px-6 py-4 border-t bg-muted/20">
            <PaginationControl totalCount={totalCount} pageSize={pageSize} />
          </div>
        )}
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
