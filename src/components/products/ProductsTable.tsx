"use client";

import { Product, ProductBatch } from "@/types";
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
  PackageSearch,
  Layers,
  Box,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
  Copy,
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
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
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
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ProductExt extends Product {
  product_batches: ProductBatch[];
  manage_by_batch: boolean;
}

export function ProductsTable({ products }: { products: ProductExt[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const onToggle = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await toggleProductStatus(id, newStatus);

      if (res.success) {
        toast.success(`Đã ${newStatus ? "kích hoạt" : "tạm ngừng"} kinh doanh`);
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  // Sao chép mã sản phẩm
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép mã sản phẩm", {
        description: `Mã: ${text}`,
      });
    } catch (err) {
      toast.error("Không thể sao chép");
    }
  };

  // Mở dialog xóa
  const openDeleteDialog = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  // Xác nhận xóa
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      const res = await deleteProductAction(productToDelete.id);

      if (res.success) {
        toast.success(`Đã xóa sản phẩm "${productToDelete.name}" thành công`);
      } else {
        toast.error(res.message || "Xóa sản phẩm thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi khi xóa sản phẩm: " + error.message);
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Tính toán trạng thái tồn kho
  const getStockStatus = (current: number, min: number) => {
    if (current === 0)
      return { variant: "destructive" as const, label: "Hết hàng" };
    if (current <= min)
      return { variant: "destructive" as const, label: "Sắp hết" };
    if (current <= min * 2)
      return { variant: "outline" as const, label: "Thấp" };
    return { variant: "secondary" as const, label: "Đủ" };
  };

  if (products.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <PackageSearch className="h-12 w-12 text-muted-foreground/60 mb-4" />
          <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader
              className={cn(isDark ? "bg-muted/30" : "bg-muted/40", "border-b")}
            >
              <TableRow>
                <TableHead className="w-[300px] font-semibold text-sm">
                  Thông tin sản phẩm
                </TableHead>
                <TableHead className="font-semibold text-sm">Quản lý</TableHead>
                <TableHead className="text-center font-semibold text-sm">
                  Tồn kho
                </TableHead>
                <TableHead className="text-right font-semibold text-sm">
                  Giá bán
                </TableHead>
                <TableHead className="text-center font-semibold text-sm">
                  Số lô
                </TableHead>
                <TableHead className="text-right font-semibold text-sm">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const stockStatus = getStockStatus(
                  p.current_stock,
                  p.min_stock,
                );
                const isDeleting = deletingId === p.id;

                return (
                  <TableRow
                    key={p.id}
                    className={cn(
                      !p.is_active && "opacity-60",
                      "border-b hover:bg-muted/20",
                    )}
                  >
                    {/* Thông tin sản phẩm */}
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">
                                {p.name}
                              </h3>
                              {!p.is_active && (
                                <Badge variant="outline" className="text-xs">
                                  Ngừng bán
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(p.internal_code)}
                                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                              >
                                {p.internal_code}
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {p.barcode && (
                          <div className="text-xs text-muted-foreground">
                            Barcode: {p.barcode}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Quản lý */}
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs font-medium"
                        >
                          {p.category || "Chưa phân loại"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {p.manage_by_batch ? (
                            <>
                              <Layers className="h-3 w-3 text-violet-600" />
                              <span>Theo lô</span>
                            </>
                          ) : (
                            <>
                              <Box className="h-3 w-3 text-blue-600" />
                              <span>Tổng hợp</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Tồn kho */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant={stockStatus.variant}
                          className={cn(
                            "font-medium",
                            stockStatus.variant === "destructive" &&
                              "animate-pulse",
                          )}
                        >
                          {stockStatus.variant === "destructive" && (
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                          )}
                          {p.current_stock} {p.unit}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Tối thiểu: {p.min_stock} {p.unit}
                        </div>
                      </div>
                    </TableCell>

                    {/* Giá bán */}
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          {new Intl.NumberFormat("vi-VN").format(p.sale_price)}{" "}
                          ₫
                        </div>
                        {p.cost_price && (
                          <div className="text-xs text-muted-foreground">
                            Giá vốn:{" "}
                            {new Intl.NumberFormat("vi-VN").format(
                              p.cost_price,
                            )}{" "}
                            ₫
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Số lô */}
                    <TableCell className="text-center">
                      {p.manage_by_batch ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700">
                            <span className="font-medium">
                              {p.product_batches?.length || 0}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                          title="Xem chi tiết"
                        >
                          <Link href={`/products/${p.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                          title="Chỉnh sửa"
                        >
                          <Link href={`/products/${p.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onToggle(p.id, p.is_active)}
                          title={p.is_active ? "Tạm ngừng" : "Kích hoạt"}
                        >
                          {p.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Tùy chọn"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                              Tùy chọn
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => onToggle(p.id, p.is_active)}
                            >
                              {p.is_active ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Tạm ngừng kinh doanh
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Kích hoạt kinh doanh
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(p.id, p.name)}
                              disabled={isDeleting}
                              className="text-destructive"
                            >
                              {isDeleting ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Đang xóa...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa sản phẩm
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
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xác nhận xóa sản phẩm
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4">
              Bạn sắp xóa sản phẩm{" "}
              <span className="font-semibold text-foreground">
                "{productToDelete?.name}"
              </span>
              .
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                <p className="text-destructive text-sm font-medium">
                  ⚠️ Hành động này không thể hoàn tác.
                </p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>• Tất cả dữ liệu liên quan sẽ bị xóa</li>
                  <li>• Không thể khôi phục sau khi xóa</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang xóa...
                </>
              ) : (
                "Xác nhận xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
