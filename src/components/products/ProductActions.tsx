// app/components/products/ProductActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProductFilters } from "@/types";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ProductActionsProps {
  filters?: ProductFilters;
  productCount?: number;
  onExport?: () => Promise<{
    success: boolean;
    message?: string;
    data?: {
      base64: string;
      filename: string;
      contentType: string;
    };
  }>;
}

export function ProductActions({
  productCount = 0,
  onExport,
}: ProductActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Xử lý xuất Excel
  const handleExport = async () => {
    if (productCount === 0) {
      toast.warning("Không có sản phẩm để xuất");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Đang xuất file Excel...");

    try {
      const result = await onExport?.();

      if (!result?.success || !result.data) {
        throw new Error(result?.message || "Xuất Excel thất bại");
      }

      // Download file
      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: result.data.contentType,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất Excel thành công!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Xuất Excel thất bại", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Nút Thêm sản phẩm */}
      <Button asChild size="default" className="h-9 gap-2 px-4">
        <Link href="/products/new">
          <Plus className="h-4 w-4" />
          <span>Thêm sản phẩm</span>
        </Link>
      </Button>

      {/* Nút Xuất Excel */}
      <Button
        variant="outline"
        size="default"
        className="h-9 gap-2"
        onClick={handleExport}
        disabled={isExporting || productCount === 0}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>Xuất Excel</span>
        {productCount > 0 && !isExporting && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
            {productCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}