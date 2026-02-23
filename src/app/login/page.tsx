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
  ShieldCheck,
  Moon,
  Sun,
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
      {/* Animated Background Elements - Tự động thích ứng với theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl dark:from-primary/10 dark:via-primary/5" />
        <div className="absolute -bottom-[30%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-3xl dark:from-primary/10 dark:via-primary/5" />

        {/* Medical Cross Pattern - Màu sắc tự động thích ứng */}
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
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 ring-1 ring-primary/20 dark:ring-primary/30">
            <ShieldCheck className="h-8 w-8 text-primary" />
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
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Mật khẩu
                  </Label>
                  <Button
                    variant="link"
                    className="px-0 text-xs h-auto font-normal text-muted-foreground hover:text-primary transition-colors"
                    type="button"
                  >
                    Quên mật khẩu?
                  </Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="pl-10 pr-10 h-11 bg-background/50 dark:bg-background/30 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
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

              {/* Demo credentials hint */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Tài khoản demo
                  </span>
                </div>
              </div>

              <div className="text-xs text-center text-muted-foreground bg-muted/50 dark:bg-muted/30 rounded-lg p-3 border border-border/30">
                <p>Email: admin@nhathuoc.com</p>
                <p>Mật khẩu: 123456</p>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <p className="text-xs text-center text-muted-foreground">
              Hệ thống quản lý nhà thuốc - Phiên bản 2.0
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground/60">
              <span>© 2024 MedPOS</span>
              <span>•</span>
              <span>Bảo mật & An toàn</span>
              <span>•</span>
              <span>v2.0.0</span>
            </div>
          </CardFooter>
        </Card>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-4 mt-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>2FA Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>HIPAA Ready</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
