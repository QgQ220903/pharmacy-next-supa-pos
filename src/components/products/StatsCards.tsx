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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-7 w-24 bg-muted rounded animate-pulse" />
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
  const inactiveProducts = totalProducts - activeProducts;

  const cards = [
    {
      title: "Tổng mặt hàng",
      value: formatNumber(totalProducts),
      icon: Package,
      subValue: activePercentage > 0 ? `${activePercentage}% active` : null,
      details: [
        { label: "Đang bán", value: formatNumber(activeProducts) },
        { label: "Tạm ngừng", value: formatNumber(inactiveProducts) },
      ],
    },
    {
      title: "Đang kinh doanh",
      value: formatNumber(activeProducts),
      icon: CheckCircle,
      subValue: `${activePercentage}%`,
      details: [
        { label: "Tổng kho", value: formatNumber(totalProducts) },
        { label: "Còn lại", value: formatNumber(inactiveProducts) },
      ],
    },
    {
      title: "Cảnh báo kho",
      value: formatNumber(totalAlerts),
      icon: AlertTriangle,
      subValue: totalAlerts > 0 ? "Cần xử lý" : "An toàn",
      details: [
        { label: "Sắp hết", value: formatNumber(lowStockProducts) },
        { label: "Hết hàng", value: formatNumber(outOfStockProducts) },
      ],
    },
    {
      title: "Giá trị tồn kho",
      value: formatCompactNumber(totalInventoryValue),
      icon: BarChart3,
      subValue: "Vốn",
      details: [
        {
          label: "Trung bình",
          value:
            totalProducts > 0
              ? formatCompactNumber(
                  Math.round(totalInventoryValue / totalProducts),
                )
              : "0",
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index} className="border">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header với icon và title */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{card.title}</span>
                </div>

                {/* Value và sub value */}
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-foreground">
                    {card.value}
                  </span>
                  {card.subValue && (
                    <span className="text-xs text-muted-foreground">
                      {card.subValue}
                    </span>
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  {card.details.map((detail, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-muted-foreground">
                        {detail.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Progress bar chỉ hiện khi cần thiết */}
                {index === 0 && totalProducts > 0 && (
                  <div className="pt-1">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${activePercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
