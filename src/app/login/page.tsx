"use client";

import { useState } from "react";
import { login } from "@/app/actions/login"; // Đảm bảo bạn đã export hàm login từ file actions.ts
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Định nghĩa hàm xử lý Action tại đây
async function handleFormAction(formData: FormData) {
  setIsLoading(true);
  // Không cần try-catch ở đây vì login (Server Action) đã xử lý rồi
  const result = await login(formData);
  
  if (result?.error) {
    toast.error(result.error);
    setIsLoading(false); 
  } else {
    window.location.href = "/products";
  }
  // Nếu thành công, trang sẽ tự chuyển, Toast sẽ không kịp hiện hoặc không có lỗi để hiện
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập hệ thống</CardTitle>
          <CardDescription>
            Chỉ dành cho quản trị viên và đối tác được cấp quyền.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* SỬA TẠI ĐÂY: action phải khớp với tên hàm đã định nghĩa ở trên */}
          <form action={handleFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  name="email" // Quan trọng: Server Action dùng 'name' để lấy dữ liệu
                  type="email" 
                  placeholder="admin@example.com" 
                  className="pl-10" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  name="password" // Quan trọng: Server Action dùng 'name' để lấy dữ liệu
                  type="password" 
                  placeholder="••••••" 
                  className="pl-10" 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác thực...</>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-center text-muted-foreground w-full">
            Hệ thống quản lý nội bộ MedPOS.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}