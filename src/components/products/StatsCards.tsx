"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { cn, formatCompactNumber, formatNumber } from "@/lib/utils";

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
  if (!rawStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-7 w-20 bg-muted rounded animate-pulse" />
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

  const stats = [
    {
      label: "Tổng sản phẩm",
      value: formatNumber(totalProducts),
      icon: Package,
      subValue: `${activeProducts} đang bán`,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Đang kinh doanh",
      value: formatNumber(activeProducts),
      icon: CheckCircle,
      subValue: totalProducts > 0 ? `${Math.round((activeProducts / totalProducts) * 100)}%` : "0%",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Cảnh báo tồn kho",
      value: formatNumber(lowStockProducts + outOfStockProducts),
      icon: AlertTriangle,
      subValue: `${lowStockProducts} sắp hết, ${outOfStockProducts} hết`,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Giá trị tồn kho",
      value: formatCompactNumber(totalInventoryValue),
      icon: DollarSign,
      subValue: "Giá vốn",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card key={index} className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground/80 line-clamp-1">
                    {stat.subValue}
                  </p>
                </div>
                <div className={cn("p-2.5 rounded-xl", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}