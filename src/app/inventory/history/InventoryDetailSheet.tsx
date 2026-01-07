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

export function InventoryDetailSheet({
  data,
  type,
  loading,
}: {
  data: any;
  type: string;
  loading: boolean;
}) {
  // 1. Trạng thái Loading
  if (loading)
    return (
      <SheetContent className="flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-sm text-slate-500 italic">
          Đang truy vấn dữ liệu...
        </p>
      </SheetContent>
    );

  // 2. Kiểm tra dữ liệu tồn tại
  if (!data || Object.keys(data).length === 0) {
    return (
      <SheetContent className="flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium">
          Không tìm thấy nội dung chứng từ
        </p>
      </SheetContent>
    );
  }

  // 3. Khai báo biến dựa trên DATABASE SCHEMA thực tế
  const isSale = type === "sale";

  // Danh sách items: sale_items hoặc stock_entry_items
  const items = isSale ? data.sale_items : data.stock_entry_items;

  // Mã chứng từ: sale_code hoặc entry_code
  const code = isSale ? data.sale_code : data.entry_code;

  // Nhãn đối tác
  const partnerLabel = isSale ? "Khách hàng" : "Nhà cung cấp";

  // Tên đối tác: Khớp với cột customer_name và supplier trong DB
  const partnerName = isSale
    ? data.customer_name || "Khách mua lẻ"
    : data.supplier || "Nhà cung cấp vãng lai";

  return (
    <SheetContent className="sm:max-w-lg p-0 flex flex-col border-l shadow-2xl">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-slate-50/50">
        <SheetHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isSale
                  ? "bg-blue-100 text-blue-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {isSale ? <Receipt size={22} /> : <Truck size={22} />}
            </div>
            <div>
              <Badge
                className={`mb-1 font-bold ${
                  isSale
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
                variant="outline"
              >
                {isSale ? "PHIẾU BÁN HÀNG" : "PHIẾU NHẬP KHO"}
              </Badge>
              <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                {code}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>
      </div>

      {/* Nội dung Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Thông tin chung */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              <User size={14} />
              <span>{partnerLabel}</span>
            </div>
            <p className="font-semibold text-slate-800 truncate">
              {partnerName}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              <Calendar size={14} />
              <span>Thời gian</span>
            </div>
            <p className="font-semibold text-slate-800">
              {new Date(data.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Tổng giá trị nổi bật */}
        <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-md shadow-blue-100">
          <div className="flex items-center justify-between mb-1 opacity-80">
            <span className="text-sm font-medium">Tổng giá trị thanh toán</span>
            <DollarSign size={18} />
          </div>
          <p className="text-3xl font-black">
            {formatPrice(data.total_amount || 0)}
          </p>
        </div>

        <Separator className="opacity-50" />

        {/* Danh sách sản phẩm */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800">Chi tiết sản phẩm</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {items?.length || 0} mục
            </span>
          </div>

          <div className="space-y-3">
            {items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="group flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                    {item.products?.name || "Sản phẩm đã xóa"}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-[12px] text-slate-500 flex items-center gap-1">
                      Số lượng:{" "}
                      <b className="text-slate-700">{item.quantity}</b>{" "}
                      {item.products?.unit}
                    </span>
                    {item.batch_number && (
                      <span className="text-[12px] text-amber-600 font-medium">
                        Lô: {item.batch_number}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">
                    {formatPrice(item.unit_price || item.price || 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">
                    Đơn giá
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ghi chú */}
        {data.notes && (
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 italic">
            <p className="text-xs font-bold text-amber-700 uppercase mb-1">
              Ghi chú
            </p>
            <p className="text-sm text-amber-800/80">{data.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t px-6 py-4 bg-slate-50/80">
        <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          <span>Hệ thống quản lý kho</span>
          <span>{isSale ? "Sale Receipt" : "Stock Entry"}</span>
        </div>
      </div>
    </SheetContent>
  );
}
