"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 1. TẠO HÓA ĐƠN BÁN HÀNG (CREATE SALE)
 * Hỗ trợ: Bán theo đơn vị quy đổi (Vỉ/Hộp), Tự sửa giá, Trừ kho theo hệ số quy đổi.
 */
export async function createSaleAction(data: {
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string;
  notes?: string;
  items: Array<{
    id: string;               // product_id
    quantity: number;         // số lượng bán (ví dụ: 2)
    sale_price: number;       // giá bán thực tế (chú M đã sửa)
    product_unit_id?: string; // id của đơn vị Vỉ/Hộp (nếu có)
    unit_name: string;        // tên đơn vị để ghi log
    conversion_factor: number;// hệ số để quy ra viên lẻ (ví dụ: 10)
    manage_by_batch: boolean;
    selected_batch_id?: string;
    selected_batch_number?: string;
  }>;
}) {
  try {
    const supabase = await createClient();

    // 1. Tạo hóa đơn gốc (sales)
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

    // 2. Duyệt giỏ hàng để lưu chi tiết và trừ kho
    for (const item of data.items) {
      // TÍNH TOÁN QUY ĐỔI: Quan trọng nhất để trừ kho đúng
      const factor = Number(item.conversion_factor) || 1;
      const actualQtyToDeduct = Number(item.quantity) * factor;

      // A. Lưu vào sale_items (Lưu cả đơn vị quy đổi và giá đã sửa)
      const { error: itemError } = await supabase
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: Number(item.quantity),       // SL hiển thị (2 hộp)
          unit_price: Number(item.sale_price),   // Giá thực tế bán
          total_price: Number(item.quantity) * Number(item.sale_price),
          batch_id: item.selected_batch_id || null,
          product_unit_id: item.product_unit_id || null, // Lưu để biết bán theo Vỉ hay Hộp
        });
      
      if (itemError) throw itemError;

      // B. Cập nhật bảng product_batches (Trừ số lượng theo đơn vị nhỏ nhất)
      if (item.manage_by_batch && item.selected_batch_id) {
        const { data: batch } = await supabase
          .from("product_batches")
          .select("quantity")
          .eq("id", item.selected_batch_id)
          .single();

        const newBatchQty = (Number(batch?.quantity) || 0) - actualQtyToDeduct;

        await supabase
          .from("product_batches")
          .update({ quantity: newBatchQty })
          .eq("id", item.selected_batch_id);
      }

      // C. Cập nhật tồn kho tổng (current_stock) và ghi Log giao dịch
      // Lưu ý: Dùng actualQtyToDeduct để trừ đúng số viên lẻ trong kho
      await supabase.rpc("update_inventory_quantity", {
        p_product_id: item.id,
        p_quantity_change: -actualQtyToDeduct, 
        p_transaction_type: "sale",
        p_reference_id: sale.id,
        p_notes: `Bán ${item.quantity} ${item.unit_name} (Hệ số x${factor})`,
      });
    }

    revalidatePath("/products");
    revalidatePath("/sales");
    
    return { success: true, saleCode: sale.sale_code, saleId: sale.id };
  } catch (error: any) {
    console.error("Sale Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 2. LẤY CHI TIẾT HÓA ĐƠN (Hỗ trợ hiển thị tên đơn vị quy đổi)
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
          unit_info:product_unit_id(unit_name),
          batch:batch_id(batch_number, expiry_date)
        )
      `)
      .eq("id", saleId)
      .single();

    if (saleError) throw saleError;

    const formattedItems = (sale.items || []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products?.name || "Sản phẩm đã bị xóa",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      // Nếu có đơn vị quy đổi (Vỉ/Hộp) thì hiện tên đó, không thì hiện đơn vị gốc
      unit: item.unit_info?.unit_name || item.products?.unit || "",
      batch_number: item.batch?.batch_number,
      expiry_date: item.batch?.expiry_date,
    }));

    return {
      success: true,
      data: { ...sale, items: formattedItems },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 3. LẤY LÔ HÀNG (Giữ nguyên logic cũ nhưng sắp xếp hạn dùng gần nhất lên trước)
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
      .order("expiry_date", { ascending: true }); // Ưu tiên hàng sắp hết hạn (FEFO)

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

/**
 * 4. LẤY DANH SÁCH HÓA ĐƠN
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