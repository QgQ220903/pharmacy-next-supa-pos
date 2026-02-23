import { Suspense } from "react";
import { getStockEntriesAction } from "@/app/actions/inventory";
import EntryListClient from "@/components/entries/EntryListClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  Download,
  AlertCircle,
  TrendingUp,
  Filter,
  CalendarDays,
  Store,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import EntriesLoading from "./loading";

interface EntriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}

async function EntriesContent({ searchParams }: EntriesPageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const limit = 10;

  const result = await getStockEntriesAction({
    page: currentPage,
    limit,
  });

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="max-w-md w-full border shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-3">
              Không thể tải dữ liệu
            </h2>
            <p className="text-muted-foreground mb-6">
              Đã xảy ra lỗi khi kết nối với cơ sở dữ liệu. Vui lòng thử lại sau.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  Quay lại Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const entries = result.data;
  const { totalCount = 0, currentPage: page = 1, totalPages = 1 } = result;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  const completedCount = entries.filter((e) => e.status === "completed").length;
  const cancelledCount = entries.filter((e) => e.status === "cancelled").length;
  const pendingCount = entries.filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header Section - Giống Products */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nhập hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý phiếu nhập kho và lô hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
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

      {/* Stats Cards - Giống Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Tổng số phiếu</span>
              </div>
              <span className="text-2xl font-semibold text-foreground">
                {totalCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Store className="h-4 w-4" />
                <span className="text-xs font-medium">Hoàn thành</span>
              </div>
              <span className="text-2xl font-semibold text-emerald-600">
                {completedCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-xs font-medium">Đang xử lý</span>
              </div>
              <span className="text-2xl font-semibold text-amber-600">
                {pendingCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium">Đã hủy</span>
              </div>
              <span className="text-2xl font-semibold text-rose-600">
                {cancelledCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Info - Giống Products */}
      {(params?.search || params?.status || params?.from || params?.to) && (
        <Card className="border bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">Đang lọc:</span>
              <div className="flex flex-wrap gap-1.5">
                {params?.search && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                    "{params.search}"
                  </Badge>
                )}
                {params?.status && params.status !== "all" && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0 h-5 capitalize"
                  >
                    {params.status === "completed"
                      ? "Hoàn thành"
                      : params.status === "cancelled"
                        ? "Đã hủy"
                        : "Chờ xử lý"}
                  </Badge>
                )}
                {params?.from && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                    Từ {new Date(params.from).toLocaleDateString("vi-VN")}
                  </Badge>
                )}
                {params?.to && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                    Đến {new Date(params.to).toLocaleDateString("vi-VN")}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Section - Giống Products */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium">Danh sách phiếu nhập</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hiển thị {startItem}-{endItem} / {totalCount} phiếu
                {totalPages > 1 && ` • Trang ${page}/${totalPages}`}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Hoàn thành</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Chờ xử lý</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Đã hủy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <EntryListClient
          initialEntries={entries}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          initialSearch={params?.search || ""}
          initialStatus={params?.status || "all"}
          initialDateFrom={params?.from || ""}
          initialDateTo={params?.to || ""}
        />
      </div>
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
