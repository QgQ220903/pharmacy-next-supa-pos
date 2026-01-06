import { supabaseAdmin } from "@/lib/supabase-server";
import EntryListClient from "@/app/entries/EntryListClient";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import Link from "next/link";

export default async function EntriesPage() {
  // Lấy danh sách phiếu nhập + kèm chi tiết món hàng + tên sản phẩm (Join bảng)
  const { data: entries } = await supabaseAdmin
    .from("stock_entries")
    .select(
      `
      *,
      items:stock_entry_items(
        *,
        products(name)
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Lịch sử nhập kho
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi các đợt nhập hàng
          </p>
        </div>
        <Button asChild>
          <Link href="/entries/new">
            <Plus className="h-4 w-4 mr-2" /> Nhập hàng mới
          </Link>
        </Button>
      </div>

      {/* Truyền dữ liệu vào Component xử lý phía Client */}
      <EntryListClient initialEntries={entries || []} />
    </div>
  );
}
