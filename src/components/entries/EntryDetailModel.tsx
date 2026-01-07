"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Package, User } from "lucide-react";

export function EntryDetailsModal({
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
            <Badge
              variant="outline"
              className="px-3 py-1.5 text-sm font-medium border-primary/30 bg-primary/5"
            >
              ĐÃ XÁC NHẬN
            </Badge>
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
                  <CalendarDays className="h-4 w-4" />
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
                          {formatPrice(item.total_price)}
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

                {/* Chú thích số bằng chữ */}
                <div className="mt-4 p-3 bg-muted/20 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Bằng chữ:</span> Viết bằng chữ
                    ở đây
                  </p>
                </div>
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
