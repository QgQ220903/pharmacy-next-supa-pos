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
} from "lucide-react";
import Link from "next/link";
import { toggleProductStatus } from "@/app/actions/products";
import { toast } from "sonner";

interface ProductExt extends Product {
  product_batches: ProductBatch[];
  manage_by_batch: boolean; // Cột mới thêm vào DB
}

export function ProductsTable({ products }: { products: ProductExt[] }) {
  const onToggle = async (id: string, status: boolean) => {
    const res = await toggleProductStatus(id, status);
    if (res.success) toast.success("Đã cập nhật trạng thái kinh doanh");
  };

  if (products.length === 0)
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <p className="mt-2 text-muted-foreground">Chưa có sản phẩm nào.</p>
      </div>
    );

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[300px]">Thông tin thuốc</TableHead>
            <TableHead>Quản lý</TableHead>
            <TableHead className="text-center">Tồn kho</TableHead>
            <TableHead className="text-right">Giá bán</TableHead>
            <TableHead className="text-center">Số lô</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow
              key={p.id}
              className={!p.is_active ? "opacity-60 grayscale" : ""}
            >
              <TableCell>
                <div className="font-bold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {p.internal_code}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="w-fit">
                    {p.category || "N/A"}
                  </Badge>
                  <span className="text-[10px] flex items-center gap-1 font-medium text-slate-500">
                    {p.manage_by_batch ? (
                      <>
                        <Layers className="h-3 w-3 text-purple-500" /> Theo lô
                      </>
                    ) : (
                      <>
                        <Box className="h-3 w-3 text-blue-500" /> Tổng hợp
                      </>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    p.current_stock <= p.min_stock ? "destructive" : "secondary"
                  }
                >
                  {p.current_stock} {p.unit}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                {new Intl.NumberFormat("vi-VN").format(p.sale_price)} đ
              </TableCell>
              <TableCell className="text-center">
                {p.manage_by_batch ? (
                  <span className="text-sm font-semibold text-blue-600 underline">
                    {p.product_batches?.length || 0}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    N/A
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/products/${p.id}`}>
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/products/${p.id}/edit`}>
                    <Edit className="h-4 w-4 text-amber-600" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggle(p.id, p.is_active)}
                >
                  {p.is_active ? (
                    <Power className="h-4 w-4 text-red-600" />
                  ) : (
                    <PowerOff className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
