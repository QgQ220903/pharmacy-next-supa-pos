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
  CheckCircle2,
  XCircle,
  Package,
  Archive,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const onToggle = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await toggleProductStatus(id, newStatus);

      if (res.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                newStatus ? "bg-green-500 animate-pulse" : "bg-yellow-500",
              )}
            />
            <span>Đã {newStatus ? "kích hoạt" : "tạm ngừng"} kinh doanh</span>
          </div>,
          {
            description: `Sản phẩm đã được cập nhật trạng thái thành công`,
          },
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
      toast.success("Đã sao chép mã sản phẩm", {
        description: `Mã: ${text}`,
        icon: <Copy className="h-4 w-4" />,
      });
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
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Xóa sản phẩm thành công</span>
          </div>,
          {
            description: `"${productToDelete.name}" đã được xóa khỏi hệ thống`,
          },
        );
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

  const getStockStatus = (current: number, min: number) => {
    if (current === 0)
      return {
        variant: "destructive" as const,
        label: "Hết hàng",
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        progress: 0,
      };
    if (current <= min)
      return {
        variant: "destructive" as const,
        label: "Sắp hết",
        icon: AlertTriangle,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        progress: (current / min) * 50,
      };
    if (current <= min * 2)
      return {
        variant: "outline" as const,
        label: "Thấp",
        icon: TrendingDown,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        progress: ((current - min) / min) * 50 + 50,
      };
    return {
      variant: "secondary" as const,
      label: "Đủ",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      progress: 100,
    };
  };

  const getProfitMargin = (cost: number, sale: number) => {
    if (!cost || !sale) return null;
    const margin = ((sale - cost) / sale) * 100;
    return margin.toFixed(1);
  };

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-dashed border-2 bg-gradient-to-b from-background to-muted/20">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6"
            >
              <PackageSearch className="h-10 w-10 text-primary/40" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border bg-card shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-semibold text-sm py-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Thông tin sản phẩm
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Quản lý
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Archive className="h-4 w-4 text-primary" />
                    Tồn kho
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Giá bán
                  </div>
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
              <AnimatePresence>
                {products.map((p, index) => {
                  const stockStatus = getStockStatus(
                    p.current_stock,
                    p.min_stock,
                  );
                  const StatusIcon = stockStatus.icon;
                  const isDeleting = deletingId === p.id;
                  const isHovered = hoveredRow === p.id;
                  const profitMargin = getProfitMargin(
                    p.cost_price || 0,
                    p.sale_price,
                  );

                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onHoverStart={() => setHoveredRow(p.id)}
                      onHoverEnd={() => setHoveredRow(null)}
                      className={cn(
                        "group relative transition-all duration-200",
                        !p.is_active && "opacity-60",
                        isHovered && "bg-muted/30 shadow-sm",
                        "border-b last:border-0",
                      )}
                    >
                      {/* Thông tin sản phẩm */}
                      <TableCell className="py-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <motion.div
                              animate={
                                isHovered ? { scale: 1.05 } : { scale: 1 }
                              }
                              className={cn(
                                "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm",
                                p.is_active
                                  ? "from-primary/20 to-primary/5 text-primary"
                                  : "from-muted to-muted/50 text-muted-foreground",
                              )}
                            >
                              <Package className="h-5 w-5" />
                            </motion.div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {p.name}
                                </h3>
                                {!p.is_active && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Ngừng bán
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(p.internal_code, p.id)
                                      }
                                      className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group/copy"
                                    >
                                      <code className="px-1.5 py-0.5 rounded bg-muted/50">
                                        {p.internal_code}
                                      </code>
                                      {copiedId === p.id ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-500 animate-in zoom-in" />
                                      ) : (
                                        <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    Sao chép mã sản phẩm
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                          {p.barcode && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="text-[10px] uppercase">
                                Barcode:
                              </span>
                              <code className="px-1 py-0.5 rounded bg-muted/30">
                                {p.barcode}
                              </code>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Quản lý */}
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge
                            variant="secondary"
                            className="w-fit text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
                          >
                            {p.category || "Chưa phân loại"}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {p.manage_by_batch ? (
                              <>
                                <Layers className="h-3 w-3 text-violet-500" />
                                <span className="font-mono">Theo lô</span>
                              </>
                            ) : (
                              <>
                                <Box className="h-3 w-3 text-blue-500" />
                                <span className="font-mono">Tổng hợp</span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Tồn kho */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative inline-flex">
                            <Badge
                              variant={stockStatus.variant}
                              className={cn(
                                "font-medium px-3 py-1 gap-1",
                                stockStatus.variant === "destructive" &&
                                  "animate-pulse",
                              )}
                            >
                              <StatusIcon
                                className={cn("h-3 w-3", stockStatus.color)}
                              />
                              {p.current_stock} {p.unit}
                            </Badge>
                          </div>

                          {/* Progress bar */}
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stockStatus.progress}%` }}
                              transition={{ duration: 0.5 }}
                              className={cn(
                                "h-full rounded-full",
                                stockStatus.variant === "destructive"
                                  ? "bg-destructive"
                                  : stockStatus.variant === "outline"
                                    ? "bg-yellow-500"
                                    : "bg-green-500",
                              )}
                            />
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Tối thiểu: {p.min_stock} {p.unit}
                          </div>
                        </div>
                      </TableCell>

                      {/* Giá bán */}
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            {new Intl.NumberFormat("vi-VN").format(
                              p.sale_price,
                            )}{" "}
                            ₫
                          </div>
                          {p.cost_price && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground cursor-help">
                                  Giá vốn:{" "}
                                  {new Intl.NumberFormat("vi-VN").format(
                                    p.cost_price,
                                  )}{" "}
                                  ₫
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <div className="space-y-1">
                                  <p>Lợi nhuận: {profitMargin}%</p>
                                  <p className="text-[10px]">
                                    Chưa bao gồm VAT
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>

                      {/* Số lô */}
                      <TableCell className="text-center">
                        {p.manage_by_batch ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="flex items-center justify-center"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                  <span className="font-semibold text-sm">
                                    {p.product_batches?.length || 0}
                                  </span>
                                </div>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Số lô đang có: {p.product_batches?.length || 0}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell className="text-right">
                        <motion.div
                          animate={
                            isHovered ? { opacity: 1 } : { opacity: 0.7 }
                          }
                          className="flex items-center justify-end gap-1"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                                asChild
                              >
                                <Link href={`/products/${p.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                                asChild
                              >
                                <Link href={`/products/${p.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Chỉnh sửa</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-8 w-8 transition-all",
                                  p.is_active
                                    ? "hover:bg-yellow-500/10 hover:text-yellow-600"
                                    : "hover:bg-green-500/10 hover:text-green-600",
                                )}
                                onClick={() => onToggle(p.id, p.is_active)}
                              >
                                {p.is_active ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {p.is_active
                                ? "Tạm ngừng kinh doanh"
                                : "Kích hoạt kinh doanh"}
                            </TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Tùy chọn</TooltipContent>
                            </Tooltip>

                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Tùy chọn nâng cao
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => onToggle(p.id, p.is_active)}
                                className="cursor-pointer"
                              >
                                {p.is_active ? (
                                  <>
                                    <PowerOff className="h-4 w-4 mr-2 text-yellow-600" />
                                    <span>Tạm ngừng kinh doanh</span>
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4 mr-2 text-green-600" />
                                    <span>Kích hoạt kinh doanh</span>
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(p.id, p.name)}
                                disabled={isDeleting}
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                {isDeleting ? (
                                  <>
                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                    <span>Đang xóa...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    <span>Xóa sản phẩm</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* AlertDialog cho xóa sản phẩm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <span>Xác nhận xóa sản phẩm</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4">
              Bạn sắp xóa sản phẩm{" "}
              <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                "{productToDelete?.name}"
              </span>
              .
              <div className="mt-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-destructive text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  ⚠️ Hành động này không thể hoàn tác
                </p>
                <ul className="mt-3 text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-destructive/50" />
                    Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-destructive/50" />
                    Không thể khôi phục sau khi xóa
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deletingId !== null}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deletingId ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Xác nhận xóa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
