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
// export async function getProducts(
//   filters?: ProductFilters,
//   page: number = 1,
//   pageSize: number = 10
// ) {
//   try {
//     const supabase = await createClient();
//     const from = (page - 1) * pageSize;
//     const to = from + pageSize - 1;

//     let query;
//     // Nếu lọc theo rpc 'get_low_stock_products', hãy đảm bảo hàm này cũng tuân thủ RLS trong DB
//     if (filters?.low_stock === true) {
//       query = supabase.rpc("get_low_stock_products", {}, { count: "exact" });
//     } else {
//       query = supabase.from("products").select("*", { count: "exact" });
//     }

//     if (filters?.search?.trim()) {
//       const s = `%${filters.search}%`;
//       query = query.or(`name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`);
//     }

//     if (filters?.category?.trim()) {
//       query = query.eq("category", filters.category);
//     }

//     if (filters?.is_active !== undefined) {
//       query = query.eq("is_active", filters.is_active);
//     }

//     // Xử lý giá
//     if (filters?.min_price) {
//       const minVal = typeof filters.min_price === "string" ? parseFloat(filters.min_price) : filters.min_price;
//       if (!isNaN(minVal)) query = query.gte("sale_price", minVal);
//     }

//     if (filters?.max_price) {
//       const maxVal = typeof filters.max_price === "string" ? parseFloat(filters.max_price) : filters.max_price;
//       if (!isNaN(maxVal)) query = query.lte("sale_price", maxVal);
//     }

//     const { data: productsData, error, count } = await query
//       .range(from, to)
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     const products = (productsData as Product[]) || [];
//     const productIds = products.map((p: Product) => p.id);

//     let batches: any[] = [];
//     if (productIds.length > 0) {
//       const { data: batchData } = await supabase
//         .from("product_batches")
//         .select("*")
//         .in("product_id", productIds);
//       batches = batchData || [];
//     }

//     const finalData = products.map((p: Product) => ({
//       ...p,
//       product_batches: batches.filter((b: any) => b.product_id === p.id),
//     }));

