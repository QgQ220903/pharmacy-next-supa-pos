// "use client";
// import { Button } from "@/components/ui/button";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { cn } from "@/lib/utils";

// export function PaginationControl({
//   totalCount,
//   pageSize,
// }: {
//   totalCount: number;
//   pageSize: number;
// }) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const currentPage = Number(searchParams.get("page")) || 1;
//   const totalPages = Math.ceil(totalCount / pageSize);

//   const onPageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", page.toString());
//     router.push(`?${params.toString()}`);
//   };

//   const getPageNumbers = (): (number | string)[] => {
//     const pages: (number | string)[] = [];
//     const maxVisiblePages = 7;
//     const ellipsis = "...";

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//       return pages;
//     }

//     let startPage = Math.max(2, currentPage - 1);
//     let endPage = Math.min(totalPages - 1, currentPage + 1);

//     if (currentPage <= 3) {
//       startPage = 2;
//       endPage = 4;
//     } else if (currentPage >= totalPages - 2) {
//       startPage = totalPages - 3;
//       endPage = totalPages - 1;
//     }

//     pages.push(1);

//     if (startPage > 2) {
//       pages.push(ellipsis);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     if (endPage < totalPages - 1) {
//       pages.push(ellipsis);
//     }

//     pages.push(totalPages);

//     return pages;
//   };

//   if (totalPages <= 1) return null;

//   const pageNumbers = getPageNumbers();

//   return (
//     <div className="flex items-center justify-between">
//       <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
//         Trang {currentPage} / {totalPages}
//       </div>
//       <div className="flex items-center gap-2">
//         <Button
//           variant="outline"
//           size="sm"
//           className="h-8 w-8 p-0"
//           disabled={currentPage <= 1}
//           onClick={() => onPageChange(currentPage - 1)}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>

//         <div className="flex items-center gap-1">
//           {pageNumbers.map((page, index) => {
//             if (page === "...") {
//               return (
//                 <span
//                   key={`ellipsis-${index}`}
//                   className="h-8 w-8 flex items-center justify-center text-muted-foreground"
//                 >
//                   ...
//                 </span>
//               );
//             }

//             return (
//               <Button
//                 key={`page-${page}`}
//                 variant={currentPage === page ? "default" : "outline"}
//                 size="sm"
//                 className={cn(
//                   "h-8 w-8 p-0 min-w-8 font-medium",
//                   currentPage === page && "bg-primary text-primary-foreground",
//                 )}
//                 onClick={() => onPageChange(page as number)}
//               >
//                 {page}
//               </Button>
//             );
//           })}
//         </div>

//         <Button
//           variant="outline"
//           size="sm"
//           className="h-8 w-8 p-0"
//           disabled={currentPage >= totalPages}
//           onClick={() => onPageChange(currentPage + 1)}
//         >
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }

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
    const maxVisiblePages = 7;
    const ellipsis = "...";

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages - 1;
    }

    pages.push(1);

    if (startPage > 2) {
      pages.push(ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push(ellipsis);
    }

    pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Trang {currentPage} / {totalPages} • {totalCount} kết quả
      </div>

      <div className="flex items-center gap-1">
        {/* Nút về trang đầu - Disabled state vẫn dùng button */}
        {currentPage <= 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hidden sm:flex"
            disabled
            title="Đầu trang"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Link
            href={createPageUrl(1)}
            prefetch={true}
            className="hidden sm:flex"
            title="Đầu trang"
          >
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Nút trang trước */}
        {currentPage <= 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Link
            href={createPageUrl(currentPage - 1)}
            prefetch={true}
            title="Trang trước"
          >
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Hiển thị các số trang */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground"
                >
                  ...
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
                title={`Trang ${pageNumber}`}
              >
                <Button
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 min-w-8 font-medium",
                    isCurrentPage && "bg-primary text-primary-foreground",
                  )}
                >
                  {pageNumber}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Nút trang sau */}
        {currentPage >= totalPages ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Link
            href={createPageUrl(currentPage + 1)}
            prefetch={true}
            title="Trang sau"
          >
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Nút đến trang cuối */}
        {currentPage >= totalPages ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hidden sm:flex"
            disabled
            title="Cuối trang"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        ) : (
          <Link
            href={createPageUrl(totalPages)}
            prefetch={true}
            className="hidden sm:flex"
            title="Cuối trang"
          >
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Input nhảy trang - Vẫn dùng router.push vì cần xử lý onKeyDown/onBlur */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Đến trang:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="1"
            max={totalPages}
            defaultValue={currentPage}
            className="w-16 h-8 border border-input rounded-md px-2 text-sm text-center"
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
