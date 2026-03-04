"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  StockEntryFilters,
  ActionResponse,
  StockEntryDetail,
  InventoryTransaction,
  InventorySnapshot,
  Product
} from "@/types";

// ==========================================
// 1. LẤY DANH SÁCH PHIẾU NHẬP (CÓ FILTER SERVER)
// ==========================================
export async function getStockEntriesAction(params: StockEntryFilters = {}) {
  try {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 10,
      search = "",
      fromDate = "",
      toDate = ""
    } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
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
          products!inner(
            id,
            name,
            internal_code,
            base_unit,
            manage_by_batch
          )
        )
      `,
        { count: "exact" }
      );

    // Tìm kiếm theo mã phiếu hoặc nhà cung cấp
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`entry_code.ilike.${searchTerm},supplier_name.ilike.${searchTerm}`);
    }

    // Lọc theo ngày
    if (fromDate) {
      query = query.gte("entry_date", fromDate);
    }
    if (toDate) {
      query = query.lte("entry_date", toDate);
    }

    const { data, error, count } = await query
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Tính tổng tiền nếu cần
    const entriesWithDetails = (data || []).map((entry: any) => ({
      ...entry,
      total_amount: entry.total_amount || entry.items?.reduce(
        (sum: number, item: any) => sum + (item.total_price || 0), 0
      ) || 0,
      item_count: entry.items?.length || 0,
    }));

    return {
      success: true,
      data: entriesWithDetails,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error: any) {
    console.error("getStockEntriesAction error:", error);
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
// 2. LẤY CHI TIẾT PHIẾU NHẬP
// ==========================================
export async function getStockEntryDetailAction(id: string): Promise<ActionResponse<StockEntryDetail>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("stock_entries")
      .select(
        `
        *,
        items:stock_entry_items(
          *,
          products(
            id,
            name,
            internal_code,
            base_unit,
            manage_by_batch
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ...data,
        total_amount: data.total_amount || data.items?.reduce(
          (sum: number, item: any) => sum + (item.total_price || 0), 0
        ) || 0,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// 3. HÀM TẠO MÃ PHIẾU NHẬP TỰ ĐỘNG (IMP-YYYYMMDD-xxxx)
// ==========================================
async function generateEntryCode(): Promise<string> {
  const supabase = await createClient();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Lấy số thứ tự cao nhất trong ngày
  const { data, error } = await supabase
    .from("stock_entries")
    .select("entry_code")
    .like("entry_code", `IMP-${dateStr}-%`)
    .order("entry_code", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return `IMP-${dateStr}-0001`;
  }

  // Tách số thứ tự từ mã cuối cùng
  const lastCode = data[0].entry_code;
  const lastNumber = parseInt(lastCode.split('-')[2] || '0000');
  const newNumber = lastNumber + 1;

  return `IMP-${dateStr}-${newNumber.toString().padStart(4, '0')}`;
}

// ==========================================
// 7. TẠO PHIẾU NHẬP MỚI (FIXED - DÙNG TRIGGER)
// ==========================================
export async function createStockEntryAction(formData: {
  supplier_name?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    batch_number?: string | null;
    expiry_date?: string | null;
  }>;
}) {
  try {
    const supabase = await createClient();

    // Validate
    if (!formData.items || formData.items.length === 0) {
      return { success: false, message: "Phải có ít nhất một sản phẩm" };
    }

    // Validate từng item (giữ nguyên)
    for (const item of formData.items) {
      if (item.quantity <= 0) {
        return { success: false, message: "Số lượng phải lớn hơn 0" };
      }
      if (item.unit_price < 0) {
        return { success: false, message: "Giá nhập không được âm" };
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("manage_by_batch, name")
        .eq("id", item.product_id)
        .single();

      if (productError || !product) {
        return { success: false, message: "Không tìm thấy sản phẩm" };
      }

      if (product.manage_by_batch) {
        if (!item.batch_number?.trim()) {
          return {
            success: false,
            message: `Sản phẩm "${product.name}" yêu cầu nhập số lô`
          };
        }
        if (!item.expiry_date) {
          return {
            success: false,
            message: `Sản phẩm "${product.name}" yêu cầu nhập hạn dùng`
          };
        }
      }
    }

    // Tạo mã phiếu nhập tự động
    const entry_code = await generateEntryCode();
    const entry_date = new Date().toISOString().split('T')[0];

    // Tính tổng tiền
    const total_amount = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );

    // 1. Tạo phiếu nhập
    const { data: entry, error: entryError } = await supabase
      .from("stock_entries")
      .insert([{
        entry_code,
        entry_date,
        supplier_name: formData.supplier_name || null,
        notes: formData.notes || null,
        total_amount,
      }])
      .select()
      .single();

    if (entryError) {
      console.error("Entry error:", entryError);
      return { success: false, message: "Lỗi tạo phiếu nhập: " + entryError.message };
    }

    // 2. Tạo chi tiết phiếu nhập - CHỈ INSERT, trigger sẽ xử lý phần còn lại
    const itemsToInsert = formData.items.map((item) => ({
      stock_entry_id: entry.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      batch_number: item.batch_number || null,
      expiry_date: item.expiry_date || null,
    }));

    const { error: itemsError } = await supabase
      .from("stock_entry_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Items error:", itemsError);
      // Rollback: Xóa phiếu nhập vừa tạo
      await supabase.from("stock_entries").delete().eq("id", entry.id);
      return { success: false, message: "Lỗi tạo chi tiết phiếu nhập: " + itemsError.message };
    }

    // KHÔNG CẦN xử lý batch, snapshot, transaction ở đây nữa
    // Trigger đã tự động làm tất cả

    // Lấy dữ liệu để in tem (nếu cần)
    const printData = [];
    for (const item of formData.items) {
      if (item.batch_number && item.expiry_date) {
        const { data: batch } = await supabase
          .from("product_batches")
          .select("*, products(name, internal_code, sale_price)")
          .eq("product_id", item.product_id)
          .eq("batch_number", item.batch_number)
          .eq("expiry_date", item.expiry_date)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (batch) {
          printData.push(batch);
        }
      }
    }

    revalidatePath("/entries");

    return {
      success: true,
      data: entry,
      printData,
      message: "Nhập hàng thành công!"
    };

  } catch (error: any) {
    console.error("createStockEntryAction error:", error);
    return { success: false, message: error.message || "Lỗi hệ thống" };
  }
}


