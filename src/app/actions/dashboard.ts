// app/actions/dashboard.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase-server";

export async function getDashboardStats() {
  try {
    const supabase = await supabaseAdmin;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // TRUY VẤN SONG SONG
    const [
      salesRes,
      lowStockCountRes,
      lowStockListRes,
      activitiesRes,
      topSellingRes,
    ] = await Promise.all([
      // A. Doanh thu & Đơn hàng hôm nay
      supabase.from("sales").select("final_amount").gte("created_at", todayISO),

      // B. Đếm số lượng sản phẩm sắp hết hàng
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("current_stock", 10)
        .eq("is_active", true),

      // C. Danh sách 5 sản phẩm tồn kho thấp nhất
      supabase
        .from("products")
        .select("name, current_stock, unit")
        .lt("current_stock", 10)
        .order("current_stock", { ascending: true })
        .limit(5),

      // D. 5 hoạt động biến động kho mới nhất
      supabase
        .from("inventory_transactions")
        .select(
          `
          created_at,
          transaction_type,
          quantity_change,
          products (name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5),

      // E. Lấy dữ liệu bán hàng để tính Top Selling (30 ngày gần nhất)
      supabase
        .from("sale_items")
        .select(
          `
          quantity,
          products (name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    // Xử lý dữ liệu Doanh thu
    const salesToday = salesRes.data || [];
    const revenue = salesToday.reduce(
      (sum, s) => sum + (s.final_amount || 0),
      0
    );
    const orders = salesToday.length;

    // Xử lý logic Top Selling Products (Gom nhóm theo tên sản phẩm)
    const productMap: Record<string, number> = {};
    topSellingRes.data?.forEach((item: any) => {
      const name = item.products?.name || "Không rõ";
      productMap[name] = (productMap[name] || 0) + (item.quantity || 0);
    });

    const topSelling = Object.entries(productMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total) // Sắp xếp giảm dần theo số lượng
      .slice(0, 5); // Lấy top 5

    return {
      success: true,
      stats: {
        revenue,
        orders,
        lowStockCount: lowStockCountRes.count || 0,
      },
      lowStockList: lowStockListRes.data || [],
      activities: activitiesRes.data || [],
      topSelling: topSelling, // Trả về danh sách top bán chạy
      revenueChart: [
        { name: "Thứ 2", total: 0 },
        { name: "Thứ 3", total: 0 },
        { name: "Thứ 4", total: 0 },
        { name: "Thứ 5", total: 0 },
        { name: "Thứ 6", total: 0 },
        { name: "Thứ 7", total: 0 },
        { name: "CN", total: 0 },
      ],
    };
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return {
      success: false,
      stats: { revenue: 0, orders: 0, lowStockCount: 0 },
      lowStockList: [],
      activities: [],
      topSelling: [],
      revenueChart: [],
    };
  }
}
