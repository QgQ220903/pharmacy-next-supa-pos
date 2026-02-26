"use server";

import { createClient } from "@/utils/supabase/server";
import { 
  Product, 
  ProductFormData, 
  ProductFilters,
  ProductUnit,
  ProductBatch,
  PaginatedResponse 
} from "@/types";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { cache } from "react";

// ==========================================
// 1. LẤY THỐNG KÊ TỔNG QUAN - FIXED - KHÔNG GIỚI HẠN 1000 DÒNG
// ==========================================
export async function getProductStats() {
  try {
    const supabase = await createClient();
    
    // Lấy tổng số sản phẩm active
    const { count: totalProducts, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (countError) throw countError;

    // Lấy thống kê tồn kho từ view - xử lý phân trang để lấy hết dữ liệu
    const pageSize = 1000;
    let allStockStats: any[] = [];
    let page = 0;

    while (true) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from("v_products_extended")
        .select(`
          current_stock,
          min_stock,
          cost_price
        `)
        .eq("is_active", true)
        .range(from, to);

      if (error) throw error;
      
      if (!data || data.length === 0) break;
      
      allStockStats = [...allStockStats, ...data];
      
      // Nếu số lượng trả về ít hơn pageSize thì đã hết dữ liệu
      if (data.length < pageSize) break;
      
      page++;
    }

    console.log(`Đã lấy ${allStockStats.length} sản phẩm để tính thống kê`);

    if (!allStockStats || allStockStats.length === 0) {
      return {
        totalProducts: totalProducts || 0,
        activeProducts: totalProducts || 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalInventoryValue: 0,
      };
    }

    // Tính toán
    let totalInventoryValue = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    allStockStats.forEach((item: any) => {
      const currentStock = item.current_stock || 0;
      
      totalInventoryValue += currentStock * (item.cost_price || 0);
      
      if (currentStock === 0) {
        outOfStockProducts++;
      } else if (currentStock <= (item.min_stock || 0)) {
        lowStockProducts++;
      }
    });

    return {
      totalProducts: totalProducts || 0,
      activeProducts: totalProducts || 0,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
    };

  } catch (error) {
    console.error("getProductStats error:", error);
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalInventoryValue: 0,
    };
  }
}


