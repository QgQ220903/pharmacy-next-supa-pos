"use client";

import {
  Bell,
  User,
  Moon,
  Sun,
  Search,
  Home,
  Calendar,
  Filter,
  HelpCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState, useEffect } from "react";

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi }));
  }, []);

  // Format date in Vietnamese
  const formatDate = (date: Date) => {
    const day = date.toLocaleDateString("vi-VN", { weekday: "long" });
    const dateStr = date.toLocaleDateString("vi-VN");
    return `${day}, ${dateStr}`;
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Left Section - Title & Date */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight">
            {title || "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {currentDate || formatDate(new Date())}
          </p>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Quick Stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Doanh thu hôm nay</p>
            <p className="text-sm font-semibold">12.5M ₫</p>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Đơn hàng</p>
            <p className="text-sm font-semibold">24</p>
          </div>
        </div>
      </div>

      {/* Right Section - Search & Actions */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        {/* <div className="hidden lg:flex relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm, hóa đơn..."
            className="pl-9 pr-4 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bộ lọc nâng cao</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div> */}

        <Separator orientation="vertical" className="h-6" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Help Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <HelpCircle className="h-4.5 w-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Trợ giúp & Hướng dẫn</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 rounded-full"
                  aria-label="Toggle theme"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đổi chế độ {theme === "dark" ? "sáng" : "tối"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full relative"
                    >
                      <Bell className="h-4.5 w-4.5" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Thông báo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Thông báo</span>
                <Badge variant="secondary">5 mới</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {[
                  {
                    title: "Sản phẩm sắp hết",
                    desc: "Amoxicillin chỉ còn 20 viên",
                    time: "5 phút trước",
                  },
                  {
                    title: "Đơn hàng mới",
                    desc: "Đơn hàng #HD001234",
                    time: "10 phút trước",
                  },
                  {
                    title: "Nhập kho thành công",
                    desc: "Phiếu nhập #PN001 đã hoàn thành",
                    time: "1 giờ trước",
                  },
                  {
                    title: "Bảo trì hệ thống",
                    desc: "Hệ thống sẽ bảo trì lúc 2:00 AM",
                    time: "2 giờ trước",
                  },
                ].map((notification, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">
                      {notification.desc}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                    >
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">AD</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tài khoản</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">AD</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">Admin User</p>
                  <p className="text-xs text-muted-foreground truncate">
                    admin@medpos.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt tài khoản</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="cursor-pointer"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Chế độ sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Chế độ tối</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2 text-xs text-muted-foreground">
                <p>Phiên bản: v1.0.0</p>
                <p>Đăng nhập lúc: 08:30 AM</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
