import { supabaseAdmin } from "@/lib/supabase-server";
import StockInForm from "@/components/entries/StockInForm"; // File Form chúng ta viết ở bước trước
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";

export default async function StockInPage() {
  // 1. Lấy danh sách sản phẩm để chọn (chỉ lấy các sp đang hoạt động)
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header đồng bộ style với trang New/Edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-10 w-10" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Nhập hàng vào kho
            </h1>
            <p className="text-sm text-muted-foreground">
              Tạo phiếu nhập mới để cập nhật số lượng tồn kho và giá vốn sản
              phẩm
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Truck className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Form chính (Client Component) */}
      <StockInForm products={(products as Product[]) || []} />
    </div>
  );
}