// Xóa hàm updateInventorySnapshot cũ hoặc comment lại

// ==========================================
// 8. XÓA PHIẾU NHẬP (CHỈ KHI CHƯA CÓ GIAO DỊCH KHÁC)
// ==========================================
export async function deleteStockEntryAction(id: string) {
  try {
    const supabase = await createClient();

    // Kiểm tra phiếu tồn tại
    const { data: entry } = await supabase
      .from("stock_entries")
      .select("entry_code, items:stock_entry_items(id, product_id, quantity, batch_number, expiry_date)")
      .eq("id", id)
      .single();

    if (!entry) {
      return { success: false, message: "Không tìm thấy phiếu nhập" };
    }

    // Kiểm tra xem có giao dịch bán hàng nào liên quan không
    // (sẽ implement sau)

    // Xóa phiếu nhập (ON DELETE CASCADE sẽ xóa items)
    const { error } = await supabase
      .from("stock_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/entries");
    return { success: true, message: "Đã xóa phiếu nhập" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}


// app/actions/inventory.ts

// ==========================================
// 9. LẤY SẢN PHẨM CHO FORM NHẬP (ĐÃ CÓ)
// ==========================================
export async function getProductsForEntry() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        internal_code,
        name,
        base_unit,
        manage_by_batch,
        sale_price,
        cost_price,
        min_stock,
        is_active,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

// ==========================================
// 10. TÌM KIẾM SẢN PHẨM NHANH (THÊM MỚI)
// ==========================================
export async function searchProductsForEntry(searchTerm: string) {
  try {
    const supabase = await createClient();

    if (!searchTerm || searchTerm.length < 2) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        internal_code,
        name,
        base_unit,
        manage_by_batch,
        sale_price,
        cost_price,
        min_stock,
        is_active,
        created_at,
        updated_at
      `)
      .or(`name.ilike.%${searchTerm}%,internal_code.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
      .eq("is_active", true)
      .limit(20);

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error: any) {
    console.error("searchProductsForEntry error:", error);
    return { success: false, data: [], message: error.message };
  }
}

// ==========================================
// 11. LẤY SẢN PHẨM PHỔ BIẾN (THÊM MỚI)
// ==========================================
export async function getPopularProducts(limit: number = 8) {
  try {
    const supabase = await createClient();

    // Lấy sản phẩm có tồn kho (từ inventory_snapshot) và có giao dịch gần đây
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        internal_code,
        name,
        base_unit,
        manage_by_batch,
        sale_price,
        cost_price,
        min_stock,
        is_active,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .order("name")
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error: any) {
    console.error("getPopularProducts error:", error);
    return { success: false, data: [], message: error.message };
  }
}

// ==========================================
// 12. LẤY LỊCH SỬ BIẾN ĐỘNG KHO (TRUNG TÂM KIỂM KÊ)
// ==========================================
export async function getInventoryTransactionsAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
} = {}) {
  try {
    const supabase = await createClient();
    const {
      page = 1,
      limit = 20,
      search = "",
      type = "all", // all, purchase, sale, adjustment
      fromDate = "",
      toDate = ""
    } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("inventory_transactions")
      .select(`
        *,
        product:products!inner(id, name, internal_code, base_unit)
      `, { count: "exact" });

    // Filter theo loại giao dịch
    if (type !== "all") {
      query = query.eq("transaction_type", type);
    }

    // Filter theo ngày
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);

    // Search theo tên sản phẩm hoặc mã (thực hiện qua join)
    if (search) {
      query = query.or(`name.ilike.%${search}%,internal_code.ilike.%${search}%`, { foreignTable: "products" });
    }

    const { data, error, count } = await query
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
    console.error("getInventoryTransactionsAction error:", error);
    return { success: false, data: [], message: error.message };
  }
}

