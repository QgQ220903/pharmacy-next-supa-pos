"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * 1. Lấy lịch sử biến động kho
 */
export async function getInventoryHistoryAction() {
  try {
    const { data, error } = await supabaseAdmin.rpc("get_inventory_history");
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 2. Lấy danh sách lô hàng của sản phẩm (FEFO)
 */
export async function getProductBatchesAction(productId: string) {
  try {
    const { data, error } = await supabaseAdmin
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
 * 3. Lấy chi tiết một đơn nhập hàng (kèm danh sách sản phẩm)
 */
export async function getStockEntryDetailAction(entryId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("stock_entries")
      .select(
        `
        *,
        items:stock_entry_items(
          *,
          products(name, unit, internal_code)
        )
      `
      )
      .eq("id", entryId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 4. Hủy đơn nhập hàng (cancelStockEntryAction)
 * Logic: Trừ lại kho đã nhập, xóa/giảm số lượng lô đã tạo, cập nhật trạng thái đơn
 */
export async function cancelStockEntryAction(entryId: string) {
  try {
    // 1. Lấy thông tin chi tiết đơn nhập để biết cần trừ bao nhiêu
    const { data: entry, error: fetchError } = await supabaseAdmin
      .from("stock_entries")
      .select("*, items:stock_entry_items(*)")
      .eq("id", entryId)
      .single();

    if (fetchError) throw fetchError;
    if (entry.status === "cancelled")
      throw new Error("Đơn này đã được hủy trước đó.");

    // 2. Duyệt qua từng sản phẩm trong đơn để hoàn kho
    for (const item of entry.items) {
      // A. Trừ kho tổng qua RPC (Dùng dấu dương để trừ vì hàm RPC của bạn dùng p_quantity_change)
      // Lưu ý: p_quantity_change: -item.quantity để giảm kho
      await supabaseAdmin.rpc("update_inventory_quantity", {
        p_product_id: item.product_id,
        p_quantity_change: -item.quantity,
        p_transaction_type: "adjustment",
        p_notes: `Hủy đơn nhập hàng: ${entry.entry_code}`,
      });

      // B. Nếu có số lô, cần trừ số lượng trong bảng product_batches
      if (item.batch_number) {
        // Tìm lô tương ứng dựa trên product_id và batch_number
        const { data: batch } = await supabaseAdmin
          .from("product_batches")
          .select("id, quantity")
          .eq("product_id", item.product_id)
          .eq("batch_number", item.batch_number)
          .single();

        if (batch) {
          const newBatchQty = Math.max(0, batch.quantity - item.quantity);
          await supabaseAdmin
            .from("product_batches")
            .update({ quantity: newBatchQty })
            .eq("id", batch.id);
        }
      }
    }

    // 3. Cập nhật trạng thái đơn nhập thành 'cancelled'
    const { error: updateError } = await supabaseAdmin
      .from("stock_entries")
      .update({ status: "cancelled" })
      .eq("id", entryId);

    if (updateError) throw updateError;

    revalidatePath("/inventory");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Cancel Entry Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * 5. Điều chỉnh kho thủ công
 */
export async function adjustStockAction(data: {
  productId: string;
  batchId?: string;
  adjustmentQty: number;
  reason: string;
}) {
  try {
    const { error } = await supabaseAdmin.rpc("update_inventory_quantity", {
      p_product_id: data.productId,
      p_quantity_change: data.adjustmentQty,
      p_transaction_type: "adjustment",
      p_notes: `Kiểm kho: ${data.reason}`,
    });

    if (error) throw error;

    if (data.batchId) {
      const { data: b } = await supabaseAdmin
        .from("product_batches")
        .select("quantity")
        .eq("id", data.batchId)
        .single();
      await supabaseAdmin
        .from("product_batches")
        .update({ quantity: (b?.quantity || 0) + data.adjustmentQty })
        .eq("id", data.batchId);
    }

    revalidatePath("/inventory/history");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 6. Tạo đơn nhập hàng mới (createStockEntryAction)
 * Logic: Tạo đơn nhập -> Tạo chi tiết đơn -> Tạo/Cập nhật Lô hàng -> Cập nhật tồn kho tổng
 */
export async function createStockEntryAction(data: {
  entry_code: string;
  entry_date: string;
  supplier: string;
  notes: string;
  total_amount: number;
  items: any[]; // Danh sách các sản phẩm nhập
}) {
  try {
    // 1. Chèn dữ liệu vào bảng stock_entries
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("stock_entries")
      .insert([
        {
          entry_code: data.entry_code || `PN${Date.now().toString().slice(-8)}`,
          entry_date: data.entry_date,
          supplier: data.supplier,
          notes: data.notes,
          total_amount: data.total_amount,
          status: "completed", // Tự động hoàn thành khi nhập
        },
      ])
      .select()
      .single();

    if (entryError) throw entryError;

    // 2. Xử lý từng sản phẩm trong đơn nhập
    for (const item of data.items) {
      // A. Lưu vào bảng stock_entry_items
      const { error: itemError } = await supabaseAdmin
        .from("stock_entry_items")
        .insert({
          stock_entry_id: entry.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date,
          manufacturer: item.manufacturer,
          registration_number: item.registration_number,
        });
      if (itemError) throw itemError;

      // B. Xử lý Lô hàng (product_batches)
      // Nếu có số lô và hạn dùng, chúng ta cập nhật hoặc tạo mới lô đó
      if (item.batch_number && item.expiry_date) {
        // Kiểm tra xem lô này đã tồn tại cho sản phẩm này chưa
        const { data: existingBatch } = await supabaseAdmin
          .from("product_batches")
          .select("id, quantity")
          .eq("product_id", item.product_id)
          .eq("batch_number", item.batch_number)
          .maybeSingle();

        if (existingBatch) {
          // Cập nhật số lượng nếu lô đã tồn tại
          await supabaseAdmin
            .from("product_batches")
            .update({
              quantity: existingBatch.quantity + item.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingBatch.id);
        } else {
          // Tạo mới lô nếu chưa có
          await supabaseAdmin.from("product_batches").insert({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: item.expiry_date,
            quantity: item.quantity,
          });
        }
      }

      // C. Cập nhật tồn kho tổng và ghi log qua RPC update_inventory_quantity
      const { error: rpcError } = await supabaseAdmin.rpc(
        "update_inventory_quantity",
        {
          p_product_id: item.product_id,
          p_quantity_change: item.quantity,
          p_transaction_type: "purchase",
          p_reference_id: entry.id,
          p_notes: `Nhập hàng từ đơn: ${entry.entry_code}${
            item.batch_number ? " - Lô: " + item.batch_number : ""
          }`,
        }
      );
      if (rpcError) throw rpcError;
    }

    revalidatePath("/inventory");
    revalidatePath("/products");
    return { success: true, entryCode: entry.entry_code };
  } catch (error: any) {
    console.error("Create Stock Entry Error:", error);
    return { success: false, message: error.message };
  }
}
