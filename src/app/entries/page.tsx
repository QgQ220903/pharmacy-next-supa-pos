import { supabaseAdmin } from "@/lib/supabase-server";
import EntryListClient from "@/components/entries/EntryListClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Download, Package2 } from "lucide-react";

export default async function EntriesPage() {
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

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in duration-500">
          <p className="text-destructive font-medium">
            Lỗi tải dữ liệu: {error.message}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

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
                Quản lý phiếu nhập kho và lô hàng chi tiết
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
          <EntryListClient initialEntries={entries || []} />
        </div>
      </div>
    </div>
  );
}
