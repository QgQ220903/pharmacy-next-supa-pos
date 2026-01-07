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
  ArrowRight,
  Package,
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

// Component modal chi tiết riêng biệt
function EntryDetailsModal({
  entry,
  isOpen,
  onClose,
}: {
  entry: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header hóa đơn */}
        <div className="px-8 py-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg mt-1">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  PHIẾU NHẬP KHO
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Mã phiếu:{" "}
                  <span className="font-medium text-foreground">
                    {entry.entry_code}
                  </span>
                </p>
              </div>
            </div>
            {entry.status === "completed" ? (
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-sm font-medium border-emerald-300 bg-emerald-50 text-emerald-700"
              >
                ĐÃ XÁC NHẬN
              </Badge>
            ) : entry.status === "cancelled" ? (
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-sm font-medium border-red-300 bg-red-50 text-red-700"
              >
                ĐÃ HỦY
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-sm font-medium border-amber-300 bg-amber-50 text-amber-700"
              >
                CHỜ XỬ LÝ
              </Badge>
            )}
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Thông tin cơ bản - Layout hóa đơn */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>THÔNG TIN NHÀ CUNG CẤP</span>
                </div>
                <p className="font-medium text-base">
                  {entry.supplier || "Chưa xác định"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>THÔNG TIN NGÀY</span>
                </div>
                <p className="font-medium text-base">
                  {new Date(entry.entry_date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date(entry.entry_date).toLocaleDateString("vi-VN", {
                    weekday: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-lg border">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  TỔNG GIÁ TRỊ
                </div>
                <p className="font-bold text-2xl text-primary">
                  {formatPrice(entry.total_amount)}
                </p>
                <div className="flex justify-between text-sm text-muted-foreground mt-3">
                  <span>Tổng sản phẩm:</span>
                  <span className="font-medium text-foreground">
                    {entry.items?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danh sách sản phẩm - Table cô đọng */}
          <div>
            <h3 className="font-semibold text-lg mb-4">CHI TIẾT SẢN PHẨM</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-semibold w-[40%]">
                        TÊN SẢN PHẨM
                      </TableHead>
                      <TableHead className="font-semibold text-center w-[15%]">
                        SL
                      </TableHead>
                      <TableHead className="font-semibold text-right w-[20%]">
                        ĐƠN GIÁ
                      </TableHead>
                      <TableHead className="font-semibold text-right w-[25%]">
                        THÀNH TIỀN
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.items?.map((item: any, index: number) => (
                      <TableRow
                        key={item.id}
                        className={
                          index === entry.items.length - 1 ? "border-b-0" : ""
                        }
                      >
                        <TableCell className="font-medium py-3">
                          <div className="flex flex-col">
                            <span>{item.products?.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                {item.batch_number || "N/A"}
                              </code>
                              <span className="text-xs text-muted-foreground">
                                HSD:{" "}
                                {item.expiry_date
                                  ? new Date(
                                      item.expiry_date
                                    ).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <div className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-muted rounded-md font-medium">
                            {item.quantity}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium py-3">
                          {formatPrice(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-semibold py-3">
                          {formatPrice(
                            item.total_price || item.quantity * item.unit_price
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Tổng kết - Style hóa đơn */}
          <div className="flex justify-end">
            <div className="w-full md:w-2/3 lg:w-1/2 space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Tổng số lượng:</span>
                <span className="font-medium">
                  {entry.items?.reduce(
                    (sum: number, item: any) => sum + (item.quantity || 0),
                    0
                  )}{" "}
                  đơn vị
                </span>
              </div>

              <Separator />

              <div className="pt-4">
                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-lg font-semibold">TỔNG CỘNG:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(entry.total_amount)}
                  </span>
                </div>

                {/* Ghi chú */}
                {entry.notes && (
                  <div className="mt-4 p-3 bg-muted/20 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Ghi chú:</span>{" "}
                      {entry.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Ký tên */}
              <div className="grid grid-cols-2 gap-6 mt-8 pt-4 border-t">
                <div className="text-center">
                  <p className="font-medium mb-1">NGƯỜI LẬP PHIẾU</p>
                  <div className="h-16 border-t border-dashed mt-2"></div>
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">NGƯỜI NHẬN HÀNG</p>
                  <div className="h-16 border-t border-dashed mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EntryListClient({
  initialEntries,
}: {
  initialEntries: any[];
}) {
  // --- States ---
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(initialEntries);

  // States cho Lọc nâng cao
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // States cho chi tiết modal
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Khắc phục lỗi Hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Logic Lọc Đa Điều Kiện ---
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

  // --- Actions ---
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
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
            Hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="shadow-none">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">Chờ xử lý</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Search & Advanced Filter Toolbar */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã phiếu hoặc nhà cung cấp..."
            className="pl-9 bg-slate-50 border-none focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={
                statusFilter !== "all" || dateFrom || dateTo
                  ? "default"
                  : "outline"
              }
              className="relative"
            >
              <Filter className="mr-2 h-4 w-4" />
              Lọc nâng cao
              {(statusFilter !== "all" || dateFrom || dateTo) && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">
                Bộ lọc phiếu
              </h4>

              <div className="space-y-2">
                <label className="text-xs font-medium">Trạng thái phiếu</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Từ ngày</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Đến ngày</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={resetFilters}
              >
                <RotateCcw className="mr-2 h-3 w-3" /> Làm mới bộ lọc
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold">Mã phiếu</TableHead>
              <TableHead className="font-bold">Ngày nhập</TableHead>
              <TableHead className="font-bold">Nhà cung cấp</TableHead>
              <TableHead className="text-right font-bold">Tổng tiền</TableHead>
              <TableHead className="text-center font-bold">
                Trạng thái
              </TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-mono font-bold text-blue-600">
                    {entry.entry_code}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(entry.entry_date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {entry.supplier || "---"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {entry.items?.length || 0} mặt hàng
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatPrice(entry.total_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(entry.status)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetail(entry.id)}
                      disabled={loadingDetail}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4 text-slate-400" />
                    </Button>
                    {entry.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleCancel(entry.id)}
                        title="Hủy phiếu"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground italic"
                >
                  Không tìm thấy dữ liệu phiếu nhập phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sử dụng modal chi tiết mới */}
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
