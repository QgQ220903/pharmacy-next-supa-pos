"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { Product, ProductFormData, ProductFilters } from "@/types";
import { revalidatePath } from "next/cache";

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

      // Tính số lượng thuốc sắp hết hàng
      if (stock <= minStock) {
        lowStockCount++;
      }

      // Tính tổng giá trị tồn kho (Ưu tiên giá nhập, nếu không có thì lấy giá bán)
      const price = p.cost_price || p.sale_price || 0;
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

// // Lấy danh sách sản phẩm
// export async function getProducts(
//   filters?: ProductFilters
// ): Promise<Product[]> {
//   try {
//     let query = supabaseAdmin
//       .from("products")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (filters?.search) {
//       const s = `%${filters.search}%`;
//       query = query.or(
//         `name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`
//       );
//     }
//     if (filters?.category) query = query.eq("category", filters.category);
//     if (filters?.is_active !== undefined)
//       query = query.eq("is_active", filters.is_active);

//     const { data, error } = await query;
//     if (error) throw error;

//     let products = data as Product[];
//     if (filters?.low_stock) {
//       products = products.filter((p) => (p.current_stock ?? 0) <= p.min_stock);
//     }
//     return products;
//   } catch (error) {
//     console.error("getProducts error:", error);
//     return [];
//   }
// }

// Lấy 1 sản phẩm theo ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Product;
}

// Thêm mới sản phẩm
export async function createProduct(formData: ProductFormData) {
  // Chỉ lấy các trường cần thiết, tránh client gửi dư thừa id/created_at
  const { current_stock, ...insertData } = formData;

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([
      {
        ...insertData,
        current_stock: 0,
        barcode: insertData.barcode || null,
        cost_price: insertData.cost_price ?? null,
        max_stock: insertData.max_stock ?? null,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Tạo dòng mặc định trong inventory_snapshot để đồng bộ
  await supabaseAdmin
    .from("inventory_snapshot")
    .insert({ product_id: data.id, quantity: 0 });

  revalidatePath("/products");
  return data;
}

// Cập nhật sản phẩm
export async function updateProduct(
  id: string,
  formData: Partial<ProductFormData>
) {
  const { current_stock, internal_code, ...updateData } = formData;

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
}

// Ngừng kinh doanh (Soft Delete)
export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  revalidatePath("/products");
  return !error;
}

// Kích hoạt lại kinh doanh
export async function restoreProduct(id: string) {
  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: true })
    .eq("id", id);
  revalidatePath("/products");
  return !error;
}

// Lấy danh sách danh mục (Dùng cho dropdown trong Form)
export async function getProductCategories(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("category")
    .not("category", "is", null);

  return Array.from(new Set(data?.map((i) => i.category as string) || []));
}

export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<{ products: Product[]; totalCount: number }> {
  try {
    let query = supabaseAdmin
      .from("products")
      .select("*", { count: "exact" }) // Thêm exact count
      .order("created_at", { ascending: false });

    // Áp dụng filters
    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${s},internal_code.ilike.${s},barcode.ilike.${s}`
      );
    }
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.is_active !== undefined)
      query = query.eq("is_active", filters.is_active);

    // Tính toán phân trang
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    return {
      products: (data as Product[]) || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalCount: 0 };
  }
}
