"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="h-3 bg-muted/30 rounded w-20 animate-pulse" />
                <div className="h-7 bg-muted/30 rounded w-24 animate-pulse" />
                <div className="h-2 bg-muted/30 rounded w-16 animate-pulse" />
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
  const activePercentage =
    totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

  const cards = [
    {
      title: "Tổng mặt hàng",
      value: formatNumber(totalProducts),
      icon: Package,
      iconColor: "text-blue-500",
      description: `${activeProducts} đang kinh doanh`,
      subDescription: activePercentage > 0 && `${activePercentage}% hoạt động`,
    },
    {
      title: "Đang kinh doanh",
      value: formatNumber(activeProducts),
      icon: CheckCircle,
      iconColor: "text-green-500",
      description: "Sản phẩm đang bán",
      subDescription:
        totalProducts > 0 && `${totalProducts - activeProducts} tạm ngừng`,
    },
    {
      title: "Cảnh báo kho",
      value: formatNumber(totalAlerts),
      icon: AlertTriangle,
      iconColor: totalAlerts > 0 ? "text-amber-500" : "text-gray-400",
      description:
        totalAlerts === 0
          ? "Không có cảnh báo"
          : `${lowStockProducts} ít hàng • ${outOfStockProducts} hết hàng`,
    },
    {
      title: "Giá trị tồn kho",
      value: formatCompactNumber(totalInventoryValue),
      icon: BarChart3,
      iconColor: "text-purple-500",
      description: "Tổng vốn tồn kho",
      suffix: " ₫",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index} className="border">
            <CardContent className="p-5">
              <div className="space-y-4">
                {/* Header with Icon */}
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", card.iconColor)} />
                  <p className="text-sm font-medium text-foreground">
                    {card.title}
                  </p>
                </div>

                {/* Main Value */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-foreground">
                      {card.value}
                    </span>
                    {card.suffix && (
                      <span className="text-sm text-muted-foreground">
                        {card.suffix}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mt-1">
                    {card.description}
                  </p>

                  {/* Sub Description */}
                  {card.subDescription && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.subDescription}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