//     return { products: finalData, totalCount: count || 0 };
//   } catch (error: any) {
//     console.error("Error in getProducts:", error.message);
//     return { products: [], totalCount: 0 };
//   }
// }
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
    if (filters?.low_stock === true) {
      query = supabase.rpc("get_low_stock_products", {}, { count: "exact" });
    } else {
      // Giữ nguyên select("*") để không phá vỡ cấu trúc Product type cũ
      query = supabase.from("products").select("*", { count: "exact" });
    }

    // ... (Giữ nguyên các đoạn lọc search, category, is_active, price như cũ của bạn)
    if (filters?.search?.trim()) {
      const s = `%${filters.search}%`;
      query = query.or(`name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`);
    }
    if (filters?.category?.trim()) query = query.eq("category", filters.category);
    if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
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

    // --- ĐOẠN THÊM MỚI ĐỂ LẤY ĐƠN VỊ QUY ĐỔI ---
    let batches: any[] = [];
    let units: any[] = []; // Khai báo thêm mảng chứa đơn vị

    if (productIds.length > 0) {
      // 1. Lấy Lô hàng (Code cũ của bạn)
      const { data: batchData } = await supabase
        .from("product_batches")
        .select("*")
        .in("product_id", productIds);
      batches = batchData || [];

      // 2. Lấy Đơn vị quy đổi (Mới thêm vào)
      const { data: unitData } = await supabase
        .from("product_units")
        .select("*")
        .in("product_id", productIds);
      units = unitData || [];
    }

    // --- GHÉP DỮ LIỆU VÀO FINAL DATA ---
    const finalData = products.map((p: Product) => ({
      ...p,
      product_batches: batches.filter((b: any) => b.product_id === p.id),
      units: units.filter((u: any) => u.product_id === p.id), // Thêm mảng units vào từng sản phẩm
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
// export async function getProductById(id: string) {
//   try {
//     const supabase = await createClient();
//     const { data: product, error: pError } = await supabase
//       .from("products")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (pError || !product) return null;

//     const { data: batches } = await supabase
//       .from("product_batches")
//       .select("*")
//       .eq("product_id", id)
//       .order("expiry_date", { ascending: true });

//     return { ...product, product_batches: batches || [] };
//   } catch (error: any) {
//     console.error("getProductById error:", error.message);
//     return null;
//   }
// }
export async function getProductById(id: string) {
  try {
    const supabase = await createClient();

    // Sử dụng dấu ngoặc nhọn để lấy dữ liệu từ các bảng quan hệ
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        units:product_units(*),
        product_batches(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error.message);
      return null;
    }

    // Sắp xếp lô hàng theo hạn sử dụng ngay tại đây nếu cần
    if (product?.product_batches) {
      product.product_batches.sort((a: any, b: any) => 
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
    }

    return product;
  } catch (error: any) {
    console.error("getProductById error:", error.message);
    return null;
  }
}
/**
 * 4. THÊM MỚI SẢN PHẨM
 */
// export async function createProduct(formData: ProductFormData) {
//   try {
//     const supabase = await createClient();
//     const { current_stock, ...insertData } = formData as any;

//     const { data: product, error: pError } = await supabase
//       .from("products")
//       .insert([{
//           ...insertData,
//           current_stock: 0,
//           barcode: insertData.barcode || null,
//           cost_price: Number(insertData.cost_price) || 0,
//           sale_price: Number(insertData.sale_price) || 0,
//           is_active: insertData.is_active ?? true,
//       }])
//       .select().single();

//     if (pError) throw pError;

//     // Snapshot tồn kho ban đầu
//     await supabase.from("inventory_snapshot").insert([{ product_id: product.id, quantity: 0 }]);

//     revalidatePath("/products");
//     return { success: true, data: product };
//   } catch (error: any) {
//     return { success: false, message: error.message };
//   }
// }

/**
 * 4. THÊM MỚI SẢN PHẨM (ĐÃ CẬP NHẬT ĐA ĐƠN VỊ)
 */
export async function createProduct(formData: any) {
  try {
    const supabase = await createClient();
    
    // Tách units ra khỏi dữ liệu sản phẩm chính
    const { units, current_stock, ...insertData } = formData;

    // 1. CHÈN VÀO BẢNG PRODUCTS
    // Lưu ý: unit ở bảng products sẽ đóng vai trò là "Đơn vị cơ bản" hiển thị mặc định
    const { data: product, error: pError } = await supabase
      .from("products")
      .insert([{
          ...insertData,
          current_stock: 0, // Luôn khởi tạo bằng 0
          barcode: insertData.barcode || null,
          cost_price: Number(insertData.cost_price) || 0,
          sale_price: Number(insertData.sale_price) || 0, // Giá của đơn vị cơ bản
          is_active: insertData.is_active ?? true,
          manage_by_batch: insertData.manage_by_batch ?? true,
      }])
      .select().single();

    if (pError) throw pError;

    // 2. CHÈN DANH SÁCH ĐƠN VỊ VÀO BẢNG PRODUCT_UNITS
    if (units && units.length > 0) {
      const unitsToInsert = units.map((u: any) => ({
        product_id: product.id,
        unit_name: u.unit_name,
        conversion_factor: Number(u.conversion_factor) || 1,
        sale_price: Number(u.sale_price) || 0,
        is_base_unit: u.is_base_unit || false
      }));

      const { error: uError } = await supabase
        .from("product_units")
        .insert(unitsToInsert);

      if (uError) {
        // Nếu lỗi chèn unit, xóa product vừa tạo để tránh rác dữ liệu (Transaction giả lập)
        await supabase.from("products").delete().eq("id", product.id);
        throw uError;
      }
    }

    // 3. KHỞI TẠO SNAPSHOT TỒN KHO
    await supabase.from("inventory_snapshot").insert([{ 
      product_id: product.id, 
      quantity: 0 
    }]);

    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("createProduct error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 5. CẬP NHẬT THÔNG TIN SẢN PHẨM
 */
// export async function updateProduct(id: string, formData: Partial<Product>) {
//   try {
//     const supabase = await createClient();
//     const {
//       id: _id,
//       current_stock,
//       internal_code,
//       created_at,
//       updated_at,
//       product_batches,
//       ...cleanData
//     } = formData as any;

//     const { data, error } = await supabase
//       .from("products")
//       .update({
//         ...cleanData,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select().single();

//     if (error) throw error;

//     revalidatePath("/products");
//     return { success: true, data };
//   } catch (error: any) {
//     return { success: false, message: error.message };
//   }
// }
export async function updateProduct(id: string, formData: Partial<Product>) {
  try {
    const supabase = await createClient();
    
    // 1. Tách mảng units ra khỏi dữ liệu sản phẩm chính
    const {
      id: _id,
      current_stock,
      internal_code, // Không cho sửa mã nội bộ để tránh sai lệch thẻ kho
      created_at,
      updated_at,
      product_batches,
      units, // Mảng các đơn vị quy đổi (Vỉ, Hộp...)
      ...cleanData
    } = formData as any;

    // 2. Thực hiện cập nhật bảng products chính
    const { data: updatedProduct, error: productError } = await supabase
      .from("products")
      .update({
        ...cleanData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (productError) throw productError;

    // 3. Xử lý ĐƠN VỊ TÍNH QUY ĐỔI (Nghiệp vụ quan trọng)
    // Cách an toàn nhất: Xóa các quy đổi cũ và chèn lại bộ quy đổi mới từ Form
    if (units) {
      // Xóa hết đơn vị cũ của sản phẩm này
      const { error: deleteError } = await supabase
        .from("product_units")
        .delete()
        .eq("product_id", id);

      if (deleteError) throw deleteError;

      // Nếu có danh sách đơn vị mới thì chèn vào
      if (units.length > 0) {
        const unitsToInsert = units.map((u: any) => ({
          product_id: id,
          unit_name: u.unit_name,
          conversion_factor: u.conversion_factor,
          sale_price: u.sale_price,
          is_base_unit: false // Các đơn vị trong mảng này luôn là đơn vị phụ
        }));

        const { error: insertUnitsError } = await supabase
          .from("product_units")
          .insert(unitsToInsert);

        if (insertUnitsError) throw insertUnitsError;
      }
    }

    // 4. Làm mới dữ liệu cache
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    
    return { success: true, data: updatedProduct };
  } catch (error: any) {
    console.error("Update Product Error:", error);
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