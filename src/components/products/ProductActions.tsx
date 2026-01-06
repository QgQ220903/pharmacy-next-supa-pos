"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, FileDown, Filter, Download } from "lucide-react";
import Link from "next/link";

interface ProductActionsProps {
  onExport?: () => void;
  onBulkAction?: () => void;
}

export function ProductActions({
  onExport,
  onBulkAction,
}: ProductActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" className="h-9">
        <Link href="/products/new">
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Link>
      </Button>

      <Button variant="outline" size="sm" className="h-9" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Xuất Excel
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
          <DropdownMenuItem onClick={onBulkAction}>
            <Filter className="mr-2 h-4 w-4" />
            Thao tác hàng loạt
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/products?low_stock=true" className="cursor-pointer">
              Xem hàng sắp hết
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/products?is_active=false" className="cursor-pointer">
              Xem hàng đã ẩn
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
