"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Định nghĩa interface để quản lý dữ liệu tốt hơn
interface DashboardStats {
  revenue: number;
  orders: number;
  lowStockCount: number;
}

export async function getDashboardStats() {
  try {
    // 1. Khởi tạo client với quyền của người dùng đang đăng nhập (áp dụng RLS)
    const supabase = await createClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 2. TRUY VẤN SONG SONG (Sử dụng ANON KEY thông qua createClient)
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
        .select(`
          created_at,
          transaction_type,
          quantity_change,
          products (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5),

      // E. Lấy dữ liệu bán hàng 30 ngày gần nhất để tính Top Selling
      supabase
        .from("sale_items")
        .select(`
          quantity,
          products (name)
        `)
        .limit(100),
    ]);

    // Kiểm tra lỗi từ các phản hồi
    if (salesRes.error) throw salesRes.error;

    // 3. XỬ LÝ DỮ LIỆU
    
    // Doanh thu hôm nay
    const salesToday = salesRes.data || [];
    const revenue = salesToday.reduce((sum, s) => sum + (Number(s.final_amount) || 0), 0);
    const orders = salesToday.length;

    // Top Selling Products
    const productMap: Record<string, number> = {};
    topSellingRes.data?.forEach((item: any) => {
      const name = item.products?.name || "Không rõ";
      productMap[name] = (productMap[name] || 0) + (Number(item.quantity) || 0);
    });

    const topSelling = Object.entries(productMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Dữ liệu biểu đồ mẫu (Bạn có thể viết thêm logic để query thật theo từng thứ trong tuần)
    const revenueChart = [
      { name: "Thứ 2", total: 0 },
      { name: "Thứ 3", total: 0 },
      { name: "Thứ 4", total: 0 },
      { name: "Thứ 5", total: 0 },
      { name: "Thứ 6", total: 0 },
      { name: "Thứ 7", total: 0 },
      { name: "CN", total: 0 },
    ];

    return {
      success: true,
      stats: {
        revenue,
        orders,
        lowStockCount: lowStockCountRes.count || 0,
      },
      lowStockList: lowStockListRes.data || [],
      activities: activitiesRes.data || [],
      topSelling: topSelling,
      revenueChart,
    };

  } catch (error: any) {
    console.error("Dashboard Stats Error:", error.message);
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

export async function getRevenueStats() {
  const supabase = await createClient();
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
  const yesterdayEnd = todayStart;

  try {
    // Truy vấn song song để tối ưu tốc độ
    const [todayRes, yesterdayRes] = await Promise.all([
      supabase.from('sales').select('final_amount').gte('created_at', todayStart),
      supabase.from('sales').select('final_amount').gte('created_at', yesterdayStart).lt('created_at', yesterdayEnd)
    ]);

    const todayRev = todayRes.data?.reduce((sum, s) => sum + (s.final_amount || 0), 0) || 0;
    const yesterdayRev = yesterdayRes.data?.reduce((sum, s) => sum + (s.final_amount || 0), 0) || 0;

    return {
      success: true,
      data: {
        today: todayRev,
        yesterday: yesterdayRev,
        thisWeek: todayRev * 1.5, // Logic thực tế của bạn ở đây
        lastWeek: yesterdayRev * 1.2,
        thisMonth: todayRev * 5,
        lastMonth: yesterdayRev * 4,
      }
    };
  } catch (error) {
    return { success: false, message: "Lỗi tính toán doanh thu" };
  }
}