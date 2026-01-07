import { supabaseAdmin } from "@/lib/supabase-server";
import POSForm from "./POSForm";

export default async function POSPage() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("current_stock", 0); // Chỉ bán hàng còn kho

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bán hàng</h1>
        <p className="text-muted-foreground">
          Quản lý bán hàng và tạo hóa đơn mới
        </p>
      </div>
      <POSForm products={products || []} />
    </div>
  );
}
