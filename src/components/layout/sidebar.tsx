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
  Settings,
  HelpCircle,
  ChevronDown,
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
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Sản phẩm",
    href: "/products",
    icon: Package,
    badge: "24",
  },
  {
    name: "Bán hàng",
    href: "/pos",
    icon: ShoppingCart,
    badge: "POS",
  },
  {
    name: "Nhập kho",
    href: "/entries",
    icon: Truck,
    badge: "3",
  },
  {
    name: "Kiểm kê",
    href: "/inventory/history",
    icon: Activity,
    badge: null,
  },
  {
    name: "Hóa đơn",
    href: "/sales",
    icon: FileText,
    badge: "12",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 70 },
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "hidden md:flex flex-col border-r bg-gradient-to-b from-background via-background to-background/95",
          "sticky top-0 h-screen shadow-lg shadow-primary/5",
        )}
      >
        {/* Logo & Toggle - Enhanced */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/50 relative">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <Link href="/" className="flex items-center gap-3 group">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="font-bold text-base tracking-tight text-foreground">
                      MedPOS
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Pharmacy System
                    </span>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full flex justify-center"
              >
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                  >
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn("absolute", collapsed ? "right-2" : "static")}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Navigation with enhanced animations */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <nav className="space-y-0.5 px-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const isHovered = hoveredItem === item.href;

              if (collapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onHoverStart={() => setHoveredItem(item.href)}
                        onHoverEnd={() => setHoveredItem(null)}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center h-9 rounded-lg mx-1 my-0.5 relative group",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                              : "text-muted-foreground hover:bg-muted/80",
                          )}
                        >
                          <motion.div
                            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                          >
                            <Icon className="h-4 w-4" />
                          </motion.div>
                          {item.badge && (
                            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-destructive rounded-full text-[8px] flex items-center justify-center text-destructive-foreground font-bold">
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="active-indicator"
                              className="absolute -left-1 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary-foreground"
                            />
                          )}
                        </Link>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="px-2 py-1 text-xs font-medium"
                    >
                      {item.name}
                      {item.badge && (
                        <Badge
                          variant="destructive"
                          className="ml-2 text-[8px] px-1"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 h-9 rounded-lg px-3 mx-1 my-0.5 relative group",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    <motion.div
                      animate={
                        isHovered
                          ? { scale: 1.1, rotate: 5 }
                          : { scale: 1, rotate: 0 }
                      }
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>

                    <span className="flex-1 text-sm">{item.name}</span>

                    {item.badge && (
                      <Badge
                        variant={isActive ? "secondary" : "outline"}
                        className={cn(
                          "text-xs px-1.5",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground border-0"
                            : "bg-muted",
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator-expanded"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary-foreground"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        <Separator className="my-2 bg-border/50" />

        {/* Bottom Actions with enhanced styling */}
        <div className="p-3 space-y-2">
          {/* Theme Toggle */}
          {!mounted ? (
            <div className="h-9 w-full bg-muted rounded-lg animate-pulse" />
          ) : collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 mx-auto rounded-lg border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={theme}
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {theme === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-9 text-sm group border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4 group-hover:text-primary transition-colors" />
                    ) : (
                      <Sun className="h-4 w-4 group-hover:text-primary transition-colors" />
                    )}
                  </motion.div>
                </AnimatePresence>
                <span className="group-hover:text-primary transition-colors">
                  {theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}
                </span>
              </Button>
            </motion.div>
          )}

          {/* Help Button */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 mx-auto rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Trợ giúp
              </TooltipContent>
            </Tooltip>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm hover:bg-primary/10 hover:text-primary transition-all"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Trợ giúp & Hướng dẫn</span>
              </Button>
            </motion.div>
          )}

          {/* Logout Button */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 mx-auto rounded-lg shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Đăng xuất
              </TooltipContent>
            </Tooltip>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2 h-9 text-sm shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all group"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Đăng xuất</span>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Version info - only when expanded */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 text-center"
          >
            <p className="text-[10px] text-muted-foreground/60">
              Phiên bản 2.0.0
            </p>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}
