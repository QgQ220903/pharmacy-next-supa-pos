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
  PlusCircle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    title: "Trang chủ",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null,
      },
    ],
  },
  {
    title: "Bán hàng",
    items: [
      { name: "Bán hàng", href: "/pos", icon: ShoppingCart, badge: "POS" },
      { name: "Hóa đơn", href: "/invoices", icon: FileText, badge: null },
      { name: "Khách hàng", href: "/customers", icon: Users, badge: null },
    ],
  },
  {
    title: "Quản lý kho",
    items: [
      { name: "Sản phẩm", href: "/products", icon: Package, badge: null },
      { name: "Nhập kho", href: "/entries", icon: Truck, badge: "Mới" },
      { name: "Kiểm kê", href: "/inventory", icon: Activity, badge: null },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      { name: "Báo cáo", href: "/reports", icon: BarChart3, badge: null },
      {
        name: "Thống kê",
        href: "/analytics",
        icon: ClipboardList,
        badge: null,
      },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { name: "Cài đặt", href: "/settings", icon: Settings, badge: null },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "hidden md:flex flex-col border-r bg-gradient-to-b from-background to-muted/30",
        collapsed ? "w-20" : "w-64",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 font-bold transition-all",
            collapsed ? "justify-center w-full" : "w-full"
          )}
        >
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          {!collapsed && (
            <>
              <span className="text-lg font-semibold tracking-tight">
                MedPOS
              </span>
              <Badge variant="outline" className="ml-auto text-xs font-normal">
                v1.0
              </Badge>
            </>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-3 top-4 z-50 h-6 w-6 rounded-full border bg-background shadow-md",
            collapsed ? "rotate-180" : ""
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </div>

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="grid gap-1">
          {navItems.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && section.title && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      collapsed ? "justify-center" : "justify-between"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted group-hover:bg-primary/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-primary-foreground" : ""
                          )}
                        />
                      </div>
                      {!collapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </div>

                    {!collapsed && item.badge && (
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {collapsed && item.badge && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}

              {sectionIndex < navItems.length - 1 && !collapsed && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Quick Actions - Only show when expanded */}
      {!collapsed && (
        <div className="mt-auto border-t p-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <PlusCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Thao tác nhanh</p>
                <p className="text-xs text-muted-foreground">Thêm mới ngay</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                asChild
              >
                <Link href="/products/new">Sản phẩm</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                asChild
              >
                <Link href="/pos">Bán hàng</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile - Always visible */}
      <div className="border-t p-4">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">AD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">
                Quản trị viên
              </p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
