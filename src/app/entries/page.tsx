// app/entries/page.tsx
import { Suspense } from "react";
import { getStockEntriesAction } from "@/app/actions/inventory";
import { EntriesClient } from "@/components/entries/EntriesClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  Download,
  AlertCircle,
  Package,
  TrendingUp,
  CalendarDays,
  Building,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EntriesLoading from "./loading";

interface EntriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    from?: string;
    to?: string;
  }>;
}

async function EntriesContent({ searchParams }: EntriesPageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const search = params?.search || "";
  const fromDate = params?.from || "";
  const toDate = params?.to || "";

  const result = await getStockEntriesAction({
    page: currentPage,
    limit: 10,
    search,
    fromDate,
    toDate,
  });

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-3">
              Không thể tải dữ liệu
            </h2>
            <p className="text-muted-foreground mb-6">
              Đã xảy ra lỗi khi kết nối với cơ sở dữ liệu.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const entries = result.data;
  const totalCount = result.totalCount;
  const totalPages = result.totalPages;

  // Tính thống kê
  const totalValue = entries.reduce((sum, e) => sum + (e.total_amount || 0), 0);
  const totalItems = entries.reduce((sum, e) => sum + (e.item_count || 0), 0);
  const uniqueSuppliers = new Set(entries.map(e => e.supplier_name).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header - Giống products */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quản lý nhập hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi các phiếu nhập kho và lô hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2" disabled>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
          <Button size="sm" asChild className="h-9 gap-2">
            <Link href="/entries/new">
              <Plus className="h-4 w-4" />
              <span>Tạo phiếu nhập</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Giống products với gap-3 và bg colors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Tổng phiếu
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {totalCount}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {totalPages} trang
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Tổng sản phẩm
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {totalItems}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Số lượng nhập
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Nhà cung cấp
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {uniqueSuppliers}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Đã giao hàng
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Tổng giá trị
                </p>
                <p className="text-2xl font-bold tracking-tight text-primary">
                  {new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(totalValue)}₫
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Giá trị nhập
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Component với filters và table */}
      <EntriesClient
        initialEntries={entries}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        initialSearch={search}
        initialDateFrom={fromDate}
        initialDateTo={toDate}
      />
    </div>
  );
}

export default function EntriesPage(props: EntriesPageProps) {
  return (
    <Suspense fallback={<EntriesLoading />}>
      <EntriesContent {...props} />
    </Suspense>
  );
}