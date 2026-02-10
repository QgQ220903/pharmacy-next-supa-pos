import { DollarSign, ShoppingCart, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  revenue?: number;
  orders?: number;
  lowStockCount?: number;
}

export default function DashboardStats({
  revenue = 0,
  orders = 0,
  lowStockCount = 0,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Doanh thu",
      value: formatPrice(revenue ?? 0),
      icon: DollarSign,
      color: "text-primary",
      accent: "border-l-primary",
      description: "Hôm nay",
    },
    {
      title: "Đơn hàng",
      value: (orders ?? 0).toString(),
      icon: ShoppingCart,
      color: "text-emerald-600 dark:text-emerald-500",
      accent: "border-l-emerald-600 dark:border-l-emerald-500",
      description: "Mới",
    },
    {
      title: "Tồn kho",
      value: (lowStockCount ?? 0).toString(),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-500",
      accent: "border-l-amber-600 dark:border-l-amber-500",
      description: "Sắp hết",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat, i) => (
        <button
          key={i}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-lg border",
            "bg-card hover:bg-accent transition-colors text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            stat.accent,
            "border-l-4",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center",
                "bg-muted",
              )}
            >
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <div className="font-medium text-sm text-muted-foreground">
                {stat.title}
              </div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
