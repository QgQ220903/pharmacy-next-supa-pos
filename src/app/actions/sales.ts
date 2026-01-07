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

    // 2. Lưu chi tiết và cập nhật kho
    for (const item of data.items) {
      // A. Lưu vào sale_items (có kèm batch_id nếu có)
      const { error: itemError } = await supabaseAdmin
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.sale_price,
          total_price: item.quantity * item.sale_price,
          batch_id: item.selected_batch_id || null, // Lưu ID lô đã chọn
        });
      if (itemError) throw itemError;

      // B. Cập nhật bảng product_batches (Nếu là hàng theo lô)
      if (item.manage_by_batch && item.selected_batch_id) {
        const { data: batch } = await supabaseAdmin
          .from("product_batches")
          .select("quantity")
          .eq("id", item.selected_batch_id)
          .single();

        await supabaseAdmin
          .from("product_batches")
          .update({ quantity: (batch?.quantity || 0) - item.quantity })
          .eq("id", item.selected_batch_id);
      }

      // C. Cập nhật tồn kho tổng qua RPC
      await supabaseAdmin.rpc("update_inventory_quantity", {
        p_product_id: item.id,
        p_quantity_change: -item.quantity,
        p_transaction_type: "sale",
        p_reference_id: sale.id,
        p_notes: `Bán hàng HD: ${sale.sale_code}${
          item.selected_batch_number
            ? " - Lô: " + item.selected_batch_number
            : ""
        }`,
      });
    }

    revalidatePath("/products");
    return { success: true, saleCode: sale.sale_code };
  } catch (error: any) {
    console.error("Sale Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getProductBatchesAction(productId: string) {
  const { data, error } = await supabaseAdmin
    .from("product_batches")
    .select("*")
    .eq("product_id", productId)
    .gt("quantity", 0) // Chỉ lấy lô còn hàng
    .gte("expiry_date", new Date().toISOString().split("T")[0]) // Chỉ lấy lô còn hạn
    .order("expiry_date", { ascending: true });

  if (error) return { success: false, data: [] };
  return { success: true, data };
}

// Trong app/actions/sales.ts (Tạo mới nếu chưa có)
export async function getSaleDetailAction(saleId: string) {
  const { data, error } = await supabaseAdmin
    .from("sales")
    .select(`*, items:sale_items(*, products(name, unit))`)
    .eq("id", saleId)
    .single();
  return { success: !error, data };
}

export async function getSalesAction() {
  const supabase = await supabaseAdmin;
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Thêm vào app/actions/sales.ts
export async function getSaleDetailAction2(saleId: string) {
  try {
    const supabase = await supabaseAdmin;

    // Lấy thông tin hóa đơn với chi tiết items
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(
        `
        *,
        items:sale_items(
          *,
          products:product_id(name, unit),
          batch:batch_id(batch_number, expiry_date)
        )
      `
      )
      .eq("id", saleId)
      .single();

    if (saleError) throw saleError;

    // Format lại dữ liệu items để dễ xử lý
    const formattedItems = (sale.items || []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products?.name || "",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      unit: item.products?.unit || item.unit || "",
      batch_number: item.batch?.batch_number,
      expiry_date: item.batch?.expiry_date,
      products: item.products,
    }));

    return {
      success: true,
      data: {
        ...sale,
        items: formattedItems,
      },
    };
  } catch (error: any) {
    console.error("Get sale detail error:", error);
    return { success: false, message: error.message };
  }
}
