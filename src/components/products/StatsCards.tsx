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
    },
    {
      label: "Đang kinh doanh",
      value: formatNumber(activeProducts),
      icon: CheckCircle,
      subValue:
        totalProducts > 0
          ? `${Math.round((activeProducts / totalProducts) * 100)}%`
          : "0%",
    },
    {
      label: "Cảnh báo tồn kho",
      value: formatNumber(lowStockProducts + outOfStockProducts),
      icon: AlertTriangle,
      subValue: `${lowStockProducts} sắp hết, ${outOfStockProducts} hết`,
    },
    {
      label: "Giá trị tồn kho",
      value: formatCompactNumber(totalInventoryValue),
      icon: DollarSign,
      subValue: "Giá vốn",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="text-xl font-semibold mt-0.5 truncate">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {stat.subValue}
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