"use client";

import { useState, useEffect } from "react";
import { login } from "@/app/actions/login";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Stethoscope,
  Shield,
  Key,
  FileCheck,
  Building,
  BadgeCheck,
  ScanLine,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Theme detection
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  async function handleFormAction(formData: FormData) {
    setIsLoading(true);
    const result = await login(formData);

    if (result?.error) {
      toast.error(result.error, {
        position: "top-center",
        duration: 3000,
      });
      setIsLoading(false);
    } else {
      toast.success("Đăng nhập thành công!", {
        position: "top-center",
        duration: 2000,
      });
      setTimeout(() => {
        window.location.href = "/products";
      }, 500);
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleFormAction(formData);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl dark:from-primary/10 dark:via-primary/5" />
        <div className="absolute -bottom-[30%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-3xl dark:from-primary/10 dark:via-primary/5" />

        {/* Medical Cross Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5v50M5 30h50' stroke='%23${theme === "dark" ? "fff" : "000"}' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 z-50"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors" />
        ) : (
          <Sun className="h-5 w-5 text-foreground/70 hover:text-foreground transition-colors" />
        )}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-4"
      >
        {/* Brand Logo/Name */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            MedPOS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hệ thống quản lý nhà thuốc thông minh
          </p>
        </motion.div>

        <Card className="relative backdrop-blur-sm bg-card/95 dark:bg-card/90 shadow-xl border-border/50 dark:border-border/30">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full" />

          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-xl font-semibold tracking-tight text-card-foreground">
              Đăng nhập hệ thống
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Vui lòng nhập thông tin đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@nhathuoc.com"
                    className="pl-10 h-11 bg-background/50 dark:bg-background/30 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="pl-10 pr-10 h-11 bg-background/50 dark:bg-background/30 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none z-10"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium relative overflow-hidden group"
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      Đăng nhập
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Professional Trust Badges */}
            <div className="grid grid-cols-3 gap-3 w-full pt-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <Building className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  Bộ Y Tế
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  GPP Certified
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <Shield className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  AES-256
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <ScanLine className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  QR Code
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <Database className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  Cloud Sync
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-primary/5 rounded-md">
                  <Key className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                  2FA Ready
                </span>
              </div>
            </div>

            {/* Footer Info */}
            <div className="w-full pt-3 border-t border-border/40">
              <p className="text-xs text-center text-muted-foreground/70">
                © 2024 MedPOS • Hệ thống quản lý nhà thuốc đạt chuẩn GPP
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground/60">v3.0.0</span>
                </div>
                <span className="text-[10px] text-muted-foreground/30">•</span>
                <div className="flex items-center gap-1">
                  <FileCheck className="h-2.5 w-2.5 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/60">ISO 27001</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-4 mt-6 text-xs text-muted-foreground/60"
        >
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>HIPAA Ready</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>GDPR</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}