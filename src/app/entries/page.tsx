import { supabaseAdmin } from "@/lib/supabase-server";
import EntryListClient from "@/components/entries/EntryListClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

export default async function EntriesPage() {
  // Lấy danh sách phiếu nhập kèm theo chi tiết sản phẩm
  const { data: entries, error } = await supabaseAdmin
    .from("stock_entries")
    .select(
      `
      *,
      items:stock_entry_items(
        id,
        quantity,
        unit_price,
        total_price,
        batch_number,
        expiry_date,
        products(name, unit)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) return <div>Lỗi tải dữ liệu: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Lịch sử nhập hàng
          </h1>
          <p className="text-muted-foreground text-sm">
            Quản lý các hóa đơn nhập kho và lô hàng.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/entries/new">
              <Plus className="mr-2 h-4 w-4" /> Nhập hàng mới
            </Link>
          </Button>
        </div>
      </div>

      <EntryListClient initialEntries={entries || []} />
    </div>
  );
}
