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
  Settings,
  Users,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  const [notifications] = useState(5);

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
                  <span className="font-bold text-lg tracking-tight">
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

        {/* Theme Toggle & Notifications */}
        <div
          className={cn(
            "flex items-center gap-2 p-4 border-b",
            collapsed ? "justify-center flex-col gap-3" : "justify-between"
          )}
        >
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Chuyển chế độ</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                  >
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Thông báo ({notifications})</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="ml-2">
                  {theme === "dark" ? "Sáng" : "Tối"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2 relative"
              >
                <Bell className="h-4 w-4" />
                <span>Thông báo</span>
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

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
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform",
                        isActive && "scale-110"
                      )}
                    />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator />

        {/* User Profile */}
        <div className="p-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent",
              collapsed && "justify-center"
            )}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border">
                <span className="text-sm font-bold bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">
                  AD
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
            </div>

            {!collapsed && (
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate">Admin User</p>
                  <Badge variant="outline" className="text-xs">
                    Pro
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  admin@medpos.com
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Hồ sơ
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Cài đặt
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
