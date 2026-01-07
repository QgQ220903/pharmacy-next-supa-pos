import { getDashboardStats } from "@/app/actions/dashboard";
import QuickActions from "@/components/dashboard/quick-actions";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentSales from "@/components/dashboard/recent-sales"; // Tùy chỉnh tương tự
import LowStockProducts from "@/components/dashboard/low-stock-products";
import TopSellingProducts from "@/components/dashboard/top-selling-products";
import { ActivityLog } from "@/components/dashboard/activity-log";
export default async function DashboardPage() {
  const data = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Tổng quan
        </h1>
        <p className="text-slate-500 mt-1">
          Dữ liệu thời gian thực - {new Date().toLocaleDateString("vi-VN")}
        </p>
      </div>

      <QuickActions />

      {/* Truyền dữ liệu thật vào Stats */}
      <DashboardStats revenue={data.stats.revenue} orders={data.stats.orders} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <RecentSales />
          {/* <LowStockProducts data={data.lowStock} /> */}
        </div>
        <div className="space-y-6">
          {/* <TopSellingProducts data={data.topSelling} /> */}
          <ActivityLog data={data.activities} />
        </div>
      </div>
    </div>
  );
}
