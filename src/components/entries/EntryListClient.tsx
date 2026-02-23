"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Package,
  Calendar,
  Building,
  FileText,
  CheckCircle,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cancelStockEntryAction,
  getStockEntryDetailAction,
} from "@/app/actions/inventory";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EntryDetailsModal } from "./EntryDetailModel";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface EntryListClientProps {
  initialEntries: any[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  initialSearch?: string;
  initialStatus?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
}

export default function EntryListClient({
  initialEntries,
  currentPage,
  totalPages,
  totalCount,
  initialSearch = "",
  initialStatus = "all",
  initialDateFrom = "",
  initialDateTo = "",
}: EntryListClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [entries, setEntries] = useState(initialEntries);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("page", "1");
      router.push(`/entries?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, dateFrom, dateTo, router]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        entry.entry_code.toLowerCase().includes(search.toLowerCase()) ||
        (entry.supplier &&
          entry.supplier.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        statusFilter === "all" || entry.status === statusFilter;
      const entryDate = new Date(entry.entry_date).setHours(0, 0, 0, 0);
      const matchDateFrom =
        !dateFrom || entryDate >= new Date(dateFrom).setHours(0, 0, 0, 0);
      const matchDateTo =
        !dateTo || entryDate <= new Date(dateTo).setHours(23, 59, 59, 999);
      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [search, entries, statusFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    params.set("page", newPage.toString());
    router.push(`/entries?${params.toString()}`);
  };

  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    const res = await getStockEntryDetailAction(id);
    if (res.success) {
      setSelectedEntry(res.data);
      setIsDetailOpen(true);
    } else {
      toast.error("Không thể tải chi tiết: " + res.message);
    }
    setLoadingDetail(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Xác nhận hủy phiếu nhập?")) return;
    const res = await cancelStockEntryAction(id);
    if (res.success) {
      toast.success("Đã hủy phiếu thành công");
      setEntries(
        entries.map((e) => (e.id === id ? { ...e, status: "cancelled" } : e)),
      );
    } else {
      toast.error(res.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border-0"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <X className="h-3 w-3" />
            Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-400 border-0"
          >
            Chờ xử lý
          </Badge>
        );
    }
  };

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, maxVisiblePages);
      } else {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  }, [currentPage, totalPages]);

  const activeFilterCount = [
    statusFilter !== "all" ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (!mounted) return null;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters Section - Giống ProductFilters */}
        <Card className="border shadow-sm">
          <div className="p-4 space-y-4">
            {/* Search và Filter Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo mã phiếu, nhà cung cấp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9 gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Lọc nâng cao</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Trạng thái
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Từ ngày
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-8 text-sm"
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
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Active Filters Tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
                    <span>
                      Trạng thái:{" "}
                      {statusFilter === "completed"
                        ? "Hoàn thành"
                        : statusFilter === "cancelled"
                          ? "Đã hủy"
                          : "Chờ xử lý"}
                    </span>
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {dateFrom && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
                    <span>
                      Từ: {new Date(dateFrom).toLocaleDateString("vi-VN")}
                    </span>
                    <button
                      onClick={() => setDateFrom("")}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {dateTo && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
                    <span>
                      Đến: {new Date(dateTo).toLocaleDateString("vi-VN")}
                    </span>
                    <button
                      onClick={() => setDateTo("")}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Table - Giống ProductsTable */}
        <Card className="border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b">
                <TableRow>
                  <TableHead className="font-medium text-xs uppercase tracking-wider py-3">
                    Mã phiếu
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider py-3">
                    Ngày nhập
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider py-3">
                    Nhà cung cấp
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider py-3 text-right">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider py-3 text-center">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider py-3 text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
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
                          {new Date(entry.entry_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {entry.supplier || "—"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {entry.items?.length || 0} sản phẩm
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {formatPrice(entry.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(entry.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewDetail(entry.id)}
                                disabled={loadingDetail}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>

                          {entry.status === "completed" && (
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Thao tác</TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleCancel(entry.id)}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Hủy phiếu
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-60 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium">
                          Không tìm thấy phiếu nhập
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {search ||
                          statusFilter !== "all" ||
                          dateFrom ||
                          dateTo
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
        </Card>

        {/* Pagination - Giống ProductsTable */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * 10 + 1} -{" "}
              {Math.min(currentPage * 10, totalCount)} / {totalCount} phiếu
            </div>
            <div className="flex items-center gap-1">
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

              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 text-sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}

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
        )}

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
