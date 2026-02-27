"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Product, SaleItem } from "@/types";

// ==========================================
// 1. TÌM KIẾM SẢN PHẨM CHO POS
// ==========================================
export async function searchProductsForPOS(searchTerm: string, page: number = 1, limit: number = 20) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Nếu không có searchTerm, lấy sản phẩm phổ biến (có tồn kho)
    if (!searchTerm || searchTerm.length < 2) {
      const { data, error, count } = await supabase
        .from("v_products_extended")
        .select(`
          id,
          internal_code,
          barcode,
          name,
          category,
          base_unit,
          sale_price,
          cost_price,
          min_stock,
          manage_by_batch,
          is_active,
          created_at,
          updated_at,
          current_stock,
          units:product_units(
            id,
            unit_name,
            conversion_factor,
            sale_price,
            is_base_unit,
            created_at
          )
        `, { count: "exact" })
        .eq("is_active", true)
        .gt("current_stock", 0)
        .order("name", { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    }

    // Có searchTerm - tìm kiếm
    const searchPattern = `%${searchTerm.trim()}%`;
    const { data, error, count } = await supabase
      .from("v_products_extended")
      .select(`
        id,
        internal_code,
        barcode,
        name,
        category,
        base_unit,
        sale_price,
        cost_price,
        min_stock,
        manage_by_batch,
        is_active,
        created_at,
        updated_at,
        current_stock,
        units:product_units(
          id,
          unit_name,
          conversion_factor,
          sale_price,
          is_base_unit,
          created_at
        )
      `, { count: "exact" })
      .eq("is_active", true)
      .gt("current_stock", 0)
      .or(`name.ilike.${searchPattern},internal_code.ilike.${searchPattern},barcode.ilike.${searchPattern}`)
      .order("name", { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error: any) {
    console.error("searchProductsForPOS error:", error);
    return {
      success: false,
      data: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      message: error.message,
    };
  }
}

// ==========================================
// 2. LẤY DANH SÁCH LÔ CÒN HẠN (FEFO)
// ==========================================
export async function getAvailableBatches(productId: string) {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("product_batches")
      .select(`
        id,
        batch_number,
        expiry_date,
        quantity,
        cost_price,
        created_at,
        updated_at
      `)
      .eq("product_id", productId)
      .gt("quantity", 0)
      .gte("expiry_date", today)
      .order("expiry_date", { ascending: true }) // FEFO: hạn gần nhất lên trước
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("getAvailableBatches error:", error);
    return { success: false, data: [], message: error.message };
  }
}

// ==========================================
// 3. TẠO HÓA ĐƠN BÁN HÀNG
// ==========================================
export async function createSaleAction(data: {
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    unit_name: string;
    conversion_factor: number;
    product_unit_id?: string | null;
    selected_batches: Array<{
      batch_id: string;
      batch_number: string;
      quantity_to_deduct: number;
    }>;
  }>;
}) {
  try {
    const supabase = await createClient();

    // Tạo mã hóa đơn: HD + timestamp + random
    const saleCode = `HD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;

    // 1. Tạo hóa đơn
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([{
        sale_code: saleCode,
        sale_date: new Date().toISOString().split('T')[0],
        customer_name: data.customerName || null,
        customer_phone: data.customerPhone || null,
        total_amount: data.totalAmount,
        discount: data.discount,
        final_amount: data.finalAmount,
        payment_method: data.paymentMethod,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (saleError) {
      console.error("Sale error:", saleError);
      throw new Error("Không thể tạo hóa đơn");
    }

    // 2. Tạo chi tiết hóa đơn và cập nhật kho
    for (const item of data.items) {
      const quantityInBase = item.quantity * item.conversion_factor;

      // Lưu chi tiết hóa đơn (chỉ lấy batch đầu tiên vì 1 item chỉ bán từ 1 lô)
      const batchId = item.selected_batches[0]?.batch_id || null;
      
      const { error: itemError } = await supabase
        .from("sale_items")
        .insert([{
          sale_id: sale.id,
          product_id: item.product_id,
          batch_id: batchId,
          product_unit_id: item.product_unit_id || null,
          quantity: item.quantity,
          quantity_in_base: quantityInBase,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          created_at: new Date().toISOString(),
        }]);

      if (itemError) {
        console.error("Sale item error:", itemError);
        throw new Error(`Lỗi khi lưu chi tiết hóa đơn cho sản phẩm`);
      }

      // Cập nhật số lượng lô
      for (const batch of item.selected_batches) {
        // Kiểm tra tồn kho lô
        const { data: currentBatch } = await supabase
          .from("product_batches")
          .select("quantity")
          .eq("id", batch.batch_id)
          .single();

        if (!currentBatch || currentBatch.quantity < batch.quantity_to_deduct) {
          throw new Error(`Lô ${batch.batch_number} không đủ số lượng`);
        }

        // Trừ kho lô
        const { error: batchError } = await supabase
          .from("product_batches")
          .update({ 
            quantity: currentBatch.quantity - batch.quantity_to_deduct,
            updated_at: new Date().toISOString()
          })
          .eq("id", batch.batch_id);

        if (batchError) {
          console.error("Batch update error:", batchError);
          throw new Error(`Lỗi khi cập nhật lô ${batch.batch_number}`);
        }
      }
    }

    // 3. Cập nhật inventory_snapshot sẽ được trigger tự động xử lý
    // Trigger trg_after_sale_item đã được tạo trong database

    revalidatePath("/pos");
    revalidatePath("/sales");
    
    return { 
      success: true, 
      saleCode: sale.sale_code,
      saleId: sale.id,
      message: "Thanh toán thành công!" 
    };
  } catch (error: any) {
    console.error("createSaleAction error:", error);
    return { success: false, message: error.message || "Lỗi khi thanh toán" };
  }
}

// ==========================================
// 4. LẤY DANH SÁCH HÓA ĐƠN
// ==========================================
export async function getSalesAction(page: number = 1, limit: number = 20) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("sales")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
}

// ==========================================
// 5. LẤY CHI TIẾT HÓA ĐƠN
// ==========================================
export async function getSaleDetailAction(saleId: string) {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(`
        *,
        items:sale_items(
          id,
          quantity,
          quantity_in_base,
          unit_price,
          total_price,
          created_at,
          product:product_id(
            id,
            name,
            base_unit
          ),
          batch:batch_id(
            id,
            batch_number,
            expiry_date
          ),
          unit:product_unit_id(
            id,
            unit_name,
            conversion_factor
          )
        )
      `)
      .eq("id", saleId)
      .single();

    if (saleError) throw saleError;

    // Format lại dữ liệu
    const formattedItems = (sale.items || []).map((item: any) => ({
      id: item.id,
      product_name: item.product?.name || "N/A",
      base_unit: item.product?.base_unit || "",
      quantity: item.quantity,
      quantity_in_base: item.quantity_in_base,
      unit_price: item.unit_price,
      total_price: item.total_price,
      batch_number: item.batch?.batch_number,
      expiry_date: item.batch?.expiry_date,
      unit_name: item.unit?.unit_name,
      conversion_factor: item.unit?.conversion_factor,
    }));

    return {
      success: true,
      data: {
        ...sale,
        items: formattedItems,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}