// ==========================================
// 13. LẤY TỒN KHO TỨC THỜI CỦA TẤT CẢ SẢN PHẨM (KÈM NHẬP/XUẤT)
// ==========================================
export async function getProductsWithStockAction(params: {
  search?: string;
  page?: number;
  limit?: number;
  lowStockOnly?: boolean;
} = {}) {
  try {
    const supabase = await createClient();
    const { search = "", page = 1, limit = 20, lowStockOnly = false } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("v_products_extended")
      .select(`
        *,
        inventory_transactions(
          quantity_change,
          transaction_type
        )
      `, { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,internal_code.ilike.%${search}%`);
    }

    if (lowStockOnly) {
      query = query.eq("is_low_stock", true);
    }

    const { data, error, count } = await query
      .order("name", { ascending: true })
      .range(from, to);

    if (error) throw error;

    // Tính toán total_in và total_out cho mỗi sản phẩm
    const enrichedData = (data || []).map((p: any) => {
      const transactions = p.inventory_transactions || [];
      const total_in = transactions
        .filter((t: any) => t.quantity_change > 0)
        .reduce((sum: number, t: any) => sum + t.quantity_change, 0);

      const total_out = transactions
        .filter((t: any) => t.quantity_change < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(t.quantity_change), 0);

      const { inventory_transactions, ...productData } = p;
      return {
        ...productData,
        total_in,
        total_out
      };
    });

    return {
      success: true,
      data: enrichedData,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error: any) {
    console.error("getProductsWithStockAction error:", error);
    return { success: false, data: [], message: error.message };
  }
}

// ==========================================
// 14. ĐIỀU CHỈNH KHO THỦ CÔNG (KIỂM KÊ)
// ==========================================
export async function adjustInventoryAction(data: {
  productId: string;
  quantityChange: number;
  reason: string;
  batchId?: string;
  isAbsolute?: boolean;
}) {
  try {
    const supabase = await createClient();

    // 1. Cập nhật snapshot
    const { data: snapshot } = await supabase
      .from("inventory_snapshot")
      .select("quantity")
      .eq("product_id", data.productId)
      .single();

    const currentQty = snapshot?.quantity || 0;

    // Tính toán lượng thay đổi thực tế
    let delta = data.quantityChange;
    if (data.isAbsolute) {
      delta = data.quantityChange - currentQty;
    }

    if (delta === 0) {
      return { success: true, message: "Không có thay đổi số lượng" };
    }

    const newQty = currentQty + delta;

    await supabase
      .from("inventory_snapshot")
      .upsert({ product_id: data.productId, quantity: newQty, last_updated: new Date().toISOString() });

    // 2. Nếu có batchId, cập nhật batch
    if (data.batchId) {
      const { data: batch } = await supabase
        .from("product_batches")
        .select("quantity")
        .eq("id", data.batchId)
        .single();

      const newBatchQty = (batch?.quantity || 0) + delta;

      await supabase
        .from("product_batches")
        .update({ quantity: newBatchQty, updated_at: new Date().toISOString() })
        .eq("id", data.batchId);
    }

    // 3. Ghi nhật ký biến động
    const { error: transError } = await supabase
      .from("inventory_transactions")
      .insert([{
        product_id: data.productId,
        transaction_type: 'adjustment',
        quantity_change: delta,
        reference_id: null,
        created_at: new Date().toISOString()
      }]);

    if (transError) throw transError;

    revalidatePath("/inventory");
    revalidatePath("/products");

    return { success: true, message: "Điều chỉnh kho thành công" };
  } catch (error: any) {
    console.error("adjustInventoryAction error:", error);
    return { success: false, message: error.message };
  }
}