"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 1. TẠO HÓA ĐƠN BÁN HÀNG (CREATE SALE)
 * Logic: Tạo hóa đơn -> Lưu chi tiết -> Trừ kho lô -> Trừ kho tổng (RPC)
 */
export async function createSaleAction(data: any) {
  try {
    const supabase = await createClient();

    // 1. Tạo hóa đơn (sales)
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          sale_code: `HD${Date.now().toString().slice(-8)}`,
          sale_date: new Date().toISOString().split("T")[0],
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          total_amount: Number(data.totalAmount),
          discount: Number(data.discount) || 0,
          final_amount: Number(data.finalAmount),
          payment_method: data.paymentMethod,
          notes: data.notes,
        },
      ])
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Lưu chi tiết và cập nhật kho
    for (const item of data.items) {
      // A. Lưu vào sale_items
      const { error: itemError } = await supabase
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: Number(item.quantity),
          unit_price: Number(item.sale_price),
          total_price: Number(item.quantity) * Number(item.sale_price),
          batch_id: item.selected_batch_id || null,
        });
      
      if (itemError) throw itemError;

      // B. Cập nhật bảng product_batches (Trừ số lượng lô cụ thể)
      if (item.manage_by_batch && item.selected_batch_id) {
        const { data: batch } = await supabase
          .from("product_batches")
          .select("quantity")
          .eq("id", item.selected_batch_id)
          .single();

        await supabase
          .from("product_batches")
          .update({ quantity: (Number(batch?.quantity) || 0) - Number(item.quantity) })
          .eq("id", item.selected_batch_id);
      }

      // C. Cập nhật tồn kho tổng và ghi Log qua RPC
      await supabase.rpc("update_inventory_quantity", {
        p_product_id: item.id,
        p_quantity_change: -Number(item.quantity), // Dấu âm để trừ kho
        p_transaction_type: "sale",
        p_reference_id: sale.id,
        p_notes: `Bán hàng HD: ${sale.sale_code}${
          item.selected_batch_number ? " - Lô: " + item.selected_batch_number : ""
        }`,
      });
    }

    revalidatePath("/products");
    revalidatePath("/sales");
    revalidatePath("/inventory");
    
    return { success: true, saleCode: sale.sale_code };
  } catch (error: any) {
    console.error("Sale Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 2. LẤY LÔ HÀNG CÒN HẠN & CÒN HÀNG CỦA SẢN PHẨM
 */
export async function getProductBatchesAction(productId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", productId)
      .gt("quantity", 0) 
      .gte("expiry_date", new Date().toISOString().split("T")[0]) 
      .order("expiry_date", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

/**
 * 3. LẤY DANH SÁCH TẤT CẢ HÓA ĐƠN (Dành cho trang quản lý)
 */
export async function getSalesAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 4. LẤY CHI TIẾT HÓA ĐƠN (Dùng để in hoặc xem lại)
 */
export async function getSaleDetailAction(saleId: string) {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(`
        *,
        items:sale_items(
          *,
          products:product_id(name, unit),
          batch:batch_id(batch_number, expiry_date)
        )
      `)
      .eq("id", saleId)
      .single();

    if (saleError) throw saleError;

    // Format dữ liệu để FE dễ render
    const formattedItems = (sale.items || []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products?.name || "Sản phẩm không xác định",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      unit: item.products?.unit || "",
      batch_number: item.batch?.batch_number,
      expiry_date: item.batch?.expiry_date,
    }));

    return {
      success: true,
      data: {
        ...sale,
        items: formattedItems,
      },
    };
  } catch (error: any) {
    console.error("Get sale detail error:", error.message);
    return { success: false, message: error.message };
  }
}