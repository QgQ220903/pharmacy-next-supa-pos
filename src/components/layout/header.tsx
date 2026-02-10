"use client";

import {
  User,
  Moon,
  Sun,
  Settings,
  LogOut,
  Loader2,
  Calendar,
  Clock,
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
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState, useEffect } from "react";
import { signOut } from "@/app/actions/login";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Kiểm tra session hiện tại
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(format(now, "dd/MM/yyyy - HH:mm:ss", { locale: vi }));
      setCurrentDate(format(now, "dd/MM/yyyy", { locale: vi }));
      setCurrentTime(format(now, "HH:mm:ss", { locale: vi }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    window.location.href = "/login";
  };

  // Nếu chưa mounted (SSR) hoặc chưa đăng nhập, không hiển thị Header
  if (!mounted || !user) return null;

  // Lấy initials từ email
  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Left section: Title & Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-9 w-1 rounded-r-full",
              title ? "bg-primary" : "bg-muted",
            )}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate text-foreground">
              {title || "Dashboard"}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center section: DateTime & Status */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium tabular-nums">{currentDate}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono font-medium tabular-nums">
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center gap-2">
        <Separator orientation="vertical" className="h-6 hidden lg:flex" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-full"
          title={theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Mobile DateTime */}
        <div className="lg:hidden flex items-center">
          <div className="text-xs text-muted-foreground font-mono">
            {currentTime}
          </div>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-accent">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-sm font-medium text-primary">
                  {getUserInitials(user?.email || "A")}
                </span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium truncate max-w-[120px]">
                  Quản trị viên
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-base font-semibold text-primary">
                    {getUserInitials(user?.email || "A")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    Quản trị viên
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer h-10">
              <User className="mr-3 h-4 w-4" />
              <span className="flex-1">Hồ sơ cá nhân</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer h-10">
              <Settings className="mr-3 h-4 w-4" />
              <span className="flex-1">Cài đặt hệ thống</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Phiên làm việc:</span>
                <span className="font-mono">{currentDateTime}</span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer h-11 text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {isLoggingOut ? (
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-3 h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất hệ thống"}
                  </span>
                </div>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                  ⌘Q
                </kbd>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
