// components/entries/EntriesClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StockEntry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  SlidersHorizontal,
  X,
  Eye,
  FileText,
  Calendar,
  Building,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getStockEntryDetailAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { EntryDetailsModal } from "./EntryDetailModel";

interface EntriesClientProps {
  initialEntries: (StockEntry & { item_count?: number })[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  initialSearch?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
}

export function EntriesClient({
  initialEntries,
  currentPage,
  totalPages,
  totalCount,
  initialSearch = "",
  initialDateFrom = "",
  initialDateTo = "",
}: EntriesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("page", "1");
      router.push(`/entries?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, dateFrom, dateTo, router]);

  const handleViewDetail = async (id: string) => {
    setLoadingId(id);
    const res = await getStockEntryDetailAction(id);
    if (res.success) {
      setSelectedEntry(res.data);
      setIsDetailOpen(true);
    } else {
      toast.error("Không thể tải chi tiết: " + res.message);
    }
    setLoadingId(null);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    params.set("page", newPage.toString());
    router.push(`/entries?${params.toString()}`);
  };

  const activeFilterCount = [dateFrom, dateTo].filter(Boolean).length;

  // Tính toán page numbers
  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters - Giống ProductFilters nhưng đơn giản hơn */}
        <Card className="border">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Lọc phiếu nhập</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>

              {(search || dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setDateFrom("");
                    setDateTo("");
                    router.push("/entries");
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Xóa lọc
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã phiếu, nhà cung cấp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 gap-1.5 text-xs"
              >
                <Calendar className="h-3.5 w-3.5" />
                Lọc theo ngày
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Date Inputs */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Từ ngày
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Đến ngày
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Result count - Giống products */}
            <div className="flex items-center justify-between text-sm pt-1 border-t">
              <span className="text-muted-foreground">Kết quả</span>
              <span className="font-medium">
                {totalCount.toLocaleString()} phiếu
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Table - Giống ProductsTable */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium">Danh sách phiếu nhập</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalCount} phiếu • Trang {currentPage}/{totalPages}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px]">Mã phiếu</TableHead>
                  <TableHead className="w-[120px]">Ngày nhập</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead className="text-right">Số SP</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-right w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialEntries.length > 0 ? (
                  initialEntries.map((entry) => {
                    const itemCount = entry.item_count || (entry as any).items?.length || 0;
                    
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm font-medium">
                              {entry.entry_code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(entry.entry_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {entry.supplier_name || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {itemCount}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(entry.total_amount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewDetail(entry.id)}
                                disabled={loadingId === entry.id}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-60 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium">
                          Không tìm thấy phiếu nhập
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {search || dateFrom || dateTo
                            ? "Thử thay đổi bộ lọc"
                            : "Chưa có phiếu nhập nào"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - Giống PaginationControl của products */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t bg-muted/10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
                {/* Thông tin kết quả */}
                <div className="text-sm text-muted-foreground order-2 lg:order-1">
                  <span className="font-medium text-foreground">{totalCount}</span> kết quả
                  <span className="mx-2">•</span>
                  Trang <span className="font-medium text-foreground">{currentPage}</span>/{totalPages}
                </div>

                {/* Phân trang */}
                <div className="hidden md:flex items-center gap-1 order-1 lg:order-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 mx-1">
                    {pageNumbers.map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 text-sm font-normal"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Phân trang mobile */}
                <div className="flex md:hidden items-center justify-between w-full order-1 lg:order-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    <span className="font-medium">{currentPage}</span>/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <EntryDetailsModal
          entry={selectedEntry}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedEntry(null);
          }}
        />
      </div>
    </TooltipProvider>
  );
}