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
} from "lucide-react";
import Link from "next/link";
import { toggleProductStatus } from "@/app/actions/products";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

interface ProductExt extends Product {
  product_batches: ProductBatch[];
  manage_by_batch: boolean;
}

export function ProductsTable({ products }: { products: ProductExt[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

const onToggle = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      // Gọi trực tiếp hàm đã import ở đầu file
      const res = await toggleProductStatus(id, newStatus); 
      
      if (res.success) {
        toast.success(`Đã ${newStatus ? 'kích hoạt' : 'tạm ngừng'} kinh doanh`);
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi bảo mật hoặc kết nối: " + error.message);
    }
};

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-card">
        <PackageSearch className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className={isDark ? "bg-muted/30" : "bg-muted/50"}>
          <TableRow>
            <TableHead className="w-[300px] font-semibold">
              Thông tin sản phẩm
            </TableHead>
            <TableHead className="font-semibold">Quản lý</TableHead>
            <TableHead className="text-center font-semibold">Tồn kho</TableHead>
            <TableHead className="text-right font-semibold">Giá bán</TableHead>
            <TableHead className="text-center font-semibold">Số lô</TableHead>
            <TableHead className="text-right font-semibold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow
              key={p.id}
              className={
                !p.is_active ? "opacity-70 hover:bg-muted/30" : "hover:bg-muted/30"
              }
            >
              {/* Thông tin sản phẩm */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {p.internal_code}
                  </div>
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
                        <Layers className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                        <span>Theo lô</span>
                      </>
                    ) : (
                      <>
                        <Box className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span>Tổng hợp</span>
                      </>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Tồn kho */}
              <TableCell className="text-center">
                <Badge
                  variant={
                    p.current_stock <= p.min_stock
                      ? "destructive"
                      : p.current_stock <= p.min_stock * 2
                      ? "outline"
                      : "secondary"
                  }
                  className="font-medium"
                >
                  {p.current_stock} {p.unit}
                </Badge>
                {p.current_stock <= p.min_stock && (
                  <div className="text-xs text-destructive mt-1 font-medium">
                    Dưới mức tối thiểu
                  </div>
                )}
              </TableCell>

              {/* Giá bán */}
              <TableCell className="text-right">
                <div className="font-semibold text-foreground">
                  {new Intl.NumberFormat("vi-VN").format(p.sale_price)} ₫
                </div>
              </TableCell>

              {/* Số lô */}
              <TableCell className="text-center">
                {p.manage_by_batch ? (
                  <div className="flex items-center justify-center">
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      {p.product_batches?.length || 0}
                    </span>
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
                  >
                    <Link href={`/products/${p.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onToggle(p.id, p.is_active)}>
                        {p.is_active ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2 text-muted-foreground" />
                            Tạm ngừng kinh doanh
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2 text-muted-foreground" />
                            Kích hoạt kinh doanh
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}