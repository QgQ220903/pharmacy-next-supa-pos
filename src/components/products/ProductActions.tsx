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
import { MoreVertical, Plus, FileDown, Filter } from "lucide-react";
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
      <Button asChild>
        <Link href="/products/new">
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
          <DropdownMenuItem onClick={onExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Xuất Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBulkAction}>
            <Filter className="mr-2 h-4 w-4" />
            Thao tác hàng loạt
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/products?filter=low_stock">Xem hàng sắp hết</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/products?filter=inactive">Xem hàng đã ẩn</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
