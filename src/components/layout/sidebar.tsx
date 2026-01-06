"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Users,
  FileText,
  Settings,
  Activity,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/products", icon: Package },
  { name: "Bán hàng", href: "/pos", icon: ShoppingCart },
  { name: "Nhập kho", href: "/entries", icon: Truck },
  { name: "Kiểm kê", href: "/inventory", icon: Activity },
  { name: "Khách hàng", href: "/customers", icon: Users },
  { name: "Báo cáo", href: "/reports", icon: BarChart3 },
  { name: "Hóa đơn", href: "/invoices", icon: FileText },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "hidden md:flex flex-col border-r bg-background",
        collapsed ? "w-16" : "w-64",
        "transition-all duration-300"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-semibold",
            collapsed ? "justify-center w-full" : "w-full"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <>
              <span className="text-lg">MedPOS</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-6 w-6"
                onClick={() => setCollapsed(!collapsed)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </Link>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed ? "justify-center px-2" : ""
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t p-4">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">AD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">
                Quản trị viên
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
