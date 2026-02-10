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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "hidden md:flex flex-col border-r bg-background",
          collapsed ? "w-[70px]" : "w-[240px]",
          "sticky top-0 h-screen transition-all duration-200",
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-foreground">
                    MedPOS
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pharmacy System
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCollapsed(true)}
                title="Thu nhỏ"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/" className="mx-auto">
                <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 absolute right-2"
                onClick={() => setCollapsed(false)}
                title="Mở rộng"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

              if (collapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center h-9 rounded-md mx-1 my-0.5 relative",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {isActive && (
                          <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="px-2 py-1 text-xs"
                    >
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-md px-3 mx-1 my-0.5",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-sm">{item.name}</span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator className="my-2" />

        {/* Bottom Actions */}
        <div className="p-3 space-y-3">
          {/* Theme Toggle */}
          {!mounted ? (
            <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
          ) : collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 mx-auto"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Chuyển chế độ
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-8 text-xs"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span>Chế độ tối</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span>Chế độ sáng</span>
                </>
              )}
            </Button>
          )}

          {/* Logout Button */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 mx-auto"
                  title="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Đăng xuất
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="destructive"
              className="w-full justify-start gap-2 h-9"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
