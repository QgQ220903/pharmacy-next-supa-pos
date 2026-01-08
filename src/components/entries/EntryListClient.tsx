"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  XCircle,
  RotateCcw,
  Calendar as CalendarIcon,
  User,
  FileText,
  Package,
  MoreHorizontal,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { EntryDetailsModal } from "./EntryDetailModel";

export default function EntryListClient({
  initialEntries,
}: {
  initialEntries: any[];
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        entries.map((e) => (e.id === id ? { ...e, status: "cancelled" } : e))
      );
    } else {
      toast.error(res.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
            Hoàn thành
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Chờ xử lý</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div
        className={cn(
          "flex flex-col md:flex-row gap-3 items-center p-4 rounded-lg border",
          isDark ? "bg-muted/20" : "bg-muted/30"
        )}
      >
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm mã phiếu, nhà cung cấp..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
              {(statusFilter !== "all" || dateFrom || dateTo) && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-blue-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Trạng thái</div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Từ ngày</div>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Đến ngày</div>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader className={isDark ? "bg-muted/30" : "bg-muted/50"}>
            <TableRow>
              <TableHead className="font-semibold">Mã phiếu</TableHead>
              <TableHead className="font-semibold">Ngày nhập</TableHead>
              <TableHead className="font-semibold">Nhà cung cấp</TableHead>
              <TableHead className="font-semibold text-right">
                Tổng tiền
              </TableHead>
              <TableHead className="font-semibold text-center">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium font-mono">
                    {entry.entry_code}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.entry_date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{entry.supplier || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.items?.length || 0} sản phẩm
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPrice(entry.total_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(entry.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetail(entry.id)}
                        disabled={loadingDetail}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {entry.status === "completed" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-50" />
                    <p>Không tìm thấy phiếu nhập</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
  );
}
