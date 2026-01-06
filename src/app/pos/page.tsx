import { supabaseAdmin } from "@/lib/supabase-server";
import POSForm from "./POSForm";

export default async function POSPage() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("current_stock", 0); // Chỉ bán hàng còn kho

  return (
    <div className="p-4 bg-muted/10 min-h-screen">
      <POSForm products={products || []} />
    </div>
  );
}
