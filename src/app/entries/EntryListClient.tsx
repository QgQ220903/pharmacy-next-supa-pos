"use client";
import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  XCircle,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { EntryDetailsModal } from "@/components/entries/EntryDetailModel";
import { cancelStockEntryAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EntryListClient({
  initialEntries,
}: {
  initialEntries: any[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(""); // Định dạng YYYY-MM-DD
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logic Tìm kiếm & Bộ lọc nâng cao
  const filtered = useMemo(() => {
    return initialEntries.filter((e) => {
      // 1. Lọc theo từ khóa (Mã phiếu, Nhà cung cấp)
      const matchesSearch =
        e.entry_code.toLowerCase().includes(search.toLowerCase()) ||
        (e.supplier && e.supplier.toLowerCase().includes(search.toLowerCase()));

      // 2. Lọc theo trạng thái
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;

      // 3. Lọc theo ngày
      const matchesDate = !dateFilter || e.entry_date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, statusFilter, dateFilter, initialEntries]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Hủy phiếu sẽ trừ tồn kho tương ứng. Bạn chắc chắn chứ?"))
      return;
    const res = await cancelStockEntryAction(id);
    if (res.success) toast.success("Đã hủy phiếu thành công");
    else toast.error(res.message);
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ Bộ lọc */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-lg border">
        {/* Tìm kiếm văn bản */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mã phiếu, nhà cung cấp..."
            className="pl-10 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Lọc trạng thái */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40 bg-background">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="completed">Thành công</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>

        {/* Lọc ngày nhập */}
        <div className="relative w-full md:w-48">
          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="date"
            className="pl-10 bg-background uppercase"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Nút Reset */}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Làm mới
        </Button>
      </div>

      {/* Hiển thị số lượng kết quả */}
      <div className="text-sm text-muted-foreground italic px-1">
        Tìm thấy {filtered.length} kết quả phù hợp
      </div>

      {/* Bảng dữ liệu */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-40">Mã phiếu</TableHead>
              <TableHead>Ngày nhập</TableHead>
              <TableHead>Nhà cung cấp</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium font-mono text-blue-600">
                    {entry.entry_code}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.entry_date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {entry.supplier || "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {formatPrice(entry.total_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className="shadow-none"
                      variant={
                        entry.status === "completed" ? "success" : "destructive"
                      }
                    >
                      {entry.status === "completed" ? "Thành công" : "Đã hủy"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {entry.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleCancel(entry.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground italic"
                >
                  Không tìm thấy phiếu nhập nào phù hợp với bộ lọc
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EntryDetailsModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
