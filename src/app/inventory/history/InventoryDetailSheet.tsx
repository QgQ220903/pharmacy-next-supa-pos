"use client";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Receipt,
  Truck,
  Calendar,
  User,
  Package,
  DollarSign,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function InventoryDetailSheet({
  data,
  type,
  loading,
}: {
  data: any;
  type: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <SheetContent className="flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Đang tải dữ liệu...
        </p>
      </SheetContent>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <SheetContent className="flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy dữ liệu</p>
      </SheetContent>
    );
  }

  const isSale = type === "sale";
  const items = isSale ? data.sale_items : data.stock_entry_items;
  const code = isSale ? data.sale_code : data.entry_code;
  const partnerLabel = isSale ? "Khách hàng" : "Nhà cung cấp";
  const partnerName = isSale
    ? data.customer_name || "Khách mua lẻ"
    : data.supplier || "Nhà cung cấp vãng lai";

  return (
    <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {isSale ? (
                <Receipt className="h-5 w-5 text-primary" />
              ) : (
                <Truck className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold">{code}</SheetTitle>
              <Badge variant="secondary" className="mt-1">
                {isSale ? "Phiếu bán hàng" : "Phiếu nhập kho"}
              </Badge>
            </div>
          </div>
        </SheetHeader>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {partnerLabel}
              </div>
              <p className="font-medium truncate">{partnerName}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Thời gian
              </div>
              <p className="font-medium">
                {new Date(data.created_at).toLocaleDateString("vi-VN")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Total Amount */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Tổng giá trị
              </span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">
              {formatPrice(data.total_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Products List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Chi tiết sản phẩm</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              {items?.length || 0} sản phẩm
            </Badge>
          </div>

          <div className="space-y-3">
            {items?.map((item: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">
                        {item.products?.name || "Sản phẩm đã xóa"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Số lượng:{" "}
                          <span className="font-medium">{item.quantity}</span>{" "}
                          {item.products?.unit}
                        </span>
                        {item.batch_number && (
                          <>
                            <span>•</span>
                            <span>Lô: {item.batch_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPrice(item.unit_price || item.price || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Ghi chú
              </p>
              <p className="text-sm">{data.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </SheetContent>
  );
}
