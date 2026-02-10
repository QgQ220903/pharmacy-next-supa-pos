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
import { useTheme } from "next-themes";
import { EntryDetailsModal } from "./EntryDetailModel";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  // Khởi tạo state với giá trị từ props
  const [search, setSearch] = useState(initialSearch);
  const [entries, setEntries] = useState(initialEntries);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cập nhật URL khi filters thay đổi (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      // Reset về trang 1 khi filter thay đổi
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

    // Giữ các filters hiện tại
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
    if (!confirm("Xác nhận hủy phiếu nhập? Tồn kho sẽ bị trừ lại tương ứng."))
      return;

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
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400">
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
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            Chờ xử lý
          </Badge>
        );
    }
  };

  // Tạo mảng số trang để hiển thị
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

  if (!mounted) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Search and Filters */}
      <Card className="border shadow-none">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm mã phiếu, nhà cung cấp..."
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-2">
                  <Filter className="h-4 w-4" />
                  Lọc
                  {(statusFilter !== "all" || dateFrom || dateTo) && (
                    <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Khoảng thời gian</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          Từ ngày
                        </div>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          Đến ngày
                        </div>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="w-full gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Xóa bộ lọc
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader
              className={cn(isDark ? "bg-muted" : "bg-muted/50", "border-b")}
            >
              <TableRow>
                <TableHead className="font-semibold w-[180px]">
                  MÃ PHIẾU
                </TableHead>
                <TableHead className="font-semibold">NGÀY NHẬP</TableHead>
                <TableHead className="font-semibold">NHÀ CUNG CẤP</TableHead>
                <TableHead className="font-semibold text-right">
                  TỔNG TIỀN
                </TableHead>
                <TableHead className="font-semibold text-center">
                  TRẠNG THÁI
                </TableHead>
                <TableHead className="font-semibold text-right w-[100px]">
                  THAO TÁC
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-muted/50 border-b transition-colors"
                  >
                    <TableCell className="font-medium font-mono">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {entry.entry_code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(entry.entry_date).toLocaleDateString("vi-VN")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {entry.supplier || "—"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.items?.length || 0} sản phẩm
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <div className="flex flex-col items-end">
                        <span>{formatPrice(entry.total_amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => handleViewDetail(entry.id)}
                          disabled={loadingDetail}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {entry.status === "completed" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                                title="Tùy chọn"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleCancel(entry.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Hủy phiếu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>In phiếu nhập</DropdownMenuItem>
                              <DropdownMenuItem>Sao chép mã</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">
                        Không tìm thấy phiếu nhập
                      </p>
                      <p className="text-sm">
                        {search || statusFilter !== "all" || dateFrom || dateTo
                          ? "Thử thay đổi bộ lọc hoặc xóa bộ lọc hiện tại"
                          : "Chưa có phiếu nhập nào trong hệ thống"}
                      </p>
                      {(search ||
                        statusFilter !== "all" ||
                        dateFrom ||
                        dateTo) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-4 gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && (
        <Card className="border shadow-none">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * 10 + 1}
                </span>
                -
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalCount)}
                </span>{" "}
                của <span className="font-medium">{totalCount}</span> phiếu
              </div>

              <div className="flex items-center space-x-1">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                  title="Trang đầu"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                {pageNumbers.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8"
                  title="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8"
                  title="Trang cuối"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
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
  );
}
