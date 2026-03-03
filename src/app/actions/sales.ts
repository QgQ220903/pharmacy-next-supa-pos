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

    // Log dữ liệu đầu vào để debug
    console.log("=== CREATE SALE DATA ===");
    console.log("Customer:", data.customerName, data.customerPhone);
    console.log("Payment:", data.paymentMethod);
    console.log("Amounts:", { total: data.totalAmount, discount: data.discount, final: data.finalAmount });
    console.log("Items count:", data.items.length);
    console.log("========================");

    // Tạo mã hóa đơn: HD + timestamp + random
    const saleCode = `HD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    console.log("Sale code:", saleCode);

    // 1. Tạo hóa đơn - dùng let thay vì const
    let saleData: any = {
      sale_code: saleCode,
      sale_date: new Date().toISOString().split('T')[0],
      customer_name: data.customerName || null,
      total_amount: data.totalAmount,
      final_amount: data.finalAmount,
      payment_method: data.paymentMethod,
      created_at: new Date().toISOString(),
    };

    // Thêm các field phụ nếu có
    if (data.customerPhone) {
      saleData.customer_phone = data.customerPhone;
    }
    if (data.discount > 0) {
      saleData.discount = data.discount;
    }

    console.log("Inserting sale with data:", saleData);

    // Khai báo sale với let để có thể gán lại
    let { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([saleData])
      .select()
      .single();

    if (saleError) {
      console.error("Sale error details:", {
        message: saleError.message,
        details: saleError.details,
        hint: saleError.hint,
        code: saleError.code
      });

      // Thử insert chỉ với các field cơ bản
      console.log("Retrying with minimal fields...");
      const minimalData = {
        sale_code: saleCode,
        sale_date: new Date().toISOString().split('T')[0],
        customer_name: data.customerName || null,
        total_amount: data.totalAmount,
        final_amount: data.finalAmount,
        payment_method: data.paymentMethod,
        created_at: new Date().toISOString(),
      };

      const { data: saleRetry, error: retryError } = await supabase
        .from("sales")
        .insert([minimalData])
        .select()
        .single();

      if (retryError) {
        console.error("Retry also failed:", retryError);
        throw new Error(`Không thể tạo hóa đơn: ${saleError.message}`);
      }

      sale = saleRetry; // Gán lại giá trị mới
    }

    if (!sale) {
      throw new Error("Không thể tạo hóa đơn - không có dữ liệu trả về");
    }

    console.log("Sale created successfully:", sale.id);

    // 2. KIỂM TRA TỒN KHO TRƯỚC KHI BÁN
    for (const item of data.items) {
      for (const batch of item.selected_batches) {
        console.log(`Checking batch ${batch.batch_number}: need ${batch.quantity_to_deduct}`);

        const { data: currentBatch, error: fetchError } = await supabase
          .from("product_batches")
          .select("quantity")
          .eq("id", batch.batch_id)
          .single();

        if (fetchError) {
          console.error("Batch fetch error:", fetchError);
          throw new Error(`Không tìm thấy lô ${batch.batch_number}`);
        }

        if (!currentBatch) {
          throw new Error(`Lô ${batch.batch_number} không tồn tại`);
        }

        console.log(`Batch ${batch.batch_number} current stock: ${currentBatch.quantity}`);

        if (currentBatch.quantity < batch.quantity_to_deduct) {
          throw new Error(`Lô ${batch.batch_number} không đủ số lượng (còn: ${currentBatch.quantity}, cần: ${batch.quantity_to_deduct})`);
        }
      }
    }

    // 3. Tạo chi tiết hóa đơn
    for (const item of data.items) {
      const quantityInBase = item.quantity * item.conversion_factor;
      const batchId = item.selected_batches[0]?.batch_id || null;

      console.log(`Inserting sale item:`, {
        product_id: item.product_id,
        batch_id: batchId,
        quantity: item.quantity,
        quantity_in_base: quantityInBase,
        unit_price: item.unit_price
      });

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
        console.error("Sale item error details:", {
          message: itemError.message,
          details: itemError.details,
          hint: itemError.hint,
          code: itemError.code
        });
        throw new Error(`Lỗi khi lưu chi tiết hóa đơn: ${itemError.message}`);
      }
    }

    console.log("All items inserted successfully");

    revalidatePath("/pos");
    revalidatePath("/sales");

    return {
      success: true,
      saleCode: sale.sale_code,
      saleId: sale.id,
      message: "Thanh toán thành công!"
    };
  } catch (error: any) {
    console.error("=== CREATE SALE ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("========================");

    return {
      success: false,
      message: error.message || "Lỗi khi thanh toán"
    };
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
      product_id: item.product?.id || "",
      // Field names must match getProductName() and getProductUnit() in sales/page.tsx
      name: item.product?.name || "N/A",
      unit: item.unit?.unit_name || item.product?.base_unit || "",
      products: {
        name: item.product?.name || "N/A",
        unit: item.unit?.unit_name || item.product?.base_unit || "",
      },
      quantity: item.quantity,
      quantity_in_base: item.quantity_in_base,
      unit_price: item.unit_price,
      total_price: item.total_price,
      batch_number: item.batch?.batch_number || null,
      expiry_date: item.batch?.expiry_date || null,
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