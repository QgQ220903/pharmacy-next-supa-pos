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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium">Tổng phiếu</span>
              </div>
              <span className="text-2xl font-semibold">{totalCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Tổng sản phẩm</span>
              </div>
              <span className="text-2xl font-semibold">{totalItems}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span className="text-xs font-medium">Nhà cung cấp</span>
              </div>
              <span className="text-2xl font-semibold">
                {new Set(entries.map(e => e.supplier_name).filter(Boolean)).size}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium">Tổng giá trị</span>
              </div>
              <span className="text-2xl font-semibold text-primary">
                {new Intl.NumberFormat("vi-VN").format(totalValue)}₫
              </span>
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