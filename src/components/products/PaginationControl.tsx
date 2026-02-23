"use client";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PaginationControl({
  totalCount,
  pageSize,
}: {
  totalCount: number;
  pageSize: number;
}) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Hàm tạo URL với page param
  const createPageUrl = (pageNumber: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  // Hàm helper tạo mảng trang cần hiển thị
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const ellipsis = "...";

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Luôn hiển thị trang 1, trang cuối, và 3 trang xung quanh current
    if (currentPage <= 3) {
      // Gần đầu: 1,2,3,4,...,last
      pages.push(1, 2, 3, 4);
      if (totalPages > 5) pages.push(ellipsis);
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Gần cuối: 1,..., last-3, last-2, last-1, last
      pages.push(1);
      if (totalPages > 5) pages.push(ellipsis);
      pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Ở giữa: 1,..., current-1, current, current+1,..., last
      pages.push(1);
      pages.push(ellipsis);
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push(ellipsis);
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
      {/* Thông tin kết quả */}
      <div className="text-sm text-muted-foreground order-2 lg:order-1">
        <span className="font-medium text-foreground">{totalCount}</span> kết
        quả
        <span className="mx-2">•</span>
        Trang <span className="font-medium text-foreground">{currentPage}</span>
        /{totalPages}
      </div>

      {/* Phân trang - Desktop */}
      <div className="hidden md:flex items-center gap-1 order-1 lg:order-2">
        {/* Nút về đầu */}
        <Link
          href={createPageUrl(1)}
          prefetch={true}
          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </Link>

        {/* Nút lùi */}
        <Link
          href={createPageUrl(currentPage - 1)}
          prefetch={true}
          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>

        {/* Số trang */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-sm text-muted-foreground"
                >
                  ⋯
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = currentPage === pageNumber;

            return (
              <Link
                key={`page-${pageNumber}`}
                href={createPageUrl(pageNumber)}
                prefetch={true}
              >
                <Button
                  variant={isCurrentPage ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-sm font-normal",
                    isCurrentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {pageNumber}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Nút tiến */}
        <Link
          href={createPageUrl(currentPage + 1)}
          prefetch={true}
          className={cn(
            currentPage >= totalPages && "pointer-events-none opacity-50",
          )}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>

        {/* Nút cuối */}
        <Link
          href={createPageUrl(totalPages)}
          prefetch={true}
          className={cn(
            currentPage >= totalPages && "pointer-events-none opacity-50",
          )}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Phân trang - Mobile */}
      <div className="flex md:hidden items-center justify-between w-full order-1 lg:order-2">
        <Link
          href={createPageUrl(1)}
          prefetch={true}
          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </Link>

        <Link
          href={createPageUrl(currentPage - 1)}
          prefetch={true}
          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>

        <span className="text-sm">
          <span className="font-medium">{currentPage}</span>/{totalPages}
        </span>

        <Link
          href={createPageUrl(currentPage + 1)}
          prefetch={true}
          className={cn(
            currentPage >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link
          href={createPageUrl(totalPages)}
          prefetch={true}
          className={cn(
            currentPage >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Input nhảy trang - Desktop */}
      <div className="hidden lg:flex items-center gap-2 order-3">
        <span className="text-sm text-muted-foreground">Đến trang:</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            className="w-16 h-8 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const page = Math.max(
                  1,
                  Math.min(totalPages, parseInt(target.value) || 1),
                );
                if (page !== currentPage) {
                  window.location.href = createPageUrl(page);
                }
              }
            }}
            onBlur={(e) => {
              const page = Math.max(
                1,
                Math.min(totalPages, parseInt(e.target.value) || 1),
              );
              if (page !== currentPage) {
                window.location.href = createPageUrl(page);
              }
            }}
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>
      </div>
    </div>
  );
}
