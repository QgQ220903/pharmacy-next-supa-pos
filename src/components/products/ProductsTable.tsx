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
import { Edit, RefreshCcw, Trash2, Eye, Package } from "lucide-react";
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

export function ProductsTable({ products }: { products: Product[] }) {
  const handleToggleActive = async (id: string, active: boolean) => {
    const ok = active ? await deleteProduct(id) : await restoreProduct(id);
    if (ok) toast.success(active ? "Đã ngừng kinh doanh" : "Đã kích hoạt lại");
  };

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-sm text-muted-foreground">
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
            <TableHead className="font-semibold">Tên thuốc / Mã</TableHead>
            <TableHead className="font-semibold">Danh mục</TableHead>
            <TableHead className="text-right font-semibold">Giá bán</TableHead>
            <TableHead className="text-center font-semibold">Tồn kho</TableHead>
            <TableHead className="text-center font-semibold">
              Trạng thái
            </TableHead>
            <TableHead className="text-right font-semibold">Thao tác</TableHead>
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
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                        {product.internal_code}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-foreground">
                  {product.category || (
                    <span className="text-muted-foreground italic">
                      Chưa phân loại
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-semibold text-foreground">
                  {product.sale_price.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-0.5">₫</span>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    product.current_stock <= product.min_stock
                      ? "destructive"
                      : "secondary"
                  }
                  className="font-medium"
                >
                  {product.current_stock} {product.unit}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={`font-medium ${
                    product.is_active
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      product.is_active
                        ? "bg-emerald-500"
                        : "bg-muted-foreground"
                    }`}
                  />
                  {product.is_active ? "Đang bán" : "Ngừng bán"}
                </Badge>
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
                              : "hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
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
  );
}
