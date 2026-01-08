"use client";

import { createClient } from "@/lib/supabaseclient"; // Sử dụng Browser Client
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // 1. Gọi hàm signOut để xóa session trong database và cookie trình duyệt
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      toast.success("Đã đăng xuất");

      // 2. Ép trình duyệt tải lại hoàn toàn và về trang login
      // Việc dùng window.location.href đảm bảo Middleware sẽ kiểm tra lại từ đầu
      window.location.href = "/login";
      
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-xs flex items-center gap-2" 
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <LogOut className="h-3 w-3" />
      )}
      Đăng xuất
    </Button>
  );
}