import { getStockEntriesAction } from "@/app/actions/inventory"; // Đường dẫn file action của bạn
import EntryListClient from "@/components/entries/EntryListClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Download, Package2, AlertCircle } from "lucide-react";

export default async function EntriesPage() {
  // Gọi hàm action thay vì dùng trực tiếp supabaseAdmin
  const result = await getStockEntriesAction({ page: 1, limit: 50 });

  if (!result.success) {
    return (
      <div className="container mx-auto py-20">
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-destructive">Không thể tải dữ liệu</h2>
          <p className="text-muted-foreground mt-2 max-w-xs">
            Đã xảy ra lỗi khi kết nối với cơ sở dữ liệu. Vui lòng kiểm tra lại quyền truy cập.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/dashboard">Quay lại Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const entries = result.data;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-3xl font-bold tracking-tight">Nhập hàng</h1>
              <p className="text-sm text-muted-foreground">
                Quản lý phiếu nhập kho và lô hàng chi tiết ({result.totalCount} phiếu)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button
              size="sm"
              asChild
              className="shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Link href="/entries/new">
                <Plus className="h-4 w-4 mr-2" />
                Nhập hàng mới
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-xl text-card-foreground overflow-hidden border-border/50">
          <EntryListClient initialEntries={entries} />
        </div>
      </div>
    </div>
  );
}