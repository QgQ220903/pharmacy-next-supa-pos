"use server";

import { createClient } from "@/utils/supabase/server"; // Đổi từ supabaseAdmin sang createClient chuẩn
import { revalidatePath } from "next/cache";

/**
 * 1. Lấy lịch sử biến động kho (Có tìm kiếm và phân trang)
 */
export async function getInventoryHistoryAction(params: {
  page?: number;
  limit?: number;
  productId?: string;
  productQuery?: string;
  fromDate?: string;
  toDate?: string;
}) {
  try {
    const supabase = await createClient(); // Áp dụng RLS dựa trên Email đăng nhập
    const {
      page = 1,
      limit = 10,
      productId,
      productQuery,
      fromDate,
      toDate,
    } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("inventory_transactions").select(
      `
        *,
        products!inner (name, internal_code, unit)
      `,
      { count: "exact" }
    );

    // Lọc theo từ khóa tìm kiếm (Tên hoặc Mã) thông qua bảng liên kết
    if (productQuery) {
      query = query.or(
        `name.ilike.%${productQuery}%,internal_code.ilike.%${productQuery}%`,
        { foreignTable: "products" }
      );
    }

    if (productId) query = query.eq("product_id", productId);
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error: any) {
    console.error("Inventory History Error:", error.message);
    return { success: false, data: [], totalPages: 1 };
  }
}

/**
 * 2. Lấy danh sách lô hàng của sản phẩm (FEFO - Hạn gần hết trước)
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
    return { success: false, message: error.message };
  }
}

/**
 * 3. Lấy chi tiết đơn nhập hàng
 */
