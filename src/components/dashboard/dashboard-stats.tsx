import { DollarSign, ShoppingCart, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      title: "Doanh thu hôm nay",
      value: formatPrice(revenue ?? 0),
      icon: DollarSign,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      description: "Tổng doanh thu trong ngày",
    },
    {
      title: "Đơn hàng mới",
      value: (orders ?? 0).toString(),
      icon: ShoppingCart,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      description: "Số đơn hàng hôm nay",
    },
    {
      title: "Sắp hết hàng",
      value: (lowStockCount ?? 0).toString(),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      description: "Cần nhập thêm",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
