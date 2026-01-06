"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "Không thể tải danh sách sản phẩm"}
      </p>
      <Button onClick={() => reset()}>Thử lại</Button>
    </div>
  );
}
