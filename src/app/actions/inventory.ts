"use server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createStockEntryAction(data: {
  entry_code: string;
  supplier?: string;
  notes?: string;
  total_amount: number;
  items: { product_id: string; quantity: number; unit_price: number }[];
}) {
  try {
    // 1. Tạo bản ghi Phiếu nhập (stock_entries)
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("stock_entries")
      .insert([
        {
          entry_code: data.entry_code,
          entry_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          supplier: data.supplier,
          total_amount: data.total_amount,
          notes: data.notes,
          status: "completed",
        },
      ])
      .select()
      .single();

    if (entryError) throw entryError;

    // 2. Lưu Chi tiết phiếu nhập (stock_entry_items)
    const itemsToInsert = data.items.map((item) => ({
      stock_entry_id: entry.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("stock_entry_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Cập nhật tồn kho qua RPC và đồng bộ bảng products
    for (const item of data.items) {
      // Gọi hàm RPC bạn đã viết trong SQL
      const { error: rpcError } = await supabaseAdmin.rpc(
        "update_inventory_quantity",
        {
          p_product_id: item.product_id,
          p_quantity_change: item.quantity,
          p_transaction_type: "purchase",
          p_reference_id: entry.id,
          p_notes: `Nhập kho: ${data.entry_code}`,
        }
      );

      if (rpcError) console.error("RPC Error:", rpcError);

      // Cập nhật giá vốn và tồn kho trực tiếp vào bảng products để hiển thị nhanh
      // Lưu ý: Cột current_stock trong bảng products cần đồng bộ với inventory_snapshot
      const { error: productUpdateError } = await supabaseAdmin
        .from("products")
        .update({
          cost_price: item.unit_price,
          // Tính toán lại current_stock nếu bạn không dùng trigger đồng bộ
        })
        .eq("id", item.product_id);
    }

    revalidatePath("/products");
    revalidatePath("/entries");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi lưu phiếu nhập:", error);
    return { success: false, message: error.message };
  }
}

export async function cancelStockEntryAction(entryId: string) {
  try {
    // 1. Lấy chi tiết phiếu nhập
    const { data: items, error: fetchError } = await supabaseAdmin
      .from("stock_entry_items")
      .select("product_id, quantity")
      .eq("stock_entry_id", entryId);

    if (fetchError) throw fetchError;

    // 2. Thực hiện trừ kho ngược lại cho từng sản phẩm
    for (const item of items) {
      await supabaseAdmin.rpc("update_inventory_quantity", {
        p_product_id: item.product_id,
        p_quantity_change: -item.quantity, // Đảo ngược số lượng (trừ kho)
        p_transaction_type: "adjustment",
        p_reference_id: entryId,
        p_notes: `Hủy phiếu nhập kho: ${entryId}`,
      });
    }

    // 3. Cập nhật trạng thái phiếu
    const { error: updateError } = await supabaseAdmin
      .from("stock_entries")
      .update({ status: "cancelled" })
      .eq("id", entryId);

    if (updateError) throw updateError;

    revalidatePath("/entries");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
