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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
        </div>
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
