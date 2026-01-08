"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { CalendarDays, Package, User, FileText } from "lucide-react";

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
      <DialogContent className="w-[95vw] max-w-[1000px] h-[90vh] max-h-[800px] p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold mb-0.5">
                Phiếu nhập kho
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 text-sm">
                <FileText className="h-3.5 w-3.5" />
                Mã: {entry.entry_code}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Basic Information */}
          <div className="px-6 py-5 space-y-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>Nhà cung cấp</span>
                </div>
                <p className="font-medium text-sm">
                  {entry.supplier || "Chưa xác định"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Ngày nhập</span>
                </div>
                <p className="font-medium text-sm">
                  {new Date(entry.entry_date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">
                  Tổng giá trị
                </div>
                <p className="text-lg font-bold">
                  {formatPrice(entry.total_amount)}
                </p>
              </div>
            </div>

            {entry.notes && (
              <div className="pt-3 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-1.5">
                  Ghi chú
                </div>
                <p className="text-sm leading-relaxed">{entry.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Products Table */}
          <div className="px-6 py-5">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-semibold text-xs min-w-[300px] h-10">
                      Sản phẩm & Thông tin
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-right min-w-[120px] h-10">
                      Đơn giá
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-right min-w-[140px] h-10">
                      Thành tiền
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.items?.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="py-3.5">
                        <div className="space-y-1.5">
                          <div className="font-medium text-sm">
                            {item.products?.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.products?.unit}</span>
                            <span>•</span>
                            {item.batch_number && (
                              <>
                                <span>Lô: {item.batch_number}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              Số lượng:{" "}
                              <span className="font-medium text-foreground">
                                {item.quantity}
                              </span>
                            </span>
                            {item.expiry_date && (
                              <>
                                <span>•</span>
                                <span>
                                  HSD:{" "}
                                  {new Date(
                                    item.expiry_date
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-right align-top font-medium text-sm">
                        {formatPrice(item.unit_price)}
                      </TableCell>

                      <TableCell className="py-3.5 text-right align-top font-semibold text-sm">
                        {formatPrice(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total Summary */}
            <div className="mt-5 flex justify-end">
              <div className="w-full md:w-1/2 space-y-2.5">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">
                    Tổng số lượng:
                  </span>
                  <span className="font-medium text-sm">
                    {entry.items?.reduce(
                      (sum: number, item: any) => sum + (item.quantity || 0),
                      0
                    )}{" "}
                    đơn vị
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold">
                    {formatPrice(entry.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