// ==========================================
// 2. LẤY DANH SÁCH SẢN PHẨM PHÂN TRANG
// ==========================================
export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<{ products: Product[]; totalCount: number }> {
  try {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query chính - sử dụng view để lấy tồn kho nhanh hơn
    let query = supabase
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
        is_low_stock
      `, { count: "exact" });

    // Apply filters
    if (filters?.search?.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(
        `name.ilike.${searchTerm},internal_code.ilike.${searchTerm},barcode.ilike.${searchTerm}`
      );
    }

    if (filters?.category && filters.category !== "all" && filters.category !== "") {
      query = query.eq("category", filters.category);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.min_price !== undefined && filters.min_price > 0) {
      query = query.gte("sale_price", filters.min_price);
    }

    if (filters?.max_price !== undefined && filters.max_price > 0) {
      query = query.lte("sale_price", filters.max_price);
    }

    // Low stock filter (sử dụng cột is_low_stock từ view)
    if (filters?.low_stock === true) {
      query = query.eq("is_low_stock", true);
    }

    const { data, error, count } = await query
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      products: (data as Product[]) || [],
      totalCount: count || 0,
    };
  } catch (error: any) {
    console.error("getProducts error:", error.message);
    return { products: [], totalCount: 0 };
  }
}

// ==========================================
// 3. LẤY CHI TIẾT SẢN PHẨM (KÈM UNITS & BATCHES)
// ==========================================
// actions/products.ts
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();

    // Lấy thông tin sản phẩm kèm units và batches
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_units (*),
        product_batches (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!product) return null;

    // Lấy tồn kho hiện tại từ snapshot
    const { data: snapshot } = await supabase
      .from("inventory_snapshot")
      .select("quantity")
      .eq("product_id", id)
      .single();

    // Sắp xếp lô theo hạn sử dụng
    if (product.product_batches) {
      product.product_batches.sort(
        (a: ProductBatch, b: ProductBatch) =>
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
    }

    return {
      ...product,
      current_stock: snapshot?.quantity || 0,
      units: product.product_units || [], // Đảm bảo units luôn là mảng
      product_batches: product.product_batches || [],
    };
  } catch (error: any) {
    console.error("getProductById error:", error.message);
    return null;
  }
}

// ==========================================
// 4. LẤY DANH MỤC SẢN PHẨM
// ==========================================
export const getProductCategories = cache(async (): Promise<string[]> => {
  const defaultCategories = [
    "Thuốc kê đơn",
    "Thuốc không kê đơn (OTC)",
    "Thực phẩm chức năng",
    "Vật tư y tế",
    "Mỹ phẩm",
    "Dụng cụ y tế",
  ];
  
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null);

    if (error) return defaultCategories;

    const dbCategories = data
      .map((item) => item.category as string)
      .filter(Boolean);

    // Kết hợp và loại bỏ trùng lặp
    const combined = Array.from(new Set([...defaultCategories, ...dbCategories]));
    
    return combined.sort((a, b) => a.localeCompare(b, "vi"));
  } catch (error) {
    return defaultCategories;
  }
});

// // ==========================================
// // 5. THÊM MỚI SẢN PHẨM
// // ==========================================
// export async function createProduct(formData: ProductFormData) {
//   try {
//     const supabase = await createClient();

//     // Validate
//     if (!formData.internal_code || !formData.name || !formData.base_unit) {
//       return {
//         success: false,
//         message: "Vui lòng nhập đầy đủ thông tin bắt buộc (mã SP, tên SP, đơn vị)",
//       };
//     }

//     // Kiểm tra mã sản phẩm đã tồn tại
//     const { data: existing } = await supabase
//       .from("products")
//       .select("id")
//       .eq("internal_code", formData.internal_code)
//       .maybeSingle();

//     if (existing) {
//       return {
//         success: false,
//         message: "Mã sản phẩm đã tồn tại trong hệ thống",
//       };
//     }

//     // Thêm sản phẩm
//     const { data: product, error: pError } = await supabase
//       .from("products")
//       .insert([{
//         internal_code: formData.internal_code,
//         barcode: formData.barcode || null,
//         name: formData.name,
//         category: formData.category || null,
//         base_unit: formData.base_unit,
//         sale_price: Number(formData.sale_price) || 0,
//         cost_price: Number(formData.cost_price) || 0,
//         min_stock: Number(formData.min_stock) || 10,
//         manage_by_batch: formData.manage_by_batch ?? true,
//         is_active: formData.is_active ?? true,
//       }])
//       .select()
//       .single();

//     if (pError) throw pError;

//     // Tạo snapshot tồn kho ban đầu
//     await supabase
//       .from("inventory_snapshot")
//       .insert([{ product_id: product.id, quantity: 0 }]);

//     revalidatePath("/products");
//     return { success: true, data: product };
//   } catch (error: any) {
//     console.error("createProduct error:", error.message);
//     return { success: false, message: error.message };
//   }
// }

// // ==========================================
// // 6. CẬP NHẬT SẢN PHẨM
// // ==========================================
// export async function updateProduct(id: string, formData: Partial<ProductFormData>) {
//   try {
//     const supabase = await createClient();

//     // Kiểm tra sản phẩm tồn tại
//     const { data: existing } = await supabase
//       .from("products")
//       .select("id")
//       .eq("id", id)
//       .single();

//     if (!existing) {
//       return { success: false, message: "Không tìm thấy sản phẩm" };
//     }

//     // Cập nhật
//     const { data, error } = await supabase
//       .from("products")
//       .update({
//         ...formData,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) throw error;

//     revalidatePath("/products");
//     revalidatePath(`/products/${id}`);
//     return { success: true, data };
//   } catch (error: any) {
//     console.error("updateProduct error:", error.message);
//     return { success: false, message: error.message };
//   }
// }

// ==========================================
// 5. THÊM MỚI SẢN PHẨM (ĐÃ SỬA)
// ==========================================
export async function createProduct(formData: any) {
  try {
    const supabase = await createClient();

    // Tách units ra khỏi dữ liệu sản phẩm
    const { units, ...productData } = formData;

    // Validate
    if (!productData.internal_code || !productData.name || !productData.base_unit) {
      return {
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc (mã SP, tên SP, đơn vị)",
      };
    }

    // Kiểm tra mã sản phẩm đã tồn tại
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("internal_code", productData.internal_code)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        message: "Mã sản phẩm đã tồn tại trong hệ thống",
      };
    }

    // 1. Thêm sản phẩm vào bảng products
    const { data: product, error: pError } = await supabase
      .from("products")
      .insert([{
        internal_code: productData.internal_code,
        barcode: productData.barcode || null,
        name: productData.name,
        category: productData.category || null,
        base_unit: productData.base_unit,
        sale_price: Number(productData.sale_price) || 0,
        cost_price: Number(productData.cost_price) || 0,
        min_stock: Number(productData.min_stock) || 10,
        manage_by_batch: productData.manage_by_batch ?? true,
        is_active: productData.is_active ?? true,
      }])
      .select()
      .single();

    if (pError) throw pError;

    // 2. Thêm các đơn vị quy đổi vào bảng product_units
    if (units && units.length > 0) {
      const unitsToInsert = units.map((unit: any) => ({
        product_id: product.id,
        unit_name: unit.unit_name,
        conversion_factor: Number(unit.conversion_factor) || 1,
        sale_price: Number(unit.sale_price) || 0,
        is_base_unit: unit.is_base_unit || false,
      }));

      const { error: uError } = await supabase
        .from("product_units")
        .insert(unitsToInsert);

      if (uError) {
        // Nếu lỗi, xóa sản phẩm vừa tạo
        await supabase.from("products").delete().eq("id", product.id);
        throw uError;
      }
    }

    // 3. Tạo snapshot tồn kho ban đầu
    await supabase
      .from("inventory_snapshot")
      .insert([{ product_id: product.id, quantity: 0 }]);

    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("createProduct error:", error.message);
    return { success: false, message: error.message };
  }
}

// ==========================================
// 6. CẬP NHẬT SẢN PHẨM (ĐÃ SỬA)
// ==========================================
export async function updateProduct(id: string, formData: any) {
  try {
    const supabase = await createClient();

    // Tách units ra khỏi dữ liệu sản phẩm
    const { units, ...productData } = formData;

    // Kiểm tra sản phẩm tồn tại
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return { success: false, message: "Không tìm thấy sản phẩm" };
    }

    // 1. Cập nhật thông tin trong bảng products
    const { data, error } = await supabase
      .from("products")
      .update({
        internal_code: productData.internal_code,
        barcode: productData.barcode || null,
        name: productData.name,
        category: productData.category || null,
        base_unit: productData.base_unit,
        sale_price: Number(productData.sale_price) || 0,
        cost_price: Number(productData.cost_price) || 0,
        min_stock: Number(productData.min_stock) || 10,
        manage_by_batch: productData.manage_by_batch ?? true,
        is_active: productData.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // 2. Cập nhật các đơn vị quy đổi
    if (units) {
      // Xóa tất cả đơn vị cũ
      await supabase
        .from("product_units")
        .delete()
        .eq("product_id", id);

      // Thêm đơn vị mới
      if (units.length > 0) {
        const unitsToInsert = units.map((unit: any) => ({
          product_id: id,
          unit_name: unit.unit_name,
          conversion_factor: Number(unit.conversion_factor) || 1,
          sale_price: Number(unit.sale_price) || 0,
          is_base_unit: unit.is_base_unit || false,
        }));

        const { error: uError } = await supabase
          .from("product_units")
          .insert(unitsToInsert);

        if (uError) throw uError;
      }
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("updateProduct error:", error.message);
    return { success: false, message: error.message };
  }
}

// ==========================================
// 7. BẬT/TẮT TRẠNG THÁI SẢN PHẨM
// ==========================================
export async function toggleProductStatus(id: string, status: boolean) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("products")
      .update({ 
        is_active: status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// 8. XÓA SẢN PHẨM
// ==========================================
export async function deleteProductAction(productId: string) {
  try {
    const supabase = await createClient();

    // Kiểm tra sản phẩm tồn tại
    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();

    if (!product) {
      return { success: false, message: "Không tìm thấy sản phẩm" };
    }

    // Kiểm tra đã có giao dịch chưa
    const { count: saleCount } = await supabase
      .from("sale_items")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    const { count: entryCount } = await supabase
      .from("stock_entry_items")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    if ((saleCount || 0) > 0 || (entryCount || 0) > 0) {
      return {
        success: false,
        message: "Không thể xóa vì sản phẩm đã có lịch sử giao dịch",
      };
    }

    // Xóa sản phẩm (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/products");
    return { success: true, message: "Đã xóa sản phẩm thành công" };
  } catch (error: any) {
    console.error("deleteProductAction error:", error);
    return { success: false, message: "Lỗi khi xóa: " + error.message };
  }
}

// ==========================================
// 9. QUẢN LÝ ĐƠN VỊ TÍNH
// ==========================================
export async function getProductUnits(productId: string): Promise<ProductUnit[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("product_units")
      .select("*")
      .eq("product_id", productId)
      .order("is_base_unit", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function saveProductUnits(productId: string, units: ProductUnit[]) {
  try {
    const supabase = await createClient();

    // Xóa đơn vị cũ
    await supabase
      .from("product_units")
      .delete()
      .eq("product_id", productId);

    // Thêm đơn vị mới
    if (units.length > 0) {
      const unitsToInsert = units.map(u => ({
        product_id: productId,
        unit_name: u.unit_name,
        conversion_factor: u.conversion_factor,
        sale_price: u.sale_price,
        is_base_unit: u.is_base_unit || false,
      }));

      const { error } = await supabase
        .from("product_units")
        .insert(unitsToInsert);

      if (error) throw error;
    }

    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// 10. QUẢN LÝ LÔ HÀNG
// ==========================================
export async function getProductBatches(productId: string): Promise<ProductBatch[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("product_batches")
      .select("*")
      .eq("product_id", productId)
      .order("expiry_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

// ==========================================
// 11. XUẤT EXCEL
// ==========================================
export async function getProductsForExport(filters?: ProductFilters) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("v_products_extended")
      .select(`
        internal_code,
        name,
        barcode,
        category,
        base_unit,
        sale_price,
        cost_price,
        current_stock,
        min_stock,
        manage_by_batch,
        is_active,
        created_at,
        updated_at
      `);

    if (filters?.search?.trim()) {
      query = query.ilike("name", `%${filters.search.trim()}%`);
    }

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: data?.length || 0,
    };
  } catch (error: any) {
    console.error("getProductsForExport error:", error);
    return { success: false, data: [], count: 0, message: error.message };
  }
}

export async function generateExcelFromProducts(products: any[]) {
  try {
    if (!products || products.length === 0) {
      return { success: false, message: "Không có dữ liệu để xuất" };
    }

    const excelData = products.map((p) => ({
      "Mã SP": p.internal_code || "",
      "Tên sản phẩm": p.name || "",
      "Barcode": p.barcode || "",
      "Danh mục": p.category || "",
      "ĐVT cơ bản": p.base_unit || "",
      "Giá bán (VNĐ)": p.sale_price || 0,
      "Giá vốn (VNĐ)": p.cost_price || 0,
      "Tồn kho": p.current_stock || 0,
      "Tồn tối thiểu": p.min_stock || 0,
      "Quản lý theo lô": p.manage_by_batch ? "Có" : "Không",
      "Trạng thái": p.is_active ? "Đang bán" : "Ngừng bán",
      "Ngày tạo": p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Đặt độ rộng cột
    ws["!cols"] = [
      { wch: 10 },  // Mã SP
      { wch: 40 },  // Tên
      { wch: 15 },  // Barcode
      { wch: 20 },  // Danh mục
      { wch: 10 },  // ĐVT
      { wch: 15 },  // Giá bán
      { wch: 15 },  // Giá vốn
      { wch: 10 },  // Tồn kho
      { wch: 12 },  // Tồn tối thiểu
      { wch: 12 },  // Quản lý lô
      { wch: 12 },  // Trạng thái
      { wch: 12 },  // Ngày tạo
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Danh sách sản phẩm");

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      success: true,
      data: {
        base64,
        filename: `danh-sach-san-pham-${new Date().toISOString().split("T")[0]}.xlsx`,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    };
  } catch (error: any) {
    console.error("generateExcelFromProducts error:", error);
    return { success: false, message: error.message };
  }
}

// ==========================================
// 12. KIỂM TRA TỒN KHO
// ==========================================
export async function checkLowStock() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("v_products_extended")
      .select(`
        id,
        internal_code,
        name,
        current_stock,
        min_stock
      `)
      .eq("is_low_stock", true)
      .eq("is_active", true);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}