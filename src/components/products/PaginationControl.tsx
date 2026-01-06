// components/products/PaginationControl.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalCount: number;
  pageSize: number;
}

export function PaginationControl({ totalCount, pageSize }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-muted-foreground">
        Hiển thị {Math.min(totalCount, (currentPage - 1) * pageSize + 1)} -{" "}
        {Math.min(totalCount, currentPage * pageSize)} trong tổng số{" "}
        {totalCount} sản phẩm
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => router.push(createPageUrl(currentPage - 1))}
        >
          <ChevronLeft className="h-4 w-4" /> Trước
        </Button>

        <div className="text-sm font-medium">
          Trang {currentPage} / {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => router.push(createPageUrl(currentPage + 1))}
        >
          Sau <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
