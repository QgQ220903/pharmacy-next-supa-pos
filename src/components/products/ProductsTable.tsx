"use client";

import { Product } from "@/types"; // Chỉ import Product, không cần ProductBatch
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Power,
  PowerOff,
  Package,
  Layers,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
  Copy,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  toggleProductStatus,
  deleteProductAction,
} from "@/app/actions/products";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { cn, formatPrice, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Không cần interface ProductExt nữa
export function ProductsTable({ products }: { products: Product[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const onToggle = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await toggleProductStatus(id, newStatus);

      if (res.success) {
        toast.success(
          newStatus ? "Đã kích hoạt sản phẩm" : "Đã tạm ngừng sản phẩm"
        );
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Đã sao chép mã sản phẩm");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Không thể sao chép");
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      const res = await deleteProductAction(productToDelete.id);

      if (res.success) {
        toast.success("Xóa sản phẩm thành công");
      } else {
        toast.error(res.message || "Xóa sản phẩm thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: "Hết hàng", variant: "destructive" as const };
    if (current <= min) return { label: "Sắp hết", variant: "destructive" as const };
    if (current <= min * 2) return { label: "Thấp", variant: "warning" as const };
    return { label: "Đủ", variant: "default" as const };
  };

  if (products.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[300px]">Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-center">Tồn kho</TableHead>
                <TableHead className="text-right">Giá bán</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const stockStatus = getStockStatus(p.current_stock || 0, p.min_stock);
                const isDeleting = deletingId === p.id;
                const batchCount = p.product_batches?.length || 0;

                return (
                  <TableRow key={p.id} className={cn(!p.is_active && "opacity-60")}>
                    {/* Sản phẩm */}
                    <TableCell className="py-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                          p.is_active 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/products/${p.id}`}
                              className="font-medium hover:text-primary hover:underline truncate"
                            >
                              {p.name}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <button
                              onClick={() => copyToClipboard(p.internal_code, p.id)}
                              className="flex items-center gap-1 hover:text-primary group"
                            >
                              <code className="px-1 py-0.5 rounded bg-muted">
                                {p.internal_code}
                              </code>
                              {copiedId === p.id ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                            {p.barcode && (
                              <span className="text-muted-foreground/60">
                                • {p.barcode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Danh mục */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {p.category || "Chưa phân loại"}
                      </Badge>
                    </TableCell>

                    {/* Tồn kho */}
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <Badge variant={stockStatus.variant} className="font-mono">
                          {formatNumber(p.current_stock || 0)} {p.base_unit}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Tối thiểu: {formatNumber(p.min_stock)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Giá bán */}
                    <TableCell className="text-right font-mono">
                      {formatPrice(p.sale_price)}
                      {p.cost_price ? (
                        <div className="text-xs text-muted-foreground">
                          Vốn: {formatPrice(p.cost_price)}
                        </div>
                      ) : null}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge 
                          variant={p.is_active ? "default" : "secondary"}
                          className="w-fit"
                        >
                          {p.is_active ? "Đang bán" : "Ngừng bán"}
                        </Badge>
                        {p.manage_by_batch && batchCount > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                                <Layers className="h-3 w-3" />
                                <span>{batchCount} lô</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Số lô đang có: {batchCount}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/products/${p.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/products/${p.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Chỉnh sửa</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => onToggle(p.id, p.is_active)}
                              className="cursor-pointer"
                            >
                              {p.is_active ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Tạm ngừng
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Kích hoạt
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(p.id, p.name)}
                              disabled={isDeleting}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              {isDeleting ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                  Đang xóa...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* AlertDialog cho xóa sản phẩm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <span className="font-semibold">"{productToDelete?.name}"</span>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingId ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}