"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { Product, ProductFormData, ProductFilters } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * 1. LẤY THỐNG KÊ TỔNG QUAN (PRODUCT STATS)
 * Best Practice: Sử dụng reduce để tính toán trong một vòng lặp duy nhất trên Server.
 */
export async function getProductStats() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("current_stock, min_stock, cost_price")
      .eq("is_active", true);

    if (error || !products) {
      return { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 };
    }

    return products.reduce(
      (acc, p) => {
        const stock = p.current_stock ?? 0;
        const minStock = p.min_stock ?? 0;
        const cost = p.cost_price ?? 0;

        acc.totalProducts++;
        if (stock <= minStock) acc.lowStockProducts++;
        acc.totalInventoryValue += stock * cost;

        return acc;
      },
      { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 }
    );
  } catch (error) {
    console.error("getProductStats error:", error);
    return { totalProducts: 0, lowStockProducts: 0, totalInventoryValue: 0 };
  }
}

/**
 * 2. LẤY DANH SÁCH SẢN PHẨM PHÂN TRANG & LỌC (GET PRODUCTS)
 * Best Practice: Xử lý search đa cột và filter logic 'Sắp hết hàng'.
 */
export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 1. Khởi tạo Query gốc
    let query;
    if (filters?.low_stock === true) {
      query = supabaseAdmin.rpc(
        "get_low_stock_products",
        {},
        { count: "exact" }
      );
    } else {
      query = supabaseAdmin.from("products").select("*", { count: "exact" });
    }

    // 2. Lọc Tìm kiếm
    if (filters?.search?.trim()) {
      const s = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`
      );
    }

    // 3. Lọc Danh mục
    if (filters?.category?.trim()) {
      query = query.eq("category", filters.category);
    }

    // 4. Lọc Trạng thái
    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    // 5. Lọc Giá - THÊM LOGIC PARSE TỪ STRING
    // Xử lý min_price
    if (filters?.min_price !== undefined && filters?.min_price !== null) {
      let minVal: number;

      // Nếu là string, chuyển đổi thành number
      if (typeof filters.min_price === "string") {
        minVal = parseFloat(filters.min_price);
      } else {
        minVal = filters.min_price as number;
      }

      if (!isNaN(minVal) && minVal > 0) {
        query = query.gte("sale_price", minVal);
      }
    }

    // Xử lý max_price
    if (filters?.max_price !== undefined && filters?.max_price !== null) {
      let maxVal: number;

      // Nếu là string, chuyển đổi thành number
      if (typeof filters.max_price === "string") {
        maxVal = parseFloat(filters.max_price);
      } else {
        maxVal = filters.max_price as number;
      }

      if (!isNaN(maxVal) && maxVal > 0) {
        query = query.lte("sale_price", maxVal);
      }
    }

    // 6. Thực thi Query
    const {
      data: productsData,
      error,
      count,
    } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Query Error:", error);
      throw error;
    }

    // --- Logic lấy batches giữ nguyên ---
    const products = (productsData as Product[]) || [];
    const productIds = products.map((p: Product) => p.id);

    let batches: any[] = [];
    if (productIds.length > 0) {
      const { data: batchData } = await supabaseAdmin
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
 * 3. LẤY CHI TIẾT 1 SẢN PHẨM (GET BY ID)
 */
export async function getProductById(id: string) {
  try {
    // 1. Lấy thông tin sản phẩm
    const { data: product, error: pError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (pError || !product) return null;

    // 2. Lấy danh sách lô hàng riêng biệt
    const { data: batches, error: bError } = await supabaseAdmin
      .from("product_batches")
      .select("*")
      .eq("product_id", id)
      .order("expiry_date", { ascending: true });

    // 3. Gộp dữ liệu
    return {
      ...product,
      product_batches: batches || [],
    };
  } catch (error) {
    console.error("getProductById error:", error);
    return null;
  }
}

/**
 * 4. THÊM MỚI SẢN PHẨM (CREATE PRODUCT)
 * Best Practice: Đảm bảo tạo Snapshot tồn kho đi kèm để quản lý lịch sử biến động.
 */
export async function createProduct(
  formData: ProductFormData & { manage_by_batch?: boolean }
) {
  try {
    // Sanitize: Loại bỏ các field không thuộc schema bảng products
    const { current_stock, ...insertData } = formData as any;

    const { data: product, error: pError } = await supabaseAdmin
      .from("products")
      .insert([
        {
          ...insertData,
          current_stock: 0, // Luôn khởi tạo bằng 0, tăng qua phiếu nhập kho
          barcode: insertData.barcode || null,
          cost_price: insertData.cost_price || 0,
          sale_price: insertData.sale_price || 0,
          is_active: insertData.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (pError) throw pError;

    // Khởi tạo dòng tồn kho trong bảng snapshot
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
 * 5. CẬP NHẬT THÔNG TIN SẢN PHẨM (UPDATE PRODUCT)
 */
export async function updateProduct(
  id: string,
  formData: Partial<Product & { product_batches?: any[] }>
) {
  try {
    // TRÍCH XUẤT: Chỉ lấy các trường có trong bảng 'products'
    // Loại bỏ hoàn toàn 'product_batches' và các trường ID, thời gian
    const {
      id: _id,
      current_stock,
      internal_code,
      created_at,
      updated_at,
      product_batches, // <-- QUAN TRỌNG: Tách cái này ra để không gửi vào DB
      ...cleanData
    } = formData as any;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        ...cleanData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error Detail:", error);
      throw error;
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("updateProduct error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * 6. BẬT/TẮT TRẠNG THÁI KINH DOANH (TOGGLE STATUS)
 */
// export async function toggleProductStatus(id: string, isActive: boolean) {
//   try {
//     const { error } = await supabaseAdmin
//       .from("products")
//       .update({ is_active: isActive, updated_at: new Date().toISOString() })
//       .eq("id", id);

//     if (error) throw error;

//     revalidatePath("/products");
//     return { success: true };
//   } catch (error: any) {
//     return { success: false, message: error.message };
//   }
// }
// app/actions/products.ts - THÊM HÀM NÀY
export async function toggleProductStatus(id: string, status: boolean) {
  console.log("toggleProductStatus called with:", { id, status });

  try {
    // Thực hiện cập nhật đơn giản
    const { error } = await supabaseAdmin
      .from("products")
      .update({
        is_active: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, message: error.message };
    }

    console.log("Update successful, revalidating...");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("toggleProductStatus error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * 7. XÓA SẢN PHẨM (DELETE PRODUCT)
 * Best Practice: Chặn xóa nếu đã có giao dịch kho để bảo vệ báo cáo tài chính.
 */
export async function deleteProduct(id: string) {
  try {
    const { count } = await supabaseAdmin
      .from("inventory_transactions")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (count && count > 0) {
      throw new Error(
        "Không thể xóa sản phẩm đã phát sinh giao dịch nhập/xuất."
      );
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

/**
 * 8. LẤY DANH MỤC SẢN PHẨM (GET CATEGORIES)
 * Logic: Gộp danh mục mặc định và danh mục thực tế từ DB.
 */
export async function getProductCategories(): Promise<string[]> {
  const defaultCategories = [
    "Thuốc kê đơn",
    "Thuốc không kê đơn (OTC)",
    "Thực phẩm chức năng",
    "Vật tư y tế",
  ];
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("category")
      .not("category", "is", null);

    if (error) return defaultCategories;

    const dbCategories = data.map((i) => i.category as string);
    const combined = Array.from(
      new Set([...defaultCategories, ...dbCategories])
    );

    return combined.sort((a, b) => a.localeCompare(b, "vi"));
  } catch (error) {
    return defaultCategories;
  }
}
