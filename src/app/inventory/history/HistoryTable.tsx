"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { getTransactionDetailAction } from "@/app/actions/inventory";
import { InventoryDetailSheet } from "./InventoryDetailSheet"; // Import component mới tách

export default function HistoryTable({
  initialData = [],
}: {
  initialData: any[];
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("");

  const handleViewDetail = async (item: any) => {
    if (item.transaction_type === "adjustment" || !item.reference_id) return;

    setIsSheetOpen(true);
    setIsLoading(true);
    setSelectedType(item.transaction_type);

    const result = await getTransactionDetailAction(
      item.reference_id,
      item.transaction_type
    );

    // Sử dụng Optional Chaining (?) hoặc kiểm tra if (result)
    if (result?.success) {
      setDetailData(result.data);
    } else {
      setDetailData(null);
      // Bạn có thể thêm toast thông báo lỗi ở đây nếu muốn
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px] text-[11px] font-bold uppercase text-slate-500 text-nowrap">
                Thời gian
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-slate-500">
                Sản phẩm / Mã
              </TableHead>
              <TableHead className="w-[150px] text-[11px] font-bold uppercase text-slate-500 text-center">
                Loại giao dịch
              </TableHead>
              <TableHead className="w-[150px] text-[11px] font-bold uppercase text-slate-500 text-right">
                Biến động
              </TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-slate-400 italic"
                >
                  Không có dữ liệu biến động trong khoảng thời gian này.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => handleViewDetail(item)}
                >
                  <TableCell className="text-[13px] text-slate-600 font-medium">
                    {new Date(item.created_at).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-[14px]">
                        {item.products?.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono tracking-tighter italic">
                        {item.products?.internal_code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={`rounded-full px-3 font-medium text-[11px] border-none ${
                        item.transaction_type === "purchase"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.transaction_type === "sale"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.transaction_type === "purchase"
                        ? "Nhập kho"
                        : item.transaction_type === "sale"
                        ? "Bán hàng"
                        : "Kiểm kê"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-black text-[15px] ${
                      item.quantity_change > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {item.quantity_change > 0
                      ? `+${item.quantity_change}`
                      : item.quantity_change}
                    <span className="text-[10px] ml-1 text-slate-400 font-normal uppercase">
                      {item.products?.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group-hover:opacity-100 opacity-0">
                      <Eye
                        size={16}
                        className="text-slate-400 group-hover:text-blue-600"
                      />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet được điều khiển từ đây nhưng giao diện nằm ở file khác */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <InventoryDetailSheet
          data={detailData}
          type={selectedType}
          loading={isLoading}
        />
      </Sheet>
    </>
  );
}
