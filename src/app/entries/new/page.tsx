import { supabaseAdmin } from "@/lib/supabase-server";
import NewStockEntryForm from "@/components/entries/NewStockEntryForm";

export default async function NewEntryPage() {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Lỗi fetch products:", error);
  }

  return (
    <div className="container mx-auto py-8">
      <NewStockEntryForm products={products || []} />
    </div>
  );
}
