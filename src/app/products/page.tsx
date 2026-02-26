import { Suspense } from "react";
import {
  getProducts,
  getProductCategories,
  getProductStats,
  getProductsForExport,
  generateExcelFromProducts,
} from "@/app/actions/products";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductFilters } from "@/components/products/ProductFilter";
import { StatsCards } from "@/components/products/StatsCards";
import { ProductActions } from "@/components/products/ProductActions";
import { PaginationControl } from "@/components/products/PaginationControl";
import ProductsLoading from "./loading";
import { ProductFilters as ProductFiltersType } from "@/types";

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

async function handleExportInPage(filters: ProductFiltersType) {
  "use server";

  try {
    const productsResult = await getProductsForExport(filters);

    if (!productsResult.success || !productsResult.data) {
      return {
        success: false,
        message: productsResult.message || "Không lấy được dữ liệu",
      };
    }

    const excelResult = await generateExcelFromProducts(productsResult.data);
    return excelResult;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 10;

  const filters: ProductFiltersType = {
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
  console.log("Fetching with filters:", filters); // Debug


  const [{ products, totalCount }, categories, stats] = await Promise.all([
    getProducts(filters, currentPage, pageSize),
    getProductCategories(),
    getProductStats(),
  ]);
  console.log("Products:", products?.length); // Debug
  console.log("Categories:", categories?.length); // Debug
  console.log("Stats:", stats); // Debug - Xem stats có dữ liệu không

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quản lý kho thuốc
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tra cứu và quản lý tồn kho dược phẩm
          </p>
        </div>
        <ProductActions
          filters={filters}
          productCount={totalCount}
          onExport={async () => {
            "use server";
            return await handleExportInPage(filters);
          }}
        />
      </div>

      <StatsCards stats={stats} />

      <ProductFilters
        categories={categories}
        initialFilters={filters}
        productCount={totalCount}
      />

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Danh sách sản phẩm</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalCount} sản phẩm • Trang {currentPage}/
                {Math.ceil(totalCount / pageSize)}
              </p>
            </div>
          </div>
        </div>

        <ProductsTable products={products} />

        {totalCount > pageSize && (
          <div className="px-4 py-3 border-t bg-muted/10">
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