export async function getStockEntryDetailAction(entryId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stock_entries")
      .select(`
        *,
        items:stock_entry_items(
          *,
          products(name, unit, internal_code)
        )
      `)
      .eq("id", entryId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 4. Hủy đơn nhập hàng
 */
export async function cancelStockEntryAction(entryId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Lấy thông tin đơn
    const { data: entry, error: fetchError } = await supabase
      .from("stock_entries")
      .select("*, items:stock_entry_items(*)")
      .eq("id", entryId)
      .single();

    if (fetchError) throw fetchError;
    if (entry.status === "cancelled") throw new Error("Đơn này đã được hủy trước đó.");

    // 2. Hoàn kho cho từng item
    for (const item of entry.items) {
      // Trừ kho tổng qua RPC
      await supabase.rpc("update_inventory_quantity", {
        p_product_id: item.product_id,
        p_quantity_change: -Number(item.quantity),
        p_transaction_type: "adjustment",
        p_notes: `Hủy đơn nhập hàng: ${entry.entry_code}`,
      });

      // Trừ số lượng trong lô hàng
      if (item.batch_number) {
        const { data: batch } = await supabase
          .from("product_batches")
          .select("id, quantity")
          .eq("product_id", item.product_id)
          .eq("batch_number", item.batch_number)
          .maybeSingle();

        if (batch) {
          const newBatchQty = Math.max(0, Number(batch.quantity) - Number(item.quantity));
          await supabase
            .from("product_batches")
            .update({ quantity: newBatchQty })
            .eq("id", batch.id);
        }
      }
    }

    // 3. Cập nhật trạng thái
    const { error: updateError } = await supabase
      .from("stock_entries")
      .update({ status: "cancelled" })
      .eq("id", entryId);

    if (updateError) throw updateError;

    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 5. Điều chỉnh kho thủ công (Kiểm kho)
 */
export async function adjustStockAction(data: {
  productId: string;
  batchId?: string;
  adjustmentQty: number;
  reason: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("update_inventory_quantity", {
      p_product_id: data.productId,
      p_quantity_change: data.adjustmentQty,
      p_transaction_type: "adjustment",
      p_notes: `Kiểm kho: ${data.reason}`,
    });

    if (error) throw error;

    if (data.batchId) {
      const { data: b } = await supabase
        .from("product_batches")
        .select("quantity")
        .eq("id", data.batchId)
        .single();
      
      await supabase
        .from("product_batches")
        .update({ quantity: (Number(b?.quantity) || 0) + data.adjustmentQty })
        .eq("id", data.batchId);
    }

    revalidatePath("/inventory/history");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 6. Tạo đơn nhập hàng mới
 */
export async function createStockEntryAction(data: {
  entry_code: string;
  entry_date: string;
  supplier: string;
  notes: string;
  total_amount: number;
  items: any[];
}) {
  try {
    const supabase = await createClient();

    const finalEntryDate = data.entry_date || new Date().toISOString().split("T")[0];

    // 1. Chèn đơn nhập
    const { data: entry, error: entryError } = await supabase
      .from("stock_entries")
      .insert([{
          entry_code: data.entry_code || `PN${Date.now().toString().slice(-8)}`,
          entry_date: finalEntryDate,
          supplier: data.supplier || "Nhà cung cấp lẻ",
          notes: data.notes,
          total_amount: data.total_amount,
          status: "completed",
      }])
      .select().single();

    if (entryError) throw entryError;

    // 2. Xử lý từng sản phẩm
    for (const item of data.items) {
      const finalExpiryDate = item.expiry_date && item.expiry_date !== "" ? item.expiry_date : null;

      // A. stock_entry_items
      await supabase.from("stock_entry_items").insert({
        stock_entry_id: entry.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: Number(item.quantity) * Number(item.unit_price),
        batch_number: item.batch_number || null,
        expiry_date: finalExpiryDate,
      });

      // B. product_batches
      if (item.batch_number && finalExpiryDate) {
        const { data: existingBatch } = await supabase
          .from("product_batches")
          .select("id, quantity")
          .eq("product_id", item.product_id)
          .eq("batch_number", item.batch_number)
          .maybeSingle();

        if (existingBatch) {
          await supabase.from("product_batches")
            .update({ quantity: Number(existingBatch.quantity) + Number(item.quantity) })
            .eq("id", existingBatch.id);
        } else {
          await supabase.from("product_batches").insert({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: finalExpiryDate,
            quantity: item.quantity,
          });
        }
      }

      // C. Cập nhật tồn kho qua RPC
      await supabase.rpc("update_inventory_quantity", {
        p_product_id: item.product_id,
        p_quantity_change: Number(item.quantity),
        p_transaction_type: "purchase",
        p_reference_id: entry.id,
        p_notes: `Nhập hàng: ${entry.entry_code}`,
      });
    }

    revalidatePath("/inventory");
    return { success: true, entryCode: entry.entry_code };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 7. Lấy chi tiết giao dịch (Sale/Purchase)
 */
export async function getTransactionDetailAction(referenceId: string, type: string) {
  try {
    const supabase = await createClient();

    if (type === "sale") {
      const { data, error } = await supabase
        .from("sales")
        .select(`*, sale_items (*, products (name, unit))`)
        .eq("id", referenceId).maybeSingle();
      if (error) throw error;
      return { success: true, data };
    }

    if (type === "purchase") {
      const { data, error } = await supabase
        .from("stock_entries")
        .select(`*, stock_entry_items (*, products (name, unit))`)
        .eq("id", referenceId).maybeSingle();
      if (error) throw error;
      return { success: true, data };
    }

    return { success: false, message: "Loại giao dịch không hỗ trợ" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 8. Thẻ kho (Inventory Card) - Tính tồn lũy kế
 */
export async function getProductInventoryCard(productId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_transactions")
      .select("id, transaction_type, quantity_change, reference_id, notes, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    let runningBalance = 0;
    const historyWithBalance = data.map((item) => {
      runningBalance += Number(item.quantity_change);
      return { ...item, balance_after: runningBalance };
    });

    return { success: true, data: historyWithBalance.reverse() };
  } catch (error: any) {
    return { success: false, data: [] };
  }
}


/**
 * Lấy danh sách phiếu nhập kho có phân trang
 */
export async function getStockEntriesAction(params: {
  page?: number;
  limit?: number;
}) {
  try {
    const supabase = await createClient();
    const { page = 1, limit = 10 } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("stock_entries")
      .select(
        `
        *,
        items:stock_entry_items(
          id,
          quantity,
          unit_price,
          total_price,
          batch_number,
          expiry_date,
          products(name, unit)
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error: any) {
    console.error("Get Stock Entries Error:", error.message);
    return { success: false, data: [], totalCount: 0, totalPages: 1 };
  }
}