"use client";

import {
  Moon,
  Sun,
  LogOut,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState, useEffect } from "react";
import { signOut } from "@/app/actions/login";
import { createClient } from "@/utils/supabase/client";

interface HeaderProps {
  // Không cần title và description nữa
}

export default function Header({}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(format(now, "dd/MM/yyyy HH:mm:ss", { locale: vi }));
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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Left section: App Name */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          MedPOS
        </h1>
      </div>

      {/* DateTime */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-mono tabular-nums text-foreground">
          {currentDateTime}
        </span>
      </div>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-9 w-9"
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {/* User Info */}
      <div className="flex items-center gap-3 pl-3 border-l">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {getUserInitials(user?.email || "A")}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">
              {getGreeting()}!
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Đăng xuất"
        >
          {isLoggingOut ? (
            <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}