"use server";

import { createClient } from "@/utils/supabase/server";
import { Product, ProductFormData, ProductFilters } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * 1. LẤY THỐNG KÊ TỔNG QUAN (PRODUCT STATS)
 * Sử dụng createClient để RLS lọc đúng dữ liệu của người đang đăng nhập.
 */
export async function getProductStats() {
  try {
    const supabase = await createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("current_stock, min_stock, cost_price")
      .eq("is_active", true);

    if (error || !products) {
      return { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 };
    }

    return products.reduce(
      (acc, p) => {
        const stock = Number(p.current_stock) || 0;
        const minStock = Number(p.min_stock) || 0;
        const cost = Number(p.cost_price) || 0;

        acc.totalProducts++;
        if (stock <= minStock) acc.lowStockProducts++;
        acc.totalInventoryValue += stock * cost;

        return acc;
      },
      { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 }
    );
  } catch (error: any) {
    console.error("getProductStats error:", error.message);
    return { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 };
  }
}

/**
 * 2. LẤY DANH SÁCH SẢN PHẨM PHÂN TRANG & LỌC
 */
export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query;
    // Nếu lọc theo rpc 'get_low_stock_products', hãy đảm bảo hàm này cũng tuân thủ RLS trong DB
    if (filters?.low_stock === true) {
      query = supabase.rpc("get_low_stock_products", {}, { count: "exact" });
    } else {
      query = supabase.from("products").select("*", { count: "exact" });
    }

    if (filters?.search?.trim()) {
      const s = `%${filters.search}%`;
      query = query.or(`name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`);
    }

    if (filters?.category?.trim()) {
      query = query.eq("category", filters.category);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    // Xử lý giá
    if (filters?.min_price) {
      const minVal = typeof filters.min_price === "string" ? parseFloat(filters.min_price) : filters.min_price;
      if (!isNaN(minVal)) query = query.gte("sale_price", minVal);
    }

    if (filters?.max_price) {
      const maxVal = typeof filters.max_price === "string" ? parseFloat(filters.max_price) : filters.max_price;
      if (!isNaN(maxVal)) query = query.lte("sale_price", maxVal);
    }

    const { data: productsData, error, count } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const products = (productsData as Product[]) || [];
    const productIds = products.map((p: Product) => p.id);

    let batches: any[] = [];
    if (productIds.length > 0) {
      const { data: batchData } = await supabase
        .from("product_batches")
        .select("*")
        .in("product_id", productIds);
      batches = batchData || [];
    }

    const finalData = products.map((p: Product) => ({
      ...p,
      product_batches: batches.filter((b: any) => b.product_id === p.id),
    }));

    return { products: finalData, totalCount: count || 0 };
  } catch (error: any) {
    console.error("Error in getProducts:", error.message);
    return { products: [], totalCount: 0 };
  }
}

/**
 * 3. LẤY CHI TIẾT 1 SẢN PHẨM
 */
export async function getProductById(id: string) {
  try {
    const supabase = await createClient();
    const { data: product, error: pError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (pError || !product) return null;

    const { data: batches } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", id)
      .order("expiry_date", { ascending: true });

    return { ...product, product_batches: batches || [] };
  } catch (error: any) {
    console.error("getProductById error:", error.message);
    return null;
  }
}

/**
 * 4. THÊM MỚI SẢN PHẨM
 */
export async function createProduct(formData: ProductFormData) {
  try {
    const supabase = await createClient();
    const { current_stock, ...insertData } = formData as any;

    const { data: product, error: pError } = await supabase
      .from("products")
      .insert([{
          ...insertData,
          current_stock: 0,
          barcode: insertData.barcode || null,
          cost_price: Number(insertData.cost_price) || 0,
          sale_price: Number(insertData.sale_price) || 0,
          is_active: insertData.is_active ?? true,
      }])
      .select().single();

    if (pError) throw pError;

    // Snapshot tồn kho ban đầu
    await supabase.from("inventory_snapshot").insert([{ product_id: product.id, quantity: 0 }]);

    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 5. CẬP NHẬT THÔNG TIN SẢN PHẨM
 */
export async function updateProduct(id: string, formData: Partial<Product>) {
  try {
    const supabase = await createClient();
    const {
      id: _id,
      current_stock,
      internal_code,
      created_at,
      updated_at,
      product_batches,
      ...cleanData
    } = formData as any;

    const { data, error } = await supabase
      .from("products")
      .update({
        ...cleanData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select().single();

    if (error) throw error;

    revalidatePath("/products");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 6. BẬT/TẮT TRẠNG THÁI KINH DOANH
 */
export async function toggleProductStatus(id: string, status: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ is_active: status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 7. XÓA SẢN PHẨM
 */
export async function deleteProduct(id: string) {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("inventory_transactions")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (count && count > 0) {
      throw new Error("Không thể xóa sản phẩm đã có lịch sử nhập/xuất kho.");
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * 8. LẤY DANH MỤC SẢN PHẨM
 */
export async function getProductCategories(): Promise<string[]> {
  const defaultCategories = ["Thuốc kê đơn", "Thuốc không kê đơn (OTC)", "Thực phẩm chức năng", "Vật tư y tế"];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null);

    if (error) return defaultCategories;

    const dbCategories = data.map((i) => i.category as string);
    const combined = Array.from(new Set([...defaultCategories, ...dbCategories]));
    return combined.sort((a, b) => a.localeCompare(b, "vi"));
  } catch (error) {
    return defaultCategories;
  }
}