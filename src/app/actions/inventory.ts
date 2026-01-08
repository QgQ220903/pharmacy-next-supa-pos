"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// Thêm tham số productQuery vào hàm
export async function getInventoryHistoryAction(params: {
  page?: number;
  limit?: number;
  productId?: string;
  productQuery?: string; // Thêm dòng này
  fromDate?: string;
  toDate?: string;
}) {
  try {
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

    let query = supabaseAdmin.from("inventory_transactions").select(
      `
        *,
        products!inner (name, internal_code, unit)
      `,
      { count: "exact" }
    );

    // Lọc theo từ khóa tìm kiếm (Tên hoặc Mã)
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
  } catch (error) {
    console.error(error);
    return { success: false, data: [], totalPages: 1 };
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
  items: any[];
}) {
  try {
    const supabase = await supabaseAdmin;

    // 1. Xử lý entry_date: Nếu trống thì lấy ngày hiện tại (YYYY-MM-DD)
    // Tránh lỗi "invalid input syntax for type date: """
    const finalEntryDate =
      data.entry_date && data.entry_date !== ""
        ? data.entry_date
        : new Date().toISOString().split("T")[0];

    // 2. Chèn dữ liệu vào bảng stock_entries
    const { data: entry, error: entryError } = await supabase
      .from("stock_entries")
      .insert([
        {
          entry_code: data.entry_code || `PN${Date.now().toString().slice(-8)}`,
          entry_date: finalEntryDate,
          supplier: data.supplier || "Nhà cung cấp lẻ",
          notes: data.notes,
          total_amount: data.total_amount,
          status: "completed",
        },
      ])
      .select()
      .single();

    if (entryError) throw entryError;

    // 3. Duyệt qua từng sản phẩm trong danh sách items
    for (const item of data.items) {
      // Xử lý hạn sử dụng: Nếu trống thì để null, không để chuỗi rỗng
      const finalExpiryDate =
        item.expiry_date && item.expiry_date !== "" ? item.expiry_date : null;

      // A. Lưu vào bảng chi tiết phiếu nhập (stock_entry_items)
      const { error: itemError } = await supabase
        .from("stock_entry_items")
        .insert({
          stock_entry_id: entry.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: Number(item.quantity) * Number(item.unit_price),
          batch_number: item.batch_number || null,
          expiry_date: finalExpiryDate,
          manufacturer: item.manufacturer || null,
          registration_number: item.registration_number || null,
        });

      if (itemError) throw itemError;

      // B. Xử lý Lô hàng (product_batches)
      // Chỉ tạo/cập nhật lô nếu có đầy đủ số lô và hạn dùng hợp lệ
      if (item.batch_number && finalExpiryDate) {
        const { data: existingBatch, error: batchCheckError } = await supabase
          .from("product_batches")
          .select("id, quantity")
          .eq("product_id", item.product_id)
          .eq("batch_number", item.batch_number)
          .maybeSingle();

        if (batchCheckError) throw batchCheckError;

        if (existingBatch) {
          // Cập nhật số lượng cho lô đã có
          await supabase
            .from("product_batches")
            .update({
              quantity: Number(existingBatch.quantity) + Number(item.quantity),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingBatch.id);
        } else {
          // Tạo mới lô hàng
          await supabase.from("product_batches").insert({
            product_id: item.product_id,
            batch_number: item.batch_number,
            expiry_date: finalExpiryDate,
            quantity: item.quantity,
          });
        }
      }

      // C. Cập nhật tồn kho tổng và Ghi log biến động (RPC)
      const { error: rpcError } = await supabase.rpc(
        "update_inventory_quantity",
        {
          p_product_id: item.product_id,
          p_quantity_change: Number(item.quantity),
          p_transaction_type: "purchase",
          p_reference_id: entry.id,
          p_notes: `Nhập hàng: ${entry.entry_code}${
            item.batch_number ? " (Lô: " + item.batch_number + ")" : ""
          }`,
        }
      );

      if (rpcError) throw rpcError;
    }

    // Làm mới cache để cập nhật giao diện
    revalidatePath("/inventory");
    revalidatePath("/entries");
    revalidatePath("/inventory/history");
    revalidatePath("/products");

    return { success: true, entryCode: entry.entry_code };
  } catch (error: any) {
    console.error("Lỗi hệ thống khi tạo phiếu nhập:", error);
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi không xác định",
    };
  }
}

export async function getTransactionDetailAction(
  referenceId: string,
  type: string
) {
  try {
    // Sử dụng client admin hoặc client thông thường của bạn
    const supabase = supabaseAdmin;

    if (type === "sale") {
      const { data, error } = await supabase
        .from("sales")
        // Lấy các cột đúng theo Schema: sale_code, customer_name, total_amount...
        .select(
          `
          *,
          sale_items (
            *,
            products (name, unit)
          )
        `
        )
        .eq("id", referenceId)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    }

    if (type === "purchase") {
      const { data, error } = await supabase
        .from("stock_entries")
        // Schema của bạn dùng cột 'supplier' (không có s) và 'entry_code'
        .select(
          `
          *,
          stock_entry_items (
            *,
            products (name, unit)
          )
        `
        )
        .eq("id", referenceId)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    }

    return { success: false, message: "Loại giao dịch không hỗ trợ chi tiết" };
  } catch (error: any) {
    console.error("Lỗi chi tiết kho:", error);
    return { success: false, message: error.message };
  }
}

// app/actions/inventory.ts

export async function getProductInventoryCard(productId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("inventory_transactions")
      .select(
        `
        id,
        transaction_type,
        quantity_change,
        reference_id,
        notes,
        created_at
      `
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: true }); // Sắp xếp cũ trước mới sau để tính tồn lũy kế

    if (error) throw error;

    // Tính toán số dư lũy kế (Running Balance)
    let runningBalance = 0;
    const historyWithBalance = data.map((item) => {
      runningBalance += item.quantity_change;
      return {
        ...item,
        balance_after: runningBalance,
      };
    });

    // Trả về danh sách đã đảo ngược (mới nhất lên đầu) để hiển thị bảng
    return {
      success: true,
      data: historyWithBalance.reverse(),
    };
  } catch (error: any) {
    console.error("Error fetching product inventory card:", error);
    return { success: false, data: [] };
  }
}
