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
import { Eye, ArrowUp, ArrowDown, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { getTransactionDetailAction } from "@/app/actions/inventory";
import { InventoryDetailSheet } from "./InventoryDetailSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      item.transaction_type,
    );

    if (result?.success) {
      setDetailData(result.data);
    } else {
      setDetailData(null);
    }
    setIsLoading(false);
  };

  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case "purchase":
        return {
          label: "Nhập kho",
          variant: "default" as const,
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "sale":
        return {
          label: "Bán hàng",
          variant: "secondary" as const,
          color: "bg-green-50 text-green-700 border-green-200",
        };
      default:
        return {
          label: "Kiểm kê",
          variant: "outline" as const,
          color: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[140px] font-medium text-xs uppercase tracking-wide">
                Thời gian
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wide">
                Sản phẩm
              </TableHead>
              <TableHead className="text-center font-medium text-xs uppercase tracking-wide">
                Loại
              </TableHead>
              <TableHead className="text-right font-medium text-xs uppercase tracking-wide">
                Biến động
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                    <Package className="h-10 w-10 opacity-40" />
                    <div>
                      <p className="font-medium">Không có dữ liệu</p>
                      <p className="text-sm mt-1">Thử điều chỉnh bộ lọc</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((item) => {
                const typeInfo = getTransactionTypeInfo(item.transaction_type);
                const isIncrease = item.quantity_change > 0;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/20 cursor-pointer group"
                    onClick={() => handleViewDetail(item)}
                  >
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm truncate max-w-[200px]">
                          {item.products?.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {item.products?.internal_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant={typeInfo.variant}
                        className={cn(
                          "text-xs font-medium px-2 py-0.5",
                          typeInfo.color,
                        )}
                      >
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isIncrease ? (
                          <ArrowUp className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-destructive" />
                        )}
                        <span
                          className={cn(
                            "font-semibold",
                            isIncrease
                              ? "text-emerald-600"
                              : "text-destructive",
                          )}
                        >
                          {isIncrease
                            ? `+${item.quantity_change}`
                            : item.quantity_change}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {item.products?.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(item);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
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
