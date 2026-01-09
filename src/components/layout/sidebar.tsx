"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react"; // Thêm useEffect
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/products", icon: Package },
  { name: "Bán hàng", href: "/pos", icon: ShoppingCart },
  { name: "Nhập kho", href: "/entries", icon: Truck },
  { name: "Kiểm kê", href: "/inventory/history", icon: Activity },
  { name: "Hóa đơn", href: "/sales", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Khắc phục lỗi Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          "sticky top-0 h-screen"
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-3 group">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight">MedPOS</span>
                  <span className="text-xs text-muted-foreground">Pharmacy System</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/" className="mx-auto">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full absolute right-2"
                onClick={() => setCollapsed(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              if (collapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center rounded-lg px-3 py-3 transition-all relative",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 transition-all group",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator />

        {/* Theme Toggle - Bọc trong điều kiện mounted */}
        <div className="p-4">
          {!mounted ? (
            <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
          ) : collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 mx-auto"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Chuyển chế độ</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="ml-2">Chế độ tối</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="ml-2">Chế độ sáng</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}