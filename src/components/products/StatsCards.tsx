"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { cn, formatCompactNumber, formatNumber } from "@/lib/utils";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!rawStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border bg-card">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-8 bg-muted rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted rounded w-20 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalProducts = 0,
    activeProducts = 0,
    lowStockProducts = 0,
    outOfStockProducts = 0,
    totalInventoryValue = 0,
  } = rawStats;

  const totalAlerts = lowStockProducts + outOfStockProducts;
  const activePercentage = totalProducts > 0 
    ? Math.round((activeProducts / totalProducts) * 100) 
    : 0;

  const cards = [
    {
      title: "Tổng mặt hàng",
      value: formatNumber(totalProducts),
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      description: `${activeProducts} đang kinh doanh`,
      subDescription: activePercentage > 0 && `${activePercentage}% hoạt động`,
    },
    {
      title: "Đang kinh doanh",
      value: formatNumber(activeProducts),
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      description: "Sản phẩm đang bán",
      subDescription: totalProducts > 0 && `${totalProducts - activeProducts} tạm ngừng`,
    },
    {
      title: "Cảnh báo kho",
      value: formatNumber(totalAlerts),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      description: totalAlerts === 0 
        ? "Không có cảnh báo" 
        : `${lowStockProducts} ít hàng, ${outOfStockProducts} hết hàng`,
      highlight: totalAlerts > 0,
    },
    {
      title: "Giá trị tồn kho",
      value: formatCompactNumber(totalInventoryValue),
      icon: BarChart3,
      color: "text-violet-600 dark:text-violet-400",
      description: "Tổng vốn tồn kho",
      suffix: " ₫",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border bg-card hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className={cn("h-5 w-5", card.color)} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">
                        {card.value}
                      </span>
                      {card.suffix && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {card.suffix}
                        </span>
                      )}
                    </div>
                    
                    <p className={cn(
                      "text-sm font-medium",
                      card.highlight 
                        ? "text-amber-600 dark:text-amber-400" 
                        : "text-muted-foreground"
                    )}>
                      {card.description}
                    </p>
                    
                    {card.subDescription && (
                      <p className="text-xs text-muted-foreground">
                        {card.subDescription}
                      </p>
                    )}
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