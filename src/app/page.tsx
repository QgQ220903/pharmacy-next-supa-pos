import { getDashboardStats } from "@/app/actions/dashboard";
import QuickActions from "@/components/dashboard/quick-actions";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import RecentSales from "@/components/dashboard/recent-sales";
import LowStockProducts from "@/components/dashboard/low-stock-products";
import TopSellingProducts from "@/components/dashboard/top-selling-products";
import { ActivityLog } from "@/components/dashboard/activity-log";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const data = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground">
          Dữ liệu thời gian thực - {new Date().toLocaleDateString("vi-VN")}
        </p>
      </div>

      <QuickActions />

      <DashboardStats
        revenue={data.stats.revenue}
        orders={data.stats.orders}
        lowStockCount={data.stats.lowStockCount}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <RecentSales />
          <LowStockProducts data={data.lowStockList} />
        </div>
        <div className="space-y-6">
          <TopSellingProducts data={data.topSelling} />
          <ActivityLog data={data.activities} />
        </div>
      </div>
    </div>
  );
}
