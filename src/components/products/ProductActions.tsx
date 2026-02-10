// app/components/products/ProductActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, // Đã sửa tên
  DropdownMenuSeparator, // Đã sửa tên
  DropdownMenuTrigger, // Đã sửa tên
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Plus,
  Filter,
  Download,
  Package,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProductFilters } from "@/types";
import { useState } from "react";

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
  onBulkAction?: () => void;
}

export function ProductActions({
  filters = {},
  productCount = 0,
  onExport,
  onBulkAction,
}: ProductActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (productCount === 0) {
      toast.warning("Không có sản phẩm để xuất");
      return;
    }

    if (!onExport) {
      toast.error("Chức năng export chưa được cấu hình");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Đang xuất Excel...");

    try {
      const result = await onExport();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Xuất Excel thất bại");
      }

      // Xử lý download file từ base64
      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: result.data.contentType,
      });

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất Excel thành công!", {
        id: toastId,
        description: `Đã tải xuống: ${result.data.filename}`,
      });
    } catch (error: any) {
      toast.error("Lỗi: " + error.message, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Nút Thêm sản phẩm */}
      <Button asChild size="sm" className="h-9 gap-2">
        <Link href="/products/new">
          <Plus className="h-4 w-4" />
          <span>Thêm sản phẩm</span>
        </Link>
      </Button>

      {/* Nút Xuất Excel */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={handleExport}
        disabled={isExporting || productCount === 0}
      >
        <Download className={`h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
        <span>
          {isExporting ? "Đang xử lý..." : "Xuất Excel"}
          {productCount > 0 && !isExporting && ` (${productCount})`}
        </span>
      </Button>

      {/* Menu dropdown thao tác khác */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            aria-label="Thao tác khác"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Phần tiêu đề menu */}
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            Thao tác khác
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Mục Thao tác hàng loạt */}
          <DropdownMenuItem onClick={onBulkAction} className="cursor-pointer">
            <Filter className="mr-2 h-4 w-4" />
            <span>Thao tác hàng loạt</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Các mục điều hướng */}
          <DropdownMenuItem asChild>
            <Link
              href="/products?low_stock=true"
              className="flex items-center cursor-pointer"
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Hàng sắp hết</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/products?is_active=false"
              className="flex items-center cursor-pointer"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              <span>Hàng đã ẩn</span>
            </Link>
          </DropdownMenuItem>

          {/* Thêm mục xem tất cả nếu cần */}
          <DropdownMenuItem asChild>
            <Link href="/products" className="flex items-center cursor-pointer">
              <span className="mr-2 h-4 w-4 flex items-center justify-center">
                📋
              </span>
              <span>Xem tất cả sản phẩm</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
