"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { Product, ProductFormData, ProductFilters } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Lấy thống kê tổng quan về sản phẩm và kho hàng
 */
export async function getProductStats() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("current_stock, min_stock, cost_price, sale_price");

    if (error || !products) {
      return { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 };
    }

    let lowStockCount = 0;
    let totalValue = 0;

    products.forEach((p) => {
      const stock = p.current_stock ?? 0;
      const minStock = p.min_stock ?? 0;

      if (stock <= minStock) {
        lowStockCount++;
      }

      // Ưu tiên giá vốn để tính giá trị kho hàng
      const price = p.cost_price || 0;
      totalValue += stock * price;
    });

    return {
      totalProducts: products.length,
      lowStockProducts: lowStockCount,
      totalInventoryValue: totalValue,
    };
  } catch (error) {
    console.error("getProductStats error:", error);
    return { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 };
  }
}

/**
 * Lấy danh sách sản phẩm kèm phân trang, bộ lọc và các lô hàng liên quan
 */
export async function getProducts(filters?: ProductFilters, page: number = 1) {
  try {
    const pageSize = 10;
    let query = supabaseAdmin.from("products").select(
      `
        *,
        product_batches (id, batch_number, expiry_date, quantity)
      `,
      { count: "exact" }
    );

    // Lọc theo tìm kiếm (Mã, Tên, Barcode)
    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`
      );
    }

    // Lọc theo danh mục
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    // Lọc theo trạng thái kinh doanh
    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      products: data as (Product & { product_batches: any[] })[],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalCount: 0 };
  }
}

/**
 * Lấy chi tiết 1 sản phẩm kèm theo danh sách các lô hàng (Batches)
 */
export async function getProductById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        product_batches (
          id,
          batch_number,
          expiry_date,
          quantity,
          updated_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error("getProductById error:", error);
    return null;
  }
}

/**
 * Thêm mới sản phẩm
 */
export async function createProduct(
  formData: ProductFormData & { manage_by_batch?: boolean }
) {
  try {
    // 1. Loại bỏ các trường không thuộc bảng products trong DB
    // Đặc biệt là loại bỏ product_batches nếu có để tránh lỗi Schema Cache
    const { product_batches, current_stock, ...insertData } = formData as any;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert([
        {
          ...insertData,
          current_stock: 0, // Sản phẩm mới luôn có kho bằng 0 (phải qua phiếu nhập)
          barcode: insertData.barcode || null,
          cost_price: insertData.cost_price || 0,
          sale_price: insertData.sale_price || 0,
          is_active: insertData.is_active ?? true,
          manage_by_batch: insertData.manage_by_batch ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 2. Khởi tạo snapshot tồn kho cho sản phẩm mới
    await supabaseAdmin
      .from("inventory_snapshot")
      .insert([{ product_id: product.id, quantity: 0 }]);

    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("createProduct error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Cập nhật thông tin sản phẩm
 */
export async function updateProduct(
  id: string,
  formData: Partial<ProductFormData>
) {
  try {
    // Loại bỏ các trường cấm cập nhật trực tiếp hoặc không thuộc bảng
    const {
      id: _id,
      current_stock,
      internal_code,
      product_batches,
      created_at,
      ...updateData
    } = formData as any;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("updateProduct error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Thay đổi trạng thái kinh doanh (Ẩn/Hiện)
 */
export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Lấy danh sách các danh mục thuốc (Unique) để dùng cho dropdown lọc
 */
export async function getProductCategories(): Promise<string[]> {
  // Danh mục hệ thống luôn có
  const defaultCategories = [
    "Thuốc kê đơn",
    "Thuốc không kê đơn (OTC)",
    "Thực phẩm chức năng",
    "Dược mỹ phẩm",
    "Vật tư y tế",
    "Hàng tiêu dùng",
  ];

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("category")
      .not("category", "is", null);

    if (error) return defaultCategories;

    // Lấy các danh mục thực tế từ DB
    const dbCategories = data?.map((i) => i.category as string) || [];

    // Gộp lại, xóa trùng sếp theo bảng chữ cái tiếng Việt
    const allCategories = Array.from(
      new Set([...defaultCategories, ...dbCategories])
    );
    return allCategories.sort((a, b) => a.localeCompare(b, "vi"));
  } catch (error) {
    return defaultCategories;
  }
}

/**
 * Xóa sản phẩm (Chỉ nên dùng nếu sản phẩm chưa có giao dịch kho)
 * Nếu đã có giao dịch, nên dùng toggleProductStatus để ẩn thay vì xóa
 */
export async function deleteProduct(id: string) {
  try {
    // Kiểm tra xem đã có lô hàng hoặc giao dịch nào chưa
    const { count } = await supabaseAdmin
      .from("inventory_transactions")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (count && count > 0) {
      throw new Error("Không thể xóa sản phẩm đã có lịch sử giao dịch kho.");
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
