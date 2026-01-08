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
import { InventoryDetailSheet } from "./InventoryDetailSheet";
import { Button } from "@/components/ui/button";

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

    if (result?.success) {
      setDetailData(result.data);
    } else {
      setDetailData(null);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] font-medium">Thời gian</TableHead>
              <TableHead className="font-medium">Sản phẩm</TableHead>
              <TableHead className="text-center font-medium">Loại</TableHead>
              <TableHead className="text-right font-medium">
                Biến động
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <p>Không có dữ liệu</p>
                    <p className="text-sm">Thay đổi bộ lọc để xem kết quả</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleViewDetail(item)}
                >
                  <TableCell className="font-medium">
                    {new Date(item.created_at).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{item.products?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.products?.internal_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        item.transaction_type === "purchase"
                          ? "default"
                          : item.transaction_type === "sale"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {item.transaction_type === "purchase"
                        ? "Nhập kho"
                        : item.transaction_type === "sale"
                        ? "Bán hàng"
                        : "Kiểm kê"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      item.quantity_change > 0
                        ? "text-emerald-600"
                        : "text-destructive"
                    }`}
                  >
                    {item.quantity_change > 0
                      ? `+${item.quantity_change}`
                      : item.quantity_change}
                    <span className="text-xs text-muted-foreground ml-1">
                      {item.products?.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewDetail(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
