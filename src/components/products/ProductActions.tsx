// app/components/products/ProductActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Download,
  Upload,
  History,
  BarChart3,
  Tag,
  AlertTriangle,
  Package,
  FileText,
  Printer,
  RefreshCw,
  Settings2,
  ClipboardList,
  TrendingUp,
  Layers,
  Truck,
  Eye,
  MoreVertical,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProductFilters } from "@/types";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  onImport?: (file: File) => Promise<void>;
  onBulkUpdate?: (data: any) => Promise<void>;
  onSync?: () => Promise<void>;
}

export function ProductActions({
  filters = {},
  productCount = 0,
  onExport,
  onImport,
  onBulkUpdate,
  onSync,
}: ProductActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkAction, setBulkAction] = useState<
    "price" | "stock" | "category" | null
  >(null);

  // Xử lý xuất Excel
  const handleExport = async () => {
    if (productCount === 0) {
      toast.warning("Không có sản phẩm để xuất", {
        description: "Vui lòng thêm sản phẩm trước khi xuất Excel",
      });
      return;
    }

    if (!onExport) {
      toast.error("Chức năng xuất Excel chưa được cấu hình");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Đang xuất file Excel...", {
      description: `Đang xử lý ${productCount} sản phẩm`,
    });

    try {
      const result = await onExport();

      if (!result.success || !result.data) {
        throw new Error(result.message || "Xuất Excel thất bại");
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

      toast.success("Xuất Excel thành công!", {
        id: toastId,
        description: `Đã tải xuống: ${result.data.filename}`,
      });
    } catch (error: any) {
      toast.error("Xuất Excel thất bại", {
        id: toastId,
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Xử lý import
  const handleImport = async () => {
    if (!selectedFile) {
      toast.warning("Vui lòng chọn file để import");
      return;
    }

    if (!onImport) {
      toast.error("Chức năng import chưa được cấu hình");
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("Đang import dữ liệu...");

    try {
      await onImport(selectedFile);
      toast.success("Import dữ liệu thành công!", {
        id: toastId,
        description: `Đã import ${selectedFile.name}`,
      });
      setShowImportDialog(false);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error("Import thất bại", {
        id: toastId,
        description: error.message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Xử lý đồng bộ
  const handleSync = async () => {
    if (!onSync) return;

    setIsSyncing(true);
    const toastId = toast.loading("Đang đồng bộ dữ liệu...");

    try {
      await onSync();
      toast.success("Đồng bộ thành công!", {
        id: toastId,
        description: "Dữ liệu sản phẩm đã được cập nhật",
      });
    } catch (error: any) {
      toast.error("Đồng bộ thất bại", {
        id: toastId,
        description: error.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Nhóm nút chính */}
        <div className="flex items-center gap-2">
          {/* Nút Thêm sản phẩm */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="default" className="h-9 gap-2 px-4">
                <Link href="/products/new">
                  <Plus className="h-4 w-4" />
                  <span>Thêm sản phẩm</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Thêm sản phẩm mới vào kho
            </TooltipContent>
          </Tooltip>

          {/* Nút Xuất Excel */}
          <Tooltip>
            <TooltipTrigger asChild>
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
                <span className="hidden sm:inline">
                  {isExporting ? "Đang xuất..." : "Xuất Excel"}
                </span>
                {productCount > 0 && !isExporting && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px]"
                  >
                    {productCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Xuất danh sách sản phẩm ra Excel
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Menu chính - Các chức năng quản lý kho */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Quản lý kho"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Quản lý kho & báo cáo</TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-72">
            {/* Header với thống kê nhanh */}
            <DropdownMenuLabel className="p-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Quản lý kho thuốc</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {productCount} sản phẩm •{" "}
                    {productCount > 0 ? "Đang hoạt động" : "Chưa có dữ liệu"}
                  </p>
                </div>
                <Badge variant="outline" className="bg-background">
                  v2.0
                </Badge>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* NHÓM 1: NHẬP/XUẤT DỮ LIỆU */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              NHẬP/XUẤT DỮ LIỆU
            </DropdownMenuLabel>

            <DropdownMenuGroup>
              {/* Import sản phẩm */}
              <DropdownMenuItem
                className="cursor-pointer py-2"
                onClick={() => setShowImportDialog(true)}
                disabled={!onImport}
              >
                <Upload className="mr-2 h-4 w-4 text-blue-500" />
                <div className="flex flex-col flex-1">
                  <span>Import sản phẩm</span>
                  <span className="text-xs text-muted-foreground">
                    Tải lên danh sách từ Excel
                  </span>
                </div>
                <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
              </DropdownMenuItem>

              {/* Đồng bộ dữ liệu */}
              <DropdownMenuItem
                className="cursor-pointer py-2"
                onClick={handleSync}
                disabled={!onSync || isSyncing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 text-green-500 ${isSyncing ? "animate-spin" : ""}`}
                />
                <div className="flex flex-col flex-1">
                  <span>Đồng bộ dữ liệu</span>
                  <span className="text-xs text-muted-foreground">
                    Cập nhật tồn kho từ hệ thống
                  </span>
                </div>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* NHÓM 2: BÁO CÁO & THỐNG KÊ */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              BÁO CÁO & THỐNG KÊ
            </DropdownMenuLabel>

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/reports/inventory" className="cursor-pointer py-2">
                  <ClipboardList className="mr-2 h-4 w-4 text-purple-500" />
                  <div className="flex flex-col flex-1">
                    <span>Báo cáo tồn kho</span>
                    <span className="text-xs text-muted-foreground">
                      Xem chi tiết số lượng, giá trị
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/reports/expiry" className="cursor-pointer py-2">
                  <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                  <div className="flex flex-col flex-1">
                    <span>Hàng sắp hết hạn</span>
                    <span className="text-xs text-muted-foreground">
                      Sản phẩm cần xử lý
                    </span>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">
                    3
                  </Badge>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/reports/top-selling"
                  className="cursor-pointer py-2"
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  <div className="flex flex-col flex-1">
                    <span>Top sản phẩm bán chạy</span>
                    <span className="text-xs text-muted-foreground">
                      Thống kê doanh số
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* NHÓM 3: QUẢN LÝ DANH MỤC */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              QUẢN LÝ DANH MỤC
            </DropdownMenuLabel>

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/categories" className="cursor-pointer py-2">
                  <Tag className="mr-2 h-4 w-4 text-indigo-500" />
                  <div className="flex flex-col flex-1">
                    <span>Danh mục sản phẩm</span>
                    <span className="text-xs text-muted-foreground">
                      Quản lý nhóm thuốc
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/suppliers" className="cursor-pointer py-2">
                  <Truck className="mr-2 h-4 w-4 text-cyan-500" />
                  <div className="flex flex-col flex-1">
                    <span>Nhà cung cấp</span>
                    <span className="text-xs text-muted-foreground">
                      Danh sách đối tác
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/batches" className="cursor-pointer py-2">
                  <Layers className="mr-2 h-4 w-4 text-orange-500" />
                  <div className="flex flex-col flex-1">
                    <span>Quản lý lô thuốc</span>
                    <span className="text-xs text-muted-foreground">
                      Theo dõi theo lô, hạn dùng
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* NHÓM 4: THAO TÁC NHANH */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              THAO TÁC NHANH
            </DropdownMenuLabel>

            <div className="grid grid-cols-2 gap-1 p-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start"
                asChild
              >
                <Link href="/products?low_stock=true">
                  <Package className="h-3 w-3 mr-1 text-amber-500" />
                  Sắp hết
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start"
                asChild
              >
                <Link href="/products?out_of_stock=true">
                  <XCircle className="h-3 w-3 mr-1 text-red-500" />
                  Hết hàng
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start"
                asChild
              >
                <Link href="/products?is_active=true">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                  Đang bán
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start"
                asChild
              >
                <Link href="/products?is_active=false">
                  <Eye className="h-3 w-3 mr-1 text-gray-500" />
                  Tạm ngừng
                </Link>
              </Button>
            </div>

            {/* Footer */}
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                asChild
              >
                <Link href="/products/settings">
                  <Settings2 className="h-3 w-3 mr-2" />
                  Cài đặt hiển thị kho
                </Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialog Import */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Import sản phẩm từ Excel
              </DialogTitle>
              <DialogDescription>
                Tải lên file Excel để thêm mới hoặc cập nhật danh sách sản phẩm.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Chọn file Excel</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="rounded-md bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Yêu cầu:</strong> File Excel phải có các cột: Mã SP,
                  Tên SP, Danh mục, Giá bán, Tồn kho tối thiểu.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <a
                  href="/templates/product-import-template.xlsx"
                  download
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Tải file mẫu
                </a>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang import...
                  </>
                ) : (
                  "Import dữ liệu"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
