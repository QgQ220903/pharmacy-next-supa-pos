"use server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createSaleAction(data: any) {
  try {
    // 1. Tạo hóa đơn (sales)
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("sales")
      .insert([
        {
          sale_code: `HD${Date.now().toString().slice(-8)}`,
          sale_date: new Date().toISOString().split("T")[0],
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          total_amount: data.totalAmount,
          discount: data.discount,
          final_amount: data.finalAmount,
          payment_method: data.paymentMethod,
          notes: data.notes,
        },
      ])
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Lưu chi tiết (sale_items) và trừ kho
    const itemsToInsert = data.items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.sale_price,
      total_price: item.quantity * item.sale_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("sale_items")
      .insert(itemsToInsert);
    if (itemsError) throw itemsError;

    // 3. Cập nhật tồn kho qua RPC
    for (const item of data.items) {
      await supabaseAdmin.rpc("update_inventory_quantity", {
        p_product_id: item.id,
        p_quantity_change: -item.quantity, // Dấu trừ để trừ kho
        p_transaction_type: "sale",
        p_reference_id: sale.id,
        p_notes: `Bán hàng hóa đơn: ${sale.sale_code}`,
      });
    }

    revalidatePath("/products");
    return { success: true, saleCode: sale.sale_code };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
