"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Định nghĩa kiểu dữ liệu cho lô hàng để tránh lỗi 'any'
interface SelectedBatch {
  batch_id: string;
  batch_number: string;
  quantity_to_deduct: number;
}

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  sale_price: number;
  unit_name: string;
  conversion_factor: number;
  product_unit_id?: string;
  selected_batches: SelectedBatch[]; // Xác định rõ kiểu ở đây
}

/**
 * 2. LẤY CHI TIẾT HÓA ĐƠN
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
      name: item.products?.name || "Sản phẩm đã bị xóa",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      unit: item.unit_info?.unit_name || item.products?.unit || "",
      batch_number: item.batch?.batch_number,
      expiry_date: item.batch?.expiry_date,
    }));

    return { success: true, data: { ...sale, items: formattedItems } };
  } catch (error: any) {
    return { success: false, message: error.message };
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

/**
 * TẠO HÓA ĐƠN BÁN HÀNG
 * Hỗ trợ trừ kho nhiều lô cho cùng một mặt hàng
 */
export async function createSaleAction(data: {
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string;
  notes?: string;
  items: SaleItem[];
}) {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([{
        sale_code: `HD${Date.now().toString().slice(-8)}`,
        sale_date: new Date().toISOString().split("T")[0],
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        total_amount: Number(data.totalAmount),
        discount: Number(data.discount) || 0,
        final_amount: Number(data.finalAmount),
        payment_method: data.paymentMethod,
        notes: data.notes,
      }])
      .select().single();

    if (saleError) throw saleError;

    for (const item of data.items) {
      const factor = Number(item.conversion_factor) || 1;
      const totalQtySmallestUnit = Number(item.quantity) * factor;

      const { error: itemError } = await supabase
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: Number(item.quantity),
          unit_price: Number(item.sale_price),
          total_price: Number(item.quantity) * Number(item.sale_price),
          product_unit_id: item.product_unit_id || null,
          batch_id: item.selected_batches[0]?.batch_id || null 
        });
      
      if (itemError) throw itemError;

      for (const b of item.selected_batches) {
        const { data: batch } = await supabase
          .from("product_batches")
          .select("quantity, batch_number")
          .eq("id", b.batch_id)
          .single();

        if (!batch || batch.quantity < b.quantity_to_deduct) {
          throw new Error(`Thuốc ${item.name} - Lô ${batch?.batch_number || '?'}: Không đủ tồn kho!`);
        }

        await supabase
          .from("product_batches")
          .update({ quantity: batch.quantity - b.quantity_to_deduct })
          .eq("id", b.batch_id);
      }

      await supabase.rpc("update_inventory_quantity", {
        p_product_id: item.id,
        p_quantity_change: -totalQtySmallestUnit,
        p_transaction_type: "sale",
        p_reference_id: sale.id,
        p_notes: `Bán lẻ ${item.quantity} ${item.unit_name}`,
      });
    }

    revalidatePath("/products");
    revalidatePath("/sales");
    return { success: true, saleCode: sale.sale_code, saleId: sale.id };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * LẤY DANH SÁCH LÔ CÒN HẠN & CÒN HÀNG (FEFO)
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
    return { success: false, message: error.message, data: [] };
  }
}