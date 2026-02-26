"use server";

import { createClient } from "@/utils/supabase/server";
import { StockEntry, StockEntryItem, StockEntryWithItems } from "@/types";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. LẤY DANH SÁCH PHIẾU NHẬP (CÓ FILTER SERVER)
// ==========================================
export async function getStockEntriesAction(params: {
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
}) {
  try {
    const supabase = await createClient();
    const { page = 1, limit = 10, search = "", fromDate = "", toDate = "" } = params;
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
export async function getStockEntryDetailAction(id: string) {
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
// 3. TẠO PHIẾU NHẬP MỚI
// ==========================================
export async function createStockEntryAction(formData: {
  entry_code: string;
  entry_date: string;
  supplier_name?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    batch_number?: string;
    expiry_date?: string;
    product_name?: string;
    unit_name?: string;
    sale_price?: number;
  }>;
}) {
  try {
    const supabase = await createClient();

    // Validate
    if (!formData.entry_code) {
      return { success: false, message: "Mã phiếu nhập là bắt buộc" };
    }
    if (!formData.items || formData.items.length === 0) {
      return { success: false, message: "Phải có ít nhất một sản phẩm" };
    }

    // Kiểm tra mã phiếu đã tồn tại
    const { data: existing } = await supabase
      .from("stock_entries")
      .select("id")
      .eq("entry_code", formData.entry_code)
      .maybeSingle();

    if (existing) {
      return { success: false, message: "Mã phiếu nhập đã tồn tại" };
    }

    // Tính tổng tiền
    const total_amount = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );

    // 1. Tạo phiếu nhập
    const { data: entry, error: entryError } = await supabase
      .from("stock_entries")
      .insert([{
        entry_code: formData.entry_code,
        entry_date: formData.entry_date,
        supplier_name: formData.supplier_name || null,
        notes: formData.notes || null,
        total_amount,
      }])
      .select()
      .single();

    if (entryError) throw entryError;

    // 2. Tạo chi tiết phiếu nhập
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

    if (itemsError) throw itemsError;

    // Trigger sẽ tự động:
    // - Cập nhật product_batches
    // - Cập nhật inventory_snapshot
    // - Ghi inventory_transactions

    revalidatePath("/entries");
    return { success: true, data: entry };
  } catch (error: any) {
    console.error("createStockEntryAction error:", error);
    return { success: false, message: error.message };
  }
}

// ==========================================
// 4. LẤY SẢN PHẨM CHO FORM NHẬP
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
        cost_price
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
// 5. XÓA PHIẾU NHẬP (CHỈ KHI CHƯA CÓ GIAO DỊCH KHÁC)
// ==========================================
export async function deleteStockEntryAction(id: string) {
  try {
    const supabase = await createClient();

    // Kiểm tra phiếu tồn tại
    const { data: entry } = await supabase
      .from("stock_entries")
      .select("entry_code, items:stock_entry_items(id)")
      .eq("id", id)
      .single();

    if (!entry) {
      return { success: false, message: "Không tìm thấy phiếu nhập" };
    }

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