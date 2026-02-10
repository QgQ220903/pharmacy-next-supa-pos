"use client";

import {
  Plus,
  ShoppingCart,
  Package,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "Bán hàng",
      icon: ShoppingCart,
      href: "/pos",
      description: "Mở POS bán hàng",
      color: "text-primary",
      accent: "border-l-primary",
    },
    {
      label: "Nhập kho",
      icon: Package,
      href: "/entries",
      description: "Nhập hàng mới",
      color: "text-emerald-600 dark:text-emerald-500",
      accent: "border-l-emerald-600 dark:border-l-emerald-500",
    },
    {
      label: "Thêm sản phẩm",
      icon: Plus,
      href: "/products/new",
      description: "Tạo sản phẩm mới",
      color: "text-blue-600 dark:text-blue-500",
      accent: "border-l-blue-600 dark:border-l-blue-500",
    },
    {
      label: "Hóa đơn",
      icon: FileText,
      href: "/sales",
      description: "Xem lịch sử bán",
      color: "text-amber-600 dark:text-amber-500",
      accent: "border-l-amber-600 dark:border-l-amber-500",
    },
  ];

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Truy cập nhanh</CardTitle>
        <CardDescription className="text-sm">
          Các thao tác thường dùng nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className={cn(
                  "group w-full flex items-center justify-between px-4 py-3",
                  "hover:bg-accent transition-colors",
                  "focus-visible:outline-none focus-visible:bg-accent",
                  action.accent,
                  "border-l-4 border-l-transparent group-hover:border-l-2",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-md flex items-center justify-center",
                      "bg-muted group-hover:bg-muted/80 transition-colors",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", action.color)} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {action.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
