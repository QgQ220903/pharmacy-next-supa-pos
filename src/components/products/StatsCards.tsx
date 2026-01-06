"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalProducts?: number;
    activeProducts?: number;
    canSellProducts?: number;
    lowStockProducts?: number;
    outOfStockProducts?: number;
    totalInventoryValue?: number;
  } | null;
}

export function StatsCards({ stats: rawStats }: StatsCardsProps) {
  // 1. Loading State (Skeleton)
  if (!rawStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  // 2. Normalize Data: Gán giá trị mặc định 0 cho tất cả các trường bị thiếu
  const {
    totalProducts = 0,
    activeProducts = 0,
    lowStockProducts = 0,
    outOfStockProducts = 0,
    totalInventoryValue = 0,
  } = rawStats;

  // Helper format tiền tệ
  const formatCurrency = (value: number) => {
    if (value === 0) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} tr`;
    return value.toLocaleString("vi-VN");
  };

  const totalAlerts = lowStockProducts + outOfStockProducts;

  const cards = [
    {
      title: "Tổng mặt hàng",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      description: "Sản phẩm trong kho",
    },
    {
      title: "Đang kinh doanh",
      value: activeProducts,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      description: "Sản phẩm đang bán",
    },
    {
      title: "Cảnh báo kho",
      value: totalAlerts,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      description:
        outOfStockProducts > 0
          ? `${outOfStockProducts} mã hết hàng`
          : "Cần nhập thêm hàng",
      isAlert: totalAlerts > 0,
    },
    {
      title: "Ước tính giá trị",
      value: formatCurrency(totalInventoryValue),
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      description: "Tổng vốn tồn kho",
      suffix: " ₫",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="border-none shadow-none bg-card/50 backdrop-blur-sm sm:border sm:shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                {/* Icon Section */}
                <div className={cn("p-2.5 rounded-xl shrink-0", card.bgColor)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>

                {/* Content Section */}
                <div className="flex flex-col min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight">
                      {card.value}
                    </span>
                    {card.suffix && (
                      <span className="text-xs font-semibold opacity-70">
                        {card.suffix}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-[10px] truncate font-medium",
                      card.isAlert ? "text-orange-600" : "text-muted-foreground"
                    )}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
