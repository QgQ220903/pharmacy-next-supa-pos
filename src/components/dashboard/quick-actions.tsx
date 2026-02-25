"use client";

import {
  ShoppingCart,
  Package,
  Plus,
  FileText,
  TrendingUp,
  Truck,
  Users,
  ArrowRight,
  Receipt,
  Pill,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  title?: string;
  description?: string;
  variant?: "grid" | "list";
}

export default function QuickActions({ 
  title = "Truy cập nhanh", 
  description = "Các thao tác thường dùng",
  variant = "grid" 
}: QuickActionProps) {
  const router = useRouter();

  const actions = [
    {
      label: "Bán hàng",
      icon: ShoppingCart,
      href: "/pos",
      description: "Mở POS bán hàng",
      stats: "12 đơn hôm nay",
      color: "bg-primary",
      lightColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Nhập kho",
      icon: Package,
      href: "/entries",
      description: "Nhập hàng mới",
      stats: "3 phiếu chờ",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Thêm sản phẩm",
      icon: Plus,
      href: "/products/new",
      description: "Tạo sản phẩm mới",
      stats: "Thêm nhanh",
      color: "bg-blue-500",
      lightColor: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Hóa đơn",
      icon: FileText,
      href: "/sales",
      description: "Xem lịch sử bán",
      stats: "48 hóa đơn",
      color: "bg-amber-500",
      lightColor: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Kiểm kê",
      icon: TrendingUp,
      href: "/inventory",
      description: "Kiểm tra tồn kho",
      stats: "5 sản phẩm sắp hết",
      color: "bg-purple-500",
      lightColor: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Nhà cung cấp",
      icon: Truck,
      href: "/suppliers",
      description: "Quản lý NCC",
      stats: "15 NCC",
      color: "bg-rose-500",
      lightColor: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (variant === "grid") {
    return (
      <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {title}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-primary"
              onClick={() => router.push("/dashboard/actions")}
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div key={index} variants={item}>
                  <button
                    onClick={() => router.push(action.href)}
                    className={cn(
                      "group w-full text-left",
                      "p-3 rounded-lg",
                      "bg-accent/5 hover:bg-accent",
                      "border border-transparent hover:border-border",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-md",
                          action.lightColor,
                          "flex items-center justify-center",
                          "group-hover:scale-110 transition-transform"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", action.iconColor)} />
                      </div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-primary transition-colors">
                          {action.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {action.description}
                        </div>
                        {action.stats && (
                          <div className="text-[10px] font-medium text-primary/70 mt-1.5">
                            {action.stats}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // List variant (mặc định)
  return (
    <Card className="border bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              {title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-primary"
          >
            Tất cả <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="divide-y divide-border"
        >
          {actions.slice(0, 4).map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div key={index} variants={item}>
                <button
                  onClick={() => router.push(action.href)}
                  className={cn(
                    "group w-full flex items-center justify-between px-4 py-3",
                    "hover:bg-accent/50 transition-colors",
                    "focus-visible:outline-none focus-visible:bg-accent/50",
                    "relative overflow-hidden"
                  )}
                >
                  {/* Progress indicator */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      "bg-gradient-to-b",
                      index === 0 && "from-primary to-primary/70",
                      index === 1 && "from-emerald-500 to-emerald-500/70",
                      index === 2 && "from-blue-500 to-blue-500/70",
                      index === 3 && "from-amber-500 to-amber-500/70",
                    )}
                  />

                  <div className="flex items-center gap-3 pl-2">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg",
                        action.lightColor,
                        "flex items-center justify-center",
                        "group-hover:scale-110 transition-transform"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", action.iconColor)} />
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

                  <div className="flex items-center gap-3">
                    {action.stats && (
                      <span className="text-xs font-medium text-primary/70 bg-primary/5 px-2 py-1 rounded-md">
                        {action.stats}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick stats footer */}
        <div className="px-4 py-2 bg-muted/20 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Tổng quan hôm nay
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3 text-primary" />
              <span className="font-medium">12</span>
            </span>
            <span className="flex items-center gap-1">
              <Receipt className="h-3 w-3 text-emerald-500" />
              <span className="font-medium">8.5M</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}