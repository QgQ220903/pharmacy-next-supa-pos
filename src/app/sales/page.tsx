"use client";
import { useEffect, useState } from "react";
import { getSalesAction } from "@/app/actions/sales";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, Filter, MoreVertical } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import { InventoryDetailSheet } from "@/app/inventory/history/InventoryDetailSheet";
import { getTransactionDetailAction } from "@/app/actions/inventory";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const res = await getSalesAction();
    if (res.success) setSales(res.data || []);
  };

  const handleViewDetail = async (sale: any) => {
    setIsSheetOpen(true);
    setLoadingDetail(true);
    // Tận dụng Action bạn đã viết ở bước trước
    const res = await getTransactionDetailAction(sale.id, "sale");
    if (res.success) setSelectedSale(res.data);
    setLoadingDetail(false);
  };

  const filteredSales = sales.filter(
    (s) =>
      s.sale_code.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Quản lý hóa đơn
          </h1>
          <p className="text-slate-500 text-sm">
            Theo dõi và quản lý các giao dịch bán hàng
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="Tìm mã đơn, tên khách..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Tổng doanh thu
          </p>
          <p className="text-2xl font-black text-blue-600">
            {formatPrice(
              filteredSales.reduce((sum, s) => sum + s.final_amount, 0)
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">
            Số đơn hàng
          </p>
          <p className="text-2xl font-black text-slate-800">
            {filteredSales.length}
          </p>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Mã hóa đơn</TableHead>
              <TableHead className="font-bold">Thời gian</TableHead>
              <TableHead className="font-bold">Khách hàng</TableHead>
              <TableHead className="font-bold text-right">Tổng tiền</TableHead>
              <TableHead className="font-bold text-center">
                Thanh toán
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow
                key={sale.id}
                className="cursor-pointer hover:bg-slate-50/50"
                onClick={() => handleViewDetail(sale)}
              >
                <TableCell className="font-mono font-bold text-blue-600">
                  {sale.sale_code}
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {new Date(sale.created_at).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-800">
                    {sale.customer_name || "Khách lẻ"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {sale.customer_phone}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPrice(sale.final_amount)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-600 border-emerald-100"
                  >
                    {sale.payment_method || "Tiền mặt"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button className="p-2 hover:bg-slate-100 rounded-full">
                    <MoreVertical size={16} className="text-slate-400" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sheet chi tiết hóa đơn (Tận dụng lại component cũ) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <InventoryDetailSheet
          data={selectedSale}
          type="sale"
          loading={loadingDetail}
        />
      </Sheet>
    </div>
  );
}
