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
  Bell,
  ChevronDown,
  Shield,
  Activity,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setMounted(true);

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

  if (!mounted || !user) return null;

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <TooltipProvider>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6 shadow-sm"
      >
        {/* Left section: Title & Description with enhanced styling */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "h-9 w-1 rounded-full bg-gradient-to-b",
                title
                  ? "from-primary to-primary/50"
                  : "from-muted-foreground/30 to-muted-foreground/10",
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <motion.h1
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-semibold truncate text-foreground"
                >
                  {title || "Dashboard"}
                </motion.h1>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-xs border-primary/20 bg-primary/5"
                >
                  <Activity className="h-3 w-3 mr-1 text-primary" />
                  Online
                </Badge>
              </div>
              {description && (
                <motion.p
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground/80 truncate flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  {description}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Center section: DateTime & Status with animations */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium tabular-nums">{currentDate}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <motion.span
                key={currentTime}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono font-medium tabular-nums"
              >
                {currentTime}
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Right section: Actions with enhanced styling */}
        <div className="flex items-center gap-1">
          <Separator
            orientation="vertical"
            className="h-6 hidden lg:flex mr-1"
          />

          {/* Notifications - Optional enhancement */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full relative hover:bg-primary/10"
                onClick={() => setShowNotification(!showNotification)}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thông báo</TooltipContent>
          </Tooltip>

          {/* Theme Toggle with animation */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 rounded-full hover:bg-primary/10 transition-all duration-300"
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
            <TooltipContent>
              {theme === "dark" ? "Chuyển sang sáng" : "Chuyển sang tối"}
            </TooltipContent>
          </Tooltip>

          {/* Mobile DateTime */}
          <div className="lg:hidden flex items-center">
            <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md">
              {currentTime}
            </div>
          </div>

          {/* User Dropdown with enhanced styling */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className="h-9 px-2 gap-2 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300 group"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-sm font-medium text-primary-foreground">
                      {getUserInitials(user?.email || "A")}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium truncate max-w-[120px] group-hover:text-primary transition-colors">
                      {getGreeting()}!
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px] flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 mt-2 border-primary/10 shadow-xl"
            >
              <DropdownMenuLabel className="pb-3 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                  >
                    <span className="text-base font-semibold text-primary-foreground">
                      {getUserInitials(user?.email || "A")}
                    </span>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {getGreeting()}!
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-primary/20"
                  >
                    Admin
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-border/50" />

              <DropdownMenuItem className="cursor-pointer h-10 hover:bg-primary/5 focus:bg-primary/5">
                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Hồ sơ cá nhân</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                  ⌘P
                </kbd>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer h-10 hover:bg-primary/5 focus:bg-primary/5">
                <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Cài đặt hệ thống</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                  ⌘S
                </kbd>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border/50" />

              <div className="px-2 py-1.5 text-xs bg-muted/30 mx-1 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phiên làm việc:</span>
                  <span className="font-mono font-medium">
                    {currentDateTime}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-border/50" />

              <DropdownMenuItem
                className="cursor-pointer h-11 text-destructive focus:bg-destructive/10 focus:text-destructive group"
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                <motion.div
                  className="flex items-center justify-between w-full"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    {isLoggingOut ? (
                      <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="font-medium">
                      {isLoggingOut
                        ? "Đang đăng xuất..."
                        : "Đăng xuất hệ thống"}
                    </span>
                  </div>
                  <kbd className="px-1.5 py-0.5 text-xs bg-destructive/10 rounded border border-destructive/20">
                    ⌘Q
                  </kbd>
                </motion.div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </TooltipProvider>
  );
}
