import { supabaseAdmin } from "@/lib/supabase-server";
import NewStockEntryForm from "@/components/entries/NewStockEntryForm";

export default async function NewEntryPage() {
  // Lấy danh sách thuốc để phục vụ việc tìm kiếm khi nhập hàng
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Lỗi fetch products:", error);
  }

  // products || [] đảm bảo không bao giờ truyền undefined vào component con
  return (
    <div className="container mx-auto py-6">
      <NewStockEntryForm products={products || []} />
    </div>
  );
}
