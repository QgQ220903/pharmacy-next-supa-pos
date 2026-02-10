import { getStockEntriesAction } from "@/app/actions/inventory";
import EntryListClient from "@/components/entries/EntryListClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  Download,
  Package2,
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

// Thêm interface cho props
interface EntriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function EntriesPage({ searchParams }: EntriesPageProps) {
  // Await searchParams trước khi sử dụng
  const params = await searchParams;

  // Lấy page từ URL, mặc định là 1
  const currentPage = Number(params?.page) || 1;
  const limit = 10; // Số lượng item mỗi trang

  const result = await getStockEntriesAction({
    page: currentPage,
    limit,
  });

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="max-w-md w-full border shadow-none">
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

  // Tính toán hiển thị range
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  // Tính toán stats
  const completedCount = entries.filter((e) => e.status === "completed").length;
  const cancelledCount = entries.filter((e) => e.status === "cancelled").length;
  const pendingCount = entries.filter((e) => e.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/5 border flex items-center justify-center">
                  <Package2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Nhập hàng
                  </h1>
                  <p className="text-muted-foreground">
                    Quản lý phiếu nhập kho và lô hàng
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-dashed"
              >
                <Download className="h-4 w-4" />
                Xuất Excel
              </Button>
              <Button
                size="sm"
                asChild
                className="h-9 gap-2 shadow-sm hover:shadow transition-shadow"
              >
                <Link href="/entries/new">
                  <Plus className="h-4 w-4" />
                  Tạo phiếu nhập
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Tổng số phiếu
                    </p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Hoàn thành
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {completedCount}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Store className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Đang xử lý
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {pendingCount}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Filter className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Đã hủy
                    </p>
                    <p className="text-2xl font-bold text-rose-600">
                      {cancelledCount}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Filter Info */}
          {(params?.search ||
            params?.status !== "all" ||
            params?.from ||
            params?.to) && (
            <Card className="border bg-muted/40">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Bộ lọc đang áp dụng:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {params?.search && (
                      <Badge variant="secondary" className="gap-1">
                        Tìm kiếm: {params.search}
                      </Badge>
                    )}
                    {params?.status && params.status !== "all" && (
                      <Badge variant="outline" className="capitalize">
                        {params.status === "completed"
                          ? "Hoàn thành"
                          : params.status === "cancelled"
                            ? "Đã hủy"
                            : "Chờ xử lý"}
                      </Badge>
                    )}
                    {params?.from && (
                      <Badge variant="outline" className="gap-1">
                        Từ: {new Date(params.from).toLocaleDateString("vi-VN")}
                      </Badge>
                    )}
                    {params?.to && (
                      <Badge variant="outline" className="gap-1">
                        Đến: {new Date(params.to).toLocaleDateString("vi-VN")}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-8" />

        {/* Content Section */}
        <div>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Danh sách phiếu nhập</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Hiển thị {startItem}-{endItem} của {totalCount} phiếu
                  {totalPages > 1 && ` • Trang ${page}/${totalPages}`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span>Chờ xử lý</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                  <span>Đã hủy</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <EntryListClient
                initialEntries={entries}
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                // Truyền thêm filters để đồng bộ với URL
                initialSearch={params?.search || ""}
                initialStatus={params?.status || "all"}
                initialDateFrom={params?.from || ""}
                initialDateTo={params?.to || ""}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Hiển thị tối đa {limit} phiếu mỗi trang • Dữ liệu được cập nhật theo
            thời gian thực
          </p>
        </div>
      </div>
    </div>
  );
}
