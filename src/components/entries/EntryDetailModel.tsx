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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu nhập: {entry.entry_code}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Nhà cung cấp:</span>{" "}
              {entry.supplier || "N/A"}
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Ngày nhập:</span>{" "}
              {new Date(entry.entry_date).toLocaleDateString("vi-VN")}
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.products?.name}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(item.total_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-right font-bold text-lg text-primary">
            Tổng cộng: {formatPrice(entry.total_amount)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
