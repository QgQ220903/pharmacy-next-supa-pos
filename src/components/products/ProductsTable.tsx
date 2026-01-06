"use client";
import { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCcw, Trash2, Eye, Package, Plus } from "lucide-react";
import { deleteProduct, restoreProduct } from "@/app/actions/products";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";

export function ProductsTable({ products }: { products: Product[] }) {
  const handleToggleActive = async (id: string, active: boolean) => {
    const ok = active ? await deleteProduct(id) : await restoreProduct(id);
    if (ok) toast.success(active ? "Đã ngừng kinh doanh" : "Đã kích hoạt lại");
  };

  if (products.length === 0) {
    return (
      <div className="border border-dashed bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm đầu tiên
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
              <TableHead className="font-semibold min-w-[200px]">
                Tên thuốc / Mã
              </TableHead>
              <TableHead className="font-semibold min-w-[120px]">
                Danh mục
              </TableHead>
              <TableHead className="font-semibold min-w-[120px]">
                Đơn vị
              </TableHead>
              <TableHead className="font-semibold min-w-[120px] text-right">
                Giá bán
              </TableHead>
              <TableHead className="font-semibold min-w-[120px] text-center">
                Tồn kho
              </TableHead>
              <TableHead className="font-semibold min-w-[120px] text-center">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold min-w-[140px] text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className={`transition-colors ${
                  !product.is_active
                    ? "bg-muted/30 opacity-60"
                    : "hover:bg-muted/20"
                }`}
              >
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground line-clamp-1">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {product.internal_code}
                      </code>
                      {product.barcode && (
                        <span className="text-xs text-muted-foreground">
                          • 📷 {product.barcode}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {product.category ? (
                      <Badge variant="secondary" className="font-normal">
                        {product.category}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        —
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-foreground">
                    {product.unit}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-semibold text-foreground">
                    {formatPrice(product.sale_price)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Badge
                      variant={
                        product.current_stock === 0
                          ? "destructive"
                          : product.current_stock <= product.min_stock
                          ? "warning"
                          : "secondary"
                      }
                      className="font-medium"
                    >
                      {product.current_stock} {product.unit}
                    </Badge>
                    {product.max_stock && (
                      <span className="text-xs text-muted-foreground">
                        Tối đa: {product.max_stock}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Badge
                      variant={product.is_active ? "success" : "destructive"}
                      className="font-medium"
                    >
                      {product.is_active ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                    {!product.can_sell && (
                      <Badge variant="outline" className="text-xs">
                        Không bán
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/products/${product.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Xem chi tiết</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/products/${product.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Chỉnh sửa</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleActive(product.id, product.is_active)
                            }
                            className={`h-8 w-8 ${
                              product.is_active
                                ? "hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                : "hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            }`}
                          >
                            {product.is_active ? (
                              <Trash2 className="h-4 w-4" />
                            ) : (
                              <RefreshCcw className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {product.is_active
                              ? "Ngừng kinh doanh"
                              : "Kích hoạt lại"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
