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
      description: "Hôm nay",
      href: "/sales",
    },
    {
      title: "Đơn hàng",
      value: (orders ?? 0).toString(),
      icon: ShoppingCart,
      description: "Mới trong ca",
      href: "/pos",
    },
    {
      title: "Tồn kho",
      value: (lowStockCount ?? 0).toString(),
      icon: AlertTriangle,
      description: "Sản phẩm sắp hết",
      href: "/inventory",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={cn(
              "ring-1 ring-border/50 transition-colors",
              "hover:bg-accent cursor-pointer"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {stat.title}
                  </div>
                  <div className="text-xl font-semibold mt-0.5 truncate">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {stat.